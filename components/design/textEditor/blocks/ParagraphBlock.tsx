"use client";
import React, { useRef, useCallback, useLayoutEffect } from "react";
import { useEditor } from "../core/EditorContext";
import { renderInlineHTML, extractInlineNodes } from "../utils/serializer";
import { handlePlainTextPaste } from "../utils/paste";
import { getIndentStyle } from "../utils/indentStyle";
import type { ParagraphBlock } from "../types";
import s from "../TextEditor.module.css";

interface Props {
  block: ParagraphBlock;
}

export function ParagraphBlockComponent({ block }: Props) {
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

  // Register ref
  useLayoutEffect(() => {
    if (divRef.current) blockRefs.current.set(block.id, divRef.current);
    return () => {
      blockRefs.current.delete(block.id);
    };
  }, [block.id, blockRefs]);

  // Sync innerHTML from model only when not focused
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
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const div = divRef.current;
      if (!div) return;
      const isEmpty = !div.textContent?.trim() || div.innerHTML === "<br>";

      // Enter: insert line break
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        // insert a single <br> and a zero-width space so caret lands after
        try {
          document.execCommand("insertHTML", false, "<br><span>&#8203;</span>");
        } catch {
          /* fallback */
        }
        return;
      }

      // Shift+Enter: create new block (split)
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        pushHistory();
        insertBlock("paragraph", block.id);
        return;
      }

      if (e.key === "Backspace" && isEmpty) {
        e.preventDefault();
        deleteBlock(block.id);
        focusPrevBlock(block.id);
        return;
      }

      if (e.key === "ArrowUp" && !e.shiftKey) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          if (range.startOffset === 0 && range.startContainer === div.firstChild) {
            e.preventDefault();
            focusPrevBlock(block.id);
          }
        }
      }

      if (e.key === "ArrowDown" && !e.shiftKey) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const lastChild = div.lastChild;
          if (lastChild && range.endContainer === lastChild && range.endOffset === (lastChild as Text).length) {
            e.preventDefault();
            focusNextBlock(block.id);
          }
        }
      }

      // Shortcuts
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
          case "z":
            e.preventDefault();
            // handled by EditorContext undo
            break;
        }
      }
    },
    [block.id, insertBlock, deleteBlock, focusPrevBlock, focusNextBlock, pushHistory],
  );

  const blockStyle: React.CSSProperties = {
    textAlign: block.align || undefined,
    direction: block.direction && block.direction !== "auto" ? block.direction : undefined,
    lineHeight: block.lineHeight || undefined,
    ...getIndentStyle(block.indent),
    marginTop: block.spaceBefore ? `${block.spaceBefore}px` : undefined,
    marginBottom: block.spaceAfter ? `${block.spaceAfter}px` : undefined,
  };

  return (
    <div
      ref={divRef}
      className={s.paragraphBlock}
      contentEditable={!config.readOnly}
      suppressContentEditableWarning
      style={blockStyle}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPaste={handlePlainTextPaste}
      onKeyDown={handleKeyDown}
      data-placeholder={config.placeholder || "متن خود را اینجا بنویسید..."}
      spellCheck={state.settings.spellCheck}
      data-block-id={block.id}
    />
  );
}
