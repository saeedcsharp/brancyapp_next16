"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { useEditor } from "./core/EditorContext";
import { EditorProvider } from "./core/EditorContext";
import { BlockRenderer } from "./blocks/BlockRenderer";
import { Toolbar } from "./toolbar/Toolbar";
import { StatusBar } from "./statusbar/StatusBar";
import { BlockMenu } from "./menus/BlockMenu";
import { ContextMenu } from "./menus/ContextMenu";
import type { EditorConfig, EditorDoc } from "./types";
import { importHTML } from "./utils/serializer";
import { CloseIcon } from "./icons";
import s from "./TextEditor.module.css";

// ─── Settings Panel ────────────────────────────────────────

function SettingsPanel() {
  const { state, dispatch } = useEditor();
  if (!state.showSettings) return null;

  const update = (settings: any) => dispatch({ type: "UPDATE_SETTINGS", settings });

  return (
    <div className={s.settingsPanel}>
      <div className={s.settingsPanelHeader}>
        <span>Editor Settings</span>
        <button className={s.settingsCloseBtn} onClick={() => dispatch({ type: "HIDE_SETTINGS" })} type="button">
          <CloseIcon size={14} />
        </button>
      </div>

      <div className={s.settingsGroup}>
        <label className={s.settingsLabel}>Theme</label>
        <select
          className={s.settingsSelect}
          value={state.settings.theme}
          onChange={(e) => update({ theme: e.target.value })}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className={s.settingsGroup}>
        <label className={s.settingsLabel}>Font Size</label>
        <input
          className={s.settingsInput}
          type="number"
          min={12}
          max={32}
          value={state.settings.fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
        />
      </div>

      <div className={s.settingsGroup}>
        <label className={s.settingsLabel}>Line Height</label>
        <input
          className={s.settingsInput}
          type="number"
          min={1}
          max={3}
          step={0.1}
          value={state.settings.lineHeight}
          onChange={(e) => update({ lineHeight: Number(e.target.value) })}
        />
      </div>

      <div className={s.settingsGroup}>
        <label className={s.settingsLabel}>Auto-save Delay (ms)</label>
        <input
          className={s.settingsInput}
          type="number"
          min={1000}
          max={30000}
          step={1000}
          value={state.settings.autoSaveDelay}
          onChange={(e) => update({ autoSaveDelay: Number(e.target.value) })}
        />
      </div>

      <div className={s.settingsGroupRow}>
        <label className={s.settingsLabel}>Auto-save</label>
        <input
          type="checkbox"
          checked={state.settings.autoSave}
          onChange={(e) => update({ autoSave: e.target.checked })}
        />
      </div>

      <div className={s.settingsGroupRow}>
        <label className={s.settingsLabel}>Spell Check</label>
        <input
          type="checkbox"
          checked={state.settings.spellCheck}
          onChange={(e) => update({ spellCheck: e.target.checked })}
        />
      </div>

      <div className={s.settingsGroupRow}>
        <label className={s.settingsLabel}>RTL Mode</label>
        <input type="checkbox" checked={state.settings.rtl} onChange={(e) => update({ rtl: e.target.checked })} />
      </div>

      <div className={s.settingsGroup}>
        <label className={s.settingsLabel}>Keyboard Shortcuts</label>
        <div className={s.shortcutList}>
          {Object.entries(state.settings.shortcuts).map(([key, def]) => (
            <div key={key} className={s.shortcutItem}>
              <span className={s.shortcutLabel}>{def.label}</span>
              <kbd className={s.shortcutKey}>{def.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Inner Editor ──────────────────────────────────────────

function EditorInner({ config }: { config: EditorConfig }) {
  const { state, dispatch, undo, redo } = useEditor();
  const editorRootRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
          return;
        }
        if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          redo();
          return;
        }
      }
    }
    const root = editorRootRef.current;
    root?.addEventListener("keydown", handleKeyDown, true);
    return () => root?.removeEventListener("keydown", handleKeyDown, true);
  }, [undo, redo]);

  // Close menus on editor area click + open links on Ctrl+Click or when readOnly
  const handleEditorClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      // Open hyperlinks: Ctrl+Click in edit mode, or any click in readOnly mode
      const linkEl = target.closest("a.textedit-link") as HTMLAnchorElement | null;
      if (linkEl) {
        if (config.readOnly || e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const href = linkEl.getAttribute("href");
          if (href) window.open(href, "_blank", "noopener,noreferrer");
          return;
        }
      }

      if (!target.closest(`.${s.blockMenuPopup}`) && !target.closest(`.${s.contextMenuPopup}`)) {
        if (state.blockMenu) dispatch({ type: "HIDE_BLOCK_MENU" });
        if (state.contextMenu) dispatch({ type: "HIDE_CONTEXT_MENU" });
      }
      if (!target.closest(`.${s.settingsPanel}`)) {
        if (state.showSettings && !target.closest(`[title="Editor settings"]`)) {
          // Don't auto-close settings
        }
      }
    },
    [state.blockMenu, state.contextMenu, state.showSettings, dispatch, config.readOnly],
  );

  // Context menu on editor background
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[contenteditable]") || target.closest(`.${s.blockItem}`)) return;
      e.preventDefault();
      dispatch({ type: "SHOW_CONTEXT_MENU", config: { x: e.clientX, y: e.clientY, type: "global" } });
    },
    [dispatch],
  );

  const editorStyle: React.CSSProperties = {
    fontSize: state.settings.fontSize,
    lineHeight: state.settings.lineHeight,
    fontFamily: state.settings.fontFamily !== "inherit" ? state.settings.fontFamily : undefined,
    direction: state.settings.rtl ? "rtl" : "ltr",
  };

  return (
    <div
      ref={editorRootRef}
      className={[s.editorRoot, state.settings.theme === "dark" ? s.editorDark : s.editorLight].join(" ")}
      style={editorStyle}
      data-editor="true"
      onClick={handleEditorClick}
      onContextMenu={handleContextMenu}>
      {/* Content area */}
      <BlockRenderer />

      {/* Bottom toolbar */}
      <div className={s.editorToolbarArea}>
        <Toolbar />
        <StatusBar />
      </div>

      {/* Settings panel */}
      <SettingsPanel />

      {/* Floating menus */}
      <BlockMenu />
      <ContextMenu />
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────

interface TextEditorProps {
  config?: EditorConfig;
  className?: string;
  value?: EditorDoc | string;
}

function parseValue(value: EditorDoc | string | undefined | null): EditorDoc | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    // Try EditorDoc JSON first
    try {
      const parsed = JSON.parse(value) as EditorDoc;
      if (parsed && parsed.version && Array.isArray(parsed.blocks)) return parsed;
    } catch {
      // not JSON
    }
    // Fallback: treat as legacy HTML (e.g. old ReactQuill output)
    if (value.trim()) return importHTML(value);
    return null;
  }
  return value;
}

export default function TextEditor({ config = {}, className, value }: TextEditorProps) {
  const parsedValue = React.useMemo(() => parseValue(value), [value]);

  // Build config with initialDoc so EditorProvider initialises correctly on first mount.
  // We memoise against parsedValue (not the raw config object) to keep the reference stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const baseConfig = React.useMemo<EditorConfig>(
    () => ({ ...config, ...(parsedValue ? { initialDoc: parsedValue } : {}) }),
    // intentionally exclude `config` – it's usually an inline literal that changes every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parsedValue],
  );

  return (
    <EditorProvider config={baseConfig}>
      <ValueSyncer value={parsedValue} />
      <div className={`${[s.editorWrapper, className].filter(Boolean).join(" ")} translate`}>
        <EditorInner config={baseConfig} />
      </div>
    </EditorProvider>
  );
}

// Syncs an externally supplied value into the editor after the initial mount.
// Handles the async case where value arrives after the editor has already mounted.
function ValueSyncer({ value }: { value: EditorDoc | null }) {
  const { dispatch } = useEditor();
  const appliedKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!value) return;
    // Use the first block id + block count as a lightweight "identity" key.
    // This avoids re-applying the same doc on every render when value is an inline literal.
    const key = `${value.blocks.length}:${value.blocks[0]?.id ?? ""}`;
    if (appliedKeyRef.current === key) return;
    appliedKeyRef.current = key;
    dispatch({ type: "SET_DOC", doc: value });
  }, [value, dispatch]);

  return null;
}
