import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "./GenericNode.module.css";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";

interface GenericNodeProps extends BaseNodeProps {
  setEditorState: React.Dispatch<React.SetStateAction<any>>;
  updateStateWithHistory: (updater: (prev: any) => any) => void;
}

export const GenericNode: React.FC<GenericNodeProps> = ({
  node,
  updateNodeData,
  setEditorState,
  updateStateWithHistory,
}) => {
  const { t } = useTranslation();
  const addOutputToNode = useCallback(() => {
    const outputCount = (node.genericItemOutputs || []).length;
    // استفاده از شناسه یکتا برای جلوگیری از تداخل socketId ها
    const newOutputId = `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    updateStateWithHistory((prev: any) => {
      const updatedNodes = prev.nodes.map((n: any) => {
        if (n.id === node.id) {
          const newGenericItemOutput = {
            id: newOutputId,
            type: "output" as const,
            label: `${t(LanguageKey.New_Flow_generic_sub)} ${outputCount + 1}`,
          };
          return {
            ...n,
            genericItemOutputs: [...(n.genericItemOutputs || []), newGenericItemOutput],
            data: {
              ...n.data,
              itemCount: outputCount + 1,
            },
          };
        }
        return n;
      });

      // ساخت نود GenericItem جدید
      const genericItemId = `genericitem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newGenericItem: NodeData = {
        id: genericItemId,
        type: "genericitem",
        label: `GenericItem ${outputCount + 1}`,
        position: {
          x: node.position.x + 400,
          y: node.position.y + outputCount * 250,
        },
        inputs: [{ id: "input", type: "input", label: "Input" }],
        outputs: [], // outputs معمولی - برای اتصالات غیر دکمه‌ای
        buttonOutputs: [{ id: "button1", type: "output", label: "Button 1" }],
        data: {
          title: "",
          subtitle: "",
          weblink: "",
          image: null,
          buttons: ["Button 1"],
        },
      };

      // ساخت اتصال محافظت شده
      const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newConnection = {
        id: connectionId,
        sourceNodeId: node.id,
        sourceSocketId: newOutputId,
        targetNodeId: genericItemId,
        targetSocketId: "input",
        protected: true, // اتصال محافظت شده
      };

      return {
        ...prev,
        nodes: [...updatedNodes, newGenericItem],
        connections: [...prev.connections, newConnection],
      };
    });
  }, [node, updateStateWithHistory]);

  return (
    <div className={styles.container}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          addOutputToNode();
        }}
        className="saveButton">
        <strong>+</strong> {t(LanguageKey.New_Flow_add_generic_sub_block)}
      </button>
    </div>
  );
};

// Height calculation for this node type
export const getGenericNodeHeight = (node: NodeData): number => {
  return 80; // ارتفاع ثابت برای نود والد
};

// Node container class name for styling the node border
export const genericNodeClassName = styles.nodeContainer;
