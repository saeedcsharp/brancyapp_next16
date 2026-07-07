"use client";
import React, { useRef, useCallback, useLayoutEffect } from "react";
import { useEditor } from "../core/EditorContext";
import { renderInlineHTML, extractInlineNodes } from "../utils/serializer";
import { handlePlainTextPaste } from "../utils/paste";
import { getIndentStyle } from "../utils/indentStyle";
import type { BlockquoteBlock } from "../types";
import s from "../TextEditor.module.css";

interface Props {
  block: BlockquoteBlock;
}

export function QuoteBlockComponent({ block }: Props) {
  const { dispatch, insertBlock, deleteBlock, focusPrevBlock, pushHistory, triggerAutoSave, state, blockRefs, config } =
    useEditor();
  const divRef = useRef<HTMLDivElement>(null);
  const isFocusedRef = useRef(false);
  const quoteDirection = block.direction && block.direction !== "auto" ? block.direction : undefined;

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
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        pushHistory();
        insertBlock("paragraph", block.id);
        return;
      }
      const isEmpty = !div.textContent?.trim();
      if (e.key === "Backspace" && isEmpty) {
        e.preventDefault();
        deleteBlock(block.id);
        focusPrevBlock(block.id);
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

  return (
    <blockquote className={s.quoteBlock} style={{ direction: quoteDirection }}>
      <div
        ref={divRef}
        className={s.quoteContent}
        contentEditable={!config.readOnly}
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          textAlign: block.align || undefined,
          direction: quoteDirection,
          ...getIndentStyle(block.indent),
        }}
        dir={quoteDirection}
        data-block-id={block.id}
        spellCheck={state.settings.spellCheck}
        onPaste={handlePlainTextPaste}
      />
    </blockquote>
  );
}
