import { sanitizeHTML, sanitizeURL, sanitizeText } from "./sanitizer";
import { generateId } from "./idGenerator";
import { getDocPlainText } from "./textUtils";
import type {
  EditorDoc,
  Block,
  InlineNode,
  TextNode,
  LinkNode,
  HashtagNode,
  InlineCodeNode,
  TextMark,
  ListItem,
  TableRow,
} from "../types";
import { getIndentStyle } from "./indentStyle";

// ─── Escape helpers ────────────────────────────────────────

function esc(text: string): string {
  return sanitizeText(text);
}

function escAttr(text: string): string {
  return (text || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ─── Inline Render: Model → HTML (for contentEditable) ────

function applyMark(mark: TextMark, inner: string): string {
  switch (mark.type) {
    case "bold":
      return `<strong>${inner}</strong>`;
    case "italic":
      return `<em>${inner}</em>`;
    case "underline":
      return `<u>${inner}</u>`;
    case "strike":
      return `<s>${inner}</s>`;
    case "superscript":
      return `<sup>${inner}</sup>`;
    case "subscript":
      return `<sub>${inner}</sub>`;
    case "inlineCode":
      return `<code class="textedit-inline-code" data-type="inlineCode">${inner}</code>`;
    case "textColor":
      return `<span style="color:${mark.attrs?.color}">${inner}</span>`;
    case "bgColor":
      return `<span style="background-color:${mark.attrs?.color}">${inner}</span>`;
    case "fontSize":
      return `<span style="font-size:${mark.attrs?.size}">${inner}</span>`;
    case "fontFamily":
      return `<span style="font-family:${mark.attrs?.family}">${inner}</span>`;
    case "fontWeight":
      return `<span style="font-weight:${mark.attrs?.weight}">${inner}</span>`;
    default:
      return inner;
  }
}

export function renderInlineHTML(nodes: InlineNode[]): string {
  const arr = Array.isArray(nodes) ? nodes : nodes ? [nodes as InlineNode] : [];
  if (!arr.length) return "";
  return arr
    .map((node) => {
      if (node.type === "link") {
        const n = node as LinkNode;
        const href = escAttr(sanitizeURL(n.href));
        const target = n.target || "_blank";
        return `<a class="textedit-link" href="${href}" target="${target}" rel="noopener noreferrer" data-type="link">${esc(n.text)}</a>`;
      }
      if (node.type === "hashtag") {
        return `<span class="textedit-hashtag" data-type="hashtag" contenteditable="false">${esc((node as HashtagNode).text)}</span>`;
      }
      if (node.type === "inlineCode") {
        return `<code class="textedit-inline-code" data-type="inlineCode">${esc((node as InlineCodeNode).text)}</code>`;
      }
      const n = node as TextNode;
      let html = esc(n.text);
      const marks = n.marks || [];
      for (const mark of marks.slice().reverse()) {
        html = applyMark(mark, html);
      }
      return html;
    })
    .join("");
}

// ─── Inline Extract: DOM → Model ──────────────────────────

const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
const HASHTAG_PATTERN = /#[\w\u0600-\u06FF\u200c]+/g;

function detectPatterns(text: string, marks?: TextMark[]): InlineNode[] {
  if (!text) return [];
  const hits: Array<{ start: number; end: number; node: InlineNode }> = [];

  let m: RegExpExecArray | null;
  URL_PATTERN.lastIndex = 0;
  while ((m = URL_PATTERN.exec(text)) !== null) {
    hits.push({
      start: m.index,
      end: m.index + m[0].length,
      node: { type: "link", text: m[0], href: m[0], target: "_blank" },
    });
  }

  HASHTAG_PATTERN.lastIndex = 0;
  while ((m = HASHTAG_PATTERN.exec(text)) !== null) {
    const overlaps = hits.some((h) => m!.index < h.end && m!.index + m![0].length > h.start);
    if (!overlaps) {
      hits.push({ start: m.index, end: m.index + m[0].length, node: { type: "hashtag", text: m[0] } });
    }
  }

  if (!hits.length) return [{ type: "text", text, marks: marks?.length ? marks : undefined }];

  hits.sort((a, b) => a.start - b.start);
  const result: InlineNode[] = [];
  let last = 0;
  for (const hit of hits) {
    if (hit.start > last) {
      const t = text.slice(last, hit.start);
      if (t) result.push({ type: "text", text: t, marks: marks?.length ? marks : undefined });
    }
    result.push(hit.node);
    last = hit.end;
  }
  if (last < text.length) {
    result.push({ type: "text", text: text.slice(last), marks: marks?.length ? marks : undefined });
  }
  return result;
}

function collectMarks(el: HTMLElement, inherited: TextMark[]): TextMark[] {
  const marks = [...inherited];
  const tag = el.tagName.toLowerCase();
  if (tag === "strong" || tag === "b") marks.push({ type: "bold" });
  if (tag === "em" || tag === "i") marks.push({ type: "italic" });
  if (tag === "u") marks.push({ type: "underline" });
  if (tag === "s" || tag === "del" || tag === "strike") marks.push({ type: "strike" });
  if (tag === "sup") marks.push({ type: "superscript" });
  if (tag === "sub") marks.push({ type: "subscript" });
  if (tag === "span" || tag === "code" || tag === "font") {
    const st = el.style;
    // color can be in style or in <font color="..."> attribute
    const attrColor = (el.getAttribute && el.getAttribute("color")) || undefined;
    const colorVal = st.color || attrColor;
    if (colorVal) marks.push({ type: "textColor", attrs: { color: colorVal } });
    // background color can be inline style or <font bgcolor="...">
    const attrBg = (el.getAttribute && el.getAttribute("bgcolor")) || undefined;
    const bgVal = st.backgroundColor || attrBg;
    if (bgVal) marks.push({ type: "bgColor", attrs: { color: bgVal } });
    if (st.fontSize) marks.push({ type: "fontSize", attrs: { size: st.fontSize } });
    if (st.fontFamily) marks.push({ type: "fontFamily", attrs: { family: st.fontFamily } });
    if (st.fontWeight && st.fontWeight !== "normal" && st.fontWeight !== "400") {
      marks.push({ type: "fontWeight", attrs: { weight: st.fontWeight } });
    }
  }
  return marks;
}

export function extractInlineNodes(el: HTMLElement): InlineNode[] {
  const nodes: InlineNode[] = [];

  function walk(node: Node, marks: TextMark[]): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (text) {
        nodes.push(...detectPatterns(text, marks.length ? marks : undefined));
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const domEl = node as HTMLElement;
    const dataType = domEl.dataset.type;

    if (dataType === "link") {
      nodes.push({
        type: "link",
        text: domEl.textContent || "",
        href: domEl.getAttribute("href") || "",
        target: (domEl.getAttribute("target") as "_blank" | "_self") || "_blank",
      });
      return;
    }
    if (dataType === "hashtag") {
      nodes.push({ type: "hashtag", text: domEl.textContent || "" });
      return;
    }
    if (dataType === "inlineCode") {
      nodes.push({ type: "inlineCode", text: domEl.textContent || "" });
      return;
    }
    if (domEl.tagName.toLowerCase() === "br") {
      nodes.push({ type: "text", text: "\n" });
      return;
    }
    const newMarks = collectMarks(domEl, marks);
    domEl.childNodes.forEach((child) => walk(child, newMarks));
  }

  el.childNodes.forEach((child) => walk(child, []));
  return nodes;
}

// ─── Export HTML ───────────────────────────────────────────

function listItemHTML(item: ListItem, ordered: boolean, task: boolean, idx: number): string {
  const inner = renderInlineHTML(item.content);
  const childrenHTML = item.children?.length
    ? `<${ordered ? "ol" : "ul"}>${item.children.map((c, i) => listItemHTML(c, ordered, task, i)).join("")}</${ordered ? "ol" : "ul"}>`
    : "";
  if (task) {
    const ch = item.checked ? "checked" : "";
    return `<li class="textedit-task-item"><input type="checkbox" ${ch} disabled />${inner}${childrenHTML}</li>`;
  }
  return `<li>${inner}${childrenHTML}</li>`;
}

export function exportDocHTML(doc: EditorDoc): string {
  return doc.blocks
    .map((block) => {
      const styleArr: string[] = [];
      if ("align" in block && block.align) styleArr.push(`text-align:${block.align}`);
      if ("direction" in block && block.direction && block.direction !== "auto")
        styleArr.push(`direction:${block.direction}`);
      const indentStyle = getIndentStyle("indent" in block ? block.indent : undefined);
      if (indentStyle.paddingInlineStart) styleArr.push(`padding-inline-start:${indentStyle.paddingInlineStart}`);
      const style = styleArr.length ? ` style="${styleArr.join(";")}"` : "";
      const dir = "direction" in block && block.direction ? ` dir="${block.direction}"` : "";

      switch (block.type) {
        case "paragraph":
          return `<p${style}${dir}>${renderInlineHTML(block.content) || "<br>"}</p>`;
        case "heading":
          return `<h${block.level}${style}${dir}>${renderInlineHTML(block.content)}</h${block.level}>`;
        case "bulletList":
          return `<ul${style}>${block.items.map((it, i) => listItemHTML(it, false, false, i)).join("")}</ul>`;
        case "orderedList":
          return `<ol${style}>${block.items.map((it, i) => listItemHTML(it, true, false, i)).join("")}</ol>`;
        case "taskList":
          return `<ul class="textedit-task-list"${style}>${block.items.map((it, i) => listItemHTML(it, false, true, i)).join("")}</ul>`;
        case "blockquote":
          return `<blockquote${style}>${renderInlineHTML(block.content)}</blockquote>`;
        case "hr":
          return "<hr>";
        case "table": {
          const rows = block.rows
            .map((row) => {
              const cells = row.cells
                .map((cell) => {
                  const tag = cell.isHeader ? "th" : "td";
                  const cs = cell.colSpan && cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : "";
                  const rs = cell.rowSpan && cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : "";
                  return `<${tag}${cs}${rs}>${renderInlineHTML(cell.content)}</${tag}>`;
                })
                .join("");
              return `<tr>${cells}</tr>`;
            })
            .join("");
          return `<table><tbody>${rows}</tbody></table>`;
        }
        case "code":
          return `<pre><code class="language-${block.language || "plain"}">${esc(block.content)}</code></pre>`;
        default:
          return "";
      }
    })
    .join("\n");
}

// ─── Export Markdown ───────────────────────────────────────

function inlineToMD(nodes: InlineNode[]): string {
  const arr = Array.isArray(nodes) ? nodes : nodes ? [nodes as InlineNode] : [];
  return arr
    .map((node) => {
      if (node.type === "link") {
        const n = node as LinkNode;
        return `[${n.text}](${n.href})`;
      }
      if (node.type === "hashtag") return node.text;
      if (node.type === "inlineCode") return `\`${node.text}\``;
      const n = node as TextNode;
      let t = n.text;
      const marks = n.marks || [];
      if (marks.some((m) => m.type === "bold")) t = `**${t}**`;
      if (marks.some((m) => m.type === "italic")) t = `*${t}*`;
      if (marks.some((m) => m.type === "strike")) t = `~~${t}~~`;
      if (marks.some((m) => m.type === "inlineCode")) t = `\`${t}\``;
      return t;
    })
    .join("");
}

function listItemToMD(item: ListItem, ordered: boolean, task: boolean, idx: number, level = 0): string {
  const ind = "  ".repeat(level);
  const prefix = task ? `${ind}- [${item.checked ? "x" : " "}] ` : ordered ? `${ind}${idx + 1}. ` : `${ind}- `;
  const children = item.children?.map((c, i) => listItemToMD(c, ordered, task, i, level + 1)).join("\n") || "";
  return prefix + inlineToMD(item.content) + (children ? "\n" + children : "");
}

export function exportDocMarkdown(doc: EditorDoc): string {
  return doc.blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return inlineToMD(block.content) || "";
        case "heading":
          return "#".repeat(block.level) + " " + inlineToMD(block.content);
        case "bulletList":
          return block.items.map((it, i) => listItemToMD(it, false, false, i)).join("\n");
        case "orderedList":
          return block.items.map((it, i) => listItemToMD(it, true, false, i)).join("\n");
        case "taskList":
          return block.items.map((it, i) => listItemToMD(it, false, true, i)).join("\n");
        case "blockquote":
          return "> " + inlineToMD(block.content);
        case "hr":
          return "---";
        case "table": {
          if (!block.rows.length) return "";
          const header = block.rows[0]?.cells.map((c) => inlineToMD(c.content)).join(" | ") || "";
          const divider = block.rows[0]?.cells.map(() => "---").join(" | ") || "";
          const body = block.rows
            .slice(1)
            .map((r) => r.cells.map((c) => inlineToMD(c.content)).join(" | "))
            .join("\n");
          return `${header}\n${divider}${body ? "\n" + body : ""}`;
        }
        case "code":
          return `\`\`\`${block.language || ""}\n${block.content}\n\`\`\``;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

export function exportDocPlainText(doc: EditorDoc): string {
  return getDocPlainText(doc);
}

// ─── Import HTML ───────────────────────────────────────────

function parseListItems(el: HTMLElement, task = false): ListItem[] {
  return Array.from(el.children)
    .filter((child) => child.tagName.toLowerCase() === "li")
    .map((li) => {
      const liEl = li as HTMLElement;
      const nestedList = liEl.querySelector("ul, ol");
      let children: ListItem[] | undefined;
      let contentEl: HTMLElement = liEl;

      if (nestedList) {
        const isOrdered = nestedList.tagName.toLowerCase() === "ol";
        children = parseListItems(nestedList as HTMLElement, task);
        const clone = liEl.cloneNode(true) as HTMLElement;
        clone.querySelector("ul, ol")?.remove();
        contentEl = clone;
      }

      return {
        id: generateId("li"),
        content: extractInlineNodes(contentEl),
        checked: task
          ? (liEl.querySelector('input[type="checkbox"]') as HTMLInputElement)?.checked || false
          : undefined,
        children: children?.length ? children : undefined,
      };
    });
}

export function importHTML(html: string): EditorDoc {
  if (typeof document === "undefined") return emptyDoc();
  const safe = sanitizeHTML(html);
  const container = document.createElement("div");
  container.innerHTML = safe;
  const blocks: Block[] = [];

  function processNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || "").trim();
      if (text) blocks.push({ id: generateId(), type: "paragraph", content: [{ type: "text", text }] });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case "p":
        const indentPx = parseFloat(el.style.paddingInlineStart || el.style.paddingLeft || "0");
        const indent = indentPx > 0 ? Math.round(indentPx / 24) || 1 : undefined;
        blocks.push({
          id: generateId(),
          type: "paragraph",
          content: extractInlineNodes(el),
          align: (el.style.textAlign as any) || undefined,
          direction: (el.dir as any) || undefined,
          indent,
        });
        break;
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        blocks.push({
          id: generateId(),
          type: "heading",
          level: parseInt(tag[1]) as any,
          content: extractInlineNodes(el),
        });
        break;
      case "ul":
        if (el.classList.contains("textedit-task-list")) {
          blocks.push({ id: generateId(), type: "taskList", items: parseListItems(el, true) });
        } else {
          blocks.push({ id: generateId(), type: "bulletList", items: parseListItems(el, false) });
        }
        break;
      case "ol":
        blocks.push({ id: generateId(), type: "orderedList", items: parseListItems(el, false) });
        break;
      case "blockquote":
        blocks.push({ id: generateId(), type: "blockquote", content: extractInlineNodes(el) });
        break;
      case "hr":
        blocks.push({ id: generateId(), type: "hr" });
        break;
      case "table": {
        const rows: TableRow[] = Array.from(el.querySelectorAll("tr")).map((tr) => ({
          id: generateId("tr"),
          cells: Array.from(tr.querySelectorAll("td,th")).map((cell) => ({
            id: generateId("tc"),
            content: extractInlineNodes(cell as HTMLElement),
            isHeader: cell.tagName.toLowerCase() === "th",
            colSpan: (cell as HTMLTableCellElement).colSpan > 1 ? (cell as HTMLTableCellElement).colSpan : undefined,
            rowSpan: (cell as HTMLTableCellElement).rowSpan > 1 ? (cell as HTMLTableCellElement).rowSpan : undefined,
          })),
        }));
        blocks.push({ id: generateId(), type: "table", rows });
        break;
      }
      case "pre": {
        const code = el.querySelector("code");
        const content = code?.textContent || el.textContent || "";
        const lang = code?.className.match(/language-(\w+)/)?.[1] || "";
        blocks.push({ id: generateId(), type: "code", language: lang || undefined, content });
        break;
      }
      case "div":
        el.childNodes.forEach(processNode);
        break;
      default:
        if (el.textContent?.trim())
          blocks.push({ id: generateId(), type: "paragraph", content: extractInlineNodes(el) });
        break;
    }
  }

  container.childNodes.forEach(processNode);
  return { version: 1, blocks: blocks.length ? blocks : [emptyParagraph()] };
}

// ─── Import Markdown ───────────────────────────────────────

function parseMDInline(text: string): InlineNode[] {
  const hits: Array<{ start: number; end: number; node: InlineNode }> = [];
  const patterns: Array<{ re: RegExp; make: (m: RegExpExecArray) => InlineNode }> = [
    { re: /\[([^\]]+)\]\(([^)]+)\)/g, make: (m) => ({ type: "link", text: m[1], href: m[2], target: "_blank" }) },
    { re: /`([^`]+)`/g, make: (m) => ({ type: "inlineCode", text: m[1] }) },
    { re: /\*\*([^*]+)\*\*/g, make: (m) => ({ type: "text", text: m[1], marks: [{ type: "bold" }] }) },
    { re: /\*([^*]+)\*/g, make: (m) => ({ type: "text", text: m[1], marks: [{ type: "italic" }] }) },
    { re: /~~([^~]+)~~/g, make: (m) => ({ type: "text", text: m[1], marks: [{ type: "strike" }] }) },
    { re: /#[\w\u0600-\u06FF\u200c]+/g, make: (m) => ({ type: "hashtag", text: m[0] }) },
  ];

  for (const pat of patterns) {
    pat.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pat.re.exec(text)) !== null) {
      const overlaps = hits.some((h) => m!.index < h.end && m!.index + m![0].length > h.start);
      if (!overlaps) hits.push({ start: m.index, end: m.index + m[0].length, node: pat.make(m) });
    }
  }

  hits.sort((a, b) => a.start - b.start);
  const result: InlineNode[] = [];
  let last = 0;
  for (const hit of hits) {
    if (hit.start > last) result.push({ type: "text", text: text.slice(last, hit.start) });
    result.push(hit.node);
    last = hit.end;
  }
  if (last < text.length) result.push({ type: "text", text: text.slice(last) });
  return result.length ? result : [{ type: "text", text }];
}

export function importMarkdown(md: string): EditorDoc {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    const hm = line.match(/^(#{1,6})\s+(.+)/);
    if (hm) {
      blocks.push({ id: generateId(), type: "heading", level: hm[1].length as any, content: parseMDInline(hm[2]) });
      i++;
      continue;
    }

    // HR
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ id: generateId(), type: "hr" });
      i++;
      continue;
    }

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        contentLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ id: generateId(), type: "code", language: lang || undefined, content: contentLines.join("\n") });
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      blocks.push({ id: generateId(), type: "blockquote", content: parseMDInline(line.slice(2)) });
      i++;
      continue;
    }

    // Task list
    if (/^- \[[ x]\]/.test(line)) {
      const items: any[] = [];
      while (i < lines.length && /^- \[[ x]\]/.test(lines[i])) {
        items.push({ id: generateId("li"), content: parseMDInline(lines[i].slice(6)), checked: lines[i][3] === "x" });
        i++;
      }
      blocks.push({ id: generateId(), type: "taskList", items });
      continue;
    }

    // Bullet list
    if (/^[-*+]\s/.test(line)) {
      const items: any[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push({ id: generateId("li"), content: parseMDInline(lines[i].slice(2)) });
        i++;
      }
      blocks.push({ id: generateId(), type: "bulletList", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: any[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push({ id: generateId("li"), content: parseMDInline(lines[i].replace(/^\d+\.\s/, "")) });
        i++;
      }
      blocks.push({ id: generateId(), type: "orderedList", items });
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|> |- |\d+\. )/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length)
      blocks.push({ id: generateId(), type: "paragraph", content: parseMDInline(paraLines.join(" ")) });
  }

  return { version: 1, blocks: blocks.length ? blocks : [emptyParagraph()] };
}

// ─── Import JSON ───────────────────────────────────────────

export function importJSON(json: string): EditorDoc {
  try {
    const doc = JSON.parse(json) as EditorDoc;
    if (doc.version !== 1 || !Array.isArray(doc.blocks)) throw new Error("invalid");
    return doc;
  } catch {
    return emptyDoc();
  }
}

// ─── Helpers ──────────────────────────────────────────────

export function emptyParagraph(): Block {
  return { id: generateId(), type: "paragraph", content: [] };
}

export function emptyDoc(): EditorDoc {
  return { version: 1, blocks: [emptyParagraph()] };
}
