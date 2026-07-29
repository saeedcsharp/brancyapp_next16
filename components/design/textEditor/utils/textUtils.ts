import type { EditorDoc, Block, InlineNode, ListItem } from "../types";

function inlineText(nodes: InlineNode[]): string {
  if (!nodes) return "";
  // If nodes is not an array, try to handle common alternatives
  if (!Array.isArray(nodes)) {
    if (typeof (nodes as any) === "string") return nodes as any;
    if ((nodes as any).text) return String((nodes as any).text);
    return "";
  }
  return nodes.map((n) => n?.text ?? "").join("");
}

function listText(items: ListItem[]): string {
  return items
    .map((item) => {
      const t = inlineText(item.content);
      const childT = item.children ? listText(item.children) : "";
      return t + (childT ? " " + childT : "");
    })
    .join(" ");
}

export function getBlockPlainText(block: Block): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "blockquote":
      return inlineText(block.content);
    case "bulletList":
    case "orderedList":
    case "taskList":
      return listText(block.items);
    case "table":
      return block.rows.map((r) => r.cells.map((c) => inlineText(c.content)).join("\t")).join("\n");
    case "code":
      return block.content;
    default:
      return "";
  }
}

export function getDocPlainText(doc: EditorDoc): string {
  return doc.blocks.map(getBlockPlainText).filter(Boolean).join("\n");
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countChars(text: string): number {
  return text.length;
}

export function countParagraphs(doc: EditorDoc): number {
  return doc.blocks.filter((b) => b.type === "paragraph" || b.type === "heading" || b.type === "blockquote").length;
}

export function getDocStats(doc: EditorDoc) {
  const text = getDocPlainText(doc);
  return {
    chars: countChars(text),
    words: countWords(text),
    paragraphs: countParagraphs(doc),
    blocks: doc.blocks.length,
  };
}
