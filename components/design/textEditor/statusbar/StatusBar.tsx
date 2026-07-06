"use client";
import React, { useState, useCallback } from "react";
import { useEditor } from "../core/EditorContext";
import { getDocStats } from "../utils/textUtils";
import {
  UndoIcon,
  RedoIcon,
  CopyIcon,
  CutIcon,
  PasteIcon,
  ImportIcon,
  ExportIcon,
  SaveIcon,
  CharacterIcon,
  WordIcon,
  ParagraphIcon,
  BlockIcon,
} from "../icons";
import s from "../TextEditor.module.css";

function formatTime(ts: number | null): string {
  if (!ts) return "Not saved";
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export function StatusBar() {
  const { state, dispatch, undo, redo, canUndo, canRedo, exportDoc, importDoc, flushAutoSave } = useEditor();
  const [importText, setImportText] = useState("");
  const [exportResult, setExportResult] = useState("");
  const [showExport, setShowExport] = useState(false);

  const stats = getDocStats(state.doc);

  const handleUndo = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      undo();
    },
    [undo],
  );

  const handleRedo = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      redo();
    },
    [redo],
  );

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand("copy");
  }, []);

  const handleCut = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand("cut");
  }, []);

  const handlePaste = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand("insertText", false, text);
    } catch {
      document.execCommand("paste");
    }
  }, []);

  const handlePastePlain = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand("insertText", false, text);
    } catch {
      /* ignore */
    }
  }, []);

  const handleImport = useCallback(() => {
    if (!importText.trim()) return;
    importDoc(state.importFormat, importText);
    setImportText("");
  }, [importText, state.importFormat, importDoc]);

  const handleExport = useCallback(
    (format: "html" | "markdown" | "json" | "text") => {
      const result = exportDoc(format);
      setExportResult(result);
      setShowExport(true);
      console.log("[TextEditor Export]", format, result);
    },
    [exportDoc],
  );

  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      flushAutoSave();
      const json = exportDoc("json");
      console.log("[TextEditor JSON Output]", json);
    },
    [flushAutoSave, exportDoc],
  );

  return (
    <div className={s.statusBar}>
      {/* Left: Undo/Redo + Edit ops */}
      <div className={s.statusBarLeft}>
        <button
          className={[s.statusBtn, !canUndo() ? s.statusBtnDisabled : ""].join(" ")}
          onClick={handleUndo}
          onMouseDown={(e) => e.preventDefault()}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
          type="button">
          <UndoIcon size={13} />
        </button>
        <button
          className={[s.statusBtn, !canRedo() ? s.statusBtnDisabled : ""].join(" ")}
          onClick={handleRedo}
          onMouseDown={(e) => e.preventDefault()}
          disabled={!canRedo()}
          title="Redo (Ctrl+Y)"
          type="button">
          <RedoIcon size={13} />
        </button>

        <div className={s.statusDivider} />

        <button
          className={s.statusBtn}
          onClick={handleCopy}
          onMouseDown={(e) => e.preventDefault()}
          title="Copy"
          type="button">
          <CopyIcon size={13} />
        </button>
        <button
          className={s.statusBtn}
          onClick={handleCut}
          onMouseDown={(e) => e.preventDefault()}
          title="Cut"
          type="button">
          <CutIcon size={13} />
        </button>
        <button
          className={s.statusBtn}
          onClick={handlePastePlain}
          onMouseDown={(e) => e.preventDefault()}
          title="Paste as plain text"
          type="button">
          <PasteIcon size={13} />
        </button>
        {/* <button
          className={s.statusBtnText}
          onClick={handlePaste}
          onMouseDown={(e) => e.preventDefault()}
          title="Paste"
          type="button">
          paste
        </button> */}

        <div className={s.statusDivider} />

        {/* Import */}
        <button
          className={s.statusBtnText}
          onClick={() => dispatch({ type: "TOGGLE_IMPORT_MODAL" })}
          onMouseDown={(e) => e.preventDefault()}
          title="Import content"
          type="button">
          <ImportIcon size={13} /> Import
        </button>

        {/* Export */}
        <div className={s.statusDropdownWrap}>
          <button
            className={s.statusBtnText}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleExport("json")}
            title="Export as JSON"
            type="button">
            <ExportIcon size={13} /> JSON
          </button>
          {/* <button
            className={s.statusBtnText}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleExport("html")}
            title="Export as HTML"
            type="button">
            HTML
          </button>
          <button
            className={s.statusBtnText}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleExport("markdown")}
            title="Export as Markdown"
            type="button">
            MD
          </button>
          <button
            className={s.statusBtnText}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleExport("text")}
            title="Export as plain text"
            type="button">
            TXT
          </button> */}
        </div>
      </div>

      {/* Center: Stats */}
      <div className={s.statusBarCenter}>
        <span className={s.statusStat} title="Characters">
          <CharacterIcon size={13} />
          {stats.chars}
        </span>
        <span className={s.statusStatSep}>·</span>
        <span className={s.statusStat} title="Words">
          <WordIcon size={13} />
          {stats.words}
        </span>
        <span className={s.statusStatSep}>·</span>
        <span className={s.statusStat} title="Paragraphs">
          <ParagraphIcon size={13} />
          {stats.paragraphs}
        </span>
        {/* <span className={s.statusStatSep}>·</span> */}
        {/* <span className={s.statusStat} title="Blocks">
          <BlockIcon size={13} />
          {stats.blocks}
        </span> */}
      </div>

      {/* Right: Auto-save status + Save */}
      <div className={s.statusBarRight}>
        {state.isDirty && <span className={s.statusDirty}>●</span>}
        <span className={s.statusSavedAt} title={state.lastSaved ? new Date(state.lastSaved).toISOString() : undefined}>
          {state.lastSaved ? `Saved: ${formatTime(state.lastSaved)}` : state.isDirty ? "Unsaved changes" : "No changes"}
        </span>
        <button
          className={s.statusSaveBtn}
          onClick={handleSave}
          onMouseDown={(e) => e.preventDefault()}
          title="Save now (logs JSON to console)"
          type="button">
          <SaveIcon size={13} /> Save
        </button>
      </div>

      {/* Import Modal */}
      {state.showImportModal && (
        <div className="dialogBg" onMouseDown={(e) => e.stopPropagation()}>
          <div className="popup">
            <div className="headerandinput">
              <div className="headerparent">
                <span className="title">Import Content</span>
                <img
                  onClick={() => dispatch({ type: "TOGGLE_IMPORT_MODAL" })}
                  style={{ cursor: "pointer", width: "30px", height: "30px" }}
                  title="ℹ️ close"
                  src="/close-box.svg"
                />
              </div>
              <div className={s.importFormatTabs}>
                {(["html", "markdown", "json"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    className={[s.importTab, state.importFormat === fmt ? s.importTabActive : ""].join(" ")}
                    onClick={() => dispatch({ type: "SET_IMPORT_FORMAT", format: fmt })}
                    type="button">
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className={s.importTextarea}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Paste ${state.importFormat.toUpperCase()} content here...`}
              rows={8}
            />
            <div className="ButtonContainer">
              <button className="saveButton" onClick={handleImport} type="button">
                Import
              </button>
              <button
                className="cancelButton"
                onClick={() => {
                  dispatch({ type: "TOGGLE_IMPORT_MODAL" });
                  setImportText("");
                }}
                type="button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Preview Modal */}
      {showExport && (
        <div className="dialogBg" onMouseDown={(e) => e.stopPropagation()}>
          <div className="popup">
            <div className="headerparent">
              <span className="title">Export Result</span>
              <img
                onClick={() => setShowExport(false)}
                style={{ cursor: "pointer", width: "30px", height: "30px" }}
                title="ℹ️ close"
                src="/close-box.svg"
              />
            </div>
            <textarea
              className={s.importTextarea}
              value={exportResult}
              readOnly
              rows={10}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <div className="ButtonContainer">
              <button className="saveButton" onClick={() => navigator.clipboard?.writeText(exportResult)} type="button">
                Copy to Clipboard
              </button>
              <button className="cancelButton" onClick={() => setShowExport(false)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
