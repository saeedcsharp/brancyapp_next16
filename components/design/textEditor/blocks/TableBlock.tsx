"use client";
import React, { useRef, useCallback, useLayoutEffect } from "react";
import { useEditor } from "../core/EditorContext";
import { renderInlineHTML, extractInlineNodes } from "../utils/serializer";
import { handlePlainTextPaste } from "../utils/paste";
import type { TableBlock, TableRow, TableCell, InlineNode } from "../types";
import { generateId } from "../utils/idGenerator";
import s from "../TextEditor.module.css";

interface Props {
  block: TableBlock;
}

function TableCellComp({
  cell,
  rowIdx,
  cellIdx,
  rows,
  onUpdate,
  isHeader,
}: {
  cell: TableCell;
  rowIdx: number;
  cellIdx: number;
  rows: TableRow[];
  onUpdate: (rows: TableRow[]) => void;
  isHeader: boolean;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const isFocusedRef = useRef(false);
  const { state, config } = useEditor();

  useLayoutEffect(() => {
    if (!divRef.current || isFocusedRef.current) return;
    const html = renderInlineHTML(cell.content);
    if (divRef.current.innerHTML !== html) divRef.current.innerHTML = html || "";
  }, [cell.content]);

  const handleInput = useCallback(() => {
    if (!divRef.current) return;
    const newContent = extractInlineNodes(divRef.current);
    const newRows = rows.map((row, ri) =>
      ri === rowIdx
        ? { ...row, cells: row.cells.map((c, ci) => (ci === cellIdx ? { ...c, content: newContent } : c)) }
        : row,
    );
    onUpdate(newRows);
  }, [rows, rowIdx, cellIdx, onUpdate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const nextCellIdx = cellIdx + 1;
        const currentRow = rows[rowIdx];
        if (nextCellIdx < currentRow.cells.length) {
          const nextCell = divRef.current?.parentElement?.parentElement?.children[nextCellIdx]?.querySelector(
            "[contenteditable]",
          ) as HTMLElement;
          nextCell?.focus();
        } else if (rowIdx < rows.length - 1) {
          const nextRow = divRef.current?.parentElement?.parentElement?.parentElement?.children[rowIdx + 1];
          const firstCell = nextRow?.children[0]?.querySelector("[contenteditable]") as HTMLElement;
          firstCell?.focus();
        }
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
    [cellIdx, rowIdx, rows],
  );

  const Tag = isHeader ? "th" : "td";

  return (
    <Tag className={[s.tableCell, isHeader ? s.tableCellHeader : ""].filter(Boolean).join(" ")}>
      <div
        ref={divRef}
        className={s.tableCellContent}
        contentEditable={!config.readOnly}
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
        onPaste={handlePlainTextPaste}
        onKeyDown={handleKeyDown}
        spellCheck={state.settings.spellCheck}
      />
    </Tag>
  );
}

export function TableBlockComponent({ block }: Props) {
  const { dispatch, triggerAutoSave } = useEditor();

  const handleUpdate = useCallback(
    (rows: TableRow[]) => {
      dispatch({ type: "SET_TABLE_ROWS", blockId: block.id, rows });
      triggerAutoSave();
    },
    [block.id, dispatch, triggerAutoSave],
  );

  const addRow = useCallback(() => {
    const cols = block.rows[0]?.cells.length || 3;
    const newRow: TableRow = {
      id: generateId("tr"),
      cells: Array.from({ length: cols }, () => ({ id: generateId("tc"), content: [] })),
    };
    handleUpdate([...block.rows, newRow]);
  }, [block.rows, handleUpdate]);

  const addCol = useCallback(() => {
    const newRows = block.rows.map((row) => ({
      ...row,
      cells: [...row.cells, { id: generateId("tc"), content: [], isHeader: row.cells[0]?.isHeader }],
    }));
    handleUpdate(newRows);
  }, [block.rows, handleUpdate]);

  const removeRow = useCallback(
    (rowIdx: number) => {
      if (block.rows.length <= 1) return;
      handleUpdate(block.rows.filter((_, i) => i !== rowIdx));
    },
    [block.rows, handleUpdate],
  );

  const removeCol = useCallback(
    (colIdx: number) => {
      if (block.rows[0]?.cells.length <= 1) return;
      handleUpdate(
        block.rows.map((row) => ({
          ...row,
          cells: row.cells.filter((_, i) => i !== colIdx),
        })),
      );
    },
    [block.rows, handleUpdate],
  );

  return (
    <div className={s.tableWrapper}>
      <div className={s.tableScrollContainer}>
        <table className={s.table}>
          <tbody>
            {block.rows.map((row, rowIdx) => (
              <tr key={row.id} className={s.tableRow}>
                {row.cells.map((cell, cellIdx) => (
                  <TableCellComp
                    key={cell.id}
                    cell={cell}
                    rowIdx={rowIdx}
                    cellIdx={cellIdx}
                    rows={block.rows}
                    onUpdate={handleUpdate}
                    isHeader={!!cell.isHeader}
                  />
                ))}
                <td className={s.tableRowAction}>
                  <button
                    className={s.tableRemoveBtn}
                    onClick={() => removeRow(rowIdx)}
                    onMouseDown={(e) => e.preventDefault()}
                    title="Remove row"
                    type="button"
                    tabIndex={-1}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.tableActions}>
        <button
          className={s.tableAddBtn}
          onClick={addRow}
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          tabIndex={-1}>
          + Row
        </button>
        <button
          className={s.tableAddBtn}
          onClick={addCol}
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          tabIndex={-1}>
          + Column
        </button>
      </div>
    </div>
  );
}
