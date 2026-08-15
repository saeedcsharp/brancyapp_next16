// #region IMPORTS AND EXPORTS
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import {
  GenericItemNode,
  GenericNode,
  ImageNode,
  OnMessageNode,
  QuickReplyNode,
  TextNode,
  VoiceNode,
  WeblinkNode,
  genericNodeClassName,
  genericitemNodeClassName,
  getGenericItemNodeHeight,
  getGenericNodeHeight,
  getImageNodeHeight,
  getOnMessageNodeHeight,
  getQuickReplyNodeHeight,
  getTextNodeHeight,
  getVoiceNodeHeight,
  getWeblinkNodeHeight,
  imageNodeClassName,
  onmessageNodeClassName,
  quickreplyNodeClassName,
  textNodeClassName,
  voiceNodeClassName,
  weblinkNodeClassName,
} from "brancy/components/messages/aiflow/flowNode";
import {
  InternalResponseType,
  NotifType,
  ResponseType,
  internalNotify,
  notify,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import styles from "./Flow.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { ITotalMasterFlow } from "brancy/models/interfaces";
// #endregion IMPORTS AND EXPORTS

// #region INTERFACES & TYPE DEFINITIONS

// ============================================================================
// INTERFACES & TYPE DEFINITIONS
// ============================================================================
// این بخش شامل تمامی تعاریف Interface و Type های مورد نیاز برای Flow Editor است
export interface ICompareFlowResult {
  hasDifference: boolean;
  addedNodes?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
  removedNodes?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
  modifiedNodes?: Array<{
    type: string;
    label: string;
    changedProperties: Array<{
      property: string;
      savedValue: any;
      inputValue: any;
    }>;
  }>;
}

/**
 * تعریف موقعیت (Position)
 * برای ذخیره مختصات x و y
 */
interface Position {
  x: number;
  y: number;
}

/**
 * تعریف Socket (نقاط اتصال نودها)
 * هر نود می‌تواند چندین input و output socket داشته باشد
 */
interface Socket {
  id: string;
  type: "input" | "output";
  label: string;
}

/**
 * تعریف داده‌های نود (NodeData)
 * شامل تمام اطلاعات مربوط به یک نود در Flow Editor
 */
interface NodeData {
  id: string;
  type: "text" | "image" | "voice" | "quickreply" | "generic" | "genericitem" | "weblink" | "onmessage";
  label: string;
  position: Position;
  inputs: Socket[];
  outputs: Socket[];
  genericItemOutputs?: Socket[]; // برای نگهداری outputs مربوط به GenericItem ها (فقط برای نود generic)
  buttonOutputs?: Socket[]; // برای نگهداری outputs مربوط به دکمه‌ها (فقط برای نود quickreply و genericitem)
  data?: any;
  selected?: boolean;
  uploadProgress?: number;
}

/**
 * تعریف نوع اتصال
 * برای تفکیک قوانین اعتبارسنجی اتصالات مختلف
 */
type ConnectionType = "default" | "genericItem" | "button";

/**
 * تعریف اتصال بین نودها (Connection)
 * هر اتصال یک نود منبع و یک نود مقصد دارد
 */
interface Connection {
  id: string;
  sourceNodeId: string;
  sourceSocketId: string;
  targetNodeId: string;
  targetSocketId: string;
  protected?: boolean; // برای اتصالات محافظت شده بین generic و genericitem
  connectionType?: ConnectionType; // نوع اتصال برای اعتبارسنجی
}

/**
 * تعریف وضعیت کلی ویرایشگر (EditorState)
 * شامل تمام نودها، اتصالات، scale و pan
 */
interface EditorState {
  nodes: NodeData[];
  connections: Connection[];
  scale: number;
  pan: Position;
}

/**
 * تعریف یک ورودی تاریخچه (History Entry)
 * برای پیاده‌سازی Undo/Redo
 */
interface HistoryEntry {
  state: EditorState;
  timestamp: number;
}

/**
 * تعریف وضعیت منوی راست‌کلیک (Context Menu)
 */
interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId?: string;
  connectionId?: string;
}

/**
 * تعریف باکس انتخاب (Selection Box)
 * برای انتخاب چندگانه نودها با کشیدن ماوس
 */
interface SelectionBox {
  active: boolean;
  start: Position;
  end: Position;
}
interface IGetFlow {
  checkFollower: boolean;
  flowModel: EditorState;
  privateReplyCompability: boolean;
  title: string;
}
// #endregion INTERFACES & TYPE DEFINITIONS

// #region CONNECTION RULES MATRIX

// ============================================================================
// CONNECTION RULES MATRIX
// ============================================================================
// ماتریس‌های کنترل قوانین اتصالات بین نودها

/**
 * ماتریس قوانین اتصالات ورودی (Input)
 * هر سطر نشان‌دهنده نود هدف (target) و هر ستون نشان‌دهنده نود منبع (source) است
 * مقدار 1 = اتصال مجاز، مقدار 0 = اتصال غیرمجاز
 */
type NodeType = "onmessage" | "weblink" | "voice" | "text" | "quickreply" | "image" | "generic" | "genericitem";

const INPUT_CONNECTION_RULES: Record<NodeType, Record<NodeType, number>> = {
  onmessage: {
    onmessage: 0,
    weblink: 0,
    voice: 0,
    text: 0,
    quickreply: 0,
    image: 0,
    generic: 0,
    genericitem: 0,
  },
  weblink: {
    onmessage: 0,
    weblink: 0,
    voice: 0,
    text: 0,
    quickreply: 0,
    image: 0,
    generic: 0,
    genericitem: 1,
  },
  voice: {
    onmessage: 1,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 0,
    genericitem: 1,
  },
  text: {
    onmessage: 1,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 0,
    genericitem: 1,
  },
  quickreply: {
    onmessage: 1,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 0,
    genericitem: 1,
  },
  image: {
    onmessage: 1,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 0,
    genericitem: 1,
  },
  generic: {
    onmessage: 1,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 0,
    genericitem: 1,
  },
  genericitem: {
    onmessage: 0,
    weblink: 0,
    voice: 0,
    text: 0,
    quickreply: 0,
    image: 0,
    generic: 1,
    genericitem: 0,
  },
};

/**
 * ماتریس قوانین اتصالات خروجی (Output)
 * هر سطر نشان‌دهنده نود منبع (source) و هر ستون نشان‌دهنده نود هدف (target) است
 * مقدار 1 = اتصال مجاز، مقدار 0 = اتصال غیرمجاز
 */
const OUTPUT_CONNECTION_RULES: Record<NodeType, Record<NodeType, number>> = {
  onmessage: {
    onmessage: 0,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 1,
    genericitem: 0,
  },
  weblink: {
    onmessage: 0,
    weblink: 0,
    voice: 0,
    text: 0,
    quickreply: 0,
    image: 0,
    generic: 0,
    genericitem: 0,
  },
  voice: {
    onmessage: 0,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 1,
    genericitem: 0,
  },
  text: {
    onmessage: 0,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 1,
    genericitem: 0,
  },
  quickreply: {
    onmessage: 0,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 1,
    genericitem: 0,
  },
  image: {
    onmessage: 0,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 1,
    genericitem: 0,
  },
  generic: {
    onmessage: 0,
    weblink: 0,
    voice: 0,
    text: 0,
    quickreply: 0,
    image: 0,
    generic: 0,
    genericitem: 1,
  },
  genericitem: {
    onmessage: 0,
    weblink: 1,
    voice: 1,
    text: 1,
    quickreply: 1,
    image: 1,
    generic: 1,
    genericitem: 0,
  },
};

/**
 * بررسی اینکه آیا تمام بلوک‌ها (به غیر از onMessage) حداقل یک ورودی دارند
 * و اینکه بلوک onMessage تنها نباشد
 * @param nodes - آرایه نودها
 * @param connections - آرایه اتصالات
 * @returns boolean - true اگر تمام بلوک‌ها ورودی داشته باشند و onMessage تنها نباشد، false در غیر این صورت
 */
const validateAllBlocksHaveInput = (flow: EditorState, flowPropsId: string): boolean => {
  // پیدا کردن بلوک onMessage
  const onMessageNode = flow.nodes.find((node) => node.type === "onmessage");

  // اگر بلوک onMessage وجود داشت، بررسی کنیم که خروجی دارد یا نه
  if (onMessageNode) {
    const onMessageHasOutput = flow.connections.some((conn) => conn.sourceNodeId === onMessageNode.id);

    // اگر onMessage تنها است (هیچ بلوک دیگری نباشد) و flowPropsId === "new"، localStorage را پاک کن
    if (!onMessageHasOutput && flowPropsId === "newFlow" && flow.nodes.length === 1) {
      localStorage.removeItem("flowEditor_autoSave_newFlow");
    }

    // اگر onMessage خروجی نداشت (تنها بود)، false برگردان
    if (!onMessageHasOutput && flowPropsId !== "newFlow") {
      return false;
    }
  }

  // فیلتر کردن نودهایی که نوع آن‌ها onMessage نیست
  const nonOnMessageNodes = flow.nodes.filter((node) => node.type !== "onmessage");

  // بررسی هر نود
  for (const node of nonOnMessageNodes) {
    // چک کردن اینکه آیا این نود حداقل یک اتصال ورودی دارد
    const hasInputConnection = flow.connections.some((conn) => conn.targetNodeId === node.id);

    // اگر نودی بدون ورودی پیدا شد، false برگردان
    if (!hasInputConnection) {
      return false;
    }
  }

  // اگر تمام شرایط برقرار بود، true برگردان
  return true;
};

/**
 * تابع اعتبارسنجی اتصال بین دو نود
 * @param sourceNodeType - نوع نود منبع (خروجی)
 * @param targetNodeType - نوع نود مقصد (ورودی)
 * @param connectionType - نوع اتصال (default, genericItem, button)
 * @returns boolean - true اگر اتصال مجاز باشد، false در غیر این صورت
 */
const validateConnection = (
  sourceNodeType: NodeData["type"],
  targetNodeType: NodeData["type"],
  connectionType: ConnectionType = "default",
): boolean => {
  if (targetNodeType === "weblink") {
    if (sourceNodeType == "genericitem") {
      return true;
    }
    return false;
  }
  if (targetNodeType === "onmessage") {
    return false;
  }
  // بررسی وجود نوع نود در ماتریس‌ها
  if (!OUTPUT_CONNECTION_RULES[sourceNodeType] || !INPUT_CONNECTION_RULES[targetNodeType]) {
    return false;
  }

  // اعتبارسنجی بر اساس نوع اتصال
  switch (connectionType) {
    case "genericItem":
      // قوانین خاص برای اتصالات genericItem
      // فقط generic می‌تواند به genericitem متصل شود
      if (sourceNodeType === "generic" && targetNodeType === "genericitem") {
        return true;
      }
      return false;

    case "button":
      // قوانین خاص برای اتصالات دکمه‌ای (quickreply و genericitem)
      // دکمه‌های quickreply و genericitem می‌توانند به اکثر نودها وصل شوند
      if (sourceNodeType === "quickreply" || sourceNodeType === "genericitem") {
        // نمی‌توانند به onmessage، weblink، generic، یا genericitem وصل شوند
        return true;
      }
      return false;

    case "default":
    default:
      return true;
    // قوانین پیش‌فرض - استفاده از ماتریس‌ها
    // const outputAllowed = OUTPUT_CONNECTION_RULES[sourceNodeType][targetNodeType] === 1;
    // const inputAllowed = INPUT_CONNECTION_RULES[targetNodeType][sourceNodeType] === 1;

    // // اتصال تنها در صورتی مجاز است که هر دو شرط برقرار باشد
    // return outputAllowed && inputAllowed;
  }
};

// #endregion CONNECTION RULES MATRIX

// #region UTILITY FUNCTIONS

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
// این بخش شامل توابع کمکی و utility functions است

/**
 * تولید شناسه یکتا برای نودها
 * @returns string - یک شناسه یکتا
 */
const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * دریافت نام کلاس CSS بر اساس نوع نود
 * @param nodeType - نوع نود
 * @returns string - نام کلاس CSS
 */
const getNodeClassName = (nodeType: string): string => {
  const classNameMap: Record<string, string> = {
    text: textNodeClassName,
    image: imageNodeClassName,
    voice: voiceNodeClassName,
    quickreply: quickreplyNodeClassName,
    generic: genericNodeClassName,
    genericitem: genericitemNodeClassName,
    weblink: weblinkNodeClassName,
    onmessage: onmessageNodeClassName,
  };
  return classNameMap[nodeType] || "";
};

/**
 * دریافت کلید ترجمه بر اساس نوع نود
 * @param nodeType - نوع نود
 * @returns LanguageKey - کلید ترجمه
 */
const getNodeTypeTranslationKey = (nodeType: string): LanguageKey => {
  const translationMap: Record<string, LanguageKey> = {
    text: LanguageKey.New_Flow_text_block,
    image: LanguageKey.New_Flow_imageorvideo_block,
    voice: LanguageKey.New_Flow_voice_block,
    quickreply: LanguageKey.New_Flow_quick_reply_block,
    generic: LanguageKey.New_Flow_generic_block,
    genericitem: LanguageKey.New_Flow_generic_block,
    weblink: LanguageKey.New_Flow_weblink_block,
    onmessage: LanguageKey.New_Flow_input_message_block,
  };
  return translationMap[nodeType] || LanguageKey.New_Flow_general_block;
};

/**
 * تولید مسیر Bezier برای نمایش اتصالات بین نودها
 * @param start - نقطه شروع
 * @param end - نقطه پایان
 * @returns string - مسیر SVG
 */
const getBezierPath = (start: Position, end: Position): string => {
  const dx = end.x - start.x;
  const controlPointOffset = Math.abs(dx) / 2;
  const fmt = (n: number) => n.toFixed(0);
  return `M ${fmt(start.x)} ${fmt(start.y)} C ${fmt(start.x + controlPointOffset)} ${fmt(start.y)}, ${fmt(
    end.x - controlPointOffset,
  )} ${fmt(end.y)}, ${fmt(end.x)} ${fmt(end.y)}`;
};

/**
 * قرار دادن موقعیت روی Grid (چسباندن به شبکه)
 * @param value - مقدار موقعیت
 * @param gridSize - اندازه شبکه
 * @param enabled - فعال بودن قابلیت snap to grid
 * @returns number - مقدار اصلاح شده
 */
const snapToGrid = (value: number, gridSize: number, enabled: boolean): number => {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
};

/**
 * دریافت رنگ مخصوص هر نوع نود
 * @param nodeType - نوع نود
 * @returns string - کد رنگ Hex
 */
const getNodeTypeColor = (nodeType: string): string => {
  const colorMap: Record<string, string> = {
    text: "#E934DD",
    image: "#8F3AFF",
    voice: "#e74c3c",
    quickreply: "#E99D34",
    generic: "#2699fb",
    genericitem: "#00c1d4",
    weblink: "#3498db",
    onmessage: "#34E994",
  };
  return colorMap[nodeType] || "#95a5a6"; // Default Gray
};

/**
 * محاسبه فاصله یک نقطه تا یک خط
 * برای تشخیص کلیک روی اتصالات
 */
const distanceToLine = (point: Position, lineStart: Position, lineEnd: Position): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;
  let xx, yy;
  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }
  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * محاسبه فاصله اقلیدسی بین دو نقطه
 */
const calculateDistance = (p1: Position, p2: Position): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * پیدا کردن نزدیک‌ترین input socket به نقطه مشخص شده
 * برای snap-to-socket در حالت موبایل
 */
const findNearestInputSocket = (
  point: Position,
  nodes: NodeData[],
  excludeNodeId: string,
  threshold: number = 120,
): { nodeId: string; socketId: string; distance: number } | null => {
  let nearest: { nodeId: string; socketId: string; distance: number } | null = null;
  let minDistance = threshold;

  nodes.forEach((node) => {
    if (node.id === excludeNodeId) return; // نود منبع را نادیده می‌گیریم

    node.inputs.forEach((socket) => {
      // برای هر socket ورودی، باید موقعیت واقعی آن را محاسبه کنیم
      // فرض می‌کنیم input socket در سمت چپ نود قرار دارد
      const socketPosition: Position = {
        x: node.position.x, // سمت چپ نود
        y: node.position.y + 75, // تقریباً در ارتفاع مشخص (مطابق با CSS)
      };

      const distance = calculateDistance(point, socketPosition);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = {
          nodeId: node.id,
          socketId: socket.id,
          distance,
        };
      }
    });
  });

  return nearest;
};

/**
 * چیدمان خودکار نودها (Auto Layout)
 * این تابع نودها را به صورت سلسله مراتبی از چپ به راست چیدمان می‌کند
 */
const autoLayout = (nodes: NodeData[], connections: Connection[]): NodeData[] => {
  const HORIZONTAL_GAP = 200;
  const VERTICAL_GAP = 200;
  const NODE_WIDTH = 200;
  const START_X = 100;
  const START_Y = 100;

  /**
   * تابع کمکی برای محاسبه ارتفاع نود بر اساس نوع آن
   */
  const getNodeHeight = (node: NodeData): number => {
    switch (node.type) {
      case "text":
        return getTextNodeHeight(node);
      case "image":
        return getImageNodeHeight(node);
      case "voice":
        return getVoiceNodeHeight(node);
      case "quickreply":
        return getQuickReplyNodeHeight(node);
      case "generic":
        return getGenericNodeHeight(node);
      case "genericitem":
        return getGenericItemNodeHeight(node);
      case "weblink":
        return getWeblinkNodeHeight(node);
      case "onmessage":
        return getOnMessageNodeHeight(node);
      default:
        return 150;
    }
  };

  const laid = new Map<string, Position>();
  const visited = new Set<string>();
  const levelNodes = new Map<number, string[]>(); // ذخیره نودهای هر سطح

  // پیدا کردن نودهای ریشه (نودهایی که اتصال ورودی ندارند)
  const roots = nodes.filter((node) => !connections.some((conn) => conn.targetNodeId === node.id));

  // ساخت ساختار سطح‌بندی شده
  const assignLevel = (nodeId: string, level: number) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    if (!levelNodes.has(level)) {
      levelNodes.set(level, []);
    }
    levelNodes.get(level)!.push(nodeId);

    const children = connections.filter((conn) => conn.sourceNodeId === nodeId).map((conn) => conn.targetNodeId);
    children.forEach((childId) => {
      assignLevel(childId, level + 1);
    });
  };

  // تخصیص سطح به تمام نودها
  roots.forEach((root) => {
    assignLevel(root.id, 0);
  });

  // محاسبه موقعیت‌ها سطح به سطح
  let currentX = START_X;
  const levelXPositions = new Map<number, number>();

  // محاسبه موقعیت X برای هر سطح
  levelNodes.forEach((nodeIds, level) => {
    levelXPositions.set(level, currentX);
    currentX += NODE_WIDTH + HORIZONTAL_GAP;
  });

  // موقعیت‌دهی نودها در هر سطح
  levelNodes.forEach((nodeIds, level) => {
    let currentY = START_Y;
    const x = levelXPositions.get(level)!;

    nodeIds.forEach((nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const nodeHeight = getNodeHeight(node);
      laid.set(nodeId, { x, y: currentY });

      currentY += nodeHeight + VERTICAL_GAP;
    });
  });

  // بازگرداندن نودها با موقعیت‌های به‌روز شده
  return nodes.map((node) => ({
    ...node,
    position: laid.get(node.id) || node.position,
  }));
};

// #endregion UTILITY FUNCTIONS

// #region MAIN COMPONENT

// ============================================================================
// MAIN COMPONENT
// ============================================================================
// کامپوننت اصلی Flow Editor

export default function Flow({
  flowId: flowPropsId,
  showUserList,
  onOpenSettings,
  onOpenLiveTest,
  onOpenTutorial,
  onRegisterGetEditorState,
  onRegisterReload,
  onSaveSuccess,
  existingFlows,
}: {
  flowId: string;
  showUserList: () => void;
  onOpenSettings: (payLoad: any) => void;
  onOpenLiveTest?: () => void;
  onOpenTutorial?: (nodeType: string) => void;
  onRegisterGetEditorState?: (fn: () => { nodes: NodeData[]; connections: Connection[]; title: string }) => void;
  onRegisterReload?: (fn: (useLocalStorage: boolean) => void) => void;
  onSaveSuccess?: (masterFlow?: ITotalMasterFlow, flowStr?: string) => void;
  existingFlows?: Array<{ title: string }>;
}) {
  const { data: session } = useSession();
  // ============================================================================
  // TRANSLATION
  // ============================================================================
  const { t } = useTranslation();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  // مدیریت State های مختلف کامپوننت

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // State اصلی ویرایشگر (نودها، اتصالات، scale و pan)
  const [editorState, setEditorState] = useState<EditorState>({
    nodes: [],
    connections: [],
    scale: 1,
    pan: { x: 0, y: 0 },
  });
  let editorStateConst: EditorState = editorState;
  // مدیریت تاریخچه برای Undo/Redo
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const MAX_HISTORY = 50;

  // State برای انتخاب چندگانه با کشیدن ماوس
  const [selectionBox, setSelectionBox] = useState<SelectionBox>({
    active: false,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  });

  // State برای کلیپبورد (کپی/پیست)
  const [clipboard, setClipboard] = useState<{
    nodes: NodeData[];
    connections: Connection[];
  } | null>(null);

  // State برای منوی راست‌کلیک
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
  });

  // State های مربوط به Drag & Drop نودها
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  // State های مربوط به Pan کردن canvas
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });

  // State های مربوط به ایجاد اتصال بین نودها
  const [connectingSocket, setConnectingSocket] = useState<{
    nodeId: string;
    socketId: string;
    position: Position;
  } | null>(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState<Position | null>(null);

  // State برای نگهداری socket نزدیک (برای snap-to-socket در موبایل)
  const [nearestSocket, setNearestSocket] = useState<{
    nodeId: string;
    socketId: string;
  } | null>(null);

  // State های مربوط به قابلیت‌های اضافی
  const [searchQuery, setSearchQuery] = useState("");
  const [showMinimap, setShowMinimap] = useState(true);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(false);
  const [panningBoundaryEnabled, setPanningBoundaryEnabled] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [forceConnectionUpdate, setForceConnectionUpdate] = useState(0);

  // State برای نمایش مودال تنظیمات (Settings Modal)
  const [settingModalVisible, setSettingModalVisible] = useState<boolean>(false);

  // State برای شناسه یکتا و عنوان Flow
  const [flowTitle, setFlowTitle] = useState<string>(() => {
    if (!existingFlows || existingFlows.length === 0) {
      return "Flow_1";
    }
    // پیدا کردن بزرگترین شماره در نام‌های موجود
    const flowNumbers = existingFlows
      .map((f) => {
        const match = f.title.match(/^Flow_(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const maxNumber = flowNumbers.length > 0 ? Math.max(...flowNumbers) : 0;
    return `Flow_${maxNumber + 1}`;
  });
  const flowTitleRef = useRef<string>(flowTitle);
  useEffect(() => {
    flowTitleRef.current = flowTitle;
  }, [flowTitle]);
  const [checkFollower, setCheckFollower] = useState<boolean>(false);
  const checkFollowerRef = useRef<boolean>(checkFollower);
  useEffect(() => {
    checkFollowerRef.current = checkFollower;
  }, [checkFollower]);
  const [privateReplyCompability, setPrivateReplyCompability] = useState<boolean>(false);
  // State های مربوط به Touch Events و Mobile Gestures
  const [touchStartDistance, setTouchStartDistance] = useState<number>(0);
  const [lastTouchScale, setLastTouchScale] = useState<number>(1);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<Position | null>(null);
  const [isTouchMoving, setIsTouchMoving] = useState(false);

  // ============================================================================
  // REFS
  // ============================================================================
  // Ref ها برای دسترسی مستقیم به عناصر DOM

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const GRID_SIZE = 20;
  // #endregion MAIN COMPONENT

  // #region panning boundary

  // ============================================================================
  // UTILITY CALLBACKS
  // ============================================================================
  // توابع کمکی برای مدیریت Pan و محدودیت‌های حرکت

  /**
   * محاسبه و محدود کردن Pan بر اساس محدوده محتوا
   * این تابع جلوی خارج شدن نودها از viewport را می‌گیرد
   */
  const clampPan = useCallback(
    (pan: Position, scale: number): Position => {
      if (!panningBoundaryEnabled || editorState.nodes.length === 0 || !canvasRef.current) return pan;
      // ابعاد واقعی نودها را محاسبه کن
      const nodeWidths = editorState.nodes.map(() => 200);
      const nodeHeights = editorState.nodes.map(() => 150);
      const minX = Math.min(...editorState.nodes.map((n, i) => n.position.x));
      const maxX = Math.max(...editorState.nodes.map((n, i) => n.position.x + nodeWidths[i]));
      const minY = Math.min(...editorState.nodes.map((n, i) => n.position.y));
      const maxY = Math.max(...editorState.nodes.map((n, i) => n.position.y + nodeHeights[i]));
      const viewport = canvasRef.current.getBoundingClientRect();
      const margin = 50;
      // محدوده pan را فقط محدود کن، ابعاد canvas را تغییر نده
      const minPanX = viewport.width - maxX * scale - margin;
      const maxPanX = margin - minX * scale;
      const minPanY = viewport.height - maxY * scale - margin;
      const maxPanY = margin - minY * scale;
      const clampValue = (value: number, a: number, b: number) => {
        const low = Math.min(a, b);
        const high = Math.max(a, b);
        return Math.min(Math.max(value, low), high);
      };
      return {
        x: clampValue(pan.x, minPanX, maxPanX),
        y: clampValue(pan.y, minPanY, maxPanY),
      };
    },
    [panningBoundaryEnabled, editorState.nodes],
  );
  // #endregion panning boundary

  // #region EFFECTS

  // ============================================================================
  // EFFECTS
  // ============================================================================
  // useEffect ها برای مدیریت side effect ها

  /**
   * هنگام تغییر وضعیت محدودیت Pan، موقعیت فعلی را اصلاح کن
   */
  useEffect(() => {
    setEditorState((prev) => ({
      ...prev,
      pan: clampPan(prev.pan, prev.scale),
    }));
  }, [panningBoundaryEnabled, clampPan]);

  /**
   * ثبت تابع getter برای دسترسی parent به editor state برای LiveTestModal
   */
  useEffect(() => {
    if (onRegisterGetEditorState) {
      const getter = () => ({
        nodes: editorState.nodes,
        connections: editorState.connections,
        title: flowTitle,
      });
      onRegisterGetEditorState(getter);
    }
  }, [editorState, flowTitle, onRegisterGetEditorState]);

  // #endregion EFFECTS

  // #region HISTORY MANAGEMENT

  // ============================================================================
  // HISTORY MANAGEMENT
  // ============================================================================
  // مدیریت تاریخچه برای Undo/Redo

  /**
   * افزودن یک وضعیت جدید به تاریخچه
   */
  const addToHistory = useCallback(
    (state: EditorState) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push({
          state: JSON.parse(JSON.stringify(state)),
          timestamp: Date.now(),
        });
        return newHistory.slice(-MAX_HISTORY);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    },
    [historyIndex],
  );

  /**
   * بازگشت به وضعیت قبلی (Undo)
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setEditorState(JSON.parse(JSON.stringify(history[historyIndex - 1].state)));
    }
  }, [historyIndex, history]);

  /**
   * رفتن به وضعیت بعدی (Redo)
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setEditorState(JSON.parse(JSON.stringify(history[historyIndex + 1].state)));
    }
  }, [historyIndex, history]);

  /**
   * به‌روزرسانی State با ذخیره در تاریخچه
   */
  const updateStateWithHistory = useCallback(
    (updater: (prev: EditorState) => EditorState) => {
      setEditorState((prev) => {
        const newState = updater(prev);
        addToHistory(newState);
        return newState;
      });
    },
    [addToHistory],
  );

  // #endregion HISTORY MANAGEMENT

  // #region NODE MANAGEMENT

  // ============================================================================
  // NODE MANAGEMENT
  // ============================================================================
  // توابع مدیریت نودها (افزودن، حذف، کپی، پیست و...)

  /**
   * افزودن نود جدید به ویرایشگر
   */
  const addNode = useCallback(
    (type: NodeData["type"], data?: any, position?: Position) => {
      // 🎯 پیدا کردن آخرین نودی که خروجی‌اش به هیچ بلاکی وصل نیست
      const findLastUnconnectedNode = (): Position => {
        // فیلتر نودهایی که حداقل یک output دارند
        const nodesWithOutputs = editorState.nodes.filter(
          (node) =>
            (node.outputs && node.outputs.length > 0) ||
            (node.buttonOutputs && node.buttonOutputs.length > 0) ||
            (node.genericItemOutputs && node.genericItemOutputs.length > 0),
        );

        // پیدا کردن نودهایی که هیچ output متصلی ندارند
        const unconnectedNodes = nodesWithOutputs.filter((node) => {
          const hasConnection = editorState.connections.some((conn) => conn.sourceNodeId === node.id);
          return !hasConnection;
        });

        if (unconnectedNodes.length > 0) {
          // آخرین نود بدون اتصال (جدیدترین)
          const lastNode = unconnectedNodes[unconnectedNodes.length - 1];
          // قرار دادن بلاک جدید در سمت راست (300 پیکسل دورتر)
          return {
            x: snapToGrid(lastNode.position.x + 350, GRID_SIZE, snapToGridEnabled),
            y: snapToGrid(lastNode.position.y, GRID_SIZE, snapToGridEnabled),
          };
        }

        // اگر همه نودها متصل هستند، از موقعیت پیش‌فرض استفاده می‌کنیم
        return {
          x: snapToGrid((400 - editorState.pan.x) / editorState.scale, GRID_SIZE, snapToGridEnabled),
          y: snapToGrid((200 - editorState.pan.y) / editorState.scale, GRID_SIZE, snapToGridEnabled),
        };
      };

      const newNode: NodeData = {
        id: generateId(),
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${
          editorState.nodes.filter((n) => n.type === type).length + 1
        }`,
        position: position || findLastUnconnectedNode(),
        inputs: [{ id: "input", type: "input", label: "Input" }],
        outputs: [{ id: "output", type: "output", label: "Output" }],
        data: data || {},
      };
      if (type === "onmessage") {
        newNode.inputs = [];
      }
      if (type === "quickreply") {
        newNode.outputs = []; // outputs معمولی - برای اتصالات غیر دکمه‌ای
        newNode.buttonOutputs = [
          { id: "output1", type: "output", label: "Button 1" },
          { id: "output2", type: "output", label: "Button 2" },
        ];
        newNode.data = { buttons: ["Button 1", "Button 2"] };
      }
      if (type === "generic") {
        // نود generic باید یک ورودی داشته باشد، پس ورودی پیش‌فرض را حفظ می‌کنیم
        newNode.outputs = [{ id: "output", type: "output", label: "Output" }]; // outputs معمولی - برای اتصالات غیر GenericItem (برای ادامه جریان)
        newNode.genericItemOutputs = []; // outputs مخصوص GenericItem ها - به صورت داینامیک اضافه می‌شوند
        newNode.data = { itemCount: 0 };
      }
      if (type === "weblink") {
        // نود weblink فقط input دارد و output ندارد
        newNode.outputs = [];
      }
      updateStateWithHistory((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));
      if (type === "image") {
        setTimeout(() => {
          const fileInput = document.getElementById(`img-${newNode.id}`) as HTMLInputElement;
          if (fileInput) {
            fileInput.click();
          }
        }, 100);
      }
    },
    [editorState.nodes, editorState.pan, editorState.scale, snapToGridEnabled, updateStateWithHistory],
  );

  /**
   * حذف یک نود
   */
  const deleteNode = useCallback(
    (nodeId: string) => {
      const node = editorState.nodes.find((n) => n.id === nodeId);
      if (node?.type === "onmessage") {
        // انیمیشن shake افقی برای 3 ثانیه
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
          nodeElement.classList.add(styles.shakeHorizontal);
          setTimeout(() => {
            nodeElement.classList.remove(styles.shakeHorizontal);
          }, 3000);
        }
        return;
      }

      updateStateWithHistory((prev) => {
        let nodesToDelete = [nodeId];

        // اگر نود generic حذف شود، تمام genericitem های متصل را هم حذف کن
        if (node?.type === "generic") {
          const connectedItems = prev.connections
            .filter((c) => c.sourceNodeId === nodeId && c.protected)
            .map((c) => c.targetNodeId);
          nodesToDelete = [...nodesToDelete, ...connectedItems];
        }

        // اگر نود genericitem حذف شود، output و connection مربوطه در generic را هم حذف کن
        if (node?.type === "genericitem") {
          const parentConnection = prev.connections.find((c) => c.targetNodeId === nodeId && c.protected);
          if (parentConnection) {
            const parentNode = prev.nodes.find((n) => n.id === parentConnection.sourceNodeId);
            if (parentNode && parentNode.type === "generic") {
              // حذف output از genericItemOutputs نود والد
              return {
                ...prev,
                nodes: prev.nodes
                  .filter((n) => !nodesToDelete.includes(n.id))
                  .map((n) => {
                    if (n.id === parentNode.id) {
                      return {
                        ...n,
                        genericItemOutputs: (n.genericItemOutputs || []).filter(
                          (o) => o.id !== parentConnection.sourceSocketId,
                        ),
                        data: {
                          ...n.data,
                          itemCount: (n.data?.itemCount || 1) - 1,
                        },
                      };
                    }
                    return n;
                  }),
                connections: prev.connections.filter(
                  (c) => !nodesToDelete.includes(c.sourceNodeId) && !nodesToDelete.includes(c.targetNodeId),
                ),
              };
            }
          }
        }

        return {
          ...prev,
          nodes: prev.nodes.filter((n) => !nodesToDelete.includes(n.id)),
          connections: prev.connections.filter(
            (c) => !nodesToDelete.includes(c.sourceNodeId) && !nodesToDelete.includes(c.targetNodeId),
          ),
        };
      });
    },
    [editorState.nodes, updateStateWithHistory],
  );

  /**
   * حذف نودهای انتخاب شده
   */
  const deleteSelectedNodes = useCallback(() => {
    // فیلتر کردن نودهای انتخاب شده به جز onmessage
    const nodesToDelete = editorState.nodes.filter((n) => n.selected && n.type !== "onmessage");

    if (nodesToDelete.length === 0) {
      return;
    }

    const selectedIds = nodesToDelete.map((n) => n.id);

    updateStateWithHistory((prev) => {
      let nodesToDeleteIds = [...selectedIds];

      // مدیریت نودهای generic - حذف فرزندان genericitem آن‌ها
      nodesToDelete.forEach((node) => {
        if (node.type === "generic") {
          const connectedItems = prev.connections
            .filter((c) => c.sourceNodeId === node.id && c.protected)
            .map((c) => c.targetNodeId);
          nodesToDeleteIds = [...nodesToDeleteIds, ...connectedItems];
        }
      });

      return {
        ...prev,
        nodes: prev.nodes.filter((n) => !nodesToDeleteIds.includes(n.id)),
        connections: prev.connections.filter(
          (c) => !nodesToDeleteIds.includes(c.sourceNodeId) && !nodesToDeleteIds.includes(c.targetNodeId),
        ),
      };
    });
  }, [editorState.nodes, updateStateWithHistory]);

  /**
   * حذف تمام نودها (به جز OnMessage)
   */
  const deleteAllNodes = useCallback(() => {
    updateStateWithHistory((prev) => {
      const onMessageNode = prev.nodes.find((n) => n.type === "onmessage");
      if (onMessageNode) {
        return {
          ...prev,
          nodes: [onMessageNode],
          connections: [],
        };
      }
      const newOnMessageNode: NodeData = {
        id: generateId(),
        type: "onmessage",
        label: "OnMessage",
        position: { x: 400, y: 200 },
        inputs: [],
        outputs: [{ id: "output", type: "output", label: "Output" }],
        data: {},
      };
      return {
        ...prev,
        nodes: [newOnMessageNode],
        connections: [],
      };
    });
  }, [updateStateWithHistory]);

  /**
   * انتخاب تمام نودها
   */
  const selectAll = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => ({ ...n, selected: true })),
    }));
  }, []);

  /**
   * کپی کردن نودهای انتخاب شده
   */
  const copySelectedNodes = useCallback(() => {
    const selectedNodes = editorState.nodes.filter((n) => n.selected && n.type !== "onmessage");
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map((n) => n.id);
    const selectedConnections = editorState.connections.filter(
      (c) => selectedIds.includes(c.sourceNodeId) && selectedIds.includes(c.targetNodeId),
    );
    setClipboard({ nodes: selectedNodes, connections: selectedConnections });
  }, [editorState.nodes, editorState.connections]);

  /**
   * پیست کردن نودهای کپی شده
   */
  const pasteNodes = useCallback(() => {
    if (!clipboard) return;
    const idMap = new Map<string, string>();
    const newNodes = clipboard.nodes.map((node) => {
      const newId = generateId();
      idMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        selected: true,
      };
    });
    const newConnections = clipboard.connections.map((conn) => ({
      ...conn,
      id: generateId(),
      sourceNodeId: idMap.get(conn.sourceNodeId) || conn.sourceNodeId,
      targetNodeId: idMap.get(conn.targetNodeId) || conn.targetNodeId,
    }));
    updateStateWithHistory((prev) => ({
      ...prev,
      nodes: [...prev.nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      connections: [...prev.connections, ...newConnections],
    }));
  }, [clipboard, updateStateWithHistory]);

  /**
   * تکثیر نودهای انتخاب شده (کپی + پیست)
   */
  const duplicateSelectedNodes = useCallback(() => {
    copySelectedNodes();
    pasteNodes();
  }, [copySelectedNodes, pasteNodes]);
  // #endregion NODE MANAGEMENT

  // #region EVENT HANDLERS - MOUSE & DRAG

  // ============================================================================
  // EVENT HANDLERS - MOUSE & DRAG
  // ============================================================================
  // مدیریت رویدادهای ماوس و Drag & Drop

  /**
   * مدیریت کلیک روی نود
   */
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if ((e.target as HTMLElement).closest(`.${styles.deleteBtn}`)) return;
      if ((e.target as HTMLElement).closest(`.${styles.socketDot}`)) return;
      if ((e.target as HTMLElement).closest(`.${styles.socketInputparent}`)) return;

      // جلوگیری از drag در nodeBody
      if ((e.target as HTMLElement).closest(`.${styles.nodeBody}`)) return;

      e.stopPropagation();
      const node = editorState.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      setDraggedNode(nodeId);
      setDragOffset({
        x: (e.clientX - editorState.pan.x) / editorState.scale - node.position.x,
        y: (e.clientY - editorState.pan.y) / editorState.scale - node.position.y,
      });
      if (e.ctrlKey || e.metaKey) {
        setEditorState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, selected: !n.selected } : n)),
        }));
      } else if (!node.selected) {
        setEditorState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => ({ ...n, selected: n.id === nodeId })),
        }));
      }
    },
    [editorState.nodes, editorState.scale, editorState.pan],
  );

  /**
   * مدیریت کلیک روی Canvas
   */
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setContextMenu({ visible: false, x: 0, y: 0 });
      const target = e.target as HTMLElement;
      if (target.closest(`.${styles.node}`)) return;
      if (e.shiftKey) {
        setSelectionBox({
          active: true,
          start: {
            x: (e.clientX - editorState.pan.x) / editorState.scale,
            y: (e.clientY - editorState.pan.y) / editorState.scale,
          },
          end: {
            x: (e.clientX - editorState.pan.x) / editorState.scale,
            y: (e.clientY - editorState.pan.y) / editorState.scale,
          },
        });
      } else {
        setIsPanning(true);
        setPanStart({
          x: e.clientX - editorState.pan.x,
          y: e.clientY - editorState.pan.y,
        });
        if (!e.ctrlKey && !e.metaKey) {
          setEditorState((prev) => ({
            ...prev,
            nodes: prev.nodes.map((n) => ({ ...n, selected: false })),
          }));
        }
      }
    },
    [editorState.pan, editorState.scale],
  );

  /**
   * مدیریت حرکت ماوس (برای Drag، Pan و Selection Box)
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggedNode) {
        const selectedNodes = editorState.nodes.filter((n) => n.selected);
        const draggedNodeData = editorState.nodes.find((n) => n.id === draggedNode);
        if (!draggedNodeData) return;
        const newX = snapToGrid(
          (e.clientX - editorState.pan.x) / editorState.scale - dragOffset.x,
          GRID_SIZE,
          snapToGridEnabled,
        );
        const newY = snapToGrid(
          (e.clientY - editorState.pan.y) / editorState.scale - dragOffset.y,
          GRID_SIZE,
          snapToGridEnabled,
        );
        const deltaX = newX - draggedNodeData.position.x;
        const deltaY = newY - draggedNodeData.position.y;
        setEditorState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => {
            if (n.selected && selectedNodes.length > 1) {
              return {
                ...n,
                position: {
                  x: n.position.x + deltaX,
                  y: n.position.y + deltaY,
                },
              };
            } else if (n.id === draggedNode) {
              return { ...n, position: { x: newX, y: newY } };
            }
            return n;
          }),
        }));
        // به‌روزرسانی connection‌ها در حین drag
        setForceConnectionUpdate((prev) => prev + 1);
      } else if (isPanning) {
        const unclamped = {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        };
        const clamped = clampPan(unclamped, editorState.scale);
        setEditorState((prev) => ({
          ...prev,
          pan: clamped,
        }));
      } else if (selectionBox.active) {
        const newEnd = {
          x: (e.clientX - editorState.pan.x) / editorState.scale,
          y: (e.clientY - editorState.pan.y) / editorState.scale,
        };
        setSelectionBox((prev) => ({ ...prev, end: newEnd }));
        const minX = Math.min(selectionBox.start.x, newEnd.x);
        const maxX = Math.max(selectionBox.start.x, newEnd.x);
        const minY = Math.min(selectionBox.start.y, newEnd.y);
        const maxY = Math.max(selectionBox.start.y, newEnd.y);
        setEditorState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => ({
            ...n,
            selected: n.position.x >= minX && n.position.x <= maxX && n.position.y >= minY && n.position.y <= maxY,
          })),
        }));
      } else if (connectingSocket && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const currentPoint = {
          x: (e.clientX - canvasRect.left - editorState.pan.x) / editorState.scale,
          y: (e.clientY - canvasRect.top - editorState.pan.y) / editorState.scale,
        };

        // پیدا کردن نزدیک‌ترین input socket
        const nearest = findNearestInputSocket(currentPoint, editorState.nodes, connectingSocket.nodeId, 120);

        if (nearest) {
          setNearestSocket({
            nodeId: nearest.nodeId,
            socketId: nearest.socketId,
          });
          // اگر socket نزدیک پیدا شد، نقطه پایان را به موقعیت socket تنظیم می‌کنیم
          const targetNode = editorState.nodes.find((n) => n.id === nearest.nodeId);
          if (targetNode) {
            setTempConnectionEnd({
              x: targetNode.position.x,
              y: targetNode.position.y + 75,
            });
          }
        } else {
          setNearestSocket(null);
          setTempConnectionEnd(currentPoint);
        }
      }
    },
    [draggedNode, isPanning, selectionBox, connectingSocket, editorState, dragOffset, panStart, snapToGridEnabled],
  );

  /**
   * مدیریت رها کردن ماوس (Mouse Up)
   */
  const handleMouseUp = useCallback(() => {
    if (draggedNode) {
      addToHistory(editorState);
      // به‌روزرسانی اجباری connection‌ها بعد از drag
      setTimeout(() => {
        setForceConnectionUpdate((prev) => prev + 1);
      }, 0);
    }

    // اگر در حال اتصال بودیم و socket نزدیک موجود است، اتصال را برقرار می‌کنیم
    if (connectingSocket && nearestSocket) {
      const sourceNode = editorState.nodes.find((n) => n.id === connectingSocket.nodeId);
      const targetNode = editorState.nodes.find((n) => n.id === nearestSocket.nodeId);

      if (sourceNode && targetNode && validateConnection(sourceNode.type, targetNode.type)) {
        // بررسی که این اتصال قبلاً وجود ندارد
        const exists = editorState.connections.some(
          (c) =>
            c.sourceNodeId === connectingSocket.nodeId &&
            c.sourceSocketId === connectingSocket.socketId &&
            c.targetNodeId === nearestSocket.nodeId &&
            c.targetSocketId === nearestSocket.socketId,
        );

        if (!exists) {
          // حذف اتصال ورودی قبلی target node (اگر وجود داشته باشد)
          const existingInputConnection = editorState.connections.find((c) => c.targetNodeId === nearestSocket.nodeId);

          // بررسی که socket خروجی قبلاً اتصال نداشته باشد
          const existingOutputFromSocket = editorState.connections.find(
            (c) => c.sourceNodeId === connectingSocket.nodeId && c.sourceSocketId === connectingSocket.socketId,
          );

          if (!existingOutputFromSocket) {
            const connectionId = `conn_${Date.now()}`;
            const newConnection: Connection = {
              id: connectionId,
              sourceNodeId: connectingSocket.nodeId,
              sourceSocketId: connectingSocket.socketId,
              targetNodeId: nearestSocket.nodeId,
              targetSocketId: nearestSocket.socketId,
            };

            const updatedConnections = existingInputConnection
              ? editorState.connections.filter((c) => c.id !== existingInputConnection.id)
              : editorState.connections;

            updateStateWithHistory((prev) => ({
              ...prev,
              connections: [...updatedConnections, newConnection],
            }));
          }
        }
      }
    }

    setDraggedNode(null);
    setIsPanning(false);
    setConnectingSocket(null);
    setTempConnectionEnd(null);
    setNearestSocket(null);
    setSelectionBox({
      active: false,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
    });
  }, [draggedNode, editorState, addToHistory, connectingSocket, nearestSocket, updateStateWithHistory]);

  // #endregion MOUSE & DRAG

  // #region EVENT HANDLERS - SOCKET & CONNECTION

  // ============================================================================
  // EVENT HANDLERS - SOCKET & CONNECTION
  // ============================================================================
  // مدیریت اتصالات بین نودها

  /**
   * مدیریت کلیک روی Socket (شروع اتصال)
   */
  const handleSocketMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string, socketId: string, socketType: "input" | "output") => {
      e.stopPropagation();
      if (socketType === "input") return;
      const node = editorState.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      if (!canvasRef.current) return;
      const socketElement = e.currentTarget as HTMLElement;
      const socketRect = socketElement.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setConnectingSocket({
        nodeId,
        socketId,
        position: {
          x: (socketRect.left + socketRect.width / 2 - canvasRect.left - editorState.pan.x) / editorState.scale,
          y: (socketRect.top + socketRect.height / 2 - canvasRect.top - editorState.pan.y) / editorState.scale,
        },
      });
    },
    [editorState.nodes, editorState.pan, editorState.scale],
  );

  /**
   * مدیریت رها کردن ماوس روی Socket (اتمام اتصال)
   */
  const handleSocketMouseUp = useCallback(
    (e: React.MouseEvent, nodeId: string, socketId: string, socketType: "input" | "output") => {
      e.stopPropagation();

      if (!connectingSocket || socketType !== "input") {
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }
      if (connectingSocket.nodeId === nodeId) {
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }

      // پیدا کردن نودهای منبع و مقصد
      const sourceNode = editorState.nodes.find((n) => n.id === connectingSocket.nodeId);
      const targetNode = editorState.nodes.find((n) => n.id === nodeId);

      if (!sourceNode || !targetNode) {
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }

      // بررسی اعتبار اتصال بر اساس ماتریس قوانین
      if (!validateConnection(sourceNode.type, targetNode.type)) {
        console.warn(`Invalid connection from ${sourceNode.type} to ${targetNode.type}`);
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }

      // 🔹 قانون جدید: بررسی که هر node فقط یک ورودی داشته باشد
      // اگر targetNode قبلاً اتصال ورودی دارد، آن را حذف می‌کنیم
      const existingInputConnection = editorState.connections.find((c) => c.targetNodeId === nodeId);

      // 🔹 قانون جدید: بررسی که هر socket خروجی فقط یک اتصال داشته باشد
      // برای quickreply: هر دکمه (socket) می‌تواند مستقلاً به هر بلوکی وصل شود
      // اما هر socket فقط یک اتصال دارد
      const existingOutputFromSocket = editorState.connections.find(
        (c) => c.sourceNodeId === connectingSocket.nodeId && c.sourceSocketId === connectingSocket.socketId,
      );

      if (existingOutputFromSocket) {
        console.warn(`Socket ${connectingSocket.socketId} of node ${sourceNode.type} already has an output connection`);
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }

      const exists = editorState.connections.some(
        (c) =>
          c.sourceNodeId === connectingSocket.nodeId &&
          c.sourceSocketId === connectingSocket.socketId &&
          c.targetNodeId === nodeId &&
          c.targetSocketId === socketId,
      );
      if (exists) {
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }

      const connectionId = `conn_${Date.now()}`;
      const newConnection: Connection = {
        id: connectionId,
        sourceNodeId: connectingSocket.nodeId,
        sourceSocketId: connectingSocket.socketId,
        targetNodeId: nodeId,
        targetSocketId: socketId,
      };

      // اگر targetNode قبلاً اتصال ورودی داشت، آن را حذف می‌کنیم
      const updatedConnections = existingInputConnection
        ? editorState.connections.filter((c) => c.id !== existingInputConnection.id)
        : editorState.connections;

      updateStateWithHistory((prev) => ({
        ...prev,
        connections: [...updatedConnections, newConnection],
      }));
      setConnectingSocket(null);
      setTempConnectionEnd(null);
    },
    [connectingSocket, editorState.connections, editorState.nodes, updateStateWithHistory, t],
  );

  /**
   * حذف یک اتصال
   */
  const deleteConnection = useCallback(
    (connectionId: string) => {
      updateStateWithHistory((prev) => {
        const connection = prev.connections.find((c) => c.id === connectionId);

        // جلوگیری از حذف اتصالات محافظت شده (بدون نمایش پیام)
        if (connection?.protected) {
          return prev;
        }

        return {
          ...prev,
          connections: prev.connections.filter((c) => c.id !== connectionId),
        };
      });
    },
    [updateStateWithHistory],
  );

  // #endregion SOCKET & CONNECTION

  // #region EVENT HANDLERS - ZOOM & VIEW

  // ============================================================================
  // EVENT HANDLERS - ZOOM & VIEW
  // ============================================================================
  // مدیریت Zoom و نمای کلی

  /**
   * مدیریت Wheel (Zoom با اسکرول ماوس)
   */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const worldX = (mouseX - editorState.pan.x) / editorState.scale;
      const worldY = (mouseY - editorState.pan.y) / editorState.scale;
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.1, Math.min(3, editorState.scale + delta));
      const newPanX = mouseX - worldX * newScale;
      const newPanY = mouseY - worldY * newScale;
      const clamped = clampPan({ x: newPanX, y: newPanY }, newScale);
      setEditorState((prev) => ({
        ...prev,
        scale: newScale,
        pan: clamped,
      }));
      // به‌روزرسانی connection‌ها بعد از zoom
      setTimeout(() => {
        setForceConnectionUpdate((prev) => prev + 1);
      }, 0);
    },
    [editorState.scale, editorState.pan, clampPan],
  );

  /**
   * ثبت wheel event listener با passive: false برای جلوگیری از خطا
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  /**
   * تغییر Zoom با دکمه‌ها
   */
  const handleZoom = useCallback((delta: number) => {
    setEditorState((prev) => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale + delta)),
    }));
    // به‌روزرسانی connection‌ها بعد از zoom
    setTimeout(() => {
      setForceConnectionUpdate((prev) => prev + 1);
    }, 0);
  }, []);

  /**
   * بازنشانی Zoom به حالت پیش‌فرض
   */
  const resetZoom = useCallback(() => {
    setEditorState((prev) => {
      const clamped = clampPan({ x: 0, y: 0 }, 1);
      return {
        ...prev,
        scale: 1,
        pan: clamped,
      };
    });
    // به‌روزرسانی connection‌ها بعد از reset zoom
    setTimeout(() => {
      setForceConnectionUpdate((prev) => prev + 1);
    }, 0);
  }, [clampPan]);

  /**
   * تنظیم نما برای نمایش تمام نودها (Fit to Screen)
   */
  const fitToScreen = useCallback(() => {
    if (editorState.nodes.length === 0) return;

    // Helper function to get node height
    const getNodeHeight = (node: NodeData): number => {
      switch (node.type) {
        case "text":
          return getTextNodeHeight(node);
        case "image":
          return getImageNodeHeight(node);
        case "voice":
          return getVoiceNodeHeight(node);
        case "quickreply":
          return getQuickReplyNodeHeight(node);
        case "generic":
          return getGenericNodeHeight(node);
        case "genericitem":
          return getGenericItemNodeHeight(node);
        case "weblink":
          return getWeblinkNodeHeight(node);
        case "onmessage":
          return getOnMessageNodeHeight(node);
        default:
          return 150;
      }
    };

    const padding = 200;
    const minX = Math.min(...editorState.nodes.map((n) => n.position.x)) - padding;
    const minY = Math.min(...editorState.nodes.map((n) => n.position.y)) - padding;
    const maxX = Math.max(...editorState.nodes.map((n) => n.position.x + 200)) + padding;
    const maxY = Math.max(...editorState.nodes.map((n) => n.position.y + getNodeHeight(n))) + padding;
    const width = maxX - minX;
    const height = maxY - minY;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = rect.width / width;
    const scaleY = rect.height / height;
    const scale = Math.min(scaleX, scaleY, 1);
    const targetPan = {
      x: (rect.width - width * scale) / 2 - minX * scale,
      y: (rect.height - height * scale) / 2 - minY * scale,
    };
    const clamped = clampPan(targetPan, scale);
    setEditorState((prev) => ({
      ...prev,
      scale,
      pan: clamped,
    }));

    // به‌روزرسانی اجباری اتصالات پس از fit to screen
    setTimeout(() => {
      setForceConnectionUpdate((prev) => prev + 1);
    }, 50);
  }, [editorState.nodes]);

  // #endregion LAYOUT & POSITIONING

  // #region CONTEXT MENU

  // ============================================================================
  // EVENT HANDLERS - CONTEXT MENU
  // ============================================================================
  // مدیریت منوی راست‌کلیک

  /**
   * نمایش منوی راست‌کلیک
   */
  const handleContextMenu = useCallback((e: React.MouseEvent, nodeId?: string, connectionId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    // ابعاد تقریبی منو
    const menuWidth = 200;
    const menuHeight = 300;

    // موقعیت نسبت به viewport
    const clientX = e.clientX;
    const clientY = e.clientY;

    // تشخیص جهت صفحه (RTL یا LTR)
    const isRTL = document.dir === "rtl" || document.documentElement.dir === "rtl";

    // اگر canvasRef موجود است، مختصات را نسبت به آن محاسبه کن
    let x = clientX;
    let y = clientY;
    if (canvasRef?.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      // در حالت RTL، منو از لبهٔ چپ نشانگر باز شود (یعنی سمت راست منو با نشانگر هم‌تراز)
      x = isRTL ? clientX - rect.left - menuWidth : clientX - rect.left;
      y = clientY - rect.top;

      // جلوگیری از بیرون زدن منو از داخل canvas
      if (x + menuWidth > rect.width) {
        x = Math.max(10, rect.width - menuWidth - 10);
      }
      if (y + menuHeight > rect.height) {
        y = Math.max(10, rect.height - menuHeight - 10);
      }
      // اگر در RTL منو از سمت چپ نشانگر قرار گرفت و از لبهٔ چپ بیرون زد، جلو بیاور
      if (x < 0) {
        x = 10;
      }
    } else {
      // fallback: محدودیت نسبت به viewport
      if (isRTL) {
        x = clientX - menuWidth;
        if (x < 0) x = 10;
      } else {
        if (x + menuWidth > window.innerWidth) {
          x = window.innerWidth - menuWidth - 10;
        }
      }
      if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight - 10;
      }
    }

    setContextMenu({
      visible: true,
      x,
      y,
      nodeId,
      connectionId,
    });
  }, []);

  /**
   * مدیریت کلیک روی یک اتصال
   */
  const handleConnectionClick = useCallback(
    (e: React.MouseEvent, connectionId: string) => {
      e.preventDefault();
      e.stopPropagation();

      // جلوگیری از نمایش منو برای اتصالات محافظت شده
      const connection = editorState.connections.find((c) => c.id === connectionId);
      if (connection?.protected) {
        return;
      }

      handleContextMenu(e, undefined, connectionId);
    },
    [handleContextMenu, editorState.connections],
  );

  //#endregion CONTEXT MENU

  // #region EVENT HANDLERS - TOUCH

  // ============================================================================
  // EVENT HANDLERS - TOUCH
  // ============================================================================
  // مدیریت رویدادهای لمسی برای موبایل

  /**
   * محاسبه فاصله بین دو نقطه لمسی (برای pinch-to-zoom)
   */
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * محاسبه مرکز بین دو نقطه لمسی
   */
  const getTouchCenter = (touches: React.TouchList): Position => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  /**
   * مدیریت شروع لمس روی نود
   */
  const handleNodeTouchStart = useCallback(
    (e: React.TouchEvent, nodeId: string) => {
      // جلوگیری از لمس روی دکمه حذف و socket
      if ((e.target as HTMLElement).closest(`.${styles.deleteBtn}`)) return;
      if ((e.target as HTMLElement).closest(`.${styles.socketDot}`)) return;
      if ((e.target as HTMLElement).closest(`.${styles.socketInputparent}`)) return;
      if ((e.target as HTMLElement).closest(`.${styles.nodeBody}`)) return;

      const touch = e.touches[0];
      const node = editorState.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      setIsTouchMoving(false);

      // راه‌اندازی تایمر برای long-press
      const timer = setTimeout(() => {
        handleContextMenu(
          {
            preventDefault: () => {},
            stopPropagation: () => {},
            clientX: touch.clientX,
            clientY: touch.clientY,
          } as any,
          nodeId,
        );
        setLongPressTimer(null);
      }, 500);

      setLongPressTimer(timer);

      setDraggedNode(nodeId);
      setDragOffset({
        x: (touch.clientX - editorState.pan.x) / editorState.scale - node.position.x,
        y: (touch.clientY - editorState.pan.y) / editorState.scale - node.position.y,
      });

      if (!node.selected) {
        setEditorState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => ({ ...n, selected: n.id === nodeId })),
        }));
      }
    },
    [editorState.nodes, editorState.scale, editorState.pan, handleContextMenu],
  );

  /**
   * مدیریت شروع لمس روی Canvas
   */
  const handleCanvasTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setContextMenu({ visible: false, x: 0, y: 0 });

      const target = e.target as HTMLElement;

      // اگر روی node کلیک شده، اجازه بده event به آنها برسد
      if (target.closest(`.${styles.node}`)) return;

      // اگر روی socket کلیک شده، فقط از pan جلوگیری کن اما اجازه بده touch ادامه پیدا کند
      if (target.closest("[data-socket-type]")) {
        // اجازه می‌دهیم که socket touch handler کار کند
        return;
      }

      const touches = e.touches;

      if (touches.length === 1) {
        // تک لمس - Pan
        const touch = touches[0];
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
        setIsTouchMoving(false);

        // راه‌اندازی تایمر برای long-press
        const timer = setTimeout(() => {
          handleContextMenu({
            preventDefault: () => {},
            stopPropagation: () => {},
            clientX: touch.clientX,
            clientY: touch.clientY,
          } as any);
          setLongPressTimer(null);
        }, 500);

        setLongPressTimer(timer);

        setIsPanning(true);
        setPanStart({
          x: touch.clientX - editorState.pan.x,
          y: touch.clientY - editorState.pan.y,
        });

        setEditorState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => ({ ...n, selected: false })),
        }));
      } else if (touches.length === 2) {
        // دو لمس - Pinch to Zoom
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
        setIsPanning(false);
        const distance = getTouchDistance(touches);
        setTouchStartDistance(distance);
        setLastTouchScale(editorState.scale);
      }
    },
    [editorState.pan, editorState.scale, longPressTimer, handleContextMenu],
  );

  /**
   * مدیریت حرکت لمس (Touch Move)
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // فقط وقتی در حال drag، pan، یا connecting هستیم، preventDefault صدا بزنیم
      if (draggedNode || isPanning || connectingSocket) {
        e.preventDefault();
      }

      const touches = e.touches;

      // لغو long-press در صورت حرکت
      if (touchStartPos && touches.length === 1) {
        const touch = touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.y);

        if (deltaX > 10 || deltaY > 10) {
          setIsTouchMoving(true);
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
          }
        }
      }

      if (touches.length === 1) {
        const touch = touches[0];

        if (draggedNode) {
          // Drag نود
          const selectedNodes = editorState.nodes.filter((n) => n.selected);
          const draggedNodeData = editorState.nodes.find((n) => n.id === draggedNode);
          if (!draggedNodeData) return;

          const newX = snapToGrid(
            (touch.clientX - editorState.pan.x) / editorState.scale - dragOffset.x,
            GRID_SIZE,
            snapToGridEnabled,
          );
          const newY = snapToGrid(
            (touch.clientY - editorState.pan.y) / editorState.scale - dragOffset.y,
            GRID_SIZE,
            snapToGridEnabled,
          );
          const deltaX = newX - draggedNodeData.position.x;
          const deltaY = newY - draggedNodeData.position.y;

          setEditorState((prev) => ({
            ...prev,
            nodes: prev.nodes.map((n) => {
              if (n.selected && selectedNodes.length > 1) {
                return {
                  ...n,
                  position: {
                    x: n.position.x + deltaX,
                    y: n.position.y + deltaY,
                  },
                };
              } else if (n.id === draggedNode) {
                return { ...n, position: { x: newX, y: newY } };
              }
              return n;
            }),
          }));

          setForceConnectionUpdate((prev) => prev + 1);
        } else if (isPanning) {
          // Pan کردن Canvas
          const unclamped = {
            x: touch.clientX - panStart.x,
            y: touch.clientY - panStart.y,
          };
          const clamped = clampPan(unclamped, editorState.scale);
          setEditorState((prev) => ({
            ...prev,
            pan: clamped,
          }));
        } else if (connectingSocket && canvasRef.current) {
          // رسم اتصال موقت
          const canvasRect = canvasRef.current.getBoundingClientRect();
          const currentPoint = {
            x: (touch.clientX - canvasRect.left - editorState.pan.x) / editorState.scale,
            y: (touch.clientY - canvasRect.top - editorState.pan.y) / editorState.scale,
          };

          // 🎯 پیدا کردن نزدیک‌ترین input socket برای snap-to-socket
          const nearest = findNearestInputSocket(currentPoint, editorState.nodes, connectingSocket.nodeId, 120);

          if (nearest) {
            setNearestSocket({
              nodeId: nearest.nodeId,
              socketId: nearest.socketId,
            });
            // اگر socket نزدیک پیدا شد، نقطه پایان را به موقعیت socket تنظیم می‌کنیم
            const targetNode = editorState.nodes.find((n) => n.id === nearest.nodeId);
            if (targetNode) {
              setTempConnectionEnd({
                x: targetNode.position.x,
                y: targetNode.position.y + 75,
              });
            }
          } else {
            setNearestSocket(null);
            setTempConnectionEnd(currentPoint);
          }
        }
      } else if (touches.length === 2) {
        // Pinch to Zoom
        const distance = getTouchDistance(touches);
        const center = getTouchCenter(touches);

        if (touchStartDistance > 0) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;

          const scale = lastTouchScale * (distance / touchStartDistance);
          const newScale = Math.max(0.1, Math.min(3, scale));

          const mouseX = center.x - rect.left;
          const mouseY = center.y - rect.top;
          const worldX = (mouseX - editorState.pan.x) / editorState.scale;
          const worldY = (mouseY - editorState.pan.y) / editorState.scale;

          const newPanX = mouseX - worldX * newScale;
          const newPanY = mouseY - worldY * newScale;
          const clamped = clampPan({ x: newPanX, y: newPanY }, newScale);

          setEditorState((prev) => ({
            ...prev,
            scale: newScale,
            pan: clamped,
          }));

          setTimeout(() => {
            setForceConnectionUpdate((prev) => prev + 1);
          }, 0);
        }
      }
    },
    [
      draggedNode,
      isPanning,
      connectingSocket,
      editorState,
      dragOffset,
      panStart,
      snapToGridEnabled,
      touchStartDistance,
      lastTouchScale,
      clampPan,
      touchStartPos,
      longPressTimer,
    ],
  );

  /**
   * مدیریت پایان لمس (Touch End)
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      // 🎯 اگر در حال ایجاد اتصال هستیم، ابتدا از nearestSocket استفاده می‌کنیم
      if (connectingSocket) {
        if (nearestSocket) {
          // اگر socket نزدیک موجود است، از آن استفاده می‌کنیم
          const sourceNode = editorState.nodes.find((n) => n.id === connectingSocket.nodeId);
          const targetNode = editorState.nodes.find((n) => n.id === nearestSocket.nodeId);

          if (sourceNode && targetNode && validateConnection(sourceNode.type, targetNode.type)) {
            // بررسی که این اتصال قبلاً وجود ندارد
            const exists = editorState.connections.some(
              (c) =>
                c.sourceNodeId === connectingSocket.nodeId &&
                c.sourceSocketId === connectingSocket.socketId &&
                c.targetNodeId === nearestSocket.nodeId &&
                c.targetSocketId === nearestSocket.socketId,
            );

            if (!exists) {
              // حذف اتصال ورودی قبلی target node (اگر وجود داشته باشد)
              const existingInputConnection = editorState.connections.find(
                (c) => c.targetNodeId === nearestSocket.nodeId,
              );

              // بررسی که socket خروجی قبلاً اتصال نداشته باشد
              const existingOutputFromSocket = editorState.connections.find(
                (c) => c.sourceNodeId === connectingSocket.nodeId && c.sourceSocketId === connectingSocket.socketId,
              );

              if (!existingOutputFromSocket) {
                console.log("🔗 Creating snap-to-socket connection...");
                const connectionId = `conn_${Date.now()}`;
                const newConnection: Connection = {
                  id: connectionId,
                  sourceNodeId: connectingSocket.nodeId,
                  sourceSocketId: connectingSocket.socketId,
                  targetNodeId: nearestSocket.nodeId,
                  targetSocketId: nearestSocket.socketId,
                };

                const updatedConnections = existingInputConnection
                  ? editorState.connections.filter((c) => c.id !== existingInputConnection.id)
                  : editorState.connections;

                updateStateWithHistory((prev) => ({
                  ...prev,
                  connections: [...updatedConnections, newConnection],
                }));
              }
            }
          }
        } else if (e.changedTouches.length > 0) {
          // اگر nearestSocket موجود نیست، از روش قدیمی استفاده می‌کنیم
          const touch = e.changedTouches[0];
          const element = document.elementFromPoint(touch.clientX, touch.clientY);

          console.log("🔍 Touch End - Checking for connection (fallback):", {
            connectingSocket,
            touchPoint: { x: touch.clientX, y: touch.clientY },
            element: element?.tagName,
            hasSocketType: element?.hasAttribute?.("data-socket-type"),
          });

          if (element) {
            // پیدا کردن socket dot که input است
            const socketDot = element.closest('[data-socket-type="input"]') as HTMLElement;

            if (socketDot) {
              const targetNodeId = socketDot.getAttribute("data-node-id");
              const targetSocketId = socketDot.getAttribute("data-socket-id");

              console.log("✅ Found input socket:", {
                targetNodeId,
                targetSocketId,
              });

              if (targetNodeId && targetSocketId && targetNodeId !== connectingSocket.nodeId) {
                // بررسی اینکه این اتصال قبلاً وجود ندارد
                const exists = editorState.connections.some(
                  (c) =>
                    c.sourceNodeId === connectingSocket.nodeId &&
                    c.sourceSocketId === connectingSocket.socketId &&
                    c.targetNodeId === targetNodeId &&
                    c.targetSocketId === targetSocketId,
                );

                if (!exists) {
                  console.log("🔗 Creating connection...");
                  // ایجاد اتصال جدید
                  const connectionId = `conn_${Date.now()}`;
                  const newConnection: Connection = {
                    id: connectionId,
                    sourceNodeId: connectingSocket.nodeId,
                    sourceSocketId: connectingSocket.socketId,
                    targetNodeId: targetNodeId,
                    targetSocketId: targetSocketId,
                  };

                  updateStateWithHistory((prev) => ({
                    ...prev,
                    connections: [...prev.connections, newConnection],
                  }));
                } else {
                  console.log("⚠️ Connection already exists");
                }
              }
            } else {
              console.log("❌ No input socket found at touch point");
            }
          }
        }
      }

      if (draggedNode) {
        addToHistory(editorState);
        setTimeout(() => {
          setForceConnectionUpdate((prev) => prev + 1);
        }, 0);
      }

      setDraggedNode(null);
      setIsPanning(false);
      setConnectingSocket(null);
      setTempConnectionEnd(null);
      setNearestSocket(null); // 🎯 Reset nearest socket
      setTouchStartDistance(0);
      setTouchStartPos(null);
      setIsTouchMoving(false);
    },
    [
      draggedNode,
      editorState,
      addToHistory,
      longPressTimer,
      connectingSocket,
      nearestSocket,
      updateStateWithHistory,
      validateConnection,
    ],
  );

  /**
   * مدیریت شروع لمس روی Socket
   */
  const handleSocketTouchStart = useCallback(
    (e: React.TouchEvent, nodeId: string, socketId: string, socketType: "input" | "output") => {
      if (socketType === "input") {
        e.stopPropagation();
        return;
      }

      // جلوگیری از propagation به node و canvas
      e.stopPropagation();

      console.log("🟢 Socket Touch Start:", { nodeId, socketId, socketType });

      const node = editorState.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      if (!canvasRef.current) return;

      const touch = e.touches[0];
      const socketElement = e.currentTarget as HTMLElement;
      const socketRect = socketElement.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();

      const newConnectingSocket = {
        nodeId,
        socketId,
        position: {
          x: (socketRect.left + socketRect.width / 2 - canvasRect.left - editorState.pan.x) / editorState.scale,
          y: (socketRect.top + socketRect.height / 2 - canvasRect.top - editorState.pan.y) / editorState.scale,
        },
      };

      console.log("📍 Setting connecting socket:", newConnectingSocket);

      setConnectingSocket(newConnectingSocket);

      // تنظیم اولیه tempConnectionEnd
      setTempConnectionEnd(newConnectingSocket.position);

      // لغو long-press
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      // جلوگیری از pan و drag وقتی در حال connecting هستیم
      setIsPanning(false);
      setDraggedNode(null);
      setIsTouchMoving(false);
    },
    [editorState.nodes, editorState.pan, editorState.scale, longPressTimer],
  );

  /**
   * مدیریت پایان لمس روی Socket
   */
  const handleSocketTouchEnd = useCallback(
    (e: React.TouchEvent, nodeId: string, socketId: string, socketType: "input" | "output") => {
      e.stopPropagation();

      if (!connectingSocket || socketType !== "input") {
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }

      if (connectingSocket.nodeId === nodeId) {
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }

      // پیدا کردن نودهای منبع و مقصد
      const sourceNode = editorState.nodes.find((n) => n.id === connectingSocket.nodeId);
      const targetNode = editorState.nodes.find((n) => n.id === nodeId);

      if (!sourceNode || !targetNode) {
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }

      // بررسی اعتبار اتصال بر اساس ماتریس قوانین
      if (!validateConnection(sourceNode.type, targetNode.type)) {
        console.warn(`Invalid connection from ${sourceNode.type} to ${targetNode.type}`);
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }

      const exists = editorState.connections.some(
        (c) =>
          c.sourceNodeId === connectingSocket.nodeId &&
          c.sourceSocketId === connectingSocket.socketId &&
          c.targetNodeId === nodeId &&
          c.targetSocketId === socketId,
      );

      if (exists) {
        setConnectingSocket(null);
        setTempConnectionEnd(null);
        return;
      }

      const connectionId = `conn_${Date.now()}`;
      const newConnection: Connection = {
        id: connectionId,
        sourceNodeId: connectingSocket.nodeId,
        sourceSocketId: connectingSocket.socketId,
        targetNodeId: nodeId,
        targetSocketId: socketId,
      };

      updateStateWithHistory((prev) => ({
        ...prev,
        connections: [...prev.connections, newConnection],
      }));

      setConnectingSocket(null);
      setTempConnectionEnd(null);
    },
    [connectingSocket, editorState.connections, editorState.nodes, updateStateWithHistory],
  );

  // #endregion TOUCH

  // #region LAYOUT & POSITIONING

  // ============================================================================
  // LAYOUT & POSITIONING
  // ============================================================================
  // توابع مربوط به چیدمان و موقعیت‌یابی

  /**
   * اعمال چیدمان خودکار
   */
  const applyAutoLayout = useCallback(() => {
    const newNodes = autoLayout(editorState.nodes, editorState.connections);
    updateStateWithHistory((prev) => ({
      ...prev,
      nodes: newNodes,
    }));

    // به‌روزرسانی اجباری اتصالات پس از layout
    setTimeout(() => {
      setForceConnectionUpdate((prev) => prev + 1);
    }, 50);
  }, [editorState.nodes, editorState.connections, updateStateWithHistory]);

  /**
   * محاسبه موقعیت یک Socket برای رسم اتصالات
   */
  const getSocketPosition = useCallback(
    (nodeId: string, socketId: string, socketType: "input" | "output"): Position => {
      const socketSelector = `[data-node-id="${nodeId}"][data-socket-id="${socketId}"][data-socket-type="${socketType}"]`;
      const socketElement = document.querySelector(socketSelector);
      if (socketElement && canvasRef.current) {
        const socketRect = socketElement.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = (socketRect.left + socketRect.width / 2 - canvasRect.left - editorState.pan.x) / editorState.scale;
        const y = (socketRect.top + socketRect.height / 2 - canvasRect.top - editorState.pan.y) / editorState.scale;
        return { x, y };
      }
      const node = editorState.nodes.find((n) => n.id === nodeId);
      if (!node) return { x: 0, y: 0 };

      const nodeHeaderHeight = 45;
      let socketIndex = -1;
      if (socketType === "input") {
        socketIndex = (node.inputs || []).findIndex((s) => s.id === socketId);
      } else {
        // برای output، ابتدا در outputs معمولی جستجو کن
        socketIndex = (node.outputs || []).findIndex((s) => s.id === socketId);
        // اگر پیدا نشد و نود generic است، در genericItemOutputs جستجو کن
        if (socketIndex === -1 && node.type === "generic" && (node.genericItemOutputs || []).length > 0) {
          const genericItemIndex = (node.genericItemOutputs || []).findIndex((s) => s.id === socketId);
          if (genericItemIndex !== -1) {
            socketIndex = (node.outputs || []).length + genericItemIndex;
          }
        }
        // اگر پیدا نشد و نود quickreply یا genericitem است، در buttonOutputs جستجو کن
        if (
          socketIndex === -1 &&
          (node.type === "quickreply" || node.type === "genericitem") &&
          (node.buttonOutputs || []).length > 0
        ) {
          const buttonIndex = (node.buttonOutputs || []).findIndex((s) => s.id === socketId);
          if (buttonIndex !== -1) {
            socketIndex = (node.outputs || []).length + buttonIndex;
          }
        }
      }
      let bodyHeight = 40;
      switch (node.type) {
        case "text":
          bodyHeight = getTextNodeHeight(node);
          break;
        case "image":
          bodyHeight = getImageNodeHeight(node);
          break;
        case "voice":
          bodyHeight = getVoiceNodeHeight(node);
          break;
        case "weblink":
          bodyHeight = getWeblinkNodeHeight(node);
          break;
        case "quickreply":
          bodyHeight = getQuickReplyNodeHeight(node);
          break;
        case "generic":
          bodyHeight = getGenericNodeHeight(node);
          break;
        case "genericitem":
          bodyHeight = getGenericItemNodeHeight(node);
          break;
        case "onmessage":
          bodyHeight = getOnMessageNodeHeight(node);
          break;
      }
      const socketStartY = nodeHeaderHeight + bodyHeight + 8;
      const socketY = socketStartY + socketIndex * 45 + 22.5;
      const nodeWidth = 200;
      const xOffset = socketType === "input" ? -17 : nodeWidth + 17;
      return {
        x: node.position.x + xOffset,
        y: node.position.y + socketY,
      };
    },
    [editorState.nodes, editorState.pan, editorState.scale, forceConnectionUpdate],
  );

  /**
   * به‌روزرسانی داده‌های یک نود
   */
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setEditorState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n)),
    }));
  }, []);

  // #endregion LAYOUT & POSITIONING

  // #region KEYBOARD SHORTCUTS

  // ============================================================================
  //  KEYBOARD SHORTCUTS
  // ============================================================================
  // مدیریت میانبرهای صفحه‌کلید

  /**
   * useEffect برای مدیریت میانبرهای صفحه‌کلید
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      // استفاده از e.code به جای e.key برای پشتیبانی از تمام زبان‌های کیبورد
      const code = e.code;

      // Undo - بازگشت به عقب
      if (isCtrlOrCmd && code === "KeyZ" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo - رفتن به جلو
      if (isCtrlOrCmd && (code === "KeyY" || (code === "KeyZ" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      // Copy - کپی
      if (isCtrlOrCmd && code === "KeyC") {
        e.preventDefault();
        copySelectedNodes();
      }
      // Panning Boundary - محدودیت حرکت
      if (isCtrlOrCmd && code === "KeyB") {
        e.preventDefault();
        setPanningBoundaryEnabled((prev) => !prev);
      }
      // Paste - پیست
      if (isCtrlOrCmd && code === "KeyV") {
        e.preventDefault();
        pasteNodes();
      }
      // Duplicate - تکثیر
      if (isCtrlOrCmd && code === "KeyQ") {
        e.preventDefault();
        duplicateSelectedNodes();
      }
      // Select All - انتخاب همه
      if (isCtrlOrCmd && code === "KeyE") {
        e.preventDefault();
        selectAll();
      }
      // Delete - حذف
      if (code === "Delete" || code === "Backspace") {
        e.preventDefault();
        deleteSelectedNodes();
      }
      // Escape - لغو انتخاب و بستن منو
      if (code === "Escape") {
        e.preventDefault();
        setEditorState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => ({ ...n, selected: false })),
        }));
        setContextMenu({ visible: false, x: 0, y: 0 });
      }
      // Auto Layout - چیدمان خودکار
      if (isCtrlOrCmd && code === "KeyL") {
        e.preventDefault();
        applyAutoLayout();
      }
      // Reset Zoom - بازنشانی زوم
      if (isCtrlOrCmd && code === "Digit0") {
        e.preventDefault();
        resetZoom();
      }
      // Fit to Screen - نمایش تمام صفحه
      if (isCtrlOrCmd && code === "Digit1") {
        e.preventDefault();
        fitToScreen();
      }
      // Snap to Grid - چسباندن به شبکه
      if (isCtrlOrCmd && code === "KeyG") {
        e.preventDefault();
        setSnapToGridEnabled((prev) => !prev);
      }
      // Show Minimap - نمایش مینی‌مپ
      if (isCtrlOrCmd && code === "KeyM") {
        e.preventDefault();
        setShowMinimap((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    copySelectedNodes,
    pasteNodes,
    duplicateSelectedNodes,
    selectAll,
    deleteSelectedNodes,
    applyAutoLayout,
    resetZoom,
    fitToScreen,
  ]);
  // #endregion KEYBOARD SHORTCUTS

  // #region MOBILE MENU CLOSE ON OUTSIDE CLICK

  // ============================================================================
  //  MOBILE MENU - CLOSE ON OUTSIDE CLICK
  // ============================================================================
  // بستن منوی موبایل هنگام کلیک خارج از آن

  /**
   * useEffect برای بستن منوی موبایل هنگام کلیک در خارج از آن
   */
  useEffect(() => {
    if (!showMobileMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // اگر روی mobilemenu کلیک شد، منو را نبند
      if (target.closest(`.${styles.mobilemenu}`)) {
        return;
      }

      // در غیر این صورت منو را ببند
      setShowMobileMenu(false);
    };

    // تاخیر کوچک برای جلوگیری از بسته شدن فوری منو هنگام باز شدن
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileMenu]);

  // #endregion MOBILE MENU CLOSE ON OUTSIDE CLICK

  // #region AUTO-SAVE

  // ============================================================================
  //  AUTO-SAVE
  // ============================================================================
  // ذخیره خودکار وضعیت ویرایشگر

  // ref برای ذخیره snapshot اولیه
  const initialStateSnapshot = useRef<string | null>(null);

  /**
   * useEffect برای ذخیره snapshot اولیه بعد از mount
   */
  useEffect(() => {
    // بعد از mount و initialization، snapshot اولیه را ذخیره می‌کنیم
    const timer = setTimeout(() => {
      initialStateSnapshot.current = JSON.stringify({
        nodesLength: editorState.nodes.length,
        nodesTypes: editorState.nodes.map((n) => n.type).join(","),
        nodesLabels: editorState.nodes.map((n) => n.label).join(","),
        nodesData: editorState.nodes.map((n) => JSON.stringify(n.data)).join(","),
        inputsLength: editorState.nodes.map((n) => n.inputs?.length).join(","),
        outputsLength: editorState.nodes.map((n) => n.outputs?.length).join(","),
        connectionsLength: editorState.connections.length,
        connectionsMap: editorState.connections.map((c) => `${c.sourceNodeId}-${c.targetNodeId}`).join(","),
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  /**
   * useEffect برای ذخیره فوری با هر تغییر در نودها و محتوای آن‌ها
   * (به جز تغییرات position و حالت اولیه)
   */
  useEffect(() => {
    // اگر snapshot اولیه هنوز ایجاد نشده، منتظر می‌مانیم
    if (!initialStateSnapshot.current) return;

    // پرهیز از ذخیره اگر نودی وجود نداشته باشد
    if (editorState.nodes.length === 0) return;

    // محاسبه snapshot فعلی
    const currentSnapshot = JSON.stringify({
      nodesLength: editorState.nodes.length,
      nodesTypes: editorState.nodes.map((n) => n.type).join(","),
      nodesLabels: editorState.nodes.map((n) => n.label).join(","),
      nodesData: editorState.nodes.map((n) => JSON.stringify(n.data)).join(","),
      inputsLength: editorState.nodes.map((n) => n.inputs?.length).join(","),
      outputsLength: editorState.nodes.map((n) => n.outputs?.length).join(","),
      connectionsLength: editorState.connections.length,
      connectionsMap: editorState.connections.map((c) => `${c.sourceNodeId}-${c.targetNodeId}`).join(","),
    });

    // اگر تغییری نسبت به snapshot اولیه وجود نداشته باشد، ذخیره نمی‌کنیم
    if (currentSnapshot === initialStateSnapshot.current) return;

    try {
      const specificKey = `flowEditor_autoSave_${flowPropsId !== "newFlow" ? flowPropsId : "newFlow"}`;
      localStorage.setItem(specificKey, JSON.stringify(editorState));
      setLastSaved(new Date());
      setHasUnsavedChanges(true);
      console.log("✅ Flow auto-saved to", specificKey);

      // به‌روزرسانی snapshot اولیه برای مقایسه‌های بعدی
      initialStateSnapshot.current = currentSnapshot;
    } catch (error) {
      console.error("❗Flow auto-save failed:", error);
    }
  }, [
    // فقط تغییرات معنادار را دنبال می‌کنیم، نه position
    editorState.nodes.length,
    editorState.nodes.map((n) => n.type).join(","),
    editorState.nodes.map((n) => n.label).join(","),
    editorState.nodes.map((n) => JSON.stringify(n.data)).join(","),
    editorState.nodes.map((n) => n.inputs?.length).join(","),
    editorState.nodes.map((n) => n.outputs?.length).join(","),
    editorState.connections.length,
    editorState.connections.map((c) => `${c.sourceNodeId}-${c.targetNodeId}`).join(","),
    flowPropsId,
  ]);
  //#endregion AUTO-SAVE

  // #region INITIALIZATION

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  // بارگذاری اولیه وضعیت از localStorage

  /**
   * useEffect برای بارگذاری وضعیت ذخیره شده از localStorage
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("flowEditor_autoSave");
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasOnMessage = parsed.nodes.some((n: NodeData) => n.type === "onmessage");
        if (hasOnMessage) {
          setEditorState(parsed);
          addToHistory(parsed);
          return;
        }
      }
      const initialNode: NodeData = {
        id: generateId(),
        type: "onmessage",
        label: "OnMessage",
        position: { x: 400, y: 200 },
        inputs: [],
        outputs: [{ id: "output", type: "output", label: "Output" }],
        data: {},
      };
      const initialState: EditorState = {
        nodes: [initialNode],
        connections: [],
        scale: 1,
        pan: { x: 0, y: 0 },
      };
      setEditorState(initialState);
      addToHistory(initialState);
    } catch (error) {
      console.error("Failed to load auto-save:", error);
      const initialNode: NodeData = {
        id: generateId(),
        type: "onmessage",
        label: "OnMessage",
        position: { x: 400, y: 200 },
        inputs: [],
        outputs: [{ id: "output", type: "output", label: "Output" }],
        data: {},
      };
      const initialState: EditorState = {
        nodes: [initialNode],
        connections: [],
        scale: 1,
        pan: { x: 0, y: 0 },
      };
      setEditorState(initialState);
      addToHistory(initialState);
    }
  }, []);

  /**
   * useEffect برای به‌روزرسانی اجباری اتصالات در رندر اولیه
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceConnectionUpdate((prev) => prev + 1);
    }, 50);
    return () => clearTimeout(timer);
  }, [editorState.nodes, editorState.connections]);

  /**
   * useEffect برای اصلاح موقعیت نود OnMessage در اولین رندر
   * (برای اطمینان از رسم صحیح اتصالات)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setEditorState((prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) =>
          node.type === "onmessage"
            ? {
                ...node,
                position: { ...node.position, y: node.position.y - 3 },
              }
            : node,
        ),
      }));
      // بعد از 100ms دوباره 1 پیکسل به پایین برگردانیم (برای اینکه تغییری در ظاهر نباشد)
      setTimeout(() => {
        setEditorState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((node) =>
            node.type === "onmessage"
              ? {
                  ...node,
                  position: { ...node.position, y: node.position.y + 3 },
                }
              : node,
          ),
        }));
      }, 100);
    }, 100);

    return () => clearTimeout(timer);
  }, []); // فقط یک بار در mount

  // #endregion INITIALIZATION

  // #region IMPORTS AND EXPORTS

  // ============================================================================
  // IMPORT & EXPORT
  // ============================================================================
  // توابع ورود و خروج داده

  /**
   * خروجی گرفتن از Flow به صورت JSON
   */
  const exportFlow = useCallback(() => {
    // رند کردن موقعیت نودها و حذف scale، pan و selected از خروجی
    const exportState = {
      nodes: editorState.nodes
        .map((node) => {
          const { selected, outputs, inputs, ...nodeWithoutSelected } = node;

          // Transform inputs/outputs arrays to input/output objects (single items, not arrays)
          // and move buttons/genericItems to dedicated properties
          let transformedNode: any = {
            ...nodeWithoutSelected,
            position: {
              x: Math.round(node.position.x),
              y: Math.round(node.position.y),
            },
          };

          // Transform inputs array to single input object
          transformedNode.input = inputs.length > 0 ? inputs[0] : null;

          // For quickreply nodes: move buttons to dedicated property
          if (node.type === "quickreply") {
            const buttons = outputs.map((output) => ({
              id: output.id,
              label: output.label,
            }));
            transformedNode.buttons = buttons;
            transformedNode.output = outputs.length > 0 ? outputs[0] : null;
          }
          // For generic nodes: collect genericItems from connected genericitem nodes
          else if (node.type === "generic") {
            const connectedGenericItems = editorState.connections
              .filter((c) => c.sourceNodeId === node.id && c.protected)
              .map((c) => {
                const itemNode = editorState.nodes.find((n) => n.id === c.targetNodeId);
                if (itemNode && itemNode.type === "genericitem") {
                  return {
                    id: itemNode.id,
                    label: itemNode.label,
                    data: itemNode.data,
                    outputs: itemNode.outputs,
                  };
                }
                return null;
              })
              .filter((item) => item !== null);

            transformedNode.genericItems = connectedGenericItems;
            transformedNode.output = outputs.length > 0 ? outputs[0] : null;
          }
          // For genericitem nodes: move buttons to dedicated property
          else if (node.type === "genericitem") {
            const buttons = outputs.map((output) => ({
              id: output.id,
              label: output.label,
            }));
            transformedNode.buttons = buttons;
            transformedNode.output = outputs.length > 0 ? outputs[0] : null;
          }
          // For other nodes: keep single output
          else {
            transformedNode.output = outputs.length > 0 ? outputs[0] : null;
          }

          return transformedNode;
        })
        .filter((node) => {
          // Keep OnMessage nodes regardless of connection status
          if (node.type === "onmessage") return true;

          // Check if this node's input is connected to any other node
          const hasInputConnection = editorState.connections.some((conn) => conn.targetNodeId === node.id);

          // Only include nodes that have an input connection
          return hasInputConnection;
        }),
      connections: editorState.connections,
    };

    const dataStr = JSON.stringify(exportState, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    // حذف کاراکترهای غیرمجاز در نام فایل
    const sanitizedTitle = flowTitle.replace(/[<>:"/\\|?*]/g, "_").trim() || "flow";
    link.download = `${sanitizedTitle}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [editorState, flowTitle]);

  /**
   * وارد کردن Flow از فایل JSON
   */
  const importFlow = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Extract filename without extension
      const fileName = file.name.replace(/\.json$/i, "");

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);

          // Transform imported data to internal format
          const transformedNodes = imported.nodes.map((node: any) => {
            const { input, output, buttons, genericItems, ...rest } = node;

            let transformedNode: any = { ...rest };

            // Transform single input object to inputs array
            if (input !== undefined) {
              transformedNode.inputs = input ? [input] : [];
            } else if (node.inputs) {
              // Backward compatibility: if inputs array exists, keep it
              transformedNode.inputs = node.inputs;
            } else {
              transformedNode.inputs = [{ id: "input", type: "input", label: "Input" }];
            }

            // Transform single output object and buttons to outputs array
            if (node.type === "quickreply") {
              if (buttons && Array.isArray(buttons)) {
                // Reconstruct outputs array from buttons
                transformedNode.outputs = buttons.map((btn: any) => ({
                  id: btn.id,
                  type: "output",
                  label: btn.label,
                }));
                // Keep buttons in data for internal use
                transformedNode.data = {
                  ...transformedNode.data,
                  buttons: buttons.map((btn: any) => btn.label),
                };
              } else if (output) {
                transformedNode.outputs = [output];
              } else if (node.outputs) {
                // Backward compatibility
                transformedNode.outputs = node.outputs;
              } else {
                transformedNode.outputs = [];
              }
            } else if (node.type === "generic") {
              // For generic nodes, outputs are managed dynamically
              if (output !== undefined) {
                transformedNode.outputs = output ? [output] : [];
              } else if (node.outputs) {
                transformedNode.outputs = node.outputs;
              } else {
                transformedNode.outputs = [];
              }
              // Note: genericItems will be handled separately as they are separate nodes
            } else if (node.type === "genericitem") {
              if (buttons && Array.isArray(buttons)) {
                // Reconstruct outputs array from buttons
                transformedNode.outputs = buttons.map((btn: any) => ({
                  id: btn.id,
                  type: "output",
                  label: btn.label,
                }));
              } else if (output) {
                transformedNode.outputs = [output];
              } else if (node.outputs) {
                transformedNode.outputs = node.outputs;
              } else {
                transformedNode.outputs = [];
              }
            } else {
              // For other node types
              if (output !== undefined) {
                transformedNode.outputs = output ? [output] : [];
              } else if (node.outputs) {
                transformedNode.outputs = node.outputs;
              } else {
                transformedNode.outputs = [{ id: "output", type: "output", label: "Output" }];
              }
            }

            return transformedNode;
          });

          // اضافه کردن scale و pan پیش‌فرض اگر وجود ندارند
          const importedState = {
            nodes: transformedNodes,
            connections: imported.connections || [],
            scale: 1,
            pan: { x: 0, y: 0 },
          };

          setEditorState(importedState);
          addToHistory(importedState);

          // Set flow title to filename
          setFlowTitle(fileName);

          // Show success toast
          toast.success(t(LanguageKey.importJSON_success));

          // اجرای fitToScreen بعد از import موفق
          setTimeout(() => {
            fitToScreen();
          }, 100);

          // Open settings modal
          setSettingModalVisible(true);
        } catch (error) {
          console.error("Import error:", error);
          toast.error(t(LanguageKey.importJSON_error));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addToHistory, t]);
  // #endregion IMPORTS AND EXPORTS

  // #region SEARCH & FILTER
  // ============================================================================
  // SEARCH & FILTER
  // ============================================================================
  // جستجو و فیلتر نودها

  /**
   * فیلتر کردن نودها بر اساس query جستجو
   */
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return editorState.nodes;
    const query = searchQuery.toLowerCase();
    return editorState.nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query) ||
        node.data?.text?.toLowerCase().includes(query) ||
        node.data?.url?.toLowerCase().includes(query),
    );
  }, [editorState.nodes, searchQuery]);

  /**
   * useEffect برای انتخاب خودکار نودهای جستجو شده
   */
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchedIds = filteredNodes.map((n) => n.id);
      setEditorState((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => ({
          ...n,
          selected: searchedIds.includes(n.id),
        })),
      }));
    }
  }, [searchQuery, filteredNodes]);
  // #endregion SEARCH & FILTER

  //#region CONNECTION RENDERING

  // ============================================================================
  // CONNECTION RENDERING
  // ============================================================================
  // رندر کردن اتصالات بین نودها

  /**
   * محاسبه ابعاد کل محتوا (Canvas Bounds)
   * این ابعاد برای تنظیم اندازه canvasContent و connectionsLayer استفاده می‌شود
   */
  const canvasBounds = useMemo(() => {
    if (editorState.nodes.length === 0) {
      return { width: 2000, height: 2000 }; // حداقل ابعاد
    }

    const padding = 500; // فضای اضافی برای جلوگیری از بریدگی
    const minX = Math.min(...editorState.nodes.map((n) => n.position.x));
    const minY = Math.min(...editorState.nodes.map((n) => n.position.y));
    const maxX = Math.max(...editorState.nodes.map((n) => n.position.x + 280)); // 280 = عرض نود
    const maxY = Math.max(...editorState.nodes.map((n) => n.position.y + 400)); // 400 = تقریباً ارتفاع نود

    return {
      width: Math.max(2000, maxX - minX + padding * 2),
      height: Math.max(2000, maxY - minY + padding * 2),
    };
  }, [editorState.nodes]);

  /**
   * محاسبه مسیرهای Bezier برای رسم اتصالات
   */
  const connectionPaths = useMemo(() => {
    return editorState.connections.map((conn) => {
      const start = getSocketPosition(conn.sourceNodeId, conn.sourceSocketId, "output");
      const end = getSocketPosition(conn.targetNodeId, conn.targetSocketId, "input");
      const sourceNode = editorState.nodes.find((n) => n.id === conn.sourceNodeId);
      const color = sourceNode ? getNodeTypeColor(sourceNode.type) : "#95a5a6";
      return {
        id: conn.id,
        path: getBezierPath(start, end),
        start,
        end,
        color,
      };
    });
  }, [editorState.connections, editorState.nodes, forceConnectionUpdate, getSocketPosition]);
  //#endregion CONNECTION RENDERING

  // #region MINIMAP
  // ============================================================================
  //  MINIMAP
  // ============================================================================
  // محاسبات مربوط به Minimap

  /**
   * محاسبه داده‌های Minimap
   */
  const minimapData = useMemo(() => {
    if (!showMinimap || editorState.nodes.length === 0) return null;
    const padding = 20;
    const minX = Math.min(...editorState.nodes.map((n) => n.position.x)) - padding;
    const minY = Math.min(...editorState.nodes.map((n) => n.position.y)) - padding;
    const maxX = Math.max(...editorState.nodes.map((n) => n.position.x + 200)) + padding;
    const maxY = Math.max(...editorState.nodes.map((n) => n.position.y + 200)) + padding;
    const worldWidth = maxX - minX;
    const worldHeight = maxY - minY;
    const minimapWidth = 200;
    const minimapHeight = 150;
    const scaleX = minimapWidth / worldWidth;
    const scaleY = minimapHeight / worldHeight;
    const minimapScale = Math.min(scaleX, scaleY);
    const minimapConnections = editorState.connections
      .map((conn) => {
        const sourceNode = editorState.nodes.find((n) => n.id === conn.sourceNodeId);
        const targetNode = editorState.nodes.find((n) => n.id === conn.targetNodeId);
        if (!sourceNode || !targetNode) return null;
        const startX = sourceNode.position.x + 200;
        const startY = sourceNode.position.y + 75;
        const endX = targetNode.position.x;
        const endY = targetNode.position.y + 75;
        return {
          id: conn.id,
          x1: startX,
          y1: startY,
          x2: endX,
          y2: endY,
        };
      })
      .filter(Boolean);
    return {
      minX,
      minY,
      worldWidth,
      worldHeight,
      minimapWidth,
      minimapHeight,
      minimapScale,
      connections: minimapConnections,
    };
  }, [editorState.nodes, editorState.connections, showMinimap]);
  // #endregion MINIMAP

  // #region CONTEXT MENU OPTIONS

  // ============================================================================
  // CONTEXT MENU OPTIONS
  // ============================================================================
  // ایجاد گزینه‌های منوی راست‌کلیک برای هر نود

  /**
   * ایجاد گزینه‌های منوی راست‌کلیک برای نودها
   */
  const createNodeMenuOptions = useCallback(
    (nodeId: string, nodeType: string) => {
      const baseOptions: Array<{
        icon: string;
        value: string;
        onClick?: () => void;
        style?: React.CSSProperties;
      }> = [
        {
          icon: "/info.svg",
          value: t(LanguageKey.Nodetutorial),
          onClick: () => {
            if (onOpenTutorial) {
              onOpenTutorial(nodeType);
            }
          },
        },
      ];

      // افزودن گزینه‌های Duplicate و Delete فقط برای نودهای غیر از onmessage
      if (nodeType !== "onmessage") {
        baseOptions.push(
          {
            icon: "/copy.svg",
            value: t(LanguageKey.Dublicate),
            onClick: () => {
              setEditorState((prev) => ({
                ...prev,
                nodes: prev.nodes.map((n) => ({
                  ...n,
                  selected: n.id === nodeId,
                })),
              }));
              setTimeout(() => {
                duplicateSelectedNodes();
              }, 0);
            },
          },
          {
            icon: "/delete.svg",
            value: t(LanguageKey.delete),
            onClick: () => {
              deleteNode(nodeId);
            },
          },
        );
      }

      return baseOptions;
    },
    [copySelectedNodes, duplicateSelectedNodes, deleteNode],
  );
  // #endregion CONTEXT MENU OPTIONS
  /**
   * Compare an incoming flow JSON/state with the localStorage key `flowEditor_autoSave`.
   * Comparison focuses on: node count, node type, label, and data properties.
   * Ignores node IDs and compares by type, label, and data content.
   *
   * Input: an `EditorState`-like object or a JSON string with the same shape.
   * Output: null if equal, or object with detailed differences if different.
   */
  const compareFlowWithLocalAutoSave = useCallback(
    (
      input: any,
      id: string,
    ): null | {
      hasDifference: boolean;
      addedNodes?: Array<{ type: string; label: string; data: any }>;
      removedNodes?: Array<{ type: string; label: string; data: any }>;
      modifiedNodes?: Array<{
        type: string;
        label: string;
        changedProperties: Array<{
          property: string;
          savedValue: any;
          inputValue: any;
        }>;
      }>;
    } => {
      let inputState: EditorState;
      try {
        inputState = typeof input === "string" ? (JSON.parse(input) as EditorState) : (input as EditorState);
        if (!inputState || !Array.isArray(inputState.nodes)) {
          return null;
        }
      } catch (err) {
        return null;
      }

      try {
        const savedRaw = localStorage.getItem(`flowEditor_autoSave_${id}`);
        if (!savedRaw) {
          return null;
        }
        const savedState = JSON.parse(savedRaw) as EditorState;
        if (!savedState || !Array.isArray(savedState.nodes)) {
          return null;
        }

        // Create a signature for each node (type + label)
        const createNodeSignature = (n: NodeData) => `${n.type}|${n.label}`;

        // Map nodes by signature
        const savedNodesMap = new Map<string, { type: string; label: string; data: any }>();
        savedState.nodes.forEach((n) => {
          savedNodesMap.set(createNodeSignature(n), {
            type: n.type,
            label: n.label,
            data: n.data ? JSON.parse(JSON.stringify(n.data)) : null,
          });
        });

        const inputNodesMap = new Map<string, { type: string; label: string; data: any }>();
        inputState.nodes.forEach((n) => {
          inputNodesMap.set(createNodeSignature(n), {
            type: n.type,
            label: n.label,
            data: n.data ? JSON.parse(JSON.stringify(n.data)) : null,
          });
        });

        const addedNodes: Array<{ type: string; label: string; data: any }> = [];
        const removedNodes: Array<{ type: string; label: string; data: any }> = [];
        const modifiedNodes: Array<{
          type: string;
          label: string;
          changedProperties: Array<{
            property: string;
            apiValue: any;
            localValue: any;
          }>;
        }> = [];

        // Find added nodes (exist in localStorage but not in API)
        // These are nodes that user added locally
        savedNodesMap.forEach((node, signature) => {
          if (!inputNodesMap.has(signature)) {
            addedNodes.push(node);
          }
        });

        // Find removed nodes (exist in API but not in localStorage)
        // These are nodes that user removed locally
        inputNodesMap.forEach((node, signature) => {
          if (!savedNodesMap.has(signature)) {
            removedNodes.push(node);
          }
        });

        // Find modified nodes (exist in both but data properties changed)
        // Compare localStorage vs API
        savedNodesMap.forEach((savedNode, signature) => {
          if (inputNodesMap.has(signature)) {
            const inputNode = inputNodesMap.get(signature)!;
            const changedProperties: Array<{
              property: string;
              apiValue: any;
              localValue: any;
            }> = [];

            // Compare data properties
            const savedData = savedNode.data || {};
            const inputData = inputNode.data || {};

            // Get all unique property keys from both objects
            const allKeys = new Set([...Object.keys(savedData), ...Object.keys(inputData)]);

            allKeys.forEach((key) => {
              const savedValue = savedData[key];
              const inputValue = inputData[key];

              if (JSON.stringify(savedValue) !== JSON.stringify(inputValue)) {
                changedProperties.push({
                  property: key,
                  apiValue: inputValue,
                  localValue: savedValue,
                });
              }
            });

            if (changedProperties.length > 0) {
              modifiedNodes.push({
                type: savedNode.type,
                label: savedNode.label,
                changedProperties,
              });
            }
          }
        });

        // Check if there are any differences
        const hasDifference = addedNodes.length > 0 || removedNodes.length > 0 || modifiedNodes.length > 0;

        if (!hasDifference) {
          return null;
        }

        const result: any = {
          hasDifference: true,
        };

        if (addedNodes.length > 0) {
          result.addedNodes = addedNodes;
        }

        if (removedNodes.length > 0) {
          result.removedNodes = removedNodes;
        }

        if (modifiedNodes.length > 0) {
          result.modifiedNodes = modifiedNodes;
        }

        return result;
      } catch (err) {
        return null;
      }
    },
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const reloadFlow = useCallback(
    async (useLocalStorage: boolean = false) => {
      try {
        const res = await clientFetchApi<boolean, IGetFlow>("/api/flow/GetMasterFlow", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [{ key: "id", value: flowPropsId }],
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          const rawNodes = res.value.flowModel.nodes || [];
          const normalizedNodes = rawNodes.map((node: any) => {
            const inputs = node.inputs ?? (node.input ? [node.input] : []);
            const outputs = node.outputs ?? (node.output ? [node.output] : []);
            return {
              ...node,
              inputs,
              outputs,
              genericItemOutputs: node.genericItemOutputs ?? [],
              buttonOutputs: node.buttonOutputs ?? [],
            } as any;
          });
          // Build an EditorState-shaped object from API response
          const incomingState: EditorState = {
            nodes: normalizedNodes,
            connections: res.value.flowModel.connections || [],
            scale: 1,
            pan: { x: 0, y: 0 },
          };

          if (useLocalStorage) {
            // استفاده از localStorage
            const savedRaw = localStorage.getItem(`flowEditor_autoSave_${flowPropsId}`);
            if (savedRaw) {
              const savedState = JSON.parse(savedRaw) as EditorState;
              setEditorState((prev) => ({
                ...prev,
                connections: savedState.connections,
                nodes: savedState.nodes,
              }));
            } else {
              // اگر localStorage خالی بود، از API استفاده کن
              setEditorState((prev) => ({
                ...prev,
                connections: incomingState.connections,
                nodes: incomingState.nodes,
              }));
            }
          } else {
            // استفاده از API
            setEditorState((prev) => ({
              ...prev,
              connections: incomingState.connections,
              nodes: incomingState.nodes,
            }));
          }

          setFlowTitle(res.value.title || "");
          setCheckFollower(res.value.checkFollower || false);
          setPrivateReplyCompability(res.value.privateReplyCompability || false);
          setLoading(false);
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [flowPropsId, session],
  );

  async function getFlow() {
    try {
      const res = await clientFetchApi<boolean, IGetFlow>("/api/flow/GetMasterFlow", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "id", value: flowPropsId }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        const rawNodes = res.value.flowModel.nodes || [];
        const normalizedNodes = rawNodes.map((node: any) => {
          const inputs = node.inputs ?? (node.input ? [node.input] : []);
          const outputs = node.outputs ?? (node.output ? [node.output] : []);
          return {
            ...node,
            inputs,
            outputs,
            genericItemOutputs: node.genericItemOutputs ?? [],
            buttonOutputs: node.buttonOutputs ?? [],
          } as any;
        });
        // Build an EditorState-shaped object from API response
        const incomingState: EditorState = {
          nodes: normalizedNodes,
          connections: res.value.flowModel.connections || [],
          scale: 1,
          pan: { x: 0, y: 0 },
        };
        console.log("Fetched flow incomingState:", incomingState);
        editorStateConst = incomingState;
        setEditorState((prev) => ({
          ...prev,
          connections: incomingState.connections,
          nodes: incomingState.nodes,
        }));
        setFlowTitle(res.value.title || "");
        setCheckFollower(res.value.checkFollower || false);
        setPrivateReplyCompability(res.value.privateReplyCompability || false);
        setLoading(false);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  useEffect(() => {
    if (onRegisterReload) {
      onRegisterReload(reloadFlow);
    }
  }, [onRegisterReload, reloadFlow]);

  useEffect(() => {
    setLoading(true);
    if (flowPropsId === "newFlow") {
      // Initialize with a single `onmessage` node when no flow id provided
      const savedRaw = localStorage.getItem("flowEditor_autoSave_newFlow");
      if (savedRaw) {
        console.log("flowEditor_autoSave_newFlow found");
        const parsed = JSON.parse(savedRaw) as EditorState;
        setEditorState(parsed);
        addToHistory(parsed);
      } else {
        console.log("Not saved flow ...");
        const initialNode: NodeData = {
          id: generateId(),
          type: "onmessage",
          label: "OnMessage",
          position: { x: 400, y: 200 },
          inputs: [],
          outputs: [{ id: "output", type: "output", label: "Output" }],
          data: {},
        };
        const initialState: EditorState = {
          nodes: [initialNode],
          connections: [],
          scale: 1,
          pan: { x: 0, y: 0 },
        };
        setEditorState(initialState);
        addToHistory(initialState);
      }
      setLoading(false);
    } else {
      getFlow();
    }

    return () => {
      console.log("FlowEditor unmounting...");
      try {
        console.log("Cleaning up flowEditor_autoSave for flowPropsId:", flowPropsId);
        console.log("editorState at unmount:", editorState);

        const autoSaveKey =
          flowPropsId === "newFlow" ? "flowEditor_autoSave_newFlow" : `flowEditor_autoSave_${flowPropsId}`;

        const savedRaw = localStorage.getItem(autoSaveKey);
        const parsed = savedRaw ? (JSON.parse(savedRaw) as EditorState) : null;

        // Calculate changes for display
        const diff = compareFlowWithLocalAutoSave(editorStateConst, flowPropsId);

        // Settings object configuration
        const settingsConfig = {
          masterFlowId: flowPropsId,
          snapToGridEnabled,
          setSnapToGridEnabled,
          showMinimap,
          setShowMinimap,
          panningBoundaryEnabled,
          setPanningBoundaryEnabled,
          exportFlow,
          importFlow,
          deleteAllNodes,
          editorState: parsed || editorState,
          lastSaved,
          historyIndex,
          history,
          flowTitle: flowTitleRef.current,
          checkFollower: checkFollowerRef.current,
          privateReplyCompability,
          isAutoSaving: true,
          unsavedChanges: diff,
        };
        // بررسی اعتبار فلو - اگر معتبر نبود، از unmount جلوگیری کن
        if (!validateAllBlocksHaveInput(parsed!, flowPropsId)) {
          console.log("Auto-saved flow is invalid. Preventing unmount cleanup.");
          toast.error(t(LanguageKey.invalidFlowDetected));
          if (flowPropsId !== "newFlow") {
            localStorage.removeItem(autoSaveKey);
          }
          return;
        }
        // Handle new flow (no flowPropsId)
        if (flowPropsId === "newFlow" && parsed && parsed.nodes.length > 1) {
          onOpenSettings(settingsConfig);
          localStorage.removeItem(autoSaveKey);
          return;
        }

        // Handle existing flow with changes
        if (diff && parsed) {
          console.log("parsedddddddd:", parsed);
          onOpenSettings(settingsConfig);
        }

        localStorage.removeItem(autoSaveKey);
      } catch (err) {
        console.warn("Error removing flowEditor_autoSave", err);
      }
    };
  }, [flowPropsId]);
  // ============================================================================
  // SERVER SAVE HANDLER
  // ============================================================================
  // دکمه سیو سرور

  const handleServerSave = async () => {
    try {
      const res = await clientFetchApi<any, ITotalMasterFlow>("/api/flow/CreateMasterFlow", {
        methodType: MethodType.post,
        session: session,
        data: editorState,
        queries: [
          { key: "checkFollower", value: checkFollower.toString() },
          { key: "title", value: flowTitle },
          {
            key: "masterFlowId",
            value: flowPropsId !== "newFlow" ? flowPropsId : undefined,
          },
        ],
        onUploadProgress: undefined,
      });
      if (!res.succeeded) {
        notify(res.info.responseType, NotifType.Warning);
      } else {
        internalNotify(InternalResponseType.Ok, NotifType.Success);
        setHasUnsavedChanges(false);
        if (flowPropsId === "newFlow" && onSaveSuccess) {
          onSaveSuccess(res.value, JSON.stringify(editorState));
        }

        // پاک کردن localStorage بعد از سیو موفق
        const autoSaveKey =
          flowPropsId === "newFlow" ? "flowEditor_autoSave_newFlow" : `flowEditor_autoSave_${flowPropsId}`;
        localStorage.removeItem(autoSaveKey);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  };

  // ============================================================================
  // JSX RENDER
  // ============================================================================
  // رندر کامپوننت

  return (
    <div className={styles.canvasparent}>
      {/* ================================================================= */}
      {/* <div className={styles.toolbar}>
        <button className={`${styles.toolbarBtn} ${styles.secondary}`} onClick={selectAll} title="Select All (Ctrl+A)">
          ☑️ Select All
        </button>

        <button
          className={`${styles.toolbarBtn} ${styles.secondary}`}
          onClick={copySelectedNodes}
          disabled={editorState.nodes.filter((n) => n.selected).length === 0}
          style={{
            opacity: editorState.nodes.filter((n) => n.selected).length === 0 ? 0.5 : 1,
            cursor: editorState.nodes.filter((n) => n.selected).length === 0 ? "not-allowed" : "pointer",
          }}
          title="Copy (Ctrl+C)">
          📋 Copy
        </button>

        <button
          className={`${styles.toolbarBtn} ${styles.secondary}`}
          onClick={pasteNodes}
          disabled={!clipboard}
          style={{
            opacity: !clipboard ? 0.5 : 1,
            cursor: !clipboard ? "not-allowed" : "pointer",
          }}
          title="Paste (Ctrl+V)">
          📄 Paste
        </button>

        <button
          className={`${styles.toolbarBtn} ${styles.secondary}`}
          onClick={duplicateSelectedNodes}
          disabled={editorState.nodes.filter((n) => n.selected).length === 0}
          style={{
            opacity: editorState.nodes.filter((n) => n.selected).length === 0 ? 0.5 : 1,
            cursor: editorState.nodes.filter((n) => n.selected).length === 0 ? "not-allowed" : "pointer",
          }}
          title="Duplicate (Ctrl+D)">
          📑 Duplicate
        </button>

        <button
          className={`${styles.toolbarBtn} ${styles.danger}`}
          onClick={deleteSelectedNodes}
          disabled={editorState.nodes.filter((n) => n.selected).length === 0}
          style={{
            opacity: editorState.nodes.filter((n) => n.selected).length === 0 ? 0.5 : 1,
            cursor: editorState.nodes.filter((n) => n.selected).length === 0 ? "not-allowed" : "pointer",
          }}
          title="Delete (Del)">
          🗑️ Delete
        </button>

        <button className={`${styles.toolbarBtn} ${styles.secondary}`} onClick={resetZoom} title="Reset Zoom (Ctrl+0)">
          🔄 Reset Zoom
        </button>
      </div> */}
      {/* ================================================================= */}
      {/* MINIMAP - نقشه کوچک */}
      {/* ================================================================= */}
      {/* <div className={styles.minimapContainer}>
        <label
          style={{
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            marginTop: "4px",
          }}>
          <input type="checkbox" checked={showMinimap} onChange={(e) => setShowMinimap(e.target.checked)} />
          <span title="Show Minimap (Ctrl+M)">Show Minimap</span>
        </label>

        {showMinimap && minimapData && (
          <div className={styles.minimap}>
            <svg width={minimapData.minimapWidth} height={minimapData.minimapHeight}>

              {editorState.nodes.map((node) => (
                <rect
                  key={node.id}
                  x={(node.position.x - minimapData.minX) * minimapData.minimapScale}
                  y={(node.position.y - minimapData.minY) * minimapData.minimapScale}
                  width={200 * minimapData.minimapScale}
                  height={150 * minimapData.minimapScale}
                  fill={node.selected ? "#4a90e2" : "#ddd"}
                  stroke="#999"
                  strokeWidth="1"
                />
              ))}

              {minimapData.connections.map((conn) => {
                if (!conn) return null;
                return (
                  <line
                    key={conn.id}
                    x1={(conn.x1 - minimapData.minX) * minimapData.minimapScale}
                    y1={(conn.y1 - minimapData.minY) * minimapData.minimapScale}
                    x2={(conn.x2 - minimapData.minX) * minimapData.minimapScale}
                    y2={(conn.y2 - minimapData.minY) * minimapData.minimapScale}
                    stroke="#999"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          </div>
        )}
      </div> */}
      {/* ================================================================= */}
      {/* SEARCH BAR - نوار جستجو */}
      {/* ================================================================= */}
      {/* <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          background: "white",
          padding: "8px 16px",
          borderRadius: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>
        <input
          type="text"
          placeholder="🔍 Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            fontSize: "13px",
            width: "300px",
          }}
        />
        {searchQuery && (
          <span style={{ fontSize: "11px", color: "#666", marginLeft: "8px" }}>{filteredNodes.length} found</span>
        )}
      </div> */}
      {loading && <Loading />}
      {!loading && (
        <>
          <div className={styles.header}>
            <svg
              onClick={() => {
                // const js = localStorage.getItem("flowEditor_autoSave");
                // if (js)
                //   localStorage.setItem(
                //     `flowEditor_autoSave_${
                //       flowPropsId.length > 0 ? flowPropsId : "newFlow"
                //     }`,
                //     js
                //   );
                // localStorage.removeItem("flowEditor_autoSave");
                showUserList();
              }}
              className={styles.backicon}
              fill="none"
              viewBox="0 0 14 11">
              <path
                d="M13 4.4H3.3l3-3A1 1 0 0 0 5 0L.3 4.7A1 1 0 0 0 .3 6l4.6 4.7a1 1 0 0 0 1.4-1.4l-3-3H13a1 1 0 0 0 0-2"
                fill="var(--color-light-blue)"
              />
            </svg>
          </div>

          {/* ================================================================= */}
          {/* TOOLBAR - نوار ابزار */}
          {/* ================================================================= */}
          {/* desktop */}
          <div className={styles.toolbardesktop}>
            <div className={styles.toolbardesktopgroup}>
              <Tooltip tooltipValue={t(LanguageKey.New_Flow_add_general_block)} position="top">
                <button onClick={() => addNode("generic")} className={styles.toolbardesktopitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="M8.7 19.2H3.3M6 22v-5.6M3 14V8.3C3 5.8 4.5 4 7 4h10c2.5 0 4 1.8 4 4.3v9c0 2.5-1.5 4.3-4 4.3h-5.4M17 10H7" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.New_Flow_add_quick_reply_block)} position="top">
                <button onClick={() => addNode("quickreply")} className={styles.toolbardesktopitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="m12 16.4 2.3-3.6H9.6L12 9.2M12 22a9 9 0 1 0-8.2-5.2l1 1.8q.3.5 0 1l-.8 1c-.4.6 0 1.4.8 1.4z" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.New_Flow_add_text_block)} position="top">
                <button onClick={() => addNode("text")} className={styles.toolbardesktopitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="M8.3 10.6V9.3h7.4v1.3M12 9.3v7.4m-1.7 0h3.4M7.7 4h8.5c3 0 4.8 2 4.8 5v8c0 3-1.8 5-4.8 5H7.8c-3 0-4.8-2-4.8-5V9c0-3 1.8-5 4.8-5" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.New_Flow_add_image_block)} position="top">
                <button onClick={() => addNode("image")} className={styles.toolbardesktopitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="M5.5 17.3 7 15.8q.9-.9 1.9 0h0l.9.8q1 .9 2 0L14 14c.5-.7 1.6-.8 2.3-.2l2.1 2.2M21 9v8c0 3-1.8 5-4.8 5H7.8c-3 0-4.8-2-4.8-5V9c0-3 1.8-5 4.8-5h8.4c3 0 4.8 2 4.8 5m-10.6 1.2a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.New_Flow_add_voice_block)} position="top">
                <button onClick={() => addNode("voice")} className={styles.toolbardesktopitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="M9.5 12v1.9m5.3-2v2M12.1 10v5.7M21 9v8c0 3-1.8 5-4.8 5H7.8c-3 0-4.8-2-4.8-5V9c0-3 1.8-5 4.8-5h8.4c3 0 4.8 2 4.8 5" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.New_Flow_add_weblink_block)} position="top">
                <button onClick={() => addNode("weblink")} className={styles.toolbardesktopitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="m8.8 11.8-.6.6a3 3 0 0 0 4.4 4.4l.6-.6m2-2 .6-.6a3 3 0 0 0-4.4-4.3l-.6.5m2.6 1.9-2.7 2.7M7.7 4h8.5c3 0 4.8 2 4.8 5v8c0 3-1.8 5-4.8 5H7.8c-3 0-4.8-2-4.8-5V9c0-3 1.8-5 4.8-5" />
                  </svg>
                </button>
              </Tooltip>
            </div>

            <div className={styles.toolbardesktopgroup}>
              <Tooltip tooltipValue={t(LanguageKey.testlab)} position="top">
                <button className={styles.toolbardesktopitem} onClick={() => onOpenLiveTest?.()}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="M6.4 14.6h12.2M4.5 17.2l3.6-5q.4-.6.4-1.3V7q.1-.8.8-.8h6.4q.7 0 .8.8v4q0 .7.4 1.2l3.6 5.2A3 3 0 0 1 18 22H7a3 3 0 0 1-2.5-4.7m6.2-14q0 .2-.2.2t-.2-.2.2-.2.2.2m4.2-1q0 .2-.2.2l-.2-.2.2-.2q.2 0 .2.2" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.AutoLayout_block)} position="top">
                <button title="Auto Layout (Ctrl+L)" onClick={applyAutoLayout} className={styles.toolbardesktopitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="M8 6.3h8M12 7v9c0 2.3 3.5 1.8 3.5 1.8m2-7.8h2q1.4-.1 1.5-1.5v-4q-.1-1.3-1.5-1.5h-2q-1.4.2-1.5 1.5v4q.1 1.4 1.5 1.5Zm-13 0h2Q7.8 9.9 8 8.5v-4Q7.8 3.2 6.5 3h-2Q3.2 3.2 3 4.5v4q.2 1.4 1.5 1.5Zm13 11h2q1.4-.1 1.5-1.5v-4q-.1-1.4-1.5-1.5h-2q-1.4.1-1.5 1.5v4q.1 1.4 1.5 1.5Z" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.undo)} position="top">
                <button onClick={undo} className={styles.toolbardesktopitem} title="Ctrl+Z">
                  <svg
                    style={{
                      opacity: historyIndex <= 0 ? 0.3 : 1,
                      cursor: historyIndex <= 0 ? "not-allowed" : "pointer",
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="m15.5 19 .8-.9A6 6 0 0 0 12 8H7m0 0 4 4M7 8l4-4" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.redo)} position="top">
                <button onClick={redo} className={styles.toolbardesktopitem} title="Ctrl+Y">
                  <svg
                    style={{
                      opacity: historyIndex >= history.length - 1 ? 0.3 : 1,
                      cursor: historyIndex >= history.length - 1 ? "not-allowed" : "pointer",
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="m9.5 19-.8-.9A6 6 0 0 1 13 8h5m0 0-4 4m4-4-4-4" />
                  </svg>
                </button>
              </Tooltip>
            </div>

            <div className={styles.toolbardesktopgroup}>
              <Tooltip tooltipValue={t(LanguageKey.zoomout)} position="top">
                <button onClick={() => handleZoom(-0.1)} className={styles.toolbardesktopitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none">
                    <path d="m17.1 17.6 3.5 3.4M9.2 11.4h4.4m6.2 0a8.4 8.4 0 1 0-16.8 0 8.4 8.4 0 0 0 16.8 0" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.fitscreen)} position="top">
                <button onClick={fitToScreen} title="Fit to Screen (Ctrl+1)" className={styles.toolbardesktopitem}>
                  {Math.round(editorState.scale * 100)}%
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.zoomin)} position="top">
                <button onClick={() => handleZoom(0.1)} className={styles.toolbardesktopitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none">
                    <path d="m17.1 17.6 3.5 3.4M9.2 11.4h4.4m-2.2-2.2v4.4m8.4-2.2a8.4 8.4 0 1 0-16.8 0 8.4 8.4 0 0 0 16.8 0" />
                  </svg>
                </button>
              </Tooltip>
            </div>

            <div className={styles.toolbardesktopgroup}>
              <Tooltip tooltipValue={t(LanguageKey.sidebar_Setting)} position="top">
                <button
                  className={styles.toolbardesktopitem}
                  onClick={() => {
                    onOpenSettings({
                      masterFlowId: flowPropsId,
                      snapToGridEnabled,
                      setSnapToGridEnabled,
                      showMinimap,
                      setShowMinimap,
                      panningBoundaryEnabled,
                      setPanningBoundaryEnabled,
                      exportFlow,
                      importFlow,
                      deleteAllNodes,
                      editorState,
                      lastSaved,
                      historyIndex,
                      history,
                      flowTitle,
                      checkFollower,
                      privateReplyCompability,
                      isValidFlow: validateAllBlocksHaveInput(editorState, flowPropsId),
                    });
                  }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="M15.5 12.3a3.5 3.5 0 0 1-7 1.1 3.5 3.5 0 1 1 7-1m2.8-3.2-.3-1V7.1q0-1-.7-1.5l-1.6-1q-1-.3-1.7.2l-1 .6-1 .2-1-.1-1-.6q-.8-.5-1.7-.1l-1.6.7Q6 6.2 6 7.1v1.1q0 .6-.3 1L5 10l-1 .5q-.8.5-1 1.5v1.8q.2 1 1 1.4l1 .6.7.7q.3.5.3 1v1.2q0 .7.7 1.5l1.6.9q1 .3 1.7-.1l1-.6 1-.3q.6 0 1 .3l1 .6q.8.4 1.7.1l1.6-1q.7-.5.7-1.4v-1.2q0-.5.3-1t.7-.7l1-.6q.8-.5 1-1.4V12q-.2-1-1-1.5l-1-.5z" />
                  </svg>
                </button>
              </Tooltip>
              <Tooltip tooltipValue={t(LanguageKey.save)} position="top">
                <button
                  className={`${styles.toolbardesktopitem} ${hasUnsavedChanges ? styles.toolbardesktopitemDraft : ""}`}
                  onClick={handleServerSave}
                  disabled={!hasUnsavedChanges}
                  style={{
                    opacity: hasUnsavedChanges ? 1 : 0.3,
                    cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
                    position: "relative",
                  }}>
                  <svg width="22px" height="22px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                    <path
                      d="M4 8.3A4.3 4.3 0 0 1 8.3 4h15.5a5 5 0 0 1 3.6 1.5l3.1 3.1a5 1 0 0 1 1.5 3.6v15.5a4.3 4.3 0 0 1-4.3 4.3H8.3A4.3 4.3 0 0 1 4 27.7zm4.3-2q-1.8.2-2 2v19.4q.2 1.8 2 2h.4v-8.2a3.5 3.5 0 0 1 3.5-3.5h11.6a3.5 3.5 0 0 1 3.5 3.5v8.2h.4q1.8-.2 2-2V12.2q0-1.1-.8-1.9l-3.2-3.2q-.7-.6-1.5-.7v4.2a3.5 3.5 0 0 1-3.5 3.5h-7a3.5 3.5 0 0 1-3.5-3.5V6.3zM25 29.7v-8.2a1.2 1.2 0 0 0-1.2-1.2H12.2a1.2 1.2 0 0 0-1.2 1.2v8.2zM12.6 6.3v4.3q.1 1.1 1.1 1.2h7a1.2 1.2 0 0 0 1.2-1.2V6.3z"
                      fill="var(--text-h1)"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
          </div>
          {/* mobile */}
          <div className={styles.toolbardesktopgroupmobile}>
            <div className={styles.toolbardesktopgrouptop}>
              <div className={styles.toolbardesktopgroup}>
                <Tooltip tooltipValue={t(LanguageKey.sidebar_Setting)} position="top">
                  <button
                    onClick={() => {
                      onOpenSettings({
                        masterFlowId: flowPropsId,
                        snapToGridEnabled,
                        setSnapToGridEnabled,
                        showMinimap,
                        setShowMinimap,
                        panningBoundaryEnabled,
                        setPanningBoundaryEnabled,
                        exportFlow,
                        importFlow,
                        deleteAllNodes,
                        editorState,
                        lastSaved,
                        historyIndex,
                        history,
                        flowTitle,
                        checkFollower,
                        privateReplyCompability,
                        isValidFlow: validateAllBlocksHaveInput(editorState, flowPropsId),
                      });
                    }}
                    className={styles.toolbarmobileitem}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="var(--text-h1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      width="24px"
                      height="24px"
                      fill="none"
                      viewBox="0 0 24 25">
                      <path d="M15.5 12.3a3.5 3.5 0 0 1-7 1.1 3.5 3.5 0 1 1 7-1m2.8-3.2-.3-1V7.1q0-1-.7-1.5l-1.6-1q-1-.3-1.7.2l-1 .6-1 .2-1-.1-1-.6q-.8-.5-1.7-.1l-1.6.7Q6 6.2 6 7.1v1.1q0 .6-.3 1L5 10l-1 .5q-.8.5-1 1.5v1.8q.2 1 1 1.4l1 .6.7.7q.3.5.3 1v1.2q0 .7.7 1.5l1.6.9q1 .3 1.7-.1l1-.6 1-.3q.6 0 1 .3l1 .6q.8.4 1.7.1l1.6-1q.7-.5.7-1.4v-1.2q0-.5.3-1t.7-.7l1-.6q.8-.5 1-1.4V12q-.2-1-1-1.5l-1-.5z" />
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip tooltipValue={t(LanguageKey.save)} position="top">
                  <button
                    className={`${styles.toolbardesktopitem} ${
                      hasUnsavedChanges ? styles.toolbardesktopitemDraft : ""
                    }`}
                    onClick={handleServerSave}
                    disabled={!hasUnsavedChanges}
                    style={{
                      opacity: hasUnsavedChanges ? 1 : 0.3,
                      cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
                      position: "relative",
                    }}>
                    <svg width="22px" height="22px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                      <path
                        d="M4 8.3A4.3 4.3 0 0 1 8.3 4h15.5a5 5 0 0 1 3.6 1.5l3.1 3.1a5 5 0 0 1 1.5 3.6v15.5a4.3 4.3 0 0 1-4.3 4.3H8.3A4.3 4.3 0 0 1 4 27.7zm4.3-2q-1.8.2-2 2v19.4q.2 1.8 2 2h.4v-8.2a3.5 3.5 0 0 1 3.5-3.5h11.6a3.5 3.5 0 0 1 3.5 3.5v8.2h.4q1.8-.2 2-2V12.2q0-1.1-.8-1.9l-3.2-3.2q-.7-.6-1.5-.7v4.2a3.5 3.5 0 0 1-3.5 3.5h-7a3.5 3.5 0 0 1-3.5-3.5V6.3zM25 29.7v-8.2a1.2 1.2 0 0 0-1.2-1.2H12.2a1.2 1.2 0 0 0-1.2 1.2v8.2zM12.6 6.3v4.3q.1 1.1 1.1 1.2h7a1.2 1.2 0 0 0 1.2-1.2V6.3z"
                        fill="var(--text-h1)"
                      />
                    </svg>
                  </button>
                </Tooltip>
              </div>

              <button
                className={styles.toolbarmobileitem}
                title="show-menu-btn"
                onClick={() => setShowMobileMenu(!showMobileMenu)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="var(--text-h1)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  width="24px"
                  height="24px"
                  fill="none"
                  viewBox="0 0 48 48">
                  <path
                    d="M22 34.3q0-.71.47-1.2.5-.5 1.23-.5.76 0 1.24.47.47.5.47 1.23 0 .72-.47 1.2-.48.5-1.24.5a1.66 1.66 0 0 1-1.7-1.7m0-10.37q0-.72.47-1.2.5-.5 1.23-.5.76 0 1.23.47.48.5.48 1.23 0 .72-.48 1.2-.46.5-1.23.5a1.66 1.66 0 0 1-1.7-1.7m0-10.23q0-.7.47-1.2.5-.5 1.23-.5.76 0 1.23.48.48.5.48 1.22 0 .74-.48 1.2-.46.5-1.23.5a1.66 1.66 0 0 1-1.7-1.7"
                    fill="var(--text-h1)"
                  />
                </svg>
              </button>
            </div>
            <div className={styles.toolbardesktopgroup}>
              <Tooltip tooltipValue={t(LanguageKey.undo)} position="top">
                <button className={styles.toolbarmobileitem} title="Ctrl+Z">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="m15.5 19 .8-.9A6 6 0 0 0 12 8H7m0 0 4 4M7 8l4-4" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.redo)} position="top">
                <button className={styles.toolbarmobileitem} title="Ctrl+Y">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="m9.5 19-.8-.9A6 6 0 0 1 13 8h5m0 0-4 4m4-4-4-4" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.New_Flow_live_test_block)} position="top">
                <button className={styles.toolbarmobileitem} onClick={() => onOpenLiveTest?.()}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="M6.4 14.6h12.2M4.5 17.2l3.6-5q.4-.6.4-1.3V7q.1-.8.8-.8h6.4q.7 0 .8.8v4q0 .7.4 1.2l3.6 5.2A3 3 0 0 1 18 22H7a3 3 0 0 1-2.5-4.7m6.2-14q0 .2-.2.2t-.2-.2.2-.2.2.2m4.2-1q0 .2-.2.2l-.2-.2.2-.2q.2 0 .2.2" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.AutoLayout_block)} position="top">
                <button title="Auto Layout (Ctrl+L)" onClick={applyAutoLayout} className={styles.toolbarmobileitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="M8 6.3h8M12 7v9c0 2.3 3.5 1.8 3.5 1.8m2-7.8h2q1.4-.1 1.5-1.5v-4q-.1-1.3-1.5-1.5h-2q-1.4.2-1.5 1.5v4q.1 1.4 1.5 1.5Zm-13 0h2Q7.8 9.9 8 8.5v-4Q7.8 3.2 6.5 3h-2Q3.2 3.2 3 4.5v4q.2 1.4 1.5 1.5Zm13 11h2q1.4-.1 1.5-1.5v-4q-.1-1.4-1.5-1.5h-2q-1.4.1-1.5 1.5v4q.1 1.4 1.5 1.5Z" />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <div className={styles.toolbardesktopgroup}>
              <Tooltip tooltipValue={t(LanguageKey.zoomout)} position="top">
                <button onClick={() => handleZoom(-0.1)} className={styles.toolbarmobileitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="m17.1 17.6 3.5 3.4M9.2 11.4h4.4m6.2 0a8.4 8.4 0 1 0-16.8 0 8.4 8.4 0 0 0 16.8 0" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.fitscreen)} position="top">
                <button onClick={fitToScreen} title="Fit to Screen (Ctrl+1)" className={styles.toolbarmobileitem}>
                  {Math.round(editorState.scale * 100)}%
                </button>
              </Tooltip>

              <Tooltip tooltipValue={t(LanguageKey.zoomin)} position="top">
                <button onClick={() => handleZoom(0.1)} className={styles.toolbarmobileitem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="var(--text-h1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    width="24px"
                    height="24px"
                    fill="none"
                    viewBox="0 0 24 25">
                    <path d="m17.1 17.6 3.5 3.4M9.2 11.4h4.4m-2.2-2.2v4.4m8.4-2.2a8.4 8.4 0 1 0-16.8 0 8.4 8.4 0 0 0 16.8 0" />
                  </svg>
                </button>
              </Tooltip>
            </div>

            {showMobileMenu && (
              <div className={styles.mobilemenuoverlay}>
                <div className={styles.mobilemenu} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      addNode("generic");
                      setShowMobileMenu(false);
                    }}
                    className={styles.mobilemenuitem}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="var(--text-h1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      width="20px"
                      height="20px"
                      fill="none"
                      viewBox="0 0 24 25">
                      <path d="M8.7 19.2H3.3M6 22v-5.6M3 14V8.3C3 5.8 4.5 4 7 4h10c2.5 0 4 1.8 4 4.3v9c0 2.5-1.5 4.3-4 4.3h-5.4M17 10H7" />
                    </svg>
                    <span>{t(LanguageKey.New_Flow_add_general_block)}</span>
                  </button>
                  <button
                    onClick={() => {
                      addNode("quickreply");
                      setShowMobileMenu(false);
                    }}
                    className={styles.mobilemenuitem}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="var(--text-h1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      width="20px"
                      height="20px"
                      fill="none"
                      viewBox="0 0 24 25">
                      <path d="m12 16.4 2.3-3.6H9.6L12 9.2M12 22a9 9 0 1 0-8.2-5.2l1 1.8q.3.5 0 1l-.8 1c-.4.6 0 1.4.8 1.4z" />
                    </svg>
                    <span>{t(LanguageKey.New_Flow_add_quick_reply_block)}</span>
                  </button>
                  <button
                    onClick={() => {
                      addNode("text");
                      setShowMobileMenu(false);
                    }}
                    className={styles.mobilemenuitem}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="var(--text-h1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      width="20px"
                      height="20px"
                      fill="none"
                      viewBox="0 0 24 25">
                      <path d="M8.3 10.6V9.3h7.4v1.3M12 9.3v7.4m-1.7 0h3.4M7.7 4h8.5c3 0 4.8 2 4.8 5v8c0 3-1.8 5-4.8 5H7.8c-3 0-4.8-2-4.8-5V9c0-3 1.8-5 4.8-5" />
                    </svg>
                    <span>{t(LanguageKey.New_Flow_add_text_block)}</span>
                  </button>
                  <label className={styles.mobilemenuitem}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="var(--text-h1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      width="20px"
                      height="20px"
                      fill="none"
                      viewBox="0 0 24 25">
                      <path d="M5.5 17.3 7 15.8q.9-.9 1.9 0h0l.9.8q1 .9 2 0L14 14c.5-.7 1.6-.8 2.3-.2l2.1 2.2M21 9v8c0 3-1.8 5-4.8 5H7.8c-3 0-4.8-2-4.8-5V9c0-3 1.8-5 4.8-5h8.4c3 0 4.8 2 4.8 5m-10.6 1.2a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0" />
                    </svg>
                    <span>{t(LanguageKey.New_Flow_add_image_block)}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        addNode("image");
                        setShowMobileMenu(false);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                  <button
                    onClick={() => {
                      addNode("voice");
                      setShowMobileMenu(false);
                    }}
                    className={styles.mobilemenuitem}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="var(--text-h1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      width="20px"
                      height="20px"
                      fill="none"
                      viewBox="0 0 24 25">
                      <path d="M9.5 12v1.9m5.3-2v2M12.1 10v5.7M21 9v8c0 3-1.8 5-4.8 5H7.8c-3 0-4.8-2-4.8-5V9c0-3 1.8-5 4.8-5h8.4c3 0 4.8 2 4.8 5" />
                    </svg>
                    <span>{t(LanguageKey.New_Flow_add_voice_block)}</span>
                  </button>
                  <button
                    onClick={() => {
                      addNode("weblink");
                      setShowMobileMenu(false);
                    }}
                    className={styles.mobilemenuitem}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="var(--text-h1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      width="20px"
                      height="20px"
                      fill="none"
                      viewBox="0 0 24 25">
                      <path d="m8.8 11.8-.6.6a3 3 0 0 0 4.4 4.4l.6-.6m2-2 .6-.6a3 3 0 0 0-4.4-4.3l-.6.5m2.6 1.9-2.7 2.7M7.7 4h8.5c3 0 4.8 2 4.8 5v8c0 3-1.8 5-4.8 5H7.8c-3 0-4.8-2-4.8-5V9c0-3 1.8-5 4.8-5" />
                    </svg>
                    <span>{t(LanguageKey.New_Flow_add_weblink_block)}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* CANVAS - بوم اصلی ویرایشگر */}
          {/* ================================================================= */}
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={{ position: "relative" }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={(e) => handleContextMenu(e)}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}>
            {/* ============================================================= */}
            {/* SELECTION BOX - باکس انتخاب چندگانه */}
            {/* ============================================================= */}
            {selectionBox.active && (
              <div
                style={{
                  position: "absolute",
                  left: `${
                    Math.min(selectionBox.start.x, selectionBox.end.x) * editorState.scale + editorState.pan.x
                  }px`,
                  top: `${
                    Math.min(selectionBox.start.y, selectionBox.end.y) * editorState.scale + editorState.pan.y
                  }px`,
                  width: `${Math.abs(selectionBox.end.x - selectionBox.start.x) * editorState.scale}px`,
                  height: `${Math.abs(selectionBox.end.y - selectionBox.start.y) * editorState.scale}px`,
                  border: "2px dashed #4a90e2",
                  background: "rgba(74, 144, 226, 0.1)",
                  pointerEvents: "none",
                  zIndex: 1000,
                }}
              />
            )}

            <div
              className={styles.canvasContent}
              style={{
                transform: `translate(${editorState.pan.x}px, ${editorState.pan.y}px) scale(${editorState.scale})`,
                width: `${canvasBounds.width}px`,
                height: `${canvasBounds.height}px`,
              }}>
              {/* ============================================================= */}
              {/* CONNECTIONS LAYER - لایه اتصالات */}
              {/* ============================================================= */}
              <svg
                className={styles.connectionsLayer}
                style={{
                  width: `${canvasBounds.width}px`,
                  height: `${canvasBounds.height}px`,
                }}>
                {connectionPaths.map(({ id, path, color }) => (
                  <g key={id}>
                    {/* لایه invisible برای کلیک راحت‌تر - ضخامت 30 پیکسل */}
                    <path
                      d={path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="30"
                      strokeLinecap="round"
                      style={{ cursor: "pointer", pointerEvents: "stroke" }}
                      onClick={(e) => handleConnectionClick(e, id)}
                      onContextMenu={(e) => handleConnectionClick(e, id)}
                    />
                    {/* خط اصلی که نمایش داده می‌شود */}
                    <path className={styles.connection} d={path} style={{ pointerEvents: "none", stroke: color }} />
                  </g>
                ))}
                {connectingSocket && tempConnectionEnd && (
                  <path
                    className={styles.connectionTemp}
                    d={getBezierPath(connectingSocket.position, tempConnectionEnd)}
                    style={{
                      stroke: (() => {
                        const sourceNode = editorState.nodes.find((n) => n.id === connectingSocket.nodeId);
                        return sourceNode ? getNodeTypeColor(sourceNode.type) : "#95a5a6";
                      })(),
                    }}
                  />
                )}
              </svg>

              {/* ============================================================= */}
              {/* NODES - نودها */}
              {/* ============================================================= */}
              {editorState.nodes.map((node) => (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className={`${styles.node} ${getNodeClassName(node.type)} ${node.selected ? styles.selected : ""}`}
                  style={{
                    left: `${node.position.x}px`,
                    top: `${node.position.y}px`,
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onContextMenu={(e) => handleContextMenu(e, node.id)}
                  onTouchStart={(e) => handleNodeTouchStart(e, node.id)}>
                  {/* Node Header - هدر نود */}
                  <div className={styles.nodeHeader}>
                    <div>
                      <div className={styles.nodeTitle}>{node.label}</div>
                      <div className={styles.nodeType}>{t(getNodeTypeTranslationKey(node.type))}</div>
                    </div>
                    <Dotmenu data={createNodeMenuOptions(node.id, node.type)} />
                  </div>

                  {/* Node Body - بدنه نود */}
                  <div className={styles.nodeBody}>
                    {node.type === "onmessage" && <OnMessageNode node={node} updateNodeData={updateNodeData} />}
                    {node.type === "text" && <TextNode node={node} updateNodeData={updateNodeData} />}
                    {node.type === "weblink" && <WeblinkNode node={node} updateNodeData={updateNodeData} />}
                    {node.type === "image" && (
                      <ImageNode node={node} updateNodeData={updateNodeData} setEditorState={setEditorState} />
                    )}
                    {node.type === "voice" && (
                      <VoiceNode node={node} updateNodeData={updateNodeData} setEditorState={setEditorState} />
                    )}
                    {node.type === "quickreply" && (
                      <QuickReplyNode
                        node={node}
                        updateNodeData={updateNodeData}
                        setEditorState={setEditorState}
                        updateStateWithHistory={updateStateWithHistory}
                      />
                    )}
                    {node.type === "generic" && (
                      <GenericNode
                        node={node}
                        updateNodeData={updateNodeData}
                        setEditorState={setEditorState}
                        updateStateWithHistory={updateStateWithHistory}
                      />
                    )}
                    {node.type === "genericitem" && (
                      <GenericItemNode
                        node={node}
                        updateNodeData={updateNodeData}
                        setEditorState={setEditorState}
                        updateStateWithHistory={updateStateWithHistory}
                      />
                    )}
                  </div>
                  {/* Sockets */}
                  <>
                    {node.inputs.map((socket) => (
                      <div key={socket.id} className={styles.socketInputparent}>
                        <div
                          className={styles.socketInput}
                          onMouseUp={(e) => handleSocketMouseUp(e, node.id, socket.id, "input")}>
                          <div
                            className={`${styles.socketDot} ${
                              editorState.connections.some(
                                (c) => c.targetNodeId === node.id && c.targetSocketId === socket.id,
                              )
                                ? styles.connected
                                : ""
                            } ${
                              nearestSocket?.nodeId === node.id && nearestSocket?.socketId === socket.id
                                ? styles.nearest
                                : ""
                            }`}
                            style={{
                              borderColor: "#95a5a6",
                              color: "#95a5a6",
                            }}
                            data-node-id={node.id}
                            data-socket-id={socket.id}
                            data-socket-type="input"
                          />
                        </div>
                        <div className={styles.socketiconinput}>
                          <svg
                            fill="var(--background-root)"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 15 15"
                            width="15"
                            height="15">
                            <path d="M7 .3a1 1 0 0 1 1.3 0l6.4 6.4q.6.6 0 1.4l-6.4 6.3A1 1 0 0 1 7 13l4.7-4.6H1a1 1 0 1 1 0-2h10.6L6.9 1.7A1 1 0 0 1 7 .3" />
                          </svg>
                        </div>
                      </div>
                    ))}

                    {node.outputs.map((socket, index) => {
                      const hasLabel =
                        node.type === "quickreply" || node.type === "generic" || node.type === "genericitem";

                      return (
                        <div key={socket.id} className={hasLabel ? styles.socketwithlabel : styles.socketwithicon}>
                          <div
                            className={styles.socketOutput}
                            onMouseDown={(e) => handleSocketMouseDown(e, node.id, socket.id, "output")}
                            onMouseUp={(e) => handleSocketMouseUp(e, node.id, socket.id, "output")}
                            onTouchStart={(e) => {
                              handleSocketTouchStart(e, node.id, socket.id, "output");
                            }}>
                            <div
                              className={`${styles.socketDot} ${
                                editorState.connections.some(
                                  (c) => c.sourceNodeId === node.id && c.sourceSocketId === socket.id,
                                )
                                  ? styles.connected
                                  : ""
                              }`}
                              style={{
                                borderColor: getNodeTypeColor(node.type),
                                color: getNodeTypeColor(node.type),
                              }}
                              data-node-id={node.id}
                              data-socket-id={socket.id}
                              data-socket-type="output"
                            />
                          </div>
                          {hasLabel && <span className={styles.socketLabel}>{socket.label}</span>}
                          {!hasLabel && (
                            <div className={styles.socketiconoutput}>
                              <svg
                                fill="var(--background-root)"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 15 15"
                                width="15"
                                height="15">
                                <path d="M7 .3a1 1 0 0 1 1.3 0l6.4 6.4q.6.6 0 1.4l-6.4 6.3A1 1 0 0 1 7 13l4.7-4.6H1a1 1 0 1 1 0-2h10.6L6.9 1.7A1 1 0 0 1 7 .3" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Render genericItemOutputs for generic nodes */}
                    {node.type === "generic" &&
                      (node.genericItemOutputs || []).map((socket, index) => {
                        return (
                          <div key={socket.id} className={styles.socketwithlabel}>
                            <div
                              className={styles.socketOutput}
                              onMouseDown={(e) => handleSocketMouseDown(e, node.id, socket.id, "output")}
                              onMouseUp={(e) => handleSocketMouseUp(e, node.id, socket.id, "output")}
                              onTouchStart={(e) => {
                                handleSocketTouchStart(e, node.id, socket.id, "output");
                              }}>
                              <div
                                className={`${styles.socketDot} ${
                                  editorState.connections.some(
                                    (c) => c.sourceNodeId === node.id && c.sourceSocketId === socket.id,
                                  )
                                    ? styles.connected
                                    : ""
                                }`}
                                style={{
                                  borderColor: getNodeTypeColor(node.type),
                                  color: getNodeTypeColor(node.type),
                                }}
                                data-node-id={node.id}
                                data-socket-id={socket.id}
                                data-socket-type="output"
                              />
                            </div>
                            <span className={styles.socketLabel}>{socket.label}</span>
                          </div>
                        );
                      })}

                    {/* Render buttonOutputs for quickreply and genericitem nodes */}
                    {(node.type === "quickreply" || node.type === "genericitem") &&
                      (node.buttonOutputs || []).map((socket, index) => {
                        return (
                          <div key={socket.id} className={styles.socketwithlabel}>
                            <div
                              className={styles.socketOutput}
                              onMouseDown={(e) => handleSocketMouseDown(e, node.id, socket.id, "output")}
                              onMouseUp={(e) => handleSocketMouseUp(e, node.id, socket.id, "output")}
                              onTouchStart={(e) => {
                                handleSocketTouchStart(e, node.id, socket.id, "output");
                              }}>
                              <div
                                className={`${styles.socketDot} ${
                                  editorState.connections.some(
                                    (c) => c.sourceNodeId === node.id && c.sourceSocketId === socket.id,
                                  )
                                    ? styles.connected
                                    : ""
                                }`}
                                style={{
                                  borderColor: getNodeTypeColor(node.type),
                                  color: getNodeTypeColor(node.type),
                                }}
                                data-node-id={node.id}
                                data-socket-id={socket.id}
                                data-socket-type="output"
                              />
                            </div>
                            <span className={styles.socketLabel}>{socket.label}</span>
                          </div>
                        );
                      })}
                  </>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ================================================================= */}
      {/* CONTEXT MENU - منوی راست‌کلیک */}
      {/* ================================================================= */}
      {contextMenu.visible &&
        (() => {
          const isRTL = document.dir === "rtl" || document.documentElement.dir === "rtl";

          return (
            <div
              className={styles.contextMenu}
              style={{
                position: "absolute",
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
                zIndex: 10000,
              }}
              onClick={(e) => e.stopPropagation()}>
              {/* گزینه‌های منو برای نود */}
              {contextMenu.nodeId &&
                (() => {
                  const node = editorState.nodes.find((n) => n.id === contextMenu.nodeId);
                  // عدم نمایش منو برای نودهای onmessage
                  if (node?.type === "onmessage") return null;

                  return (
                    <>
                      <div
                        className={styles.contextMenuItem}
                        onClick={() => {
                          const node = editorState.nodes.find((n) => n.id === contextMenu.nodeId);
                          if (node) {
                            setEditorState((prev) => ({
                              ...prev,
                              nodes: prev.nodes.map((n) => ({
                                ...n,
                                selected: n.id === contextMenu.nodeId,
                              })),
                            }));
                            copySelectedNodes();
                          }
                          setContextMenu({ visible: false, x: 0, y: 0 });
                        }}>
                        <img style={{ width: "24px", height: "24px" }} src="/copy.svg" />
                        {t(LanguageKey.copy)}
                      </div>

                      <div
                        className={styles.contextMenuItem}
                        onClick={() => {
                          if (contextMenu.nodeId) {
                            const node = editorState.nodes.find((n) => n.id === contextMenu.nodeId);
                            if (node) {
                              setEditorState((prev) => ({
                                ...prev,
                                nodes: prev.nodes.map((n) => ({
                                  ...n,
                                  selected: n.id === contextMenu.nodeId,
                                })),
                              }));
                              duplicateSelectedNodes();
                            }
                          }
                          setContextMenu({ visible: false, x: 0, y: 0 });
                        }}>
                        <img style={{ width: "24px", height: "24px" }} src="/copy.svg" />
                        {t(LanguageKey.Dublicate)}
                      </div>

                      <div
                        className={styles.contextMenuItem}
                        onClick={() => {
                          if (contextMenu.nodeId) {
                            deleteNode(contextMenu.nodeId);
                          }
                          setContextMenu({ visible: false, x: 0, y: 0 });
                        }}>
                        <img style={{ width: "24px", height: "24px" }} src="/delete.svg" />
                        {t(LanguageKey.delete)}
                      </div>
                    </>
                  );
                })()}

              {/* گزینه‌های منو برای اتصال */}
              {contextMenu.connectionId && (
                <div
                  className={styles.contextMenuItem}
                  onClick={() => {
                    if (contextMenu.connectionId) {
                      deleteConnection(contextMenu.connectionId);
                    }
                    setContextMenu({ visible: false, x: 0, y: 0 });
                  }}>
                  <img style={{ width: "24px", height: "24px" }} src="/delete.svg" />
                  {t(LanguageKey.delete)}
                </div>
              )}

              {/* گزینه‌های منو برای Canvas */}
              {!contextMenu.nodeId && !contextMenu.connectionId && (
                <>
                  <div
                    className={styles.contextMenuItem}
                    onClick={() => {
                      selectAll();
                      setContextMenu({ visible: false, x: 0, y: 0 });
                    }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="24" height="24" viewBox="0 0 24 24">
                      <g fill="var(--color-gray)">
                        <path d="M11.18 3.82a.82.82 0 1 1 1.64 0v1.63a.82.82 0 0 1-1.64 0zm0 5.73a.82.82 0 0 1 1.64 0v4.9a.82.82 0 1 1-1.64 0zm0 9a.82.82 0 1 1 1.64 0v1.63a.82.82 0 1 1-1.64 0zm9-7.37a.82.82 0 1 1 0 1.64h-1.63a.82.82 0 1 1 0-1.64z" />
                        <path d="M14.45 11.18a.82.82 0 1 1 0 1.64h-4.9a.82.82 0 0 1 0-1.64zm-9 0a.82.82 0 0 1 0 1.64H3.82a.82.82 0 1 1 0-1.64z" />
                      </g>
                      <rect x="3" y="3" rx="5" width="18" height="18" stroke="var(--color-gray60)" strokeWidth="2" />
                    </svg>{" "}
                    {t(LanguageKey.selectall)}
                  </div>

                  <div
                    className={styles.contextMenuItem}
                    onClick={() => {
                      deleteAllNodes();
                      setContextMenu({ visible: false, x: 0, y: 0 });
                    }}>
                    <img style={{ width: "24px", height: "24px" }} src="/delete.svg" />
                    {t(LanguageKey.delete)} {t(LanguageKey.all)}
                  </div>

                  <div
                    className={styles.contextMenuItem}
                    onClick={() => {
                      pasteNodes();
                      setContextMenu({ visible: false, x: 0, y: 0 });
                    }}
                    style={{ opacity: clipboard ? 1 : 0.5 }}>
                    <img style={{ width: "24px", height: "24px" }} src="/copy.svg" /> {t(LanguageKey.copy)}
                  </div>
                </>
              )}
            </div>
          );
        })()}
    </div>
  );
}
