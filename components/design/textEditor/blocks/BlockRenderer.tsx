"use client";
import React from "react";
import { useEditorState } from "../core/EditorContext";
import { BlockItem } from "./BlockItem";
import { useEditor } from "../core/EditorContext";
import { ParagraphBlockComponent } from "./ParagraphBlock";
import { HeadingBlockComponent } from "./HeadingBlock";
import { ListBlockComponent } from "./ListBlock";
import { QuoteBlockComponent } from "./QuoteBlock";
import { HRBlockComponent } from "./HRBlock";
import { TableBlockComponent } from "./TableBlock";
import { CodeBlockComponent } from "./CodeBlock";
import type { Block } from "../types";
import s from "../TextEditor.module.css";

function BlockContent({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlockComponent block={block} />;
    case "heading":
      return <HeadingBlockComponent block={block} />;
    case "bulletList":
    case "orderedList":
    case "taskList":
      return <ListBlockComponent block={block as any} />;
    case "blockquote":
      return <QuoteBlockComponent block={block} />;
    case "hr":
      return <HRBlockComponent block={block} />;
    case "table":
      return <TableBlockComponent block={block} />;
    case "code":
      return <CodeBlockComponent block={block} />;
    default:
      return null;
  }
}

export function BlockRenderer() {
  const state = useEditorState();
  const { insertBlock } = useEditor();

  const lastId = state.doc.blocks.length ? state.doc.blocks[state.doc.blocks.length - 1].id : undefined;

  return (
    <div className={s.blockList} role="document">
      {state.doc.blocks.map((block) => (
        <BlockItem key={block.id} block={block}>
          <BlockContent block={block} />
        </BlockItem>
      ))}
      <div className={s.addBlockWrap}>
        <button
          type="button"
          className={s.addBlockBtn}
          onMouseDown={(e) => {
            e.preventDefault();
            insertBlock("paragraph", lastId);
          }}>
          +
        </button>
      </div>
    </div>
  );
}
