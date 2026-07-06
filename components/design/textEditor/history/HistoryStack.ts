import type { EditorDoc, SelectionInfo } from "../types";
import { deepClone } from "../utils/deepClone";

export interface HistoryEntry {
  doc: EditorDoc;
  selection: SelectionInfo | null;
  timestamp: number;
}

export class HistoryStack {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private readonly maxSize: number;

  constructor(maxSize = 200) {
    this.maxSize = maxSize;
  }

  push(entry: HistoryEntry): void {
    this.undoStack.push({ ...entry, doc: deepClone(entry.doc) });
    if (this.undoStack.length > this.maxSize) this.undoStack.shift();
    this.redoStack = [];
  }

  undo(current: HistoryEntry): HistoryEntry | null {
    if (!this.undoStack.length) return null;
    const prev = this.undoStack.pop()!;
    this.redoStack.push({ ...current, doc: deepClone(current.doc) });
    return prev;
  }

  redo(current: HistoryEntry): HistoryEntry | null {
    if (!this.redoStack.length) return null;
    const next = this.redoStack.pop()!;
    this.undoStack.push({ ...current, doc: deepClone(current.doc) });
    return next;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
  undoCount(): number {
    return this.undoStack.length;
  }
  redoCount(): number {
    return this.redoStack.length;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
