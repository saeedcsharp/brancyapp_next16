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

  // Close menus on editor area click
  const handleEditorClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
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
    [state.blockMenu, state.contextMenu, state.showSettings, dispatch],
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
}

export default function TextEditor({ config = {}, className }: TextEditorProps) {
  return (
    <EditorProvider config={config}>
      <div className={`${[s.editorWrapper, className].filter(Boolean).join(" ")} translate`}>
        <EditorInner config={config} />
      </div>
    </EditorProvider>
  );
}
