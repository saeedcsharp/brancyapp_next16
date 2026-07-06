"use client";
import React, { useRef, useCallback, useLayoutEffect } from "react";
import { useEditor } from "../core/EditorContext";
import { renderInlineHTML, extractInlineNodes } from "../utils/serializer";
import { handlePlainTextPaste } from "../utils/paste";
import { getIndentStyle } from "../utils/indentStyle";
import type { HeadingBlock, HeadingLevel } from "../types";
import s from "../TextEditor.module.css";

interface Props {
  block: HeadingBlock;
}

const headingClass: Record<HeadingLevel, string> = {
  1: s.heading1,
  2: s.heading2,
  3: s.heading3,
  4: s.heading4,
  5: s.heading5,
  6: s.heading6,
};

export function HeadingBlockComponent({ block }: Props) {
  const {
    dispatch,
    insertBlock,
    deleteBlock,
    focusPrevBlock,
    focusNextBlock,
    pushHistory,
    triggerAutoSave,
    state,
    blockRefs,
    config,
  } = useEditor();
  const divRef = useRef<HTMLDivElement>(null);
  const isFocusedRef = useRef(false);

  useLayoutEffect(() => {
    if (divRef.current) blockRefs.current.set(block.id, divRef.current);
    return () => {
      blockRefs.current.delete(block.id);
    };
  }, [block.id, blockRefs]);

  useLayoutEffect(() => {
    if (!divRef.current || isFocusedRef.current) return;
    const html = renderInlineHTML(block.content);
    if (divRef.current.innerHTML !== html) divRef.current.innerHTML = html || "";
  }, [block.content]);

  const handleInput = useCallback(() => {
    if (!divRef.current) return;
    dispatch({ type: "SET_CONTENT", blockId: block.id, content: extractInlineNodes(divRef.current) });
    triggerAutoSave();
  }, [block.id, dispatch, triggerAutoSave]);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
    dispatch({ type: "SET_FOCUSED_BLOCK", id: block.id });
    dispatch({ type: "SET_ACTIVE_BLOCK", id: block.id });
  }, [block.id, dispatch]);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    dispatch({ type: "SET_FOCUSED_BLOCK", id: null });
    if (divRef.current)
      dispatch({ type: "SET_CONTENT", blockId: block.id, content: extractInlineNodes(divRef.current) });
  }, [block.id, dispatch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const div = divRef.current;
      if (!div) return;

      // Enter: insert line break
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        try {
          document.execCommand("insertHTML", false, "<br><span>&#8203;</span>");
        } catch {}
        return;
      }

      // Shift+Enter: create new paragraph block
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        pushHistory();
        insertBlock("paragraph", block.id);
        return;
      }

      const isEmpty = !div.textContent?.trim() || div.innerHTML === "<br>";
      if (e.key === "Backspace" && isEmpty) {
        e.preventDefault();
        deleteBlock(block.id);
        focusPrevBlock(block.id);
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            document.execCommand("bold");
            break;
          case "i":
            e.preventDefault();
            document.execCommand("italic");
            break;
          case "u":
            e.preventDefault();
            document.execCommand("underline");
            break;
        }
      }
    },
    [block.id, insertBlock, deleteBlock, focusPrevBlock, pushHistory],
  );

  const blockStyle: React.CSSProperties = {
    textAlign: block.align || undefined,
    direction: block.direction && block.direction !== "auto" ? block.direction : undefined,
    lineHeight: block.lineHeight || undefined,
    ...getIndentStyle(block.indent),
  };

  return (
    <div
      ref={divRef}
      className={[s.headingBlock, headingClass[block.level]].filter(Boolean).join(" ")}
      contentEditable={!config.readOnly}
      suppressContentEditableWarning
      style={blockStyle}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPaste={handlePlainTextPaste}
      onKeyDown={handleKeyDown}
      role="heading"
      aria-level={block.level}
      data-block-id={block.id}
      spellCheck={state.settings.spellCheck}
    />
  );
}
