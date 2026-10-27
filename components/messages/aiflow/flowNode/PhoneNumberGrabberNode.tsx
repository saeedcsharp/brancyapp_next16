import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n/languageKeys";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";
import styles from "./PhoneNumberGrabberNode.module.css";

export const PhoneNumberGrabberNode: React.FC<BaseNodeProps> = () => {
  const { t } = useTranslation();
  return <div className={styles.container}>{t(LanguageKey.New_Flow_Tutorials_phonenumbergrabber_description)}</div>;
};

export const getPhoneNumberGrabberNodeHeight = (node: NodeData): number => 80;

export const phonenumbergrabberNodeClassName = styles.nodeContainer;
