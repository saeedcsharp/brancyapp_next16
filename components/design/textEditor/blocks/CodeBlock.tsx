"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../core/EditorContext";
import type { CodeBlock } from "../types";
import { ChevronDownIcon } from "../icons";
import s from "../TextEditor.module.css";

interface Props {
  block: CodeBlock;
}

const LANGUAGES = [
  "plain",
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "json",
  "bash",
  "sql",
  "php",
  "java",
  "csharp",
  "go",
  "rust",
];

export function CodeBlockComponent({ block }: Props) {
  const { dispatch, triggerAutoSave, config, insertBlock, pushHistory, focusBlock } = useEditor();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  // Ensure content is always a string before using string methods
  const content = block.content == null ? "" : String(block.content);

  useEffect(() => {
    if (!showLanguageMenu) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (menuWrapRef.current?.contains(target)) return;
      setShowLanguageMenu(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLanguageMenu]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatch({ type: "SET_CODE_CONTENT", blockId: block.id, content: e.target.value });
      triggerAutoSave();
    },
    [block.id, dispatch, triggerAutoSave],
  );

  const handleLangChange = useCallback(
    (language: string) => {
      dispatch({ type: "UPDATE_BLOCK", id: block.id, updates: { language } as any });
      setShowLanguageMenu(false);
    },
    [block.id, dispatch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = ta.value.slice(0, start) + "  " + ta.value.slice(end);
        dispatch({ type: "SET_CODE_CONTENT", blockId: block.id, content: newVal });
        // Reset cursor position after React re-render
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        }, 0);
      }
      // Shift+Enter -> create new paragraph block below code
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        // insert newline in textarea
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = ta.value.slice(0, start) + "\n" + ta.value.slice(end);
        dispatch({ type: "SET_CODE_CONTENT", blockId: block.id, content: newVal });
        // create new paragraph after this block
        pushHistory();
        const newId = insertBlock("paragraph", block.id);
        // focus the newly created block
        focusBlock(newId);
      }
    },
    [block.id, dispatch],
  );

  return (
    <div className={s.codeBlock}>
      <div className={s.codeBlockHeader}>
        <div ref={menuWrapRef} className={s.toolbarDropdownWrap}>
          <button
            type="button"
            className={[s.codeLanguageSelect, showLanguageMenu ? s.toolbarBtnActive : ""].filter(Boolean).join(" ")}
            onMouseDown={(e) => {
              e.preventDefault();
              setShowLanguageMenu((current) => !current);
            }}
            aria-expanded={showLanguageMenu}
            aria-haspopup="true">
            <span>{block.language || "plain"}</span>
            <ChevronDownIcon size={9} className={showLanguageMenu ? s.toolbarChevronOpen : s.toolbarChevron} />
          </button>
          {showLanguageMenu && (
            <div
              className={s.toolbarDropdownMenu}
              onMouseDown={(e) => e.preventDefault()}
              style={{ bottom: "auto", top: "calc(100% + 6px)" }}>
              {LANGUAGES.map((lang) => (
                <button key={lang} type="button" className={s.dropdownItem} onClick={() => handleLangChange(lang)}>
                  <span>{lang}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className={s.codeBlockLabel}>Code</span>
      </div>
      <textarea
        className={s.codeTextarea}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => dispatch({ type: "SET_ACTIVE_BLOCK", id: block.id })}
        readOnly={config.readOnly}
        spellCheck={false}
        placeholder="// Write your code here..."
        rows={Math.max(3, (content.match(/\n/g) || []).length + 1)}
      />
    </div>
  );
}
