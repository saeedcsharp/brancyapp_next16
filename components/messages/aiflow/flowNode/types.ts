// Shared Types for Flow Nodes

export interface Position {
  x: number;
  y: number;
}

export interface Socket {
  id: string;
  type: "input" | "output";
  label: string;
}

export interface NodeData {
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

export interface BaseNodeProps {
  node: NodeData;
  updateNodeData: (nodeId: string, data: any) => void;
}
