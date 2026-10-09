import initialzedTime from "brancy/helper/manageTimer";
import { createElement, CSSProperties, ReactNode } from "react";
import { DateObject } from "react-multi-date-picker";

const promptCodeTokenPattern =
  /(\*\*[^*]+\*\*)|(^\s*(?:[-*]\s*)?[^{}[\],:"*\r\n]+)(?=\s*:)|("(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?|[{},:])/g;

export const promptSyntaxStyles = {
  key: { color: "var(--color-light-blue)", fontWeight: 500 },
  bold: { color: "var(--color-light-blue)", fontWeight: 500 },
  string: { color: "var(--text-h1)" },
  primitive: { fontWeight: 400 },
  punctuation: { color: "var(--color-purple)", fontWeight: 700 },
  placeholder: {
    display: "inline-block",
    marginInline: "0.12em",
    paddingInline: "0.25em",
    border: "1px solid var(--color-light-yellow30, var(--color-light-yellow10))",
    borderRadius: "4px",
    background: "var(--color-light-yellow10)",
    color: "var(--color-light-yellow)",
  },
} satisfies Record<string, CSSProperties>;

export const promptCodeStyles = {
  block: {
    maxHeight: "min(62vh, 720px)",
    margin: "10px 0 0",
    padding: "14px 12px",
    overflow: "auto",
    border: "1px solid var(--color-gray30)",
    borderRadius: "10px",
    background: "var(--color-gray30)",
    color: "var(--text-h1)",
    textAlign: "start",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
    fontSize: "var(--font-12)",
    lineHeight: 1.75,
    tabSize: 2,
    textWrap: "pretty",
  },
  line: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    minHeight: "1.75em",
  },
  content: { minWidth: 0 },
} satisfies Record<string, CSSProperties>;

function renderPromptText(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[A-Za-z0-9_][^\]\r\n]*\])/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return createElement("strong", { key: `${part}-${index}`, style: promptSyntaxStyles.bold }, part.slice(2, -2));
    }
    if (part.startsWith("[") && part.endsWith("]")) {
      return createElement("span", { key: `${part}-${index}`, style: promptSyntaxStyles.placeholder }, part);
    }
    return createElement("span", { key: `${part}-${index}` }, part);
  });
}

export function renderPromptLine(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  promptCodeTokenPattern.lastIndex = 0;
  while ((match = promptCodeTokenPattern.exec(line)) !== null) {
    if (match.index > lastIndex) parts.push(...renderPromptText(line.slice(lastIndex, match.index)));
    const part = match[0];
    const isLabel = line.slice(match.index + part.length).match(/^\s*:/) && !part.startsWith('"');
    const isKey = part.startsWith('"') && line.slice(match.index + part.length).match(/^\s*:/);
    const isString = part.startsWith('"') && part.endsWith('"');
    const isPrimitive = /^(true|false|null|-?\d+(?:\.\d+)?)$/.test(part);
    const isPunctuation = /^[{},:]$/.test(part);
    const style =
      isKey || isLabel
        ? promptSyntaxStyles.key
        : isString
          ? promptSyntaxStyles.string
          : isPrimitive
            ? promptSyntaxStyles.primitive
            : isPunctuation
              ? promptSyntaxStyles.punctuation
              : undefined;
    if (style) {
      parts.push(
        createElement("span", { key: `${part}-${match.index}`, style }, isString ? renderPromptText(part) : part),
      );
    } else {
      parts.push(...renderPromptText(part));
    }
    lastIndex = match.index + part.length;
  }
  if (lastIndex < line.length) parts.push(...renderPromptText(line.slice(lastIndex)));
  return parts;
}

export function PromptCodeBlock({ prompt }: { prompt: string }) {
  return createElement(
    "pre",
    { className: "translate", style: promptCodeStyles.block },
    createElement(
      "code",
      null,
      prompt
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")
        .map((line, index) =>
          createElement(
            "span",
            { key: `${index}-${line}`, style: promptCodeStyles.line },
            createElement("span", { style: promptCodeStyles.content }, renderPromptLine(line)),
          ),
        ),
    ),
  );
}

export interface MetadataItem {
  key: string;
  label: string;
  value: string;
}

export function formatGeneratedMediaTime(timestamp: number): string {
  const time = initialzedTime();
  return new DateObject({
    date: timestamp * 1000,
    calendar: time.calendar,
    locale: time.locale,
  }).format("YYYY/MM/DD HH:mm:ss");
}

function formatMetadataLabel(key: string): string {
  const label = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatMetadataValue(value: unknown, translate: (key: string) => string): string {
  if (value === null) return translate("Not available");
  if (typeof value === "boolean") return value ? translate("Yes") : translate("No");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function parseGeneratedMediaMetadata(
  metadata: string,
  translate: (key: string) => string = (key) => key,
): MetadataItem[] | null {
  try {
    const parsed: unknown = JSON.parse(metadata);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    return Object.entries(parsed).map(([key, value]) => ({
      key,
      label: formatMetadataLabel(key),
      value: formatMetadataValue(value, translate),
    }));
  } catch {
    return null;
  }
}
