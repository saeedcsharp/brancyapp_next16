"use client";

import type React from "react";
import { sanitizeText } from "./sanitizer";

function preserveLeadingWhitespace(line: string): string {
  const match = line.match(/^[\t ]+/);
  if (!match) return sanitizeText(line);

  const leading = match[0].replace(/\t/g, "    ").replace(/ /g, "&nbsp;");
  const rest = sanitizeText(line.slice(match[0].length));
  return leading + rest;
}

export function handlePlainTextPaste(event: React.ClipboardEvent<HTMLElement>) {
  const pastedText = event.clipboardData.getData("text/plain");
  if (!pastedText) return;

  event.preventDefault();

  const normalized = pastedText.replace(/\r\n?/g, "\n");
  const html = normalized.split("\n").map(preserveLeadingWhitespace).join("<br>");

  document.execCommand("insertHTML", false, html || "<br>");
}
