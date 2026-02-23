import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/messages/aiflow/flowNode/QuickReplyNode.module.css";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";
interface QuickReplyNodeProps extends BaseNodeProps {
  setEditorState: React.Dispatch<React.SetStateAction<any>>;
  updateStateWithHistory: (updater: (prev: any) => any) => void;
}
export const QuickReplyNode: React.FC<QuickReplyNodeProps> = ({
  node,
  updateNodeData,
  setEditorState,
  updateStateWithHistory,
}) => {
  const [isTitleFocused, setIsTitleFocused] = React.useState<boolean>(false);
  const { t } = useTranslation();
  const defaultTitlePlaceholder = t(LanguageKey.New_Flow_quick_reply_title_placeholder);
  const addOutputToNode = useCallback(() => {
    updateStateWithHistory((prev: any) => {
      const currentNode = prev.nodes.find((n: any) => n.id === node.id);
      if (!currentNode) return prev;

      const outputCount = (currentNode.buttonOutputs || []).length;
      const newOutputId = `output${outputCount + 1}`;

      return {
        ...prev,
        nodes: prev.nodes.map((n: any) => {
          if (n.id === node.id) {
            const newButtonOutput = { id: newOutputId, type: "output" as const, label: `Button ${outputCount + 1}` };
            return {
              ...n,
              buttonOutputs: [...(n.buttonOutputs || []), newButtonOutput],
              data: {
                ...n.data,
                buttons: [...(n.data?.buttons || []), `Button ${outputCount + 1}`],
              },
            };
          }
          return n;
        }),
      };
    });
  }, [node.id, updateStateWithHistory]);
  const removeOutputFromNode = useCallback(
    (outputId: string, index: number) => {
      updateStateWithHistory((prev: any) => {
        const currentNode = prev.nodes.find((n: any) => n.id === node.id);
        if (!currentNode) return prev;

        // If only one output left, delete the entire node
        if ((currentNode.buttonOutputs || []).length === 1) {
          return {
            ...prev,
            nodes: prev.nodes.filter((n: any) => n.id !== node.id),
            connections: prev.connections.filter((c: any) => c.sourceNodeId !== node.id && c.targetNodeId !== node.id),
          };
        }

        // Otherwise, remove the specific output
        return {
          ...prev,
          nodes: prev.nodes.map((n: any) => {
            if (n.id === node.id) {
              const outputIndex = (n.buttonOutputs || []).findIndex((o: any) => o.id === outputId);
              if (outputIndex !== -1) {
                const newButtons = [...(n.data?.buttons || [])];
                newButtons.splice(outputIndex, 1);
                return {
                  ...n,
                  buttonOutputs: (n.buttonOutputs || []).filter((o: any) => o.id !== outputId),
                  data: {
                    ...n.data,
                    buttons: newButtons,
                  },
                };
              }
            }
            return n;
          }),
          connections: prev.connections.filter(
            (c: any) => !(c.sourceNodeId === node.id && c.sourceSocketId === outputId)
          ),
        };
      });
    },
    [node.id, updateStateWithHistory]
  );

  // Initialize title with default placeholder if empty
  React.useEffect(() => {
    if (!node.data?.title || node.data.title === "") {
      updateNodeData(node.id, { title: defaultTitlePlaceholder });
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* Title Input */}
      <div className={styles.titleSection}>
        <div onClick={(e) => e.stopPropagation()}>
          <InputText
            value={node.data?.title === defaultTitlePlaceholder ? "" : node.data?.title || ""}
            maxLength={140}
            handleInputChange={(e) => {
              updateNodeData(node.id, { title: e.target.value });
            }}
            handleInputonFocus={(e) => {
              setIsTitleFocused(true);
              if (node.data?.title === defaultTitlePlaceholder) {
                updateNodeData(node.id, { title: "" });
              }
            }}
            handleInputBlur={(e) => {
              setIsTitleFocused(false);
              if (!node.data?.title || node.data.title.trim() === "") {
                updateNodeData(node.id, { title: defaultTitlePlaceholder });
              }
            }}
            placeHolder={defaultTitlePlaceholder}
            className="textinputbox"
            name="quick reply title"
          />
        </div>
      </div>

      {/* Buttons */}
      {node.data?.buttons?.map((btn: string, idx: number) => (
        <div key={idx} className={styles.buttonItem}>
          <div onClick={(e) => e.stopPropagation()}>
            <InputText
              value={btn}
              maxLength={40}
              handleInputChange={(e) => {
                const newButtons = [...(node.data?.buttons || [])];
                newButtons[idx] = e.target.value;
                const newButtonOutputs = [...(node.buttonOutputs || [])];
                if (newButtonOutputs[idx]) {
                  newButtonOutputs[idx] = {
                    ...newButtonOutputs[idx],
                    label: e.target.value || `${t(LanguageKey.button)} ${idx + 1}`,
                  };
                }

                updateNodeData(node.id, { buttons: newButtons });
                setEditorState((prev: any) => ({
                  ...prev,
                  nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, buttonOutputs: newButtonOutputs } : n)),
                }));
              }}
              placeHolder={`${t(LanguageKey.button)} ${idx + 1}`}
              className="textinputbox"
              name={`button-${idx}`}
            />
          </div>
          <img
            onClick={(e) => {
              e.stopPropagation();
              const outputId = (node.buttonOutputs || [])[idx]?.id;
              if (outputId) {
                removeOutputFromNode(outputId, idx);
              }
            }}
            role="button"
            style={{ cursor: "pointer", width: "30px", height: "30px", padding: "5px" }}
            title="ℹ️ delete Button"
            src="/delete-red.svg"
          />
        </div>
      ))}
      <button
        onClick={(e) => {
          e.stopPropagation();
          addOutputToNode();
        }}
        className="saveButton">
        <strong>+ </strong> {t(LanguageKey.New_Flow_add_button)}
      </button>
    </div>
  );
};

// Height calculation for this node type
export const getQuickReplyNodeHeight = (node: NodeData): number => {
  const buttonCount = node.data?.buttons?.length || 2;
  const titleHeight = 60; // label + input + margins
  return titleHeight + buttonCount * 35 + 50; // title + buttons + add button
};

// Node container class name for styling the node border
export const quickreplyNodeClassName = styles.nodeContainer;
