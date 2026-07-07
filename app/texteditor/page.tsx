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
                id: "b_demo_1",
                type: "heading",
                level: 1,
                content: [
                  {
                    type: "text",
                    text: "سلام، این یک تست است!",
                  },
                ],
              },
              {
                id: "b_demo_2",
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "این یک پاراگراف ساده است با ",
                  },
                  {
                    type: "text",
                    text: "متن بولد",
                    marks: [
                      {
                        type: "bold",
                      },
                    ],
                  },
                  {
                    type: "text",
                    text: " و ",
                  },
                  {
                    type: "text",
                    text: "متن ایتالیک",
                    marks: [
                      {
                        type: "italic",
                      },
                    ],
                  },
                  {
                    type: "text",
                    text: ".",
                  },
                ],
              },
              {
                id: "b_demo_4",
                type: "code",
                language: "javascript",
                content: 'console.log("Hello World!");',
              },
              {
                id: "b_demo_3",
                type: "bulletList",
                items: [
                  {
                    id: "li_1",
                    content: [
                      {
                        type: "text",
                        text: "آیتم اول",
                      },
                    ],
                  },
                  {
                    id: "li_2",
                    content: [
                      {
                        type: "text",
                        text: "آیتم دوم",
                      },
                    ],
                  },
                  {
                    id: "li_3",
                    content: [
                      {
                        type: "text",
                        text: "آیتم سوم",
                      },
                    ],
                  },
                ],
              },
              {
                id: "b_demo_5",
                type: "orderedList",
                items: [
                  {
                    id: "li_mr963huy_1",
                    content: [
                      {
                        type: "text",
                        text: "این",
                        marks: [
                          {
                            type: "fontSize",
                            attrs: {
                              size: "20px",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                      {
                        type: "text",
                        text: "یک",
                        marks: [
                          {
                            type: "textColor",
                            attrs: {
                              color: "rgb(142, 68, 173)",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                      {
                        type: "inlineCode",
                        text: "نقل‌قول",
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                      {
                        type: "text",
                        text: "نمونه",
                        marks: [
                          {
                            type: "bold",
                          },
                          {
                            type: "subscript",
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " است.",
                      },
                    ],
                  },
                  {
                    id: "li_mr963huy_2",
                    content: [
                      {
                        type: "text",
                        text: "aaaaaaa",
                        marks: [
                          {
                            type: "fontSize",
                            attrs: {
                              size: "36px",
                            },
                          },
                        ],
                      },
                    ],
                    checked: false,
                  },
                ],
              },
              {
                id: "b_mr96mtiz_1",
                type: "table",
                rows: [
                  {
                    id: "tr_mr96mtiz_2",
                    cells: [
                      {
                        id: "tc_mr96mtiz_3",
                        content: [],
                        isHeader: true,
                      },
                      {
                        id: "tc_mr96mtiz_4",
                        content: [],
                        isHeader: true,
                      },
                      {
                        id: "tc_mr96mtiz_5",
                        content: [],
                        isHeader: true,
                      },
                      {
                        id: "tc_mr96mtiz_e",
                        content: [],
                        isHeader: true,
                      },
                    ],
                  },
                  {
                    id: "tr_mr96mtiz_6",
                    cells: [
                      {
                        id: "tc_mr96mtiz_7",
                        content: [
                          {
                            type: "text",
                            text: "فقدفقدف",
                          },
                        ],
                      },
                      {
                        id: "tc_mr96mtiz_8",
                        content: [
                          {
                            type: "text",
                            text: "قدقفدفقد",
                            marks: [
                              {
                                type: "bold",
                              },
                              {
                                type: "underline",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        id: "tc_mr96mtiz_9",
                        content: [],
                      },
                      {
                        id: "tc_mr96mtiz_f",
                        content: [],
                      },
                    ],
                  },
                  {
                    id: "tr_mr96mtiz_a",
                    cells: [
                      {
                        id: "tc_mr96mtiz_b",
                        content: [],
                      },
                      {
                        id: "tc_mr96mtiz_c",
                        content: [],
                      },
                      {
                        id: "tc_mr96mtiz_d",
                        content: [
                          {
                            type: "text",
                            text: "دفققفد",
                          },
                        ],
                      },
                      {
                        id: "tc_mr96mtiz_g",
                        content: [],
                      },
                    ],
                  },
                ],
              },
            ],
          }}
          config={{
            placeholder: "Start writing your content here... ",
            autoSave: true,
            autoSaveDelay: 5000,
            autoSaveTTL: 3 * 24 * 60 * 60 * 1000,
            autoSaveKey: "te_test_draft",
            theme: "light",
            locale: "en",
            aiEnabled: true,
            onChange: (doc: EditorDoc) => {
              // onChange fires every time content changes
            },
            onSave: (json: string) => {
              console.log("[TextEditor onSave] JSON output:", json);
            },
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
