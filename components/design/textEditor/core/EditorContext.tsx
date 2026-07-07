"use client";
import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from "react";
import type {
  EditorDoc,
  EditorState,
  EditorAction,
  EditorConfig,
  EditorSettings,
  Block,
  InlineNode,
  ListItem,
  TableRow,
  SelectionInfo,
  ContextMenuConfig,
  BlockMenuConfig,
} from "../types";
import { HistoryStack } from "../history/HistoryStack";
import { createAutoSaveTimer, AutoSaveTimer } from "../storage/autoSave";
import {
  emptyDoc,
  emptyParagraph,
  importHTML,
  importMarkdown,
  importJSON,
  exportDocHTML,
  exportDocMarkdown,
  exportDocPlainText,
  extractInlineNodes,
} from "../utils/serializer";
import { getBlockPlainText } from "../utils/textUtils";
import { generateId } from "../utils/idGenerator";
import { deepClone } from "../utils/deepClone";

// ─── Default Settings ──────────────────────────────────────

const defaultShortcuts = {
  "ctrl+b": { key: "ctrl+b", label: "Bold", action: "bold" },
  "ctrl+i": { key: "ctrl+i", label: "Italic", action: "italic" },
  "ctrl+u": { key: "ctrl+u", label: "Underline", action: "underline" },
  "ctrl+z": { key: "ctrl+z", label: "Undo", action: "undo" },
  "ctrl+y": { key: "ctrl+y", label: "Redo", action: "redo" },
  "ctrl+shift+z": { key: "ctrl+shift+z", label: "Redo", action: "redo" },
  "ctrl+shift+x": { key: "ctrl+shift+x", label: "Strike", action: "strikeThrough" },
  "ctrl+shift+h": { key: "ctrl+shift+h", label: "Highlight", action: "hiliteColor" },
};

function createDefaultSettings(config: EditorConfig): EditorSettings {
  return {
    theme: config.theme || "light",
    fontSize: 14,
    fontFamily: "inherit",
    lineHeight: 1.6,
    spellCheck: true,
    autoSave: config.autoSave ?? true,
    autoSaveDelay: config.autoSaveDelay || 5000,
    locale: config.locale || "fa",
    rtl: config.rtl || false,
    shortcuts: { ...defaultShortcuts, ...(config.customShortcuts || {}) },
  };
}

function splitInlineContentIntoLines(content: InlineNode[]): InlineNode[][] {
  if (!content.length) return [[]];

  const lines: InlineNode[][] = [];
  let currentLine: InlineNode[] = [];

  const pushLine = () => {
    lines.push(currentLine);
    currentLine = [];
  };

  for (const node of content) {
    if (node.type !== "text" || !node.text.includes("\n")) {
      currentLine.push(node);
      continue;
    }

    const parts = node.text.split("\n");
    parts.forEach((part, index) => {
      if (part) currentLine.push({ ...node, text: part });
      if (index < parts.length - 1) pushLine();
    });
  }

  lines.push(currentLine);
  return lines.length ? lines : [[]];
}

// ─── Initial State ─────────────────────────────────────────

function createInitialState(config: EditorConfig): EditorState {
  return {
    doc: config.initialDoc ? deepClone(config.initialDoc) : emptyDoc(),
    selection: null,
    activeBlockId: null,
    focusedBlockId: null,
    settings: createDefaultSettings(config),
    contextMenu: null,
    blockMenu: null,
    lastSaved: null,
    isDirty: false,
    showSettings: false,
    dragBlockId: null,
    dragOverBlockId: null,
    showImportModal: false,
    importFormat: "html",
  };
}

// ─── Reducer ──────────────────────────────────────────────

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_CONTENT": {
      const blocks = state.doc.blocks.map((b) =>
        b.id === action.blockId && "content" in b ? { ...b, content: action.content } : b,
      ) as Block[];
      return { ...state, doc: { ...state.doc, blocks }, isDirty: true };
    }
    case "SET_CODE_CONTENT": {
      const blocks = state.doc.blocks.map((b) =>
        b.id === action.blockId && b.type === "code" ? { ...b, content: action.content } : b,
      ) as Block[];
      return { ...state, doc: { ...state.doc, blocks }, isDirty: true };
    }
    case "SET_LIST_ITEMS": {
      const blocks = state.doc.blocks.map((b) =>
        b.id === action.blockId && "items" in b ? { ...b, items: action.items } : b,
      ) as Block[];
      return { ...state, doc: { ...state.doc, blocks }, isDirty: true };
    }
    case "SET_TABLE_ROWS": {
      const blocks = state.doc.blocks.map((b) =>
        b.id === action.blockId && b.type === "table" ? { ...b, rows: action.rows } : b,
      ) as Block[];
      return { ...state, doc: { ...state.doc, blocks }, isDirty: true };
    }
    case "INSERT_BLOCK": {
      const blocks = [...state.doc.blocks];
      if (action.afterId) {
        const idx = blocks.findIndex((b) => b.id === action.afterId);
        blocks.splice(idx >= 0 ? idx + 1 : blocks.length, 0, action.block);
      } else {
        blocks.push(action.block);
      }
      return { ...state, doc: { ...state.doc, blocks }, activeBlockId: action.block.id, isDirty: true };
    }
    case "DELETE_BLOCK": {
      const blocks = state.doc.blocks.filter((b) => b.id !== action.id);
      const finalBlocks = blocks.length ? blocks : [emptyParagraph()];
      return {
        ...state,
        doc: { ...state.doc, blocks: finalBlocks },
        activeBlockId: state.activeBlockId === action.id ? null : state.activeBlockId,
        focusedBlockId: state.focusedBlockId === action.id ? null : state.focusedBlockId,
        isDirty: true,
      };
    }
    case "UPDATE_BLOCK": {
      const blocks = state.doc.blocks.map((b) => (b.id === action.id ? ({ ...b, ...action.updates } as Block) : b));
      return { ...state, doc: { ...state.doc, blocks }, isDirty: true };
    }
    case "MOVE_BLOCK": {
      const blocks = [...state.doc.blocks];
      const idx = blocks.findIndex((b) => b.id === action.id);
      if (idx < 0) return state;
      if (action.direction === "up" && idx > 0) [blocks[idx - 1], blocks[idx]] = [blocks[idx], blocks[idx - 1]];
      if (action.direction === "down" && idx < blocks.length - 1)
        [blocks[idx], blocks[idx + 1]] = [blocks[idx + 1], blocks[idx]];
      return { ...state, doc: { ...state.doc, blocks }, isDirty: true };
    }
    case "REORDER_BLOCKS": {
      const blocks = [...state.doc.blocks];
      const fromIdx = blocks.findIndex((b) => b.id === action.fromId);
      const toIdx = blocks.findIndex((b) => b.id === action.toId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return state;
      const [moved] = blocks.splice(fromIdx, 1);
      blocks.splice(toIdx, 0, moved);
      return { ...state, doc: { ...state.doc, blocks }, isDirty: true };
    }
    case "SET_ACTIVE_BLOCK":
      return { ...state, activeBlockId: action.id };
    case "SET_FOCUSED_BLOCK":
      return { ...state, focusedBlockId: action.id };
    case "SET_SELECTION":
      return { ...state, selection: action.selection };
    case "SHOW_CONTEXT_MENU":
      return { ...state, contextMenu: action.config, blockMenu: null };
    case "HIDE_CONTEXT_MENU":
      return { ...state, contextMenu: null };
    case "SHOW_BLOCK_MENU":
      return { ...state, blockMenu: action.config, contextMenu: null };
    case "HIDE_BLOCK_MENU":
      return { ...state, blockMenu: null };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "SET_DOC":
      return { ...state, doc: action.doc, activeBlockId: null, focusedBlockId: null, isDirty: false };
    case "SET_LAST_SAVED":
      return { ...state, lastSaved: action.timestamp, isDirty: false };
    case "SET_DIRTY":
      return { ...state, isDirty: action.dirty };
    case "TOGGLE_SETTINGS":
      return { ...state, showSettings: !state.showSettings, contextMenu: null, blockMenu: null };
    case "HIDE_SETTINGS":
      return { ...state, showSettings: false };
    case "SET_DRAG_BLOCK":
      return { ...state, dragBlockId: action.blockId };
    case "SET_DRAG_OVER_BLOCK":
      return { ...state, dragOverBlockId: action.blockId };
    case "TOGGLE_IMPORT_MODAL":
      return { ...state, showImportModal: !state.showImportModal };
    case "SET_IMPORT_FORMAT":
      return { ...state, importFormat: action.format };
    case "CLEAR":
      return { ...state, doc: emptyDoc(), isDirty: true, activeBlockId: null, focusedBlockId: null };
    default:
      return state;
  }
}

// ─── Context Value ─────────────────────────────────────────

export interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  config: EditorConfig;
  blockRefs: React.MutableRefObject<Map<string, HTMLElement>>;
  historyStack: React.MutableRefObject<HistoryStack>;
  // commands
  insertBlock(type: Block["type"], afterId?: string, attrs?: Partial<Block>): string;
  deleteBlock(id: string): void;
  moveBlock(id: string, direction: "up" | "down"): void;
  duplicateBlock(id: string): void;
  convertBlock(id: string, newType: Block["type"], attrs?: Partial<Block>): void;
  focusBlock(id: string, atStart?: boolean): void;
  focusPrevBlock(currentId: string): void;
  focusNextBlock(currentId: string): void;
  applyFormat(command: string, value?: string): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  pushHistory(): void;
  importDoc(format: "html" | "markdown" | "json", content: string): void;
  exportDoc(format: "html" | "markdown" | "json" | "text"): string;
  triggerAutoSave(): void;
  flushAutoSave(): void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────

export function EditorProvider({ children, config }: { children: React.ReactNode; config: EditorConfig }) {
  const [state, dispatch] = useReducer(editorReducer, config, createInitialState);
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  const historyStack = useRef<HistoryStack>(new HistoryStack(200));
  const stateRef = useRef(state);
  const autoSaveRef = useRef<AutoSaveTimer | null>(null);
  stateRef.current = state;

  // Init auto-save
  useEffect(() => {
    if (typeof window === "undefined") return;
    autoSaveRef.current = createAutoSaveTimer(
      () => stateRef.current.doc,
      (ts) => dispatch({ type: "SET_LAST_SAVED", timestamp: ts }),
      stateRef.current.settings.autoSaveDelay,
      config.autoSaveKey || "textedit_autosave",
      config.autoSaveTTL || 3 * 24 * 60 * 60 * 1000,
    );
    return () => autoSaveRef.current?.cancel();
  }, [config.autoSaveKey, config.autoSaveTTL]);

  // Call external onChange
  useEffect(() => {
    if (config.onChange && state.isDirty) config.onChange(state.doc);
  }, [state.doc]);

  // ── Commands ──────────────────────────────────────────

  const pushHistory = useCallback(() => {
    historyStack.current.push({
      doc: deepClone(stateRef.current.doc),
      selection: stateRef.current.selection,
      timestamp: Date.now(),
    });
  }, []);

  const focusBlock = useCallback((id: string, atStart = false) => {
    setTimeout(() => {
      const el = blockRefs.current.get(id);
      if (!el) return;
      el.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      if (el.childNodes.length === 0) {
        range.setStart(el, 0);
      } else if (atStart) {
        range.setStart(el, 0);
        range.collapse(true);
      } else {
        range.selectNodeContents(el);
        range.collapse(false);
      }
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  }, []);

  const focusPrevBlock = useCallback(
    (currentId: string) => {
      const blocks = stateRef.current.doc.blocks;
      const idx = blocks.findIndex((b) => b.id === currentId);
      if (idx > 0) focusBlock(blocks[idx - 1].id);
    },
    [focusBlock],
  );

  const focusNextBlock = useCallback(
    (currentId: string) => {
      const blocks = stateRef.current.doc.blocks;
      const idx = blocks.findIndex((b) => b.id === currentId);
      if (idx >= 0 && idx < blocks.length - 1) focusBlock(blocks[idx + 1].id);
    },
    [focusBlock],
  );

  const insertBlock = useCallback((type: Block["type"], afterId?: string, attrs?: Partial<Block>): string => {
    const id = generateId();
    let block: Block;
    const base = { id, ...(attrs || {}) };

    switch (type) {
      case "heading":
        block = { ...base, type: "heading", level: (attrs as any)?.level || 1, content: [] } as Block;
        break;
      case "bulletList":
        block = { ...base, type: "bulletList", items: [{ id: generateId("li"), content: [] }] } as Block;
        break;
      case "orderedList":
        block = { ...base, type: "orderedList", items: [{ id: generateId("li"), content: [] }] } as Block;
        break;
      case "taskList":
        block = { ...base, type: "taskList", items: [{ id: generateId("li"), content: [], checked: false }] } as Block;
        break;
      case "blockquote":
        block = { ...base, type: "blockquote", content: [] } as Block;
        break;
      case "hr":
        block = { ...base, type: "hr" } as Block;
        break;
      case "table":
        block = {
          ...base,
          type: "table",
          rows: [
            {
              id: generateId("tr"),
              cells: [
                { id: generateId("tc"), content: [], isHeader: true },
                { id: generateId("tc"), content: [], isHeader: true },
                { id: generateId("tc"), content: [], isHeader: true },
              ],
            },
            {
              id: generateId("tr"),
              cells: [
                { id: generateId("tc"), content: [] },
                { id: generateId("tc"), content: [] },
                { id: generateId("tc"), content: [] },
              ],
            },
          ],
        } as Block;
        break;
      case "code":
        block = { ...base, type: "code", language: "plain", content: "" } as Block;
        break;
      default:
        block = { ...base, type: "paragraph", content: [] } as Block;
    }

    dispatch({ type: "INSERT_BLOCK", block, afterId });
    return id;
  }, []);

  const deleteBlock = useCallback(
    (id: string) => {
      pushHistory();
      dispatch({ type: "DELETE_BLOCK", id });
    },
    [pushHistory],
  );

  const moveBlock = useCallback(
    (id: string, direction: "up" | "down") => {
      pushHistory();
      dispatch({ type: "MOVE_BLOCK", id, direction });
    },
    [pushHistory],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      pushHistory();
      const block = stateRef.current.doc.blocks.find((b) => b.id === id);
      if (!block) return;
      const newBlock = { ...deepClone(block), id: generateId() } as Block;
      dispatch({ type: "INSERT_BLOCK", block: newBlock, afterId: id });
    },
    [pushHistory],
  );

  const convertBlock = useCallback(
    (id: string, newType: Block["type"], attrs?: Partial<Block>) => {
      pushHistory();
      const block = stateRef.current.doc.blocks.find((b) => b.id === id);
      if (!block) return;

      const rawContent = "content" in block ? (block as any).content : undefined;
      const existingItems = "items" in block ? deepClone((block as any).items) : undefined;
      let updates: Partial<Block>;

      // Helpers to normalize content shapes
      const toInlineContent = (c: any) => {
        if (Array.isArray(c)) return c;
        if (typeof c === "string") return [{ type: "text", text: c }];
        return [];
      };

      switch (newType) {
        case "heading":
          updates = { type: "heading", level: (attrs as any)?.level || 1, content: toInlineContent(rawContent) } as any;
          break;
        case "blockquote":
          updates = { type: "blockquote", content: toInlineContent(rawContent) } as any;
          break;
        case "bulletList":
          updates = {
            type: "bulletList",
            items: existingItems?.length
              ? existingItems
              : splitInlineContentIntoLines(toInlineContent(rawContent)).map((line) => ({
                  id: generateId("li"),
                  content: line,
                })),
          } as any;
          break;
        case "orderedList":
          updates = {
            type: "orderedList",
            items: existingItems?.length
              ? existingItems
              : splitInlineContentIntoLines(toInlineContent(rawContent)).map((line) => ({
                  id: generateId("li"),
                  content: line,
                })),
          } as any;
          break;
        case "taskList":
          updates = {
            type: "taskList",
            items: existingItems?.length
              ? existingItems.map((item: ListItem) => ({
                  ...item,
                  checked: !!item.checked,
                }))
              : splitInlineContentIntoLines(toInlineContent(rawContent)).map((line) => ({
                  id: generateId("li"),
                  content: line,
                  checked: false,
                })),
          } as any;
          break;
        case "code": {
          // Convert block to code: produce a plain string from the block
          const codeText = block.type === "code" ? (block as any).content : getBlockPlainText(block as Block);
          updates = { type: "code", language: (attrs as any)?.language || "plain", content: codeText } as any;
          break;
        }
        default:
          // Convert to paragraph or other types that expect InlineNode[]
          updates = { type: newType, content: toInlineContent(rawContent) } as any;
      }

      dispatch({ type: "UPDATE_BLOCK", id, updates });
    },
    [pushHistory],
  );

  const applyFormat = useCallback((command: string, value?: string) => {
    if (typeof document === "undefined") return;
    // Capture the focused contenteditable BEFORE execCommand changes the selection.
    const activeContentEditable = document.activeElement as HTMLElement | null;
    document.execCommand(command, false, value);
    // execCommand does not always fire the `input` event, so we manually
    // dispatch it on the focused contenteditable. This covers list items and
    // all other block types without needing blockRefs.
    requestAnimationFrame(() => {
      if (activeContentEditable && activeContentEditable.isContentEditable) {
        activeContentEditable.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        // Fallback: read directly from blockRefs for simple blocks.
        const activeId = stateRef.current.activeBlockId;
        if (!activeId) return;
        const el = blockRefs.current.get(activeId);
        if (!el) return;
        dispatch({ type: "SET_CONTENT", blockId: activeId, content: extractInlineNodes(el) });
        if (stateRef.current.settings.autoSave) autoSaveRef.current?.trigger();
      }
    });
  }, []);

  const undo = useCallback(() => {
    const current = { doc: stateRef.current.doc, selection: stateRef.current.selection, timestamp: Date.now() };
    const prev = historyStack.current.undo(current);
    if (prev) dispatch({ type: "SET_DOC", doc: prev.doc });
  }, []);

  const redo = useCallback(() => {
    const current = { doc: stateRef.current.doc, selection: stateRef.current.selection, timestamp: Date.now() };
    const next = historyStack.current.redo(current);
    if (next) dispatch({ type: "SET_DOC", doc: next.doc });
  }, []);

  const canUndo = useCallback(() => historyStack.current.canUndo(), []);
  const canRedo = useCallback(() => historyStack.current.canRedo(), []);

  const importDoc = useCallback(
    (format: "html" | "markdown" | "json", content: string) => {
      pushHistory();
      let doc: EditorDoc;
      if (format === "html") doc = importHTML(content);
      else if (format === "markdown") doc = importMarkdown(content);
      else doc = importJSON(content);
      dispatch({ type: "SET_DOC", doc });
      dispatch({ type: "TOGGLE_IMPORT_MODAL" });
    },
    [pushHistory],
  );

  const exportDoc = useCallback((format: "html" | "markdown" | "json" | "text"): string => {
    const doc = stateRef.current.doc;
    if (format === "html") return exportDocHTML(doc);
    if (format === "markdown") return exportDocMarkdown(doc);
    if (format === "text") return exportDocPlainText(doc);
    return JSON.stringify(doc, null, 2);
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (stateRef.current.settings.autoSave) autoSaveRef.current?.trigger();
  }, []);

  const flushAutoSave = useCallback(() => {
    autoSaveRef.current?.flush();
  }, []);

  const value: EditorContextValue = {
    state,
    dispatch,
    config,
    blockRefs,
    historyStack,
    insertBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    convertBlock,
    focusBlock,
    focusPrevBlock,
    focusNextBlock,
    applyFormat,
    undo,
    redo,
    canUndo,
    canRedo,
    pushHistory,
    importDoc,
    exportDoc,
    triggerAutoSave,
    flushAutoSave,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}

export function useEditorState(): EditorState {
  return useEditor().state;
}
