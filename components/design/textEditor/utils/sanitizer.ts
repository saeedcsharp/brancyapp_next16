// ─── XSS Sanitizer (no external packages) ──────────────────

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "del",
  "sup",
  "sub",
  "code",
  "span",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "pre",
  "mark",
  "div",
  "input",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel", "data-type"]),
  span: new Set(["style", "data-type", "class"]),
  code: new Set(["data-type", "class"]),
  pre: new Set(["class"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
  li: new Set(["class"]),
  ul: new Set(["class"]),
  ol: new Set(["class"]),
  input: new Set(["type", "checked", "disabled"]),
  "*": new Set(["class", "dir", "align", "id"]),
};

const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "font-size",
  "font-family",
  "font-weight",
  "text-align",
  "text-decoration",
  "line-height",
  "padding-left",
  "padding-inline-start",
  "padding-right",
  "margin-top",
  "margin-bottom",
  "direction",
]);

const DANGEROUS_PROTOCOLS = /^(javascript|vbscript|data|blob):/i;

export function sanitizeHTML(html: string): string {
  if (typeof document === "undefined") return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  function sanitizeStyle(style: string): string {
    return style
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => {
        const colonIdx = s.indexOf(":");
        if (colonIdx < 0) return false;
        const prop = s.slice(0, colonIdx).trim().toLowerCase();
        return ALLOWED_STYLE_PROPS.has(prop);
      })
      .join("; ");
  }

  function sanitizeNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) return node.cloneNode(false);
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tagName)) {
      const frag = document.createDocumentFragment();
      el.childNodes.forEach((child) => {
        const s = sanitizeNode(child);
        if (s) frag.appendChild(s);
      });
      return frag;
    }

    const newEl = document.createElement(tagName);
    const allowedForTag = ALLOWED_ATTRS[tagName] || new Set<string>();
    const allowedGlobal = ALLOWED_ATTRS["*"];

    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (!allowedForTag.has(name) && !allowedGlobal.has(name)) return;

      if (name === "href" || name === "src") {
        const val = attr.value.trim();
        if (DANGEROUS_PROTOCOLS.test(val)) return;
        newEl.setAttribute(name, val);
      } else if (name === "style") {
        const safe = sanitizeStyle(attr.value);
        if (safe) newEl.setAttribute("style", safe);
      } else {
        newEl.setAttribute(name, attr.value);
      }
    });

    el.childNodes.forEach((child) => {
      const s = sanitizeNode(child);
      if (s) newEl.appendChild(s);
    });

    return newEl;
  }

  const result = document.createElement("div");
  doc.body.childNodes.forEach((child) => {
    const s = sanitizeNode(child);
    if (s) result.appendChild(s);
  });
  return result.innerHTML;
}

export function sanitizeURL(url: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  if (DANGEROUS_PROTOCOLS.test(trimmed)) return "";
  return trimmed;
}

export function sanitizeText(text?: string): string {
  const t = text ?? "";
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
