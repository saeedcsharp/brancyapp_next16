"use client";
import React, { useEffect, useRef } from "react";
import { useEditor } from "../core/EditorContext";
import { TrashIcon, DuplicateIcon, MoveUpIcon, MoveDownIcon, AIIcon, CopyIcon } from "../icons";
import s from "../TextEditor.module.css";

const AI_OPS = [
  { id: "rewrite", label: "Rewrite" },
  // { id: "continue", label: "Continue Writing" },
  // { id: "summarize", label: "Summarize" },
  // { id: "translate", label: "Translate" },
  // { id: "grammar", label: "Fix Grammar" },
];

export function BlockMenu() {
  const { state, dispatch, deleteBlock, moveBlock, duplicateBlock } = useEditor();
  const { blockMenu } = state;
  const menuRef = useRef<HTMLDivElement>(null);
  const hasMultipleBlocks = state.doc.blocks.length > 1;

  useEffect(() => {
    if (!blockMenu) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        dispatch({ type: "HIDE_BLOCK_MENU" });
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [blockMenu, dispatch]);

  if (!blockMenu) return null;

  const { blockId, x, y } = blockMenu;

  // Position logic: clamp to viewport
  const adjustedY = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 800) - 280);
  const adjustedX = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1200) - 180);

  const handleCopyStyle = () => {
    const block = state.doc.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const style = { align: (block as any).align, direction: (block as any).direction, indent: (block as any).indent };
    navigator.clipboard?.writeText(JSON.stringify(style)).catch(() => {});
    dispatch({ type: "HIDE_BLOCK_MENU" });
  };

  const handleAI = (op: string) => {
    dispatch({ type: "HIDE_BLOCK_MENU" });
    console.log("[AI]", op, "for block", blockId);
    // AI integration point - currently logs to console
    alert(`AI ${op} — AI backend not connected. This will call onAIRequest(op, content) when configured.`);
  };

  return (
    <div
      ref={menuRef}
      className={s.blockMenuPopup}
      style={{ top: adjustedY, left: adjustedX }}
      onMouseDown={(e) => e.stopPropagation()}>
      {hasMultipleBlocks && (
        <>
          <button
            className={s.contextMenuItem}
            onClick={() => {
              moveBlock(blockId, "up");
              dispatch({ type: "HIDE_BLOCK_MENU" });
            }}>
            <MoveUpIcon size={14} /> Move Up
          </button>
          <button
            className={s.contextMenuItem}
            onClick={() => {
              moveBlock(blockId, "down");
              dispatch({ type: "HIDE_BLOCK_MENU" });
            }}>
            <MoveDownIcon size={14} /> Move Down
          </button>
          <button
            className={s.contextMenuItem}
            onClick={() => {
              duplicateBlock(blockId);
              dispatch({ type: "HIDE_BLOCK_MENU" });
            }}>
            <DuplicateIcon size={14} /> Duplicate
          </button>
        </>
      )}
      <button className={s.contextMenuItem} onClick={handleCopyStyle}>
        <CopyIcon size={14} /> Copy Style
      </button>
      {hasMultipleBlocks && <div className={s.contextMenuDivider} />}

      {/* AI Section */}
      <div className={s.contextMenuSubHeader}>
        <AIIcon size={13} /> AI Assistant
      </div>
      {AI_OPS.map((op) => (
        <button
          key={op.id}
          className={[s.contextMenuItem, s.contextMenuItemIndent].join(" ")}
          onClick={() => handleAI(op.id)}>
          {op.label}
        </button>
      ))}

      <div className={s.contextMenuDivider} />
      <button
        className={[s.contextMenuItem, s.contextMenuItemDanger].join(" ")}
        onClick={() => {
          deleteBlock(blockId);
          dispatch({ type: "HIDE_BLOCK_MENU" });
        }}>
        <TrashIcon size={14} /> {hasMultipleBlocks ? "Delete Block" : "Clear Content"}
      </button>
    </div>
  );
}
