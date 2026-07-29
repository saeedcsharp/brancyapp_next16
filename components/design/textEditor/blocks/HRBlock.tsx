"use client";
import React, { useCallback } from "react";
import { useEditor } from "../core/EditorContext";
import type { HRBlock } from "../types";
import s from "../TextEditor.module.css";

interface Props {
  block: HRBlock;
}

export function HRBlockComponent({ block }: Props) {
  const { dispatch, deleteBlock } = useEditor();

  const handleClick = useCallback(() => {
    dispatch({ type: "SET_ACTIVE_BLOCK", id: block.id });
  }, [block.id, dispatch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        deleteBlock(block.id);
      }
    },
    [block.id, deleteBlock],
  );

  return (
    <div
      className={s.hrBlock}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="separator"
      aria-label="Horizontal rule">
      <hr className={s.hrLine} />
    </div>
  );
}
