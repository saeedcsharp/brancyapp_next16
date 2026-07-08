"use client";
import React, { useEffect, useRef, useState } from "react";
import { useEditor } from "../core/EditorContext";
import { CopyIcon, CutIcon, PasteIcon, TrashIcon, DuplicateIcon, MoveUpIcon, MoveDownIcon, AIIcon } from "../icons";
import { getBlockPlainText } from "../utils/textUtils";
import { renderInlineHTML } from "../utils/serializer";
import s from "../TextEditor.module.css";
import RingLoader from "brancy/components/design/loader/ringLoder";

export function ContextMenu() {
  const { state, dispatch, deleteBlock, moveBlock, duplicateBlock, config, pushHistory, blockRefs } = useEditor();
  const { contextMenu } = state;
  const menuRef = useRef<HTMLDivElement>(null);
  const hasMultipleBlocks = state.doc.blocks.length > 1;
  const [isRewriting, setIsRewriting] = useState(false);

  useEffect(() => {
    if (!contextMenu) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        dispatch({ type: "HIDE_CONTEXT_MENU" });
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") dispatch({ type: "HIDE_CONTEXT_MENU" });
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleKey);
    };
  }, [contextMenu, dispatch]);

  if (!contextMenu) return null;

  const { x, y, blockId } = contextMenu;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const adjustedX = Math.min(x, vw - 180);
  const adjustedY = Math.min(y, vh - 250);

  const activeBlock = blockId ? state.doc.blocks.find((b) => b.id === blockId) : null;
  const isParagraph = activeBlock?.type === "paragraph";

  const handleAIRewrite = async () => {
    if (!blockId || !config.onAIRequest || isRewriting || !isParagraph) return;
    const block = state.doc.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const plainText = getBlockPlainText(block);
    if (!plainText.trim()) return;

    setIsRewriting(true);
    try {
      const result = await config.onAIRequest("rewrite", plainText);
      if (result) {
        const newContent: [{ type: "text"; text: string }] = [{ type: "text", text: result }];
        pushHistory();
        dispatch({ type: "SET_CONTENT", blockId, content: newContent });
        // ParagraphBlock only syncs DOM when not focused; force-update the DOM directly
        requestAnimationFrame(() => {
          const el = blockRefs.current.get(blockId);
          if (el) el.innerHTML = renderInlineHTML(newContent);
        });
      }
    } finally {
      setIsRewriting(false);
      close();
    }
  };

  // Only show context menu when click originated inside the block list
  if (typeof document !== "undefined") {
    const el = document.elementFromPoint(adjustedX, adjustedY);
    if (!el || !el.closest(`.${s.blockList}`)) return null;
  }

  const close = () => dispatch({ type: "HIDE_CONTEXT_MENU" });

  const handleCopy = () => {
    document.execCommand("copy");
    close();
  };
  const handleCut = () => {
    document.execCommand("cut");
    close();
  };
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand("insertText", false, text);
    } catch {
      document.execCommand("paste");
    }
    close();
  };
  const handlePastePlain = async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand("insertText", false, text);
    } catch {
      /* ignore */
    }
    close();
  };

  return (
    <div
      ref={menuRef}
      className={s.contextMenuPopup}
      style={{ top: adjustedY, left: adjustedX }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}>
      <button className={s.contextMenuItem} onClick={handleCopy}>
        <CopyIcon size={13} /> Copy
      </button>
      <button className={s.contextMenuItem} onClick={handleCut}>
        <CutIcon size={13} /> Cut
      </button>
      <button className={s.contextMenuItem} onClick={handlePaste}>
        <PasteIcon size={13} /> Paste
      </button>
      <button className={s.contextMenuItem} onClick={handlePastePlain}>
        <PasteIcon size={13} /> Paste as Plain Text
      </button>

      {blockId && hasMultipleBlocks && (
        <>
          <div className={s.contextMenuDivider} />
          <button
            className={s.contextMenuItem}
            onClick={() => {
              moveBlock(blockId, "up");
              close();
            }}>
            <MoveUpIcon size={13} /> Move Up
          </button>
          <button
            className={s.contextMenuItem}
            onClick={() => {
              moveBlock(blockId, "down");
              close();
            }}>
            <MoveDownIcon size={13} /> Move Down
          </button>
          <button
            className={s.contextMenuItem}
            onClick={() => {
              duplicateBlock(blockId);
              close();
            }}>
            <DuplicateIcon size={13} /> Duplicate
          </button>

          <div className={s.contextMenuDivider} />
          {isParagraph && config.onAIRequest && (
            <>
              <div className={s.contextMenuSubHeader}>
                <AIIcon size={12} /> AI Assistant
              </div>
              <button
                className={[s.contextMenuItem, s.contextMenuItemIndent].join(" ")}
                onClick={() => void handleAIRewrite()}
                disabled={isRewriting}>
                {isRewriting ? <RingLoader width={14} height={14} color="blue" /> : "Rewrite"}
              </button>
              <div className={s.contextMenuDivider} />
            </>
          )}
        </>
      )}

      {blockId && (
        <>
          <div className={s.contextMenuDivider} />
          <button
            className={[s.contextMenuItem, s.contextMenuItemDanger].join(" ")}
            onClick={() => {
              deleteBlock(blockId);
              close();
            }}>
            <TrashIcon size={13} /> {hasMultipleBlocks ? "Delete Block" : "Clear Content"}
          </button>
        </>
      )}
    </div>
  );
}
