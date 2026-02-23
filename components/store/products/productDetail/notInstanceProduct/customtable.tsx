import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckBoxButton from "../../../../design/checkBoxButton";
import InputText from "../../../../design/inputText";
import { LanguageKey } from "../../../../../i18n";
import styles from "./customtable.module.css";
interface TableCell {
  value: string;
}
interface TableRow {
  cells: TableCell[];
}
interface CustomTableProps {
  onClose: () => void;
  onInsertTable: (tableHtml: string, titleTable: string) => void;
  initialTable?: string;
  initialTableTitle?: string;
}
export default function CustomTable({ onClose, onInsertTable, initialTable, initialTableTitle }: CustomTableProps) {
  const { t } = useTranslation();
  const initialMinRows = [{ cells: [{ value: "" }, { value: "" }] }, { cells: [{ value: "" }, { value: "" }] }];
  const [rows, setRows] = useState<TableRow[]>(initialMinRows);
  const [cols, setCols] = useState<number>(2);
  const [isHeader, setIsHeader] = useState<boolean>(true);
  const [tableTitle, setTableTitle] = useState<string>("");
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);
  const [hoveredAddColumnIndex, setHoveredAddColumnIndex] = useState<number | null>(null);
  const [hoveredAddRowIndex, setHoveredAddRowIndex] = useState<number | null>(null);
  const [hoveredRemoveRowIndex, setHoveredRemoveRowIndex] = useState<number | null>(null);
  useEffect(() => {
    const ensureTableDimensions = (
      parsedRows: TableRow[],
      parsedCols: number,
      parsedIsHeader: boolean
    ): { finalRows: TableRow[]; finalCols: number; finalIsHeader: boolean } => {
      let finalRows = [...parsedRows];
      let finalCols = parsedCols;
      let finalIsHeader = parsedIsHeader;
      if (finalRows.length === 0 || finalCols === 0) {
        return { finalRows: initialMinRows, finalCols: 2, finalIsHeader: true };
      }
      if (finalCols < 2) {
        const colsToAdd = 2 - finalCols;
        finalRows = finalRows.map((row) => ({
          cells: [...row.cells, ...Array(colsToAdd).fill({ value: "" })],
        }));
        finalCols = 2;
      }
      const minRowsRequired = 2;
      if (finalRows.length < minRowsRequired) {
        const rowsToAdd = minRowsRequired - finalRows.length;
        for (let i = 0; i < rowsToAdd; i++) {
          finalRows.push({ cells: Array(finalCols).fill({ value: "" }) });
        }
      }
      finalRows = finalRows.map((row) => {
        const currentCols = row.cells.length;
        if (currentCols < finalCols) {
          return {
            cells: [...row.cells, ...Array(finalCols - currentCols).fill({ value: "" })],
          };
        } else if (currentCols > finalCols) {
          return { cells: row.cells.slice(0, finalCols) };
        }
        return row;
      });
      return { finalRows, finalCols, finalIsHeader };
    };

    if (!initialTable) {
      setRows(initialMinRows);
      setCols(2);
      setIsHeader(true);
      setTableTitle("");
      return;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(initialTable, "text/html");
    const table = doc.querySelector("table");
    const caption = doc.querySelector("caption");
    let parsedRows: TableRow[] = [];
    let parsedCols = 0;
    let parsedIsHeader = false;
    let parsedTitle = initialTableTitle || "";
    if (caption) {
      parsedTitle = caption.textContent || "";
    }
    if (table) {
      const headerRow = table.querySelector("thead tr");
      const bodyRows = table.querySelectorAll("tbody tr");
      if (headerRow) {
        const headerCells = Array.from(headerRow.querySelectorAll("th")).map((th) => ({
          value: th.textContent || "",
        }));
        parsedCols = headerCells.length;
        parsedRows = [
          { cells: headerCells },
          ...Array.from(bodyRows).map((tr) => ({
            cells: Array.from(tr.querySelectorAll("td")).map((td) => ({
              value: td.textContent || "",
            })),
          })),
        ];
        parsedIsHeader = true;
      } else {
        const trs = Array.from(table.querySelectorAll("tr"));
        if (trs.length > 0) {
          const cells = Array.from(trs[0].querySelectorAll("td")).map((td) => ({
            value: td.textContent || "",
          }));
          parsedCols = cells.length;
          parsedRows = trs.map((tr) => ({
            cells: Array.from(tr.querySelectorAll("td")).map((td) => ({
              value: td.textContent || "",
            })),
          }));
        }
        parsedIsHeader = false;
      }
    }
    const { finalRows, finalCols, finalIsHeader } = ensureTableDimensions(parsedRows, parsedCols, parsedIsHeader);
    setRows(finalRows);
    setCols(finalCols);
    setIsHeader(finalIsHeader);
    console.log("initialTableTitle", initialTableTitle);
    setTableTitle(initialTableTitle || "");
  }, [initialTable]);
  const addRow = (rowIndex?: number) => {
    const newRow: TableRow = {
      cells: Array(cols).fill({ value: "" }),
    };
    const insertIndex = rowIndex !== undefined ? rowIndex + 1 : rows.length;
    const newRows = [...rows];
    newRows.splice(insertIndex, 0, newRow);
    setRows(newRows);
  };
  const removeRow = (rowIndex: number) => {
    if (rows.length <= 2 || (isHeader && rowIndex === 0)) {
      return;
    }
    const newRows = [...rows];
    newRows.splice(rowIndex, 1);
    setRows(newRows);
  };
  const addColumn = (colIndex?: number) => {
    const insertIndex = colIndex !== undefined ? colIndex + 1 : cols;
    setCols(cols + 1);
    setRows(
      rows.map((row) => {
        const newCells = [...row.cells];
        newCells.splice(insertIndex, 0, { value: "" });
        return { cells: newCells };
      })
    );
  };
  const removeColumn = (colIndex: number) => {
    if (cols <= 2) {
      return;
    }
    setCols(cols - 1);
    setRows(
      rows.map((row) => {
        const newCells = [...row.cells];
        newCells.splice(colIndex, 1);
        return { cells: newCells };
      })
    );
  };
  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex].cells[colIndex] = { value: value.slice(0, 50) };
    setRows(newRows);
  };
  const generateTableHtml = () => {
    const styles = `
      <style>
        .size-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: var(--font-14);
          overflow: auto;
        }
        .size-table::-webkit-scrollbar {
          display: block;
        }
        .size-table caption {
          text-align: center;
          font-weight: bold;
          padding: 10px;
          font-size: var(--font-16);
          color: var(--text-h1);
          margin-bottom: 10px;
        }
        .size-table th,
        .size-table td {
          border: 1px solid var(--color-gray30);
          padding: 8px;
          text-align: center;
        }
        .size-table th {
          background-color: var(--color-gray30);
          font-weight: bold;
          color: var(--text-h1);
        }
        .size-table td {
          color: var(--text-h2);
        }
        .size-table tr:hover td {
          background-color: var(--color-gray30);
        }
        @media (max-width: 768px) {
          .size-table {
            display: block;
            overflow: auto;
            white-space: nowrap;
          }
        }
      </style>
    `;
    let tableHtml = `${styles}<div class="headerandinput">`;
    if (tableTitle.trim()) {
      tableHtml += `<div class="title">${tableTitle.trim()}</div>`;
    }
    tableHtml += `<table class="size-table">`;
    if (isHeader) {
      tableHtml += "<thead><tr>";
      for (let i = 0; i < cols; i++) {
        tableHtml += `<th>${rows[0].cells[i].value || ""}</th>`;
      }
      tableHtml += "</tr></thead>";
    }
    tableHtml += "<tbody>";
    const startRow = isHeader ? 1 : 0;
    for (let i = startRow; i < rows.length; i++) {
      tableHtml += "<tr>";
      for (let j = 0; j < cols; j++) {
        tableHtml += `<td>${rows[i].cells[j].value || ""}</td>`;
      }
      tableHtml += "</tr>";
    }
    tableHtml += "</tbody></table></></div>";
    return tableHtml;
  };
  const handleInsert = () => {
    const tableHtml = generateTableHtml();
    onInsertTable(tableHtml, tableTitle);
    onClose();
  };
  return (
    <>
      <div className="dialogBg" onClick={onClose} />
      <div className="popup" style={{ width: "80%", maxWidth: "800px" }}>
        <div className="headerandinput">
          <div className="headerparent">
            <div className="title">{t(LanguageKey.product_addtable)}</div>
            <img
              onClick={onClose}
              style={{
                cursor: "pointer",
                width: "30px",
                height: "30px",
                alignSelf: "end",
              }}
              title="ℹ️ close"
              src="/close-box.svg"
            />
          </div>
          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.product_tabletitle)}</div>
            <InputText
              name="tableTitle"
              className="textinputbox"
              value={tableTitle}
              handleInputChange={(e) => setTableTitle(e.target.value)}
              placeHolder={t(LanguageKey.product_tabletitleExplain)}
              maxLength={50}
            />
          </div>
        </div>
        <CheckBoxButton
          title={t(LanguageKey.product_tableheaderoption)}
          textlabel={t(LanguageKey.product_tableheaderoption)}
          handleToggle={(e: ChangeEvent<HTMLInputElement>) => setIsHeader(e.target.checked)}
          value={isHeader}
        />
        <div className={styles.tablePreview}>
          <table>
            <thead>
              <tr>
                <th>
                  {rows.length}x{cols}
                </th>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <th
                    key={`col-action-${colIndex}`}
                    className={`${styles.actionHeader} ${
                      hoveredColumnIndex === colIndex ? styles.highlightedColumn : ""
                    }`}>
                    <img
                      title={t(LanguageKey.product_AddColumn)}
                      className="closepopup"
                      alt={t(LanguageKey.product_AddColumn)}
                      src="/add-circle.svg"
                      onClick={() => addColumn(colIndex)}
                      onMouseEnter={() => setHoveredAddColumnIndex(colIndex)}
                      onMouseLeave={() => setHoveredAddColumnIndex(null)}
                    />
                    <img
                      title={t(LanguageKey.product_DeleteColumn)}
                      className={`closepopup ${cols <= 2 ? "fadeDiv" : ""}`}
                      alt={t(LanguageKey.product_DeleteColumn)}
                      src="/min-circle.svg"
                      onClick={() => removeColumn(colIndex)}
                      onMouseEnter={() => setHoveredColumnIndex(colIndex)}
                      onMouseLeave={() => setHoveredColumnIndex(null)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`
                    ${isHeader && rowIndex === 0 ? styles.headerRow : ""}
                    ${hoveredAddRowIndex === rowIndex ? styles.highlightAddRowBorder : ""}
                    ${hoveredRemoveRowIndex === rowIndex ? styles.highlightRemoveRowBg : ""}
                  `}>
                  <td className={styles.actionCell}>
                    <img
                      title={t(LanguageKey.product_AddRow)}
                      className="closepopup"
                      alt={t(LanguageKey.product_AddRow)}
                      src="/add-circle.svg"
                      onClick={() => addRow(rowIndex)}
                      onMouseEnter={() => setHoveredAddRowIndex(rowIndex)}
                      onMouseLeave={() => setHoveredAddRowIndex(null)}
                    />
                    <img
                      title={t(LanguageKey.product_DeleteRow)}
                      className={`closepopup ${(isHeader && rowIndex === 0) || rows.length <= 2 ? "fadeDiv" : ""}`}
                      alt={t(LanguageKey.product_DeleteRow)}
                      src="/min-circle.svg"
                      onClick={() =>
                        (isHeader && rowIndex === 0) || rows.length <= 2 ? undefined : removeRow(rowIndex)
                      }
                      onMouseEnter={() => setHoveredRemoveRowIndex(rowIndex)}
                      onMouseLeave={() => setHoveredRemoveRowIndex(null)}
                    />
                  </td>
                  {row.cells.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={`
                      ${hoveredColumnIndex === colIndex ? styles.highlightedColumn : ""}
                      ${hoveredAddColumnIndex === colIndex ? styles.highlightAddColumnBorder : ""}
                      `}>
                      <InputText
                        name={`cell-${rowIndex}-${colIndex}`}
                        className="textinputbox"
                        value={cell.value}
                        handleInputChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        placeHolder={
                          isHeader && rowIndex === 0
                            ? `${t(LanguageKey.rowheader)} ${colIndex + 1}`
                            : `${t(LanguageKey.cell)} ${rowIndex + 1}-${colIndex + 1}`
                        }
                        maxLength={50}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ButtonContainer">
          <button className="saveButton" onClick={handleInsert}>
            {t(LanguageKey.save)}
          </button>
          <button className="cancelButton" onClick={onClose}>
            {t(LanguageKey.cancel)}
          </button>
        </div>
      </div>
    </>
  );
}
