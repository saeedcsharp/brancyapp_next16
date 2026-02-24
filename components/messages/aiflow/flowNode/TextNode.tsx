import React from "react";
import { useTranslation } from "react-i18next";
import TextArea from "brancy/components/design/textArea/textArea";
import { LanguageKey } from "brancy/i18n";
import styles from "./TextNode.module.css";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";
export const TextNode: React.FC<BaseNodeProps> = ({ node, updateNodeData }) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const defaultPlaceholder = t(LanguageKey.pageToolspopup_typehere);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      updateNodeData(node.id, { text });
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // وقتی focus می‌شود، اگر متن پیشفرض است، کامل پاک کن
    if (node.data?.text === defaultPlaceholder) {
      updateNodeData(node.id, { text: "" });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // اگر متن خالی است، متن پیشفرض را برگردان
    if (!node.data?.text || node.data.text.trim() === "") {
      updateNodeData(node.id, { text: defaultPlaceholder });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(node.id, { text: e.target.value });
  };

  // مطمئن شویم که در ابتدا اگر خالی است، placeholder قرار بگیرد
  React.useEffect(() => {
    if (!node.data?.text || node.data.text.trim() === "") {
      updateNodeData(node.id, { text: defaultPlaceholder });
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className="headerparent" style={{ paddingInline: "10px" }}>
        <span className="counter">{node.data?.text?.length || 0}/2200</span>
        <img
          style={{ cursor: "pointer", width: "20px", height: "20px" }}
          title="ℹ️ paste"
          role="button"
          src="/copy.svg"
          onClick={(e) => {
            e.stopPropagation();
            handlePaste();
          }}
        />
      </div>
      <div className={styles.textareaWrapper} style={{ height: "150px", minHeight: "150px", maxHeight: "150px" }}>
        <TextArea
          className="captiontextarea"
          placeHolder={defaultPlaceholder}
          maxLength={2200}
          value={node.data?.text === defaultPlaceholder ? "" : node.data?.text || ""}
          handleInputChange={handleChange}
          handleInputonFocus={handleFocus}
          handleInputBlur={handleBlur}
          role="textbox"
          title="Text input"
        />
      </div>
    </div>
  );
};

// Height calculation for this node type
export const getTextNodeHeight = (node: NodeData): number => {
  return 200;
};

// Node container class name for styling the node border
export const textNodeClassName = styles.container;
