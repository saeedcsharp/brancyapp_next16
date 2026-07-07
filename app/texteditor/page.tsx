"use client";
import React from "react";
import dynamic from "next/dynamic";
import type { EditorDoc } from "../../components/design/textEditor/types";

const TextEditor = dynamic(() => import("../../components/design/textEditor/TextEditor"), { ssr: false });

export default function TextEditorTestPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        padding: "32px 16px",
        fontFamily: "system-ui, sans-serif",
      }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#1a1a2e" }}>TextEditor — Test Environment</h1>
          <p style={{ color: "#6c757d", marginTop: 6, fontSize: 14 }}>
            Rich text editor with block-based editing, drag &amp; drop, toolbar, and JSON output. All interactions are
            logged to the browser console.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {[
              "Bold/Italic/Underline",
              "Headings H1–H6",
              "Lists (Bullet/Ordered/Task)",
              "Links auto-detect",
              "#Hashtags",
              "Tables",
              "Code blocks",
              "Blockquote",
              "Drag & Drop blocks",
              "Right-click menu",
              "Block menu",
              "Auto-save (5s)",
              "Undo/Redo",
              "Import HTML/MD/JSON",
              "Export JSON/HTML/MD",
              "Dark mode (settings)",
            ].map((f) => (
              <span
                key={f}
                style={{
                  background: "#e8f0fe",
                  color: "#2980b9",
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 12,
                  border: "1px solid #bee3f8",
                }}>
                {f}
              </span>
            ))}
          </div>
        </div> */}

        <TextEditor
          value={{
            version: 1,
            blocks: [
              {
                id: "b_mradg1wx_1",
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "frerevrrevrev",
                  },
                ],
                align: "left",
                direction: "ltr",
                indent: 8,
              },
            ],
          }}
          className=""
        />

        {/* <div style={{ marginTop: 16, color: "#6c757d", fontSize: 12 }}>
          <strong>Console output:</strong> Open DevTools → Console to see JSON output, auto-save events, and AI action
          logs.
          <br />
          <strong>Auto-save:</strong> Triggers 5 seconds after any change; stored in localStorage for 3 days.
          <br />
          <strong>Shortcuts:</strong> Ctrl+B Bold · Ctrl+I Italic · Ctrl+U Underline · Ctrl+Z Undo · Ctrl+Y Redo
          <br />
          <strong>Drag blocks:</strong> Hover a block → grab the 6-dot handle on the left.
          <br />
          <strong>Block menu:</strong> Hover a block → click the 3-dot icon on the left.
        </div> */}
      </div>
    </div>
  );
}
