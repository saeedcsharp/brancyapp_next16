"use client";
import React, { useRef, useCallback, useLayoutEffect, useState } from "react";
import { useEditor } from "../core/EditorContext";
import { renderInlineHTML, extractInlineNodes } from "../utils/serializer";
import { handlePlainTextPaste } from "../utils/paste";
import type { BulletListBlock, OrderedListBlock, TaskListBlock, ListItem } from "../types";
import { generateId } from "../utils/idGenerator";
import s from "../TextEditor.module.css";

type ListBlock = BulletListBlock | OrderedListBlock | TaskListBlock;
interface Props {
  block: ListBlock;
}

function ListItemComp({
  item,
  idx,
  blockId,
  listType,
  items,
  onUpdate,
  focusTargetId,
  clearFocusTargetId,
  requestFocusTargetId,
}: {
  item: ListItem;
  idx: number;
  blockId: string;
  listType: "bulletList" | "orderedList" | "taskList";
  items: ListItem[];
  onUpdate: (items: ListItem[]) => void;
  focusTargetId: string | null;
  clearFocusTargetId: () => void;
  requestFocusTargetId: (id: string) => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const isFocusedRef = useRef(false);
  const { state, config, dispatch, insertBlock, deleteBlock, focusBlock, blockRefs, triggerAutoSave } = useEditor();

  useLayoutEffect(() => {
    if (focusTargetId !== item.id || !divRef.current) return;

    divRef.current.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(divRef.current);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
    clearFocusTargetId();
  }, [clearFocusTargetId, focusTargetId, item.id]);

  useLayoutEffect(() => {
    if (divRef.current && !isFocusedRef.current) {
      const html = renderInlineHTML(item.content);
      if (divRef.current.innerHTML !== html) divRef.current.innerHTML = html || "";
    }
  }, [item.content]);

  const handleInput = useCallback(() => {
    if (!divRef.current) return;
    const newItems = items.map((it, i) => (i === idx ? { ...it, content: extractInlineNodes(divRef.current!) } : it));
    onUpdate(newItems);
    triggerAutoSave();
  }, [items, idx, onUpdate, triggerAutoSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const div = divRef.current;
      if (!div) return;
      const isEmpty = !div.textContent?.trim();

      // Enter: create a new list item
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const newItem: ListItem = { id: generateId("li"), content: [], checked: false };
        const newItems = [...items];
        newItems.splice(idx + 1, 0, newItem);
        onUpdate(newItems);
        requestFocusTargetId(newItem.id);
        return;
      }

      // Shift+Enter: exit the list and continue in a paragraph below it
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        const newId = insertBlock("paragraph", blockId);
        focusBlock(newId, true);
        return;
      }

      if (e.key === "Backspace" && isEmpty) {
        e.preventDefault();
        if (items.length === 1) {
          // Convert to paragraph
          deleteBlock(blockId);
          return;
        }
        const newItems = items.filter((_, i) => i !== idx);
        onUpdate(newItems);
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        // Indent/outdent - simplified
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
    [items, idx, onUpdate, deleteBlock, blockId, insertBlock, focusBlock, requestFocusTargetId],
  );

  const handleCheckChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newItems = items.map((it, i) => (i === idx ? { ...it, checked: e.target.checked } : it));
      onUpdate(newItems);
    },
    [items, idx, onUpdate],
  );

  return (
    <li className={[s.listItem, listType === "taskList" ? s.taskListItem : ""].filter(Boolean).join(" ")}>
      {listType === "taskList" && (
        <input type="checkbox" checked={!!item.checked} onChange={handleCheckChange} className={s.taskCheckbox} />
      )}
      <div
        ref={divRef}
        className={s.listItemContent}
        contentEditable={!config.readOnly}
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => {
          isFocusedRef.current = true;
          dispatch({ type: "SET_ACTIVE_BLOCK", id: blockId });
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
        onPaste={handlePlainTextPaste}
        onKeyDown={handleKeyDown}
        spellCheck={state.settings.spellCheck}
      />
    </li>
  );
}

export function ListBlockComponent({ block }: Props) {
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);
  const { dispatch, triggerAutoSave } = useEditor();

  const handleUpdate = useCallback(
    (items: ListItem[]) => {
      dispatch({ type: "SET_LIST_ITEMS", blockId: block.id, items });
      triggerAutoSave();
    },
    [block.id, dispatch, triggerAutoSave],
  );

  const clearFocusTargetId = useCallback(() => setFocusTargetId(null), []);
  const requestFocusTargetId = useCallback((id: string) => setFocusTargetId(id), []);

  const items = "items" in block ? block.items : [];
  const listStyle: React.CSSProperties = {
    textAlign: block.align || undefined,
    direction: block.direction && block.direction !== "auto" ? block.direction : undefined,
    marginTop: block.spaceBefore ? `${block.spaceBefore}px` : undefined,
    marginBottom: block.spaceAfter ? `${block.spaceAfter}px` : undefined,
  };

  const Tag = block.type === "orderedList" ? "ol" : "ul";

  return (
    <Tag
      className={[
        s.listBlock,
        block.type === "taskList" ? s.taskListBlock : "",
        block.type === "orderedList" ? s.orderedListBlock : s.bulletListBlock,
      ]
        .filter(Boolean)
        .join(" ")}
      style={listStyle}>
      {items.map((item, idx) => (
        <ListItemComp
          key={item.id}
          item={item}
          idx={idx}
          blockId={block.id}
          listType={block.type as any}
          items={items}
          onUpdate={handleUpdate}
          focusTargetId={focusTargetId}
          clearFocusTargetId={clearFocusTargetId}
          requestFocusTargetId={requestFocusTargetId}
        />
      ))}
    </Tag>
  );
}
