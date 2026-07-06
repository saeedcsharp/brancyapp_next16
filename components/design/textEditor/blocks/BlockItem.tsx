"use client";
import React, { useRef, useCallback } from "react";
import { useEditor } from "../core/EditorContext";
import type { Block } from "../types";
import { DragHandleIcon, BlockMenuIcon } from "../icons";
import s from "../TextEditor.module.css";

interface BlockItemProps {
  block: Block;
  children: React.ReactNode;
}

export function BlockItem({ block, children }: BlockItemProps) {
  const { state, dispatch, moveBlock, duplicateBlock, deleteBlock, focusNextBlock } = useEditor();
  const isDragging = state.dragBlockId === block.id;
  const isDragOver = state.dragOverBlockId === block.id;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", block.id);
      e.dataTransfer.effectAllowed = "move";
      dispatch({ type: "SET_DRAG_BLOCK", blockId: block.id });
    },
    [block.id, dispatch],
  );

  const handleDragEnd = useCallback(() => {
    dispatch({ type: "SET_DRAG_BLOCK", blockId: null });
    dispatch({ type: "SET_DRAG_OVER_BLOCK", blockId: null });
  }, [dispatch]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (state.dragBlockId && state.dragBlockId !== block.id) {
        dispatch({ type: "SET_DRAG_OVER_BLOCK", blockId: block.id });
      }
    },
    [block.id, state.dragBlockId, dispatch],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        dispatch({ type: "SET_DRAG_OVER_BLOCK", blockId: null });
      }
    },
    [dispatch],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const fromId = e.dataTransfer.getData("text/plain");
      if (fromId && fromId !== block.id) {
        dispatch({ type: "REORDER_BLOCKS", fromId, toId: block.id });
      }
      dispatch({ type: "SET_DRAG_BLOCK", blockId: null });
      dispatch({ type: "SET_DRAG_OVER_BLOCK", blockId: null });
    },
    [block.id, dispatch],
  );

  const handleBlockMenuClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      dispatch({
        type: "SHOW_BLOCK_MENU",
        config: { blockId: block.id, x: rect.right + 8, y: rect.top },
      });
    },
    [block.id, dispatch],
  );

  // Context menu via right-click on block content
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({
        type: "SHOW_CONTEXT_MENU",
        config: { x: e.clientX, y: e.clientY, blockId: block.id, type: "block" },
      });
    },
    [block.id, dispatch],
  );

  // Long-press for touch devices
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      longPressTimer.current = setTimeout(() => {
        dispatch({
          type: "SHOW_CONTEXT_MENU",
          config: { x: touch.clientX, y: touch.clientY, blockId: block.id, type: "block" },
        });
      }, 700);
    },
    [block.id, dispatch],
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const isHR = block.type === "hr";

  return (
    <div
      className={[
        s.blockItem,
        isDragging ? s.blockItemDragging : "",
        isDragOver ? s.blockItemDragOver : "",
        state.activeBlockId === block.id ? s.blockItemActive : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      data-block-id={block.id}
      data-block-type={block.type}>
      {/* Left controls */}
      <div className={s.blockControls}>
        <button
          className={s.blockMenuBtn}
          onClick={handleBlockMenuClick}
          onMouseDown={(e) => e.preventDefault()}
          title="Block menu"
          type="button"
          tabIndex={-1}
          aria-label="Block options">
          <BlockMenuIcon size={14} />
        </button>
        <div
          className={s.dragHandle}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          title="Drag to reorder"
          aria-label="Drag block">
          <DragHandleIcon size={14} />
        </div>
      </div>

      {/* Block content */}
      <div className={s.blockContent}>{children}</div>
    </div>
  );
}
