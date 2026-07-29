// ============================================================
// TextEditor — Complete Type Definitions
// ============================================================

export type BlockType =
  | "paragraph"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "blockquote"
  | "hr"
  | "table"
  | "code";

export type MarkType =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "superscript"
  | "subscript"
  | "inlineCode"
  | "textColor"
  | "bgColor"
  | "fontSize"
  | "fontFamily"
  | "fontWeight";

export type AlignType = "left" | "center" | "right" | "justify";
export type DirectionType = "ltr" | "rtl" | "auto";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface TextMark {
  type: MarkType;
  attrs?: Record<string, string | number | boolean>;
}

// ─── Inline Nodes ──────────────────────────────────────────

export interface TextNode {
  type: "text";
  text: string;
  marks?: TextMark[];
}

export interface LinkNode {
  type: "link";
  text: string;
  href: string;
  target?: "_blank" | "_self";
}

export interface HashtagNode {
  type: "hashtag";
  text: string;
}

export interface InlineCodeNode {
  type: "inlineCode";
  text: string;
}

export type InlineNode = TextNode | LinkNode | HashtagNode | InlineCodeNode;

// ─── Blocks ────────────────────────────────────────────────

export interface BaseBlock {
  id: string;
  align?: AlignType;
  direction?: DirectionType;
  indent?: number;
  lineHeight?: number;
  spaceBefore?: number;
  spaceAfter?: number;
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  content: InlineNode[];
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: HeadingLevel;
  content: InlineNode[];
}

export interface ListItem {
  id: string;
  content: InlineNode[];
  checked?: boolean;
  children?: ListItem[];
  indent?: number;
}

export interface BulletListBlock extends BaseBlock {
  type: "bulletList";
  items: ListItem[];
}

export interface OrderedListBlock extends BaseBlock {
  type: "orderedList";
  items: ListItem[];
}

export interface TaskListBlock extends BaseBlock {
  type: "taskList";
  items: ListItem[];
}

export interface BlockquoteBlock extends BaseBlock {
  type: "blockquote";
  content: InlineNode[];
}

export interface HRBlock extends BaseBlock {
  type: "hr";
}

export interface TableCell {
  id: string;
  content: InlineNode[];
  colSpan?: number;
  rowSpan?: number;
  isHeader?: boolean;
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TableBlock extends BaseBlock {
  type: "table";
  rows: TableRow[];
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  language?: string;
  content: string;
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | BulletListBlock
  | OrderedListBlock
  | TaskListBlock
  | BlockquoteBlock
  | HRBlock
  | TableBlock
  | CodeBlock;

// ─── Document ──────────────────────────────────────────────

export interface EditorDoc {
  version: 1;
  blocks: Block[];
}

// ─── AI ────────────────────────────────────────────────────

export type AIOperation = "write" | "rewrite" | "translate" | "summarize" | "continue" | "grammar";

// ─── Settings ──────────────────────────────────────────────

export interface ShortcutDef {
  key: string;
  label: string;
  action: string;
}

export type ShortcutMap = Record<string, ShortcutDef>;

export interface EditorPlugin {
  name: string;
  install(api: EditorPublicAPI): void;
  uninstall?(api: EditorPublicAPI): void;
}

export interface EditorConfig {
  placeholder?: string;
  readOnly?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  autoSaveTTL?: number;
  autoSaveKey?: string;
  theme?: "light" | "dark" | "custom";
  locale?: string;
  rtl?: boolean;
  aiEnabled?: boolean;
  onAIRequest?: (op: AIOperation, content: string) => Promise<string>;
  customShortcuts?: Partial<ShortcutMap>;
  plugins?: EditorPlugin[];
  onChange?: (doc: EditorDoc) => void;
  onSave?: (json: string) => void;
  initialDoc?: EditorDoc;
  maxBlocks?: number;
}

export interface EditorSettings {
  theme: "light" | "dark" | "custom";
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  spellCheck: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  locale: string;
  rtl: boolean;
  shortcuts: ShortcutMap;
}

// ─── Selection ─────────────────────────────────────────────

export interface SelectionInfo {
  blockId: string;
  startOffset: number;
  endOffset: number;
  isCollapsed: boolean;
  activeMarks: TextMark[];
}

// ─── Context Menu ──────────────────────────────────────────

export interface ContextMenuConfig {
  x: number;
  y: number;
  blockId?: string;
  type: "block" | "inline" | "global";
}

export interface BlockMenuConfig {
  blockId: string;
  x: number;
  y: number;
}

// ─── State ─────────────────────────────────────────────────

export interface EditorState {
  doc: EditorDoc;
  selection: SelectionInfo | null;
  activeBlockId: string | null;
  focusedBlockId: string | null;
  settings: EditorSettings;
  contextMenu: ContextMenuConfig | null;
  blockMenu: BlockMenuConfig | null;
  lastSaved: number | null;
  isDirty: boolean;
  showSettings: boolean;
  dragBlockId: string | null;
  dragOverBlockId: string | null;
  showImportModal: boolean;
  importFormat: "html" | "markdown" | "json";
}

// ─── Actions ───────────────────────────────────────────────

export type EditorAction =
  | { type: "SET_CONTENT"; blockId: string; content: InlineNode[] }
  | { type: "SET_CODE_CONTENT"; blockId: string; content: string }
  | { type: "SET_LIST_ITEMS"; blockId: string; items: ListItem[] }
  | { type: "SET_TABLE_ROWS"; blockId: string; rows: TableRow[] }
  | { type: "INSERT_BLOCK"; block: Block; afterId?: string }
  | { type: "DELETE_BLOCK"; id: string }
  | { type: "UPDATE_BLOCK"; id: string; updates: Partial<Block> }
  | { type: "MOVE_BLOCK"; id: string; direction: "up" | "down" }
  | { type: "REORDER_BLOCKS"; fromId: string; toId: string }
  | { type: "SET_ACTIVE_BLOCK"; id: string | null }
  | { type: "SET_FOCUSED_BLOCK"; id: string | null }
  | { type: "SET_SELECTION"; selection: SelectionInfo | null }
  | { type: "SHOW_CONTEXT_MENU"; config: ContextMenuConfig }
  | { type: "HIDE_CONTEXT_MENU" }
  | { type: "SHOW_BLOCK_MENU"; config: BlockMenuConfig }
  | { type: "HIDE_BLOCK_MENU" }
  | { type: "UPDATE_SETTINGS"; settings: Partial<EditorSettings> }
  | { type: "SET_DOC"; doc: EditorDoc }
  | { type: "SET_LAST_SAVED"; timestamp: number }
  | { type: "SET_DIRTY"; dirty: boolean }
  | { type: "TOGGLE_SETTINGS" }
  | { type: "HIDE_SETTINGS" }
  | { type: "SET_DRAG_BLOCK"; blockId: string | null }
  | { type: "SET_DRAG_OVER_BLOCK"; blockId: string | null }
  | { type: "TOGGLE_IMPORT_MODAL" }
  | { type: "SET_IMPORT_FORMAT"; format: "html" | "markdown" | "json" }
  | { type: "CLEAR" };

// ─── Public API ────────────────────────────────────────────

export interface EditorPublicAPI {
  getDoc(): EditorDoc;
  setDoc(doc: EditorDoc): void;
  getJSON(): string;
  focus(blockId?: string): void;
  insertBlock(type: Block["type"], afterId?: string, attrs?: Partial<Block>): void;
  deleteBlock(id: string): void;
  updateBlock(id: string, updates: Partial<Block>): void;
  moveBlock(id: string, direction: "up" | "down"): void;
  duplicateBlock(id: string): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  getWordCount(): number;
  getCharCount(): number;
  getParagraphCount(): number;
  clear(): void;
  importHTML(html: string): void;
  importMarkdown(md: string): void;
  importJSON(json: string): void;
  exportHTML(): string;
  exportMarkdown(): string;
  exportJSON(): string;
  exportPlainText(): string;
}
