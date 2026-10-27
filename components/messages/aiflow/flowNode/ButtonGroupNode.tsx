import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import InputBox from "brancy/components/design/inputBox/inputBox";
import TextArea from "brancy/components/design/textArea/textArea";
import { LanguageKey } from "brancy/i18n";
import styles from "./ButtonGroupNode.module.css";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";

export const BUTTON_GROUP_MAX_BUTTONS = 3;
export const BUTTON_GROUP_MAX_TITLE_LENGTH = 640;
const BUTTON_MAX_LENGTH = 20;

const truncateTitle = (value: string) => Array.from(value).slice(0, BUTTON_GROUP_MAX_TITLE_LENGTH).join("");

interface ButtonGroupNodeProps extends BaseNodeProps {
  setEditorState: React.Dispatch<React.SetStateAction<any>>;
  updateStateWithHistory: (updater: (prev: any) => any) => void;
}

export const ButtonGroupNode: React.FC<ButtonGroupNodeProps> = ({
  node,
  updateNodeData,
  setEditorState,
  updateStateWithHistory,
}) => {
  const { t } = useTranslation();
  const defaultTitlePlaceholder = t(LanguageKey.New_Flow_buttongroup_title_placeholder);
  const title = node.data?.title === defaultTitlePlaceholder ? "" : node.data?.title || "";
  const buttonCount = node.data?.buttons?.length || 0;

  const addOutputToNode = useCallback(() => {
    updateStateWithHistory((prev: any) => {
      const currentNode = prev.nodes.find((n: any) => n.id === node.id);
      if (!currentNode) return prev;

      const outputCount = (currentNode.buttonOutputs || []).length;
      if (outputCount >= BUTTON_GROUP_MAX_BUTTONS) return prev;
      const usedIds = new Set((currentNode.buttonOutputs || []).map((o: any) => o.id));
      let nextNumber = outputCount + 1;
      while (usedIds.has(`output${nextNumber}`)) nextNumber++;
      const newOutputId = `output${nextNumber}`;

      return {
        ...prev,
        nodes: prev.nodes.map((n: any) => {
          if (n.id !== node.id) return n;
          return {
            ...n,
            buttonOutputs: [
              ...(n.buttonOutputs || []),
              { id: newOutputId, type: "output" as const, label: `Button ${outputCount + 1}` },
            ],
            data: {
              ...n.data,
              buttons: [...(n.data?.buttons || []), `Button ${outputCount + 1}`],
            },
          };
        }),
      };
    });
  }, [node.id, updateStateWithHistory]);

  const removeOutputFromNode = useCallback(
    (outputId: string) => {
      updateStateWithHistory((prev: any) => {
        const currentNode = prev.nodes.find((n: any) => n.id === node.id);
        if (!currentNode) return prev;

        // Removing the last button deletes the whole node, same as quick reply
        if ((currentNode.buttonOutputs || []).length === 1) {
          return {
            ...prev,
            nodes: prev.nodes.filter((n: any) => n.id !== node.id),
            connections: prev.connections.filter((c: any) => c.sourceNodeId !== node.id && c.targetNodeId !== node.id),
          };
        }

        return {
          ...prev,
          nodes: prev.nodes.map((n: any) => {
            if (n.id !== node.id) return n;
            const outputIndex = (n.buttonOutputs || []).findIndex((o: any) => o.id === outputId);
            if (outputIndex === -1) return n;
            const newButtons = [...(n.data?.buttons || [])];
            newButtons.splice(outputIndex, 1);
            return {
              ...n,
              buttonOutputs: (n.buttonOutputs || []).filter((o: any) => o.id !== outputId),
              data: { ...n.data, buttons: newButtons },
            };
          }),
          connections: prev.connections.filter(
            (c: any) => !(c.sourceNodeId === node.id && c.sourceSocketId === outputId),
          ),
        };
      });
    },
    [node.id, updateStateWithHistory],
  );

  React.useEffect(() => {
    if (!node.data?.title || node.data.title === "") {
      updateNodeData(node.id, { title: defaultTitlePlaceholder });
    } else if (Array.from(node.data.title as string).length > BUTTON_GROUP_MAX_TITLE_LENGTH) {
      updateNodeData(node.id, { title: truncateTitle(node.data.title) });
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <div className="headerparent" style={{ paddingInline: "10px" }}>
          <span className="counter">
            {Array.from(title).length}/{BUTTON_GROUP_MAX_TITLE_LENGTH}
          </span>
        </div>
        <div className={styles.textareaWrapper} onClick={(e) => e.stopPropagation()}>
          <TextArea
            className="TextArea"
            placeHolder={defaultTitlePlaceholder}
            value={title}
            handleInputChange={(e) => {
              updateNodeData(node.id, { title: truncateTitle(e.target.value) });
            }}
            handleInputonFocus={() => {
              if (node.data?.title === defaultTitlePlaceholder) {
                updateNodeData(node.id, { title: "" });
              }
            }}
            handleInputBlur={() => {
              if (!node.data?.title || node.data.title.trim() === "") {
                updateNodeData(node.id, { title: defaultTitlePlaceholder });
              }
            }}
            role="textbox"
            title="Button group title"
          />
        </div>
      </div>

      {node.data?.buttons?.map((btn: string, idx: number) => (
        <div key={idx} className={styles.buttonItem}>
          <div className={styles.inputTextparent} onClick={(e) => e.stopPropagation()}>
            <InputBox
              value={btn}
              maxLength={BUTTON_MAX_LENGTH}
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
              if (outputId) removeOutputFromNode(outputId);
            }}
            role="button"
            className={styles.deleteIcon}
            title="ℹ️ delete Button"
            src="/delete-red.svg"
          />
        </div>
      ))}
      {buttonCount < BUTTON_GROUP_MAX_BUTTONS && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            addOutputToNode();
          }}
          className="saveButton">
          <strong>+ </strong> {t(LanguageKey.New_Flow_add_button)}
        </button>
      )}
    </div>
  );
};

export const getButtonGroupNodeHeight = (node: NodeData): number => {
  const buttonCount = node.data?.buttons?.length || 2;
  const titleHeight = 165; // counter + textarea + margins
  const addButtonHeight = buttonCount < BUTTON_GROUP_MAX_BUTTONS ? 50 : 0;
  return titleHeight + buttonCount * 35 + addButtonHeight;
};

export const buttongroupNodeClassName = styles.nodeContainer;
