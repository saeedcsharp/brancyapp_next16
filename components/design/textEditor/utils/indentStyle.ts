import type { CSSProperties } from "react";

export function getIndentStyle(indent?: number): CSSProperties {
  if (!indent) return {};
  return {
    paddingInlineStart: `${indent * 24}px`,
  };
}