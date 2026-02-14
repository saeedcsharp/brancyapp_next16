import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import styles from "./OnMessageNode.module.css";
import { BaseNodeProps, NodeData } from "./types";
export const OnMessageNode: React.FC<BaseNodeProps> = ({ node, updateNodeData }) => {
  const { t } = useTranslation();
  return <div className={styles.container}>{t(LanguageKey.New_Flow_input_message_block)}</div>;
};

// Height calculation for this node type
export const getOnMessageNodeHeight = (node: NodeData): number => {
  return 60;
};

// Node container class name for styling the node border
export const onmessageNodeClassName = styles.nodeContainer;
