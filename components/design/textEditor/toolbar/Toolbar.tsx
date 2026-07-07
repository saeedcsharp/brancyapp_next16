"use client";
import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { useEditor } from "../core/EditorContext";
import type { Block, AlignType, DirectionType, HeadingLevel } from "../types";
import { extractInlineNodes } from "../utils/serializer";
import { generateId } from "../utils/idGenerator";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikeIcon,
  SuperscriptIcon,
  SubscriptIcon,
  CodeInlineIcon,
  ClearFormatIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  BulletListIcon,
  OrderedListIcon,
  TaskListIcon,
  QuoteIcon,
  TextIcon,
  HRIcon,
  TableIcon,
  CodeBlockIcon,
  LinkIcon,
  brakLinkIcon,
  AIIcon,
  FontFamilyIcon,
  EmojiIcon,
  SettingsIcon,
  ChevronDownIcon,
  TextColorIcon,
  BgColorIcon,
  FontSizeIcon,
  HeadingIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  RTLIcon,
  LTRIcon,
  IndentIcon,
  OutdentIcon,
} from "../icons";
import s from "../TextEditor.module.css";

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
}

const FONT_FAMILIES = [
  { label: "Default", value: "inherit" },
  { label: "Vazir", value: "Vazir, sans-serif" },
  { label: "IRANSans", value: "IRANSans, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Mono", value: "monospace" },
];

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32", "36", "48"];

const COLORS = [
  "#000000",
  "#1a1a1a",
  "#4a4a4a",
  "#6b6b6b",
  "#9b9b9b",
  "#d0d0d0",
  "#ffffff",
  "#e74c3c",
  "#e67e22",
  "#f39c12",
  "#27ae60",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#1abc9c",
  "#2980b9",
  "#8e44ad",
  "#16a085",
];

const EMOJIS = ["😀", "😂", "❤️", "👍", "🎉", "✅", "⚠️", "💡", "🔥", "⭐", "📌", "🔗", "💬", "📝", "🎯", "🚀"];

function Divider() {
  return <div className={s.toolbarDivider} />;
}

function getNodePath(node: Node, root: Node): number[] | null {
  const path: number[] = [];
  let current: Node | null = node;

  while (current && current !== root) {
    const parentNode: Node | null = current.parentNode;
    if (!parentNode) return null;
    path.unshift(Array.prototype.indexOf.call(parentNode.childNodes, current));
    current = parentNode;
  }

  return current === root ? path : null;
}

function resolveNodePath(root: Node, path: number[]): Node | null {
  let current: Node = root;
  for (const index of path) {
    const next = current.childNodes[index];
    if (!next) return null;
    current = next;
  }
  return current;
}

function cloneFragmentToInlineNodes(range: Range) {
  const wrapper = document.createElement("div");
  wrapper.appendChild(range.cloneContents());
  return extractInlineNodes(wrapper);
}

function splitInlineContentIntoLines(content: ReturnType<typeof cloneFragmentToInlineNodes>) {
  if (!content.length) return [[]];

  const lines: ReturnType<typeof cloneFragmentToInlineNodes>[] = [];
  let currentLine: ReturnType<typeof cloneFragmentToInlineNodes> = [];

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
  return lines;
}

// ToolbarDropdown removed; use ToolbarPopover instead for all popovers/dropdowns

interface PopoverProps {
  trigger: React.ReactNode;
  triggerTitle?: string;
  triggerActive?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBeforeOpen?: () => void;
  children: React.ReactNode;
}

function ToolbarPopover({
  trigger,
  triggerTitle,
  triggerActive,
  open,
  onOpenChange,
  onBeforeOpen,
  children,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuMaxH = 260;
    const minW = 160;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const top =
      spaceBelow >= 160 || spaceBelow >= menuMaxH
        ? Math.min(rect.bottom + -30, window.innerHeight - 10)
        : Math.max(rect.top - 6 - Math.min(menuMaxH, Math.max(spaceAbove, 120)), 8);
    let left = rect.left;
    if (left + minW > window.innerWidth - 8) left = Math.max(8, window.innerWidth - minW - 8);
    setCoords({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (ref.current?.contains(t) || popRef.current?.contains(t)) return;
      onOpenChange(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className={s.toolbarDropdownWrap}>
      <button
        className={[s.toolbarBtn, triggerActive || open ? s.toolbarBtnActive : ""].filter(Boolean).join(" ")}
        onMouseDown={(e) => {
          e.preventDefault();
          onBeforeOpen?.();
          onOpenChange(!open);
        }}
        title={triggerTitle}
        type="button"
        aria-expanded={open}
        aria-haspopup="true">
        {trigger}
      </button>
      {open && coords && (
        <div
          ref={popRef}
          onMouseDown={(e) => e.preventDefault()}
          style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 1000 }}>
          {children}
        </div>
      )}
    </div>
  );
}

interface TBtnProps {
  onClick(): void;
  active?: boolean;
  title?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function TBtn({ onClick, active, title, disabled, children }: TBtnProps) {
  return (
    <button
      className={[s.toolbarBtn, active ? s.toolbarBtnActive : "", disabled ? s.toolbarBtnDisabled : ""]
        .filter(Boolean)
        .join(" ")}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      title={title}
      type="button"
      disabled={disabled}
      aria-pressed={active}>
      {children}
    </button>
  );
}

export function Toolbar() {
  const {
    state,
    dispatch,
    config,
    applyFormat,
    insertBlock,
    convertBlock,
    pushHistory,
    triggerAutoSave,
    undo,
    redo,
    canUndo,
    canRedo,
    blockRefs,
  } = useEditor();
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
  });
  const [hasLink, setHasLink] = useState(false);
  const [hasInlineCode, setHasInlineCode] = useState(false);
  const [selectionTextColor, setSelectionTextColor] = useState<string | null>(null);
  const [selectionBgColor, setSelectionBgColor] = useState<string | null>(null);
  const [selectionFontSize, setSelectionFontSize] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<"text" | "bg" | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showBlockType, setShowBlockType] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showAlign, setShowAlign] = useState(false);
  const [showDirection, setShowDirection] = useState(false);
  const [showIndent, setShowIndent] = useState(false);
  const [showListType, setShowListType] = useState(false);
  const [linkHref, setLinkHref] = useState("");
  const [linkText, setLinkText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSendingAiPrompt, setIsSendingAiPrompt] = useState(false);
  const savedSelectionRef = useRef<Range | null>(null);
  const savedBlockIdRef = useRef<string | null>(null);
  const aiPromptRef = useRef<HTMLTextAreaElement>(null);

  // Track active formatting from browser selection
  useEffect(() => {
    function onSelectionChange() {
      try {
        setFormatState({
          bold: document.queryCommandState("bold"),
          italic: document.queryCommandState("italic"),
          underline: document.queryCommandState("underline"),
          strike: document.queryCommandState("strikeThrough"),
        });

        const sel = window.getSelection();
        if (sel && sel.anchorNode) {
          let el =
            sel.anchorNode.nodeType === 3
              ? (sel.anchorNode.parentElement as HTMLElement)
              : (sel.anchorNode as HTMLElement);
          let foundLink = false;
          let foundCode = false;
          while (el && el !== document.body) {
            if (el.classList && el.classList.contains("textedit-link")) foundLink = true;
            if (el.classList && el.classList.contains("textedit-inline-code")) foundCode = true;
            el = el.parentElement as HTMLElement;
          }
          setHasLink(foundLink);
          setHasInlineCode(foundCode);

          // detect colors only when selection is inside the active block
          const node =
            sel.anchorNode.nodeType === 3
              ? (sel.anchorNode.parentElement as HTMLElement)
              : (sel.anchorNode as HTMLElement);
          const blockEl = node?.closest && (node.closest("[data-block-id]") as HTMLElement | null);
          const blockId = blockEl?.getAttribute("data-block-id");
          if (blockId && blockId === state.activeBlockId) {
            // find inline text color
            let cur: HTMLElement | null = node as HTMLElement;
            let foundColor: string | null = null;
            while (cur && cur !== blockEl) {
              if (cur.style && cur.style.color) {
                foundColor = cur.style.color;
                break;
              }
              if (cur.tagName === "FONT" && (cur as HTMLFontElement).color) {
                foundColor = (cur as HTMLFontElement).color as string;
                break;
              }
              cur = cur.parentElement as HTMLElement;
            }
            if (!foundColor) {
              try {
                const cs = window.getComputedStyle(node as Element);
                if (cs && cs.color && cs.color !== "rgba(0, 0, 0, 0)") foundColor = cs.color;
              } catch {}
            }
            setSelectionTextColor(foundColor || null);

            let foundFontSize: string | null = null;
            let fontCur: HTMLElement | null = node as HTMLElement;
            while (fontCur && fontCur !== blockEl) {
              if (fontCur.style && fontCur.style.fontSize) {
                foundFontSize = fontCur.style.fontSize;
                break;
              }
              fontCur = fontCur.parentElement as HTMLElement;
            }
            if (!foundFontSize) {
              try {
                const cs3 = window.getComputedStyle(node as Element);
                if (cs3 && cs3.fontSize) foundFontSize = cs3.fontSize;
              } catch {}
            }
            setSelectionFontSize(foundFontSize ? String(Math.round(Number.parseFloat(foundFontSize))) : null);

            // find inline background color (highlight)
            cur = node as HTMLElement;
            let foundBg: string | null = null;
            while (cur && cur !== blockEl) {
              if (cur.style && cur.style.backgroundColor && cur.style.backgroundColor !== "transparent") {
                foundBg = cur.style.backgroundColor;
                break;
              }
              cur = cur.parentElement as HTMLElement;
            }
            if (!foundBg) {
              try {
                const cs2 = window.getComputedStyle(node as Element);
                if (
                  cs2 &&
                  cs2.backgroundColor &&
                  cs2.backgroundColor !== "rgba(0, 0, 0, 0)" &&
                  cs2.backgroundColor !== "transparent"
                )
                  foundBg = cs2.backgroundColor;
              } catch {}
            }
            setSelectionBgColor(foundBg || null);
          } else {
            setSelectionTextColor(null);
            setSelectionBgColor(null);
          }
        } else {
          setHasLink(false);
          setHasInlineCode(false);
          setSelectionTextColor(null);
          setSelectionBgColor(null);
          setSelectionFontSize(null);
        }
      } catch {
        /* ignore */
      }
    }
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [state.activeBlockId]);

  const activeBlock = state.doc.blocks.find((b) => b.id === state.activeBlockId);

  // Save selection before toolbar interaction
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
      // Also save the active block ID so we can find the contenteditable
      // even after blur invalidates the range's DOM nodes.
      savedBlockIdRef.current = state.activeBlockId;
    }
  }, [state.activeBlockId]);

  const restoreSelection = useCallback(() => {
    if (!savedSelectionRef.current) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedSelectionRef.current);
  }, []);

  const resolveTargetBlockId = useCallback(() => {
    const range = savedSelectionRef.current;
    const selectionNode = range?.startContainer || window.getSelection()?.anchorNode;

    if (selectionNode) {
      const element = selectionNode.nodeType === 3 ? selectionNode.parentElement : (selectionNode as HTMLElement);
      const blockEl = element?.closest?.("[data-block-id]") as HTMLElement | null;
      const blockId = blockEl?.getAttribute("data-block-id");
      if (blockId) return blockId;
    }

    return state.activeBlockId;
  }, [state.activeBlockId]);

  const applyInlineHeading = useCallback(
    (level: HeadingLevel) => {
      const activeId = state.activeBlockId;
      const currentBlock = activeBlock;
      const range = savedSelectionRef.current;

      if (!activeId || !currentBlock || currentBlock.type !== "paragraph" || !range || range.collapsed) return false;

      const blockEl = document.querySelector(`[data-block-id="${activeId}"]`) as HTMLElement | null;
      if (!blockEl || !blockEl.contains(range.startContainer) || !blockEl.contains(range.endContainer)) return false;

      const headingSizes: Record<HeadingLevel, string> = {
        1: "2em",
        2: "1.5em",
        3: "1.17em",
        4: "1em",
        5: "0.83em",
        6: "0.67em",
      };

      pushHistory();

      const wrapper = document.createElement("span");
      wrapper.style.fontSize = headingSizes[level];
      wrapper.style.fontWeight = "700";
      wrapper.style.lineHeight = "1.25";

      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);

      blockEl.normalize();
      dispatch({ type: "SET_CONTENT", blockId: activeId, content: extractInlineNodes(blockEl) });
      triggerAutoSave();
      return true;
    },
    [activeBlock, dispatch, pushHistory, state.activeBlockId, triggerAutoSave],
  );

  const applySelectionListType = useCallback(
    (type: Extract<Block["type"], "bulletList" | "orderedList" | "taskList">) => {
      const activeId = state.activeBlockId;
      const currentBlock = activeBlock;
      const range = savedSelectionRef.current;

      if (!activeId || !currentBlock || !range || range.collapsed) return false;
      if (currentBlock.type !== "paragraph" && currentBlock.type !== "heading" && currentBlock.type !== "blockquote")
        return false;

      const blockEl = document.querySelector(`[data-block-id="${activeId}"]`) as HTMLElement | null;
      if (!blockEl || !blockEl.contains(range.startContainer) || !blockEl.contains(range.endContainer)) return false;

      const startPath = getNodePath(range.startContainer, blockEl);
      const endPath = getNodePath(range.endContainer, blockEl);
      if (!startPath || !endPath) return false;

      const clone = blockEl.cloneNode(true) as HTMLElement;
      const startNode = resolveNodePath(clone, startPath);
      const endNode = resolveNodePath(clone, endPath);
      if (!startNode || !endNode) return false;

      const sharedAttrs = {
        align: currentBlock.align,
        direction: currentBlock.direction,
        indent: currentBlock.indent,
        lineHeight: currentBlock.lineHeight,
        spaceBefore: currentBlock.spaceBefore,
        spaceAfter: currentBlock.spaceAfter,
      };

      const makePreservedBlock = (content: ReturnType<typeof extractInlineNodes>): Block => {
        if (currentBlock.type === "heading") {
          return {
            id: generateId(),
            type: "heading",
            level: currentBlock.level,
            content,
            ...sharedAttrs,
          } as Block;
        }
        if (currentBlock.type === "blockquote") {
          return {
            id: generateId(),
            type: "blockquote",
            content,
            ...sharedAttrs,
          } as Block;
        }
        return {
          id: generateId(),
          type: "paragraph",
          content,
          ...sharedAttrs,
        } as Block;
      };

      const beforeRange = document.createRange();
      beforeRange.selectNodeContents(clone);
      beforeRange.setEnd(startNode, range.startOffset);

      const selectionRange = document.createRange();
      selectionRange.setStart(startNode, range.startOffset);
      selectionRange.setEnd(endNode, range.endOffset);

      const afterRange = document.createRange();
      afterRange.selectNodeContents(clone);
      afterRange.setStart(endNode, range.endOffset);

      const beforeContent = cloneFragmentToInlineNodes(beforeRange);
      const selectedContent = cloneFragmentToInlineNodes(selectionRange);
      const afterContent = cloneFragmentToInlineNodes(afterRange);

      const selectedLines = splitInlineContentIntoLines(selectedContent).filter((line) =>
        line.some((node) => node.type !== "text" || node.text.trim().length > 0),
      );
      if (!selectedLines.length) return false;

      const blocks: Block[] = [];
      let selectedBlockId: string | null = null;

      if (beforeContent.length) blocks.push(makePreservedBlock(beforeContent));

      selectedBlockId = generateId();
      blocks.push(
        type === "taskList"
          ? ({
              id: selectedBlockId,
              type: "taskList",
              items: selectedLines.map((line) => ({ id: generateId("li"), content: line, checked: false })),
              ...sharedAttrs,
            } as Block)
          : type === "orderedList"
            ? ({
                id: selectedBlockId,
                type: "orderedList",
                items: selectedLines.map((line) => ({ id: generateId("li"), content: line })),
                ...sharedAttrs,
              } as Block)
            : ({
                id: selectedBlockId,
                type: "bulletList",
                items: selectedLines.map((line) => ({ id: generateId("li"), content: line })),
                ...sharedAttrs,
              } as Block),
      );

      if (afterContent.length) blocks.push(makePreservedBlock(afterContent));

      const nextBlocks = state.doc.blocks.flatMap((block) => (block.id === activeId ? blocks : [block]));
      pushHistory();
      dispatch({ type: "SET_DOC", doc: { ...state.doc, blocks: nextBlocks } });
      dispatch({ type: "SET_ACTIVE_BLOCK", id: selectedBlockId });
      triggerAutoSave();
      return true;
    },
    [activeBlock, dispatch, pushHistory, state.activeBlockId, state.doc, triggerAutoSave],
  );

  const applySelectionBlockType = useCallback(
    (type: Extract<Block["type"], "blockquote" | "code">, attrs?: Partial<Block>) => {
      const activeId = state.activeBlockId;
      const currentBlock = activeBlock;
      const range = savedSelectionRef.current;

      if (!activeId || !currentBlock || !range || range.collapsed) return false;
      if (currentBlock.type !== "paragraph" && currentBlock.type !== "heading" && currentBlock.type !== "blockquote")
        return false;

      const blockEl = document.querySelector(`[data-block-id="${activeId}"]`) as HTMLElement | null;
      if (!blockEl || !blockEl.contains(range.startContainer) || !blockEl.contains(range.endContainer)) return false;

      const startPath = getNodePath(range.startContainer, blockEl);
      const endPath = getNodePath(range.endContainer, blockEl);
      if (!startPath || !endPath) return false;

      const clone = blockEl.cloneNode(true) as HTMLElement;
      const startNode = resolveNodePath(clone, startPath);
      const endNode = resolveNodePath(clone, endPath);
      if (!startNode || !endNode) return false;

      const sharedAttrs = {
        align: currentBlock.align,
        direction: currentBlock.direction,
        indent: currentBlock.indent,
        lineHeight: currentBlock.lineHeight,
        spaceBefore: currentBlock.spaceBefore,
        spaceAfter: currentBlock.spaceAfter,
      };

      const makePreservedBlock = (content: ReturnType<typeof extractInlineNodes>): Block => {
        if (currentBlock.type === "heading") {
          return {
            id: generateId(),
            type: "heading",
            level: currentBlock.level,
            content,
            ...sharedAttrs,
          } as Block;
        }
        if (currentBlock.type === "blockquote") {
          return {
            id: generateId(),
            type: "blockquote",
            content,
            ...sharedAttrs,
          } as Block;
        }
        return {
          id: generateId(),
          type: "paragraph",
          content,
          ...sharedAttrs,
        } as Block;
      };

      const beforeRange = document.createRange();
      beforeRange.selectNodeContents(clone);
      beforeRange.setEnd(startNode, range.startOffset);

      const selectionRange = document.createRange();
      selectionRange.setStart(startNode, range.startOffset);
      selectionRange.setEnd(endNode, range.endOffset);

      const afterRange = document.createRange();
      afterRange.selectNodeContents(clone);
      afterRange.setStart(endNode, range.endOffset);

      const beforeContent = cloneFragmentToInlineNodes(beforeRange);
      const selectedContent = cloneFragmentToInlineNodes(selectionRange);
      const afterContent = cloneFragmentToInlineNodes(afterRange);

      const blocks: Block[] = [];
      let selectedBlockId: string | null = null;

      if (beforeContent.length) blocks.push(makePreservedBlock(beforeContent));

      if (type === "code") {
        selectedBlockId = generateId();
        blocks.push({
          id: selectedBlockId,
          type: "code",
          language: (attrs as any)?.language || "plain",
          content: selectionRange.toString(),
          ...sharedAttrs,
        } as Block);
      } else {
        selectedBlockId = generateId();
        blocks.push({
          id: selectedBlockId,
          type: "blockquote",
          content: selectedContent,
          ...sharedAttrs,
        } as Block);
      }

      if (afterContent.length) blocks.push(makePreservedBlock(afterContent));

      if (!blocks.length) return false;

      const nextBlocks = state.doc.blocks.flatMap((block) => (block.id === activeId ? blocks : [block]));
      pushHistory();
      dispatch({ type: "SET_DOC", doc: { ...state.doc, blocks: nextBlocks } });
      dispatch({ type: "SET_ACTIVE_BLOCK", id: selectedBlockId });
      triggerAutoSave();
      return true;
    },
    [activeBlock, dispatch, pushHistory, state.activeBlockId, state.doc, triggerAutoSave],
  );

  const fmt = useCallback(
    (cmd: string, value?: string) => {
      restoreSelection();
      applyFormat(cmd, value);
    },
    [restoreSelection, applyFormat],
  );

  // Color
  const applyTextColor = useCallback(
    (color: string) => {
      restoreSelection();
      applyFormat("foreColor", color);
      setSelectionTextColor(color);
      setShowColorPicker(null);
    },
    [restoreSelection, applyFormat],
  );

  const applyBgColor = useCallback(
    (color: string) => {
      restoreSelection();
      applyFormat("hiliteColor", color);
      setSelectionBgColor(color);
      setShowColorPicker(null);
    },
    [restoreSelection, applyFormat],
  );

  // Block type change
  const changeBlockType = useCallback(
    (type: Block["type"], attrs?: Partial<Block>) => {
      if (!state.activeBlockId) return;
      if (type === "bulletList" || type === "orderedList" || type === "taskList") {
        const selectionHandled = applySelectionListType(type);
        if (selectionHandled) return;
      }
      if (type === "heading" && attrs && "level" in attrs) {
        const inlineHandled = applyInlineHeading(attrs.level as HeadingLevel);
        if (inlineHandled) return;
      }
      if (type === "blockquote" || type === "code") {
        const selectionHandled = applySelectionBlockType(type, attrs);
        if (selectionHandled) return;
      }
      convertBlock(state.activeBlockId, type, attrs);
    },
    [applyInlineHeading, applySelectionBlockType, applySelectionListType, convertBlock, state.activeBlockId],
  );

  const applyListType = useCallback(
    (type: "bulletList" | "orderedList" | "taskList") => {
      if (!state.activeBlockId) {
        insertBlock(type);
        return;
      }

      if (
        activeBlock?.type === "paragraph" ||
        activeBlock?.type === "heading" ||
        activeBlock?.type === "blockquote" ||
        activeBlock?.type === "bulletList" ||
        activeBlock?.type === "orderedList" ||
        activeBlock?.type === "taskList"
      ) {
        changeBlockType(type);
        return;
      }

      insertBlock(type, state.activeBlockId);
    },
    [activeBlock?.type, changeBlockType, insertBlock, state.activeBlockId],
  );

  // Align
  const applyAlign = useCallback(
    (align: AlignType) => {
      const targetBlockId = resolveTargetBlockId();
      if (!targetBlockId) return;
      pushHistory();
      dispatch({ type: "UPDATE_BLOCK", id: targetBlockId, updates: { align } as any });
      triggerAutoSave();
    },
    [dispatch, pushHistory, resolveTargetBlockId, triggerAutoSave],
  );

  // Direction
  const applyDirection = useCallback(
    (direction: DirectionType) => {
      const targetBlockId = resolveTargetBlockId();
      if (!targetBlockId) return;
      pushHistory();
      dispatch({
        type: "UPDATE_BLOCK",
        id: targetBlockId,
        updates: { direction, align: direction === "rtl" ? "right" : "left" } as any,
      });
      triggerAutoSave();
    },
    [dispatch, pushHistory, resolveTargetBlockId, triggerAutoSave],
  );

  // Insert link
  const handleInsertLink = useCallback(() => {
    if (!linkHref) return;
    const sanitizedHref = linkHref.startsWith("http") ? linkHref : `https://${linkHref}`;
    const selectedText = linkText.trim();
    const blockId = savedBlockIdRef.current || state.activeBlockId;
    if (!blockId) return;

    const block = state.doc.blocks.find((b) => b.id === blockId);

    // If we have selected text and a block with inline content, update model directly
    if (selectedText && block && "content" in block) {
      const content = (block as any).content as ReturnType<typeof extractInlineNodes>;
      const linkNode = { type: "link" as const, text: selectedText, href: sanitizedHref, target: "_blank" as const };

      // Replace the first occurrence of selectedText in the content nodes with a link
      const newContent: ReturnType<typeof extractInlineNodes> = [];
      let replaced = false;
      for (const node of content) {
        if (!replaced && node.type === "text" && node.text.includes(selectedText)) {
          const idx = node.text.indexOf(selectedText);
          if (idx > 0) newContent.push({ ...node, text: node.text.slice(0, idx) });
          newContent.push(linkNode);
          const after = node.text.slice(idx + selectedText.length);
          if (after) newContent.push({ ...node, text: after });
          replaced = true;
        } else {
          newContent.push(node);
        }
      }

      if (replaced) {
        pushHistory();
        dispatch({ type: "SET_CONTENT", blockId, content: newContent });
        triggerAutoSave();

        // Also update the DOM so the contenteditable reflects the new state
        requestAnimationFrame(() => {
          const el = blockRefs.current.get(blockId);
          if (el) el.dispatchEvent(new Event("input", { bubbles: true }));
        });

        setShowLinkDialog(false);
        setLinkHref("");
        setLinkText("");
        return;
      }
    }

    // Fallback: insert link at cursor using DOM Range API
    const contentEditable = blockId ? (blockRefs.current.get(blockId) as HTMLElement | null) : null;
    if (!contentEditable) return;

    contentEditable.focus();
    const aEl = document.createElement("a");
    aEl.className = "textedit-link";
    aEl.href = sanitizedHref;
    aEl.target = "_blank";
    aEl.rel = "noopener noreferrer";
    aEl.dataset.type = "link";
    aEl.textContent = selectedText || sanitizedHref;

    const range = savedSelectionRef.current;
    const sel = window.getSelection();
    if (range) {
      try {
        sel?.removeAllRanges();
        sel?.addRange(range);
        if (!range.collapsed) range.deleteContents();
        range.insertNode(aEl);
        const newRange = document.createRange();
        newRange.setStartAfter(aEl);
        newRange.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(newRange);
      } catch {
        contentEditable.appendChild(aEl);
      }
    } else {
      contentEditable.appendChild(aEl);
    }

    contentEditable.dispatchEvent(new Event("input", { bubbles: true }));
    setShowLinkDialog(false);
    setLinkHref("");
    setLinkText("");
  }, [linkHref, linkText, state.activeBlockId, state.doc.blocks, blockRefs, dispatch, pushHistory, triggerAutoSave]);

  // Insert emoji
  const insertEmoji = useCallback(
    (emoji: string) => {
      restoreSelection();
      document.execCommand("insertText", false, emoji);
      setShowEmojiPicker(false);
    },
    [restoreSelection],
  );

  // Font size/family
  const applyFontSize = useCallback(
    (size: string) => {
      restoreSelection();
      const sel = window.getSelection();
      const range = savedSelectionRef.current || (sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null);
      if (!range) return;

      const ancestor =
        range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
          ? (range.commonAncestorContainer as HTMLElement)
          : range.commonAncestorContainer.parentElement;
      const blockEl = ancestor?.closest?.("[data-block-id]") as HTMLElement | null;
      const blockId = blockEl?.getAttribute("data-block-id");
      if (!blockEl || !blockId) return;

      // Find the specific contenteditable that holds the selection.
      // This handles list items correctly (they don't appear in blockRefs).
      const contentEditableEl = (
        range.startContainer.nodeType === Node.ELEMENT_NODE
          ? (range.startContainer as HTMLElement)
          : range.startContainer.parentElement
      )?.closest?.("[contenteditable]") as HTMLElement | null;

      if (!range.collapsed) {
        const wrapper = document.createElement("span");
        wrapper.style.fontSize = `${size}px`;
        wrapper.appendChild(range.extractContents());
        range.insertNode(wrapper);

        sel?.removeAllRanges();
        const nextRange = document.createRange();
        nextRange.selectNodeContents(wrapper);
        sel?.addRange(nextRange);
      } else {
        document.execCommand("fontSize", false, "7");
        blockEl.querySelectorAll('font[size="7"]').forEach((el) => {
          const span = document.createElement("span");
          span.style.fontSize = `${size}px`;
          span.innerHTML = (el as HTMLElement).innerHTML;
          el.parentNode?.replaceChild(span, el);
        });
      }

      // Dispatch input on the actual contenteditable so React's onInput handler fires.
      // Falls back to blockRefs for simple blocks if contenteditable isn't found via range.
      requestAnimationFrame(() => {
        if (contentEditableEl) {
          contentEditableEl.dispatchEvent(new Event("input", { bubbles: true }));
        } else {
          const el = blockRefs.current.get(blockId);
          if (el) {
            dispatch({ type: "SET_CONTENT", blockId, content: extractInlineNodes(el) });
            triggerAutoSave();
          }
        }
      });
    },
    [restoreSelection, blockRefs, dispatch, triggerAutoSave],
  );

  const applyFontFamily = useCallback(
    (family: string) => {
      restoreSelection();
      applyFormat("fontName", family);
    },
    [restoreSelection, applyFormat],
  );

  const applyInlineCode = useCallback(() => {
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const selectionNode = range.commonAncestorContainer;
    const selectionElement =
      selectionNode.nodeType === Node.ELEMENT_NODE ? (selectionNode as HTMLElement) : selectionNode.parentElement;
    const blockEl = selectionElement?.closest?.("[data-block-id]") as HTMLElement | null;
    if (!blockEl) return;

    if (range.collapsed) {
      document.execCommand(
        "insertHTML",
        false,
        `<code class="textedit-inline-code" data-type="inlineCode">code</code>`,
      );
      blockEl.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    const codeAncestor = selectionElement?.closest?.("code.textedit-inline-code") as HTMLElement | null;
    if (codeAncestor && codeAncestor.contains(range.startContainer) && codeAncestor.contains(range.endContainer)) {
      return;
    }

    const codeEl = document.createElement("code");
    codeEl.className = "textedit-inline-code";
    codeEl.dataset.type = "inlineCode";
    codeEl.textContent = range.toString();

    range.deleteContents();
    range.insertNode(codeEl);

    sel.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(codeEl);
    sel.addRange(nextRange);

    blockEl.dispatchEvent(new Event("input", { bubbles: true }));
  }, [restoreSelection]);

  // Indent
  const applyIndent = useCallback(() => {
    if (!state.activeBlockId) return;
    const block = state.doc.blocks.find((b) => b.id === state.activeBlockId);
    if (!block) return;
    const current = (block as any).indent || 0;
    dispatch({ type: "UPDATE_BLOCK", id: state.activeBlockId, updates: { indent: current + 1 } as any });
  }, [state.activeBlockId, state.doc.blocks, dispatch]);

  const applyOutdent = useCallback(() => {
    if (!state.activeBlockId) return;
    const block = state.doc.blocks.find((b) => b.id === state.activeBlockId);
    if (!block) return;
    const current = (block as any).indent || 0;
    if (current > 0)
      dispatch({ type: "UPDATE_BLOCK", id: state.activeBlockId, updates: { indent: current - 1 } as any });
  }, [state.activeBlockId, state.doc.blocks, dispatch]);

  const currentBlockType = activeBlock?.type || "paragraph";
  const currentHeadingLevel = (activeBlock as any)?.level;
  const currentAlign = (activeBlock as any)?.align || "left";
  const currentDir = (activeBlock as any)?.direction || "auto";
  const currentFontSize = selectionFontSize || String(state.settings.fontSize);

  const blockTypeLabel =
    currentBlockType === "heading"
      ? `H${currentHeadingLevel}`
      : currentBlockType === "paragraph"
        ? "P"
        : currentBlockType === "blockquote"
          ? "Quote"
          : currentBlockType.replace(/([A-Z])/g, " $1").trim();

  // Render icon for current block type in the trigger instead of text
  const BlockTypeIcon: React.ComponentType<any> = (() => {
    if (currentBlockType === "heading") {
      return currentHeadingLevel === 1
        ? Heading1Icon
        : currentHeadingLevel === 2
          ? Heading2Icon
          : currentHeadingLevel === 3
            ? Heading3Icon
            : currentHeadingLevel === 4
              ? Heading4Icon
              : currentHeadingLevel === 5
                ? Heading5Icon
                : Heading6Icon;
    }
    if (currentBlockType === "paragraph") return TextIcon;
    if (currentBlockType === "blockquote") return QuoteIcon;
    if (currentBlockType === "code") return CodeBlockIcon;
    if (currentBlockType === "bulletList") return BulletListIcon;
    if (currentBlockType === "orderedList") return OrderedListIcon;
    if (currentBlockType === "taskList") return TaskListIcon;
    if (currentBlockType === "hr") return HRIcon;
    if (currentBlockType === "table") return TableIcon;
    return TextIcon;
  })();

  const AlignIcon: React.ComponentType<any> = (() => {
    if (currentAlign === "left") return AlignLeftIcon;
    if (currentAlign === "center") return AlignCenterIcon;
    if (currentAlign === "right") return AlignRightIcon;
    return AlignJustifyIcon;
  })();

  const DirectionIcon: React.ComponentType<any> = (() => {
    return currentDir === "rtl" ? RTLIcon : LTRIcon;
  })();

  const ListTypeIcon: React.ComponentType<any> = (() => {
    if (currentBlockType === "orderedList") return OrderedListIcon;
    if (currentBlockType === "taskList") return TaskListIcon;
    return BulletListIcon;
  })();

  const currentIndent = (activeBlock as any)?.indent || 0;
  const aiPromptPlaceholder = config.aiEnabled === false ? "AI prompt is disabled" : "Write an AI prompt...";

  const handleSendAiPrompt = useCallback(async () => {
    const prompt = aiPrompt.trim();
    if (!prompt || !config.onAIRequest || config.aiEnabled === false || isSendingAiPrompt) return;

    setIsSendingAiPrompt(true);
    try {
      await config.onAIRequest("write", prompt);
      setAiPrompt("");
    } finally {
      setIsSendingAiPrompt(false);
    }
  }, [aiPrompt, config, isSendingAiPrompt]);

  useLayoutEffect(() => {
    const el = aiPromptRef.current;
    if (!el) return;

    el.style.height = "auto";
    const computed = window.getComputedStyle(el);
    const lineHeight = Number.parseFloat(computed.lineHeight) || 20;
    const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(computed.paddingBottom) || 0;
    const borderTop = Number.parseFloat(computed.borderTopWidth) || 0;
    const borderBottom = Number.parseFloat(computed.borderBottomWidth) || 0;
    const maxHeight = lineHeight * 5 + paddingTop + paddingBottom + borderTop + borderBottom;

    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [aiPrompt]);

  return (
    <div className={s.toolbar} role="toolbar" aria-label="Editor toolbar" onMouseDownCapture={saveSelection}>
      <div style={{ display: "flex", flex: "1 0 100%", padding: "4px  4px" }}>
        <div className={s.toolbarAiPromptShell}>
          <span className={s.toolbarAiPromptIcon} aria-hidden="true">
            <AIIcon size={14} />
          </span>
          <textarea
            ref={aiPromptRef}
            className={s.toolbarAiPromptInput}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={aiPromptPlaceholder}
            aria-label="AI prompt input"
            rows={1}
          />
          <button
            className={s.toolbarAiPromptButton}
            type="button"
            onClick={() => void handleSendAiPrompt()}
            disabled={!aiPrompt.trim() || config.aiEnabled === false || !config.onAIRequest || isSendingAiPrompt}>
            Send
          </button>
        </div>
      </div>

      {/* Paragraph Style */}
      <ToolbarPopover
        trigger={
          <>
            <span className={s.toolbarBlockTypeLabel}>
              <BlockTypeIcon />
            </span>
            <ChevronDownIcon size={9} className={showBlockType ? s.toolbarChevronOpen : s.toolbarChevron} />
          </>
        }
        triggerTitle="Block type"
        open={showBlockType}
        onOpenChange={setShowBlockType}
        onBeforeOpen={() => {
          saveSelection();
          setShowEmojiPicker(false);
          setShowLinkDialog(false);
          setShowColorPicker(null);
        }}>
        <div className={s.toolbarDropdownMenu} onClick={() => setShowBlockType(false)}>
          <button
            className={s.dropdownItem}
            onClick={() => {
              changeBlockType("paragraph");
              setShowBlockType(false);
            }}>
            <div className={s.dropdownItemICON}>
              <TextIcon />
            </div>
            <span>Paragraph</span>
          </button>
          {([1, 2, 3, 4, 5, 6] as HeadingLevel[]).map((n) => {
            const IconComp =
              n === 1
                ? Heading1Icon
                : n === 2
                  ? Heading2Icon
                  : n === 3
                    ? Heading3Icon
                    : n === 4
                      ? Heading4Icon
                      : n === 5
                        ? Heading5Icon
                        : Heading6Icon;
            return (
              <button
                key={n}
                className={s.dropdownItem}
                onClick={() => {
                  changeBlockType("heading", { level: n } as any);
                  setShowBlockType(false);
                }}>
                <div className={s.dropdownItemICON}>
                  <IconComp />
                </div>

                <span style={{ fontSize: `${16 - n * 1.2}px`, fontWeight: 700 }}>Heading {n}</span>
              </button>
            );
          })}
          <button
            className={s.dropdownItem}
            onClick={() => {
              changeBlockType("blockquote");
              setShowBlockType(false);
            }}>
            <div className={s.dropdownItemICON}>
              <QuoteIcon />
            </div>
            Quote
          </button>
          <button
            className={s.dropdownItem}
            onClick={() => {
              changeBlockType("code");
              setShowBlockType(false);
            }}>
            <div className={s.dropdownItemICON}>
              <CodeBlockIcon />
            </div>
            Code
          </button>
        </div>
      </ToolbarPopover>

      <Divider />

      {/* Text Formatting */}
      <TBtn onClick={() => fmt("bold")} active={formatState.bold} title="Bold (Ctrl+B)">
        <BoldIcon />
      </TBtn>
      <TBtn onClick={() => fmt("italic")} active={formatState.italic} title="Italic (Ctrl+I)">
        <ItalicIcon />
      </TBtn>
      <TBtn onClick={() => fmt("underline")} active={formatState.underline} title="Underline (Ctrl+U)">
        <UnderlineIcon />
      </TBtn>
      <TBtn onClick={() => fmt("strikeThrough")} active={formatState.strike} title="Strike">
        <StrikeIcon />
      </TBtn>
      <TBtn onClick={() => fmt("superscript")} title="Superscript">
        <SuperscriptIcon />
      </TBtn>
      <TBtn onClick={() => fmt("subscript")} title="Subscript">
        <SubscriptIcon />
      </TBtn>
      <TBtn onClick={applyInlineCode} title="Inline Code" active={hasInlineCode}>
        <CodeInlineIcon />
      </TBtn>
      <TBtn onClick={() => fmt("removeFormat")} title="Clear Formatting">
        <ClearFormatIcon />
      </TBtn>

      <Divider />

      {/* Font */}
      <ToolbarPopover
        trigger={
          <>
            <span className={s.toolbarBlockTypeLabel}>{currentFontSize}</span>
            <ChevronDownIcon size={9} className={showFontSize ? s.toolbarChevronOpen : s.toolbarChevron} />
          </>
        }
        triggerTitle="Font size"
        open={showFontSize}
        onOpenChange={setShowFontSize}
        onBeforeOpen={() => {
          saveSelection();
          setShowEmojiPicker(false);
          setShowLinkDialog(false);
          setShowColorPicker(null);
        }}>
        <div className={s.toolbarDropdownMenu} onClick={() => setShowFontSize(false)}>
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              className={s.dropdownItem}
              onClick={() => {
                applyFontSize(size);
                setShowFontSize(false);
              }}>
              {size}
            </button>
          ))}
        </div>
      </ToolbarPopover>

      {/* <ToolbarPopover
        trigger={
          <span>
            <FontFamilyIcon />
            <ChevronDownIcon size={9} />
          </span>
        }
        triggerTitle="Font family"
        open={showFontFamily}
        onOpenChange={setShowFontFamily}
        onBeforeOpen={() => {
          saveSelection();
          setShowEmojiPicker(false);
          setShowLinkDialog(false);
          setShowColorPicker(null);
        }}>
        <div className={s.toolbarDropdownMenu} onClick={() => setShowFontFamily(false)}>
          {FONT_FAMILIES.map((f) => (
            <button
              key={f.value}
              className={s.dropdownItem}
              style={{ fontFamily: f.value }}
              onClick={() => {
                applyFontFamily(f.value);
                setShowFontFamily(false);
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </ToolbarPopover> */}

      <Divider />

      {/* Colors */}
      {/* Text Color */}
      <ToolbarPopover
        trigger={<TextColorIcon color={selectionTextColor || undefined} />}
        triggerTitle="Text color"
        open={showColorPicker === "text"}
        onOpenChange={(v) => setShowColorPicker(v ? "text" : null)}
        onBeforeOpen={() => {
          saveSelection();
          setShowEmojiPicker(false);
          setShowLinkDialog(false);
        }}>
        <div className={s.colorPicker}>
          <div className={s.colorGrid}>
            {COLORS.map((c) => (
              <button
                key={c}
                className={s.colorSwatch}
                style={{ backgroundColor: c }}
                onClick={() => applyTextColor(c)}
                title={c}
              />
            ))}
          </div>
          <div className={s.colorPickerCustom}>
            <input type="color" onChange={(e) => applyTextColor(e.target.value)} title="Custom color" />
            <span>Custom</span>
          </div>
        </div>
      </ToolbarPopover>

      {/* Background Color */}
      <ToolbarPopover
        trigger={<BgColorIcon color={selectionBgColor || undefined} />}
        triggerTitle="Highlight / Background color"
        open={showColorPicker === "bg"}
        onOpenChange={(v) => setShowColorPicker(v ? "bg" : null)}
        onBeforeOpen={() => {
          saveSelection();
          setShowEmojiPicker(false);
          setShowLinkDialog(false);
        }}>
        <div className={s.colorPicker}>
          <div className={s.colorGrid}>
            {COLORS.map((c) => (
              <button
                key={c}
                className={s.colorSwatch}
                style={{ backgroundColor: c }}
                onClick={() => applyBgColor(c)}
                title={c}
              />
            ))}
          </div>
          <div className={s.colorPickerCustom}>
            <input type="color" onChange={(e) => applyBgColor(e.target.value)} title="Custom color" />
            <span>Custom</span>
          </div>
        </div>
      </ToolbarPopover>

      <Divider />

      {/* Alignment (popover) */}
      <ToolbarPopover
        trigger={
          <>
            <AlignIcon />
            <ChevronDownIcon size={9} className={showAlign ? s.toolbarChevronOpen : s.toolbarChevron} />
          </>
        }
        triggerTitle="Alignment"
        triggerActive={currentAlign !== "left"}
        open={showAlign}
        onOpenChange={setShowAlign}
        onBeforeOpen={() => {
          saveSelection();
          setShowEmojiPicker(false);
          setShowLinkDialog(false);
          setShowColorPicker(null);
        }}>
        <div className={s.toolbarDropdownMenu} onClick={() => setShowAlign(false)}>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyAlign("left");
              setShowAlign(false);
            }}>
            <div className={s.dropdownItemICON}>
              <AlignLeftIcon />
            </div>
            <span>Left</span>
          </button>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyAlign("center");
              setShowAlign(false);
            }}>
            <div className={s.dropdownItemICON}>
              <AlignCenterIcon />
            </div>
            <span>Center</span>
          </button>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyAlign("right");
              setShowAlign(false);
            }}>
            <div className={s.dropdownItemICON}>
              <AlignRightIcon />
            </div>
            <span>Right</span>
          </button>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyAlign("justify");
              setShowAlign(false);
            }}>
            <div className={s.dropdownItemICON}>
              <AlignJustifyIcon />
            </div>
            <span>Justify</span>
          </button>
        </div>
      </ToolbarPopover>

      <Divider />

      {/* Direction (popover) */}
      <ToolbarPopover
        trigger={
          <>
            <DirectionIcon />
            <ChevronDownIcon size={9} className={showDirection ? s.toolbarChevronOpen : s.toolbarChevron} />
          </>
        }
        triggerTitle="Direction"
        triggerActive={currentDir === "rtl"}
        open={showDirection}
        onOpenChange={setShowDirection}
        onBeforeOpen={() => {
          saveSelection();
          setShowEmojiPicker(false);
          setShowLinkDialog(false);
          setShowColorPicker(null);
        }}>
        <div className={s.toolbarDropdownMenu} onClick={() => setShowDirection(false)}>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyDirection("ltr");
              setShowDirection(false);
            }}>
            <div className={s.dropdownItemICON}>
              <LTRIcon />
            </div>
            <span>LTR</span>
          </button>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyDirection("rtl");
              setShowDirection(false);
            }}>
            <div className={s.dropdownItemICON}>
              <RTLIcon />
            </div>
            <span>RTL</span>
          </button>
        </div>
      </ToolbarPopover>

      <Divider />

      {/* Indent (popover) */}
      <ToolbarPopover
        trigger={
          <>
            <IndentIcon />
            <ChevronDownIcon size={9} className={showIndent ? s.toolbarChevronOpen : s.toolbarChevron} />
          </>
        }
        triggerTitle="Indent"
        triggerActive={currentIndent > 0}
        open={showIndent}
        onOpenChange={setShowIndent}
        onBeforeOpen={() => {
          saveSelection();
          setShowEmojiPicker(false);
          setShowLinkDialog(false);
          setShowColorPicker(null);
        }}>
        <div className={s.toolbarDropdownMenu} onClick={() => setShowIndent(false)}>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyOutdent();
              setShowIndent(false);
            }}
            disabled={currentIndent === 0}
            title={currentIndent === 0 ? "No outdent available" : "Outdent"}>
            <div className={s.dropdownItemICON}>
              <OutdentIcon />
            </div>
            <span>Outdent</span>
          </button>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyIndent();
              setShowIndent(false);
            }}>
            <div className={s.dropdownItemICON}>
              <IndentIcon />
            </div>
            <span>Indent</span>
          </button>
        </div>
      </ToolbarPopover>

      <Divider />

      <ToolbarPopover
        trigger={
          <>
            <ListTypeIcon />
            <ChevronDownIcon size={9} className={showListType ? s.toolbarChevronOpen : s.toolbarChevron} />
          </>
        }
        triggerTitle="List type"
        triggerActive={
          currentBlockType === "bulletList" || currentBlockType === "orderedList" || currentBlockType === "taskList"
        }
        open={showListType}
        onOpenChange={setShowListType}
        onBeforeOpen={() => {
          saveSelection();
          setShowEmojiPicker(false);
          setShowLinkDialog(false);
          setShowColorPicker(null);
        }}>
        <div className={s.toolbarDropdownMenu} onClick={() => setShowListType(false)}>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyListType("bulletList");
              setShowListType(false);
            }}>
            <div className={s.dropdownItemICON}>
              <BulletListIcon />
            </div>
            <span>Bullet list</span>
          </button>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyListType("orderedList");
              setShowListType(false);
            }}>
            <div className={s.dropdownItemICON}>
              <OrderedListIcon />
            </div>
            <span>Ordered list</span>
          </button>
          <button
            className={s.dropdownItem}
            onClick={() => {
              applyListType("taskList");
              setShowListType(false);
            }}>
            <div className={s.dropdownItemICON}>
              <TaskListIcon />
            </div>
            <span>Task list</span>
          </button>
        </div>
      </ToolbarPopover>

      <Divider />

      {/* Insert blocks */}
      <TBtn onClick={() => insertBlock("blockquote", state.activeBlockId || undefined)} title="Blockquote">
        <QuoteIcon />
      </TBtn>
      <TBtn onClick={() => insertBlock("hr", state.activeBlockId || undefined)} title="Horizontal rule">
        <HRIcon />
      </TBtn>
      <TBtn onClick={() => insertBlock("table", state.activeBlockId || undefined)} title="Insert table">
        <TableIcon />
      </TBtn>
      <TBtn onClick={() => insertBlock("code", state.activeBlockId || undefined)} title="Code block">
        <CodeBlockIcon />
      </TBtn>

      <Divider />

      {/* Link */}
      <ToolbarPopover
        trigger={<LinkIcon />}
        triggerTitle="Insert link"
        triggerActive={hasLink}
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onBeforeOpen={() => {
          saveSelection();
          setLinkText(window.getSelection()?.toString() || "");
          setShowEmojiPicker(false);
          setShowColorPicker(null);
        }}>
        <div className={s.linkDialog}>
          <div className={s.linkDialogTitle}>Insert Link</div>
          <input
            className={s.linkInput}
            value={linkHref}
            onChange={(e) => setLinkHref(e.target.value)}
            placeholder="https://..."
            type="url"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInsertLink();
              if (e.key === "Escape") setShowLinkDialog(false);
            }}
          />
          <input
            className={s.linkInput}
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Link text (optional)"
            type="text"
          />
          <div className={s.linkDialogActions}>
            <button className={s.linkDialogBtn} onClick={handleInsertLink} type="button">
              Insert
            </button>
            <button className={s.linkDialogBtnCancel} onClick={() => setShowLinkDialog(false)} type="button">
              Cancel
            </button>
          </div>
        </div>
      </ToolbarPopover>

      {/* Emoji */}
      {/* <ToolbarPopover
        trigger={<EmojiIcon />}
        triggerTitle="Insert emoji"
        open={showEmojiPicker}
        onOpenChange={setShowEmojiPicker}
        onBeforeOpen={() => {
          saveSelection();
          setShowColorPicker(null);
          setShowLinkDialog(false);
        }}>
        <div className={s.emojiPicker}>
          {EMOJIS.map((em) => (
            <button key={em} className={s.emojiBtn} onClick={() => insertEmoji(em)} type="button">
              {em}
            </button>
          ))}
        </div>
      </ToolbarPopover> */}

      {/* Spacer */}
      {/* <div className={s.toolbarSpacer} />*/}

      {/* Settings */}
      {/*  <TBtn onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })} active={state.showSettings} title="Editor settings">
        <SettingsIcon />
      </TBtn>  */}
    </div>
  );
}
