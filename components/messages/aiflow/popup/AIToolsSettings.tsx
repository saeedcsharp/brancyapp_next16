import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n/languageKeys";
import TextArea from "brancy/components/design/textArea/textArea";
import { ITool } from "brancy/models/AI/prompt";
import { ToolType } from "brancy/models/AI/enum";
import styles from "./popup.module.css";
interface AIToolParameter {
  name: string;
  description: string;
  type: string;
  isRequired: boolean;
  generateWithAI: boolean;
}
interface AITool {
  name: string;
  description: string;
  completeDescription: string;
  tokenUsage: number;
  parameters: AIToolParameter[];
  toolType: ToolType;
}
interface AIToolsSettingsProps {
  onClose: () => void;
  aiTools: AITool[];
  selectedAITool: AITool | null;
  onAddToPrompt: (text: string) => void;
  onAddTool: (tool: ITool) => void;
}

interface ParamValues {
  [toolName: string]: {
    [paramName: string]: string;
  };
}

const AIToolsSettings: React.FC<AIToolsSettingsProps> = ({
  onClose,
  aiTools,
  selectedAITool,
  onAddToPrompt,
  onAddTool,
}) => {
  const { t } = useTranslation();
  const [paramValues, setParamValues] = useState<ParamValues>({});
  // اضافه کردن آیتم username به لیست ابزارها
  const usernameItem: AITool = {
    name: "{SENDER_USERNAME}",
    description: "Use username in your prompt",
    completeDescription: "Use username in your prompt",
    tokenUsage: 0,
    parameters: [],
    toolType: ToolType.SendTelegramMessage,
  };
  // اگر ابزار خاصی انتخاب شده باشد، فقط آن را نمایش بده
  const toolsToDisplay = selectedAITool ? [selectedAITool] : [usernameItem, ...aiTools];

  const handleParamChange = (toolName: string, paramName: string, value: string) => {
    setParamValues((prev) => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        [paramName]: value,
      },
    }));
  };

  const isAddToolEnabled = (item: AITool): boolean => {
    const requiredManualParams = item.parameters.filter((p) => p.isRequired && !p.generateWithAI);
    if (requiredManualParams.length === 0) return false;
    return requiredManualParams.every((p) => {
      const val = paramValues[item.name]?.[p.name];
      return val && val.trim().length > 0;
    });
  };

  const handleAddTool = (item: AITool) => {
    const requiredManualParams = item.parameters.filter((p) => p.isRequired && !p.generateWithAI);
    const tool: ITool = {
      toolId: String(item.toolType),
      parameters: requiredManualParams.map((p) => ({
        name: p.name,
        value: paramValues[item.name]?.[p.name] ?? "",
      })),
    };
    onAddTool(tool);
    onClose();
  };

  const handleAddToPrompt = (item: AITool) => {
    onAddToPrompt(item.name);
    onClose();
  };

  const getDisplayName = (name: string) => {
    switch (name) {
      case "send_sms_ir_code":
        return t(LanguageKey.sendsms);
      case "send_to_telegram":
        return t(LanguageKey.sendtotelegram);
      case "{SENDER_USERNAME}":
        return t(LanguageKey.senderusername);
      default:
        return name;
    }
  };

  return (
    <>
      {toolsToDisplay.map((item, index) => (
        <React.Fragment key={index}>
          <div className="title"> {getDisplayName(item.name)}</div>
          <div className={styles.container}>
            <div className="headerandinput">
              <div className="title2">Description</div>
              <div className="explain">{item.description}</div>
              <div className="explain">{item.completeDescription}</div>
            </div>
            <div className="headerandinput">
              <div className="title2">token Usage</div>
              <div className="explain">{item.tokenUsage}</div>
            </div>
            {item.parameters.map((des, i) => (
              <div key={i} className="headerandinput">
                <div className="title2">{des.name}</div>
                <div className="explain">{des.description}</div>
                {des.isRequired && !des.generateWithAI && (
                  <TextArea
                    role="textbox"
                    title={des.name}
                    className="captiontextarea"
                    value={paramValues[item.name]?.[des.name] ?? ""}
                    handleInputChange={(e) => handleParamChange(item.name, des.name, e.target.value)}
                    required
                  />
                )}
              </div>
            ))}
          </div>

          <div className="ButtonContainer" role="group">
            {item.parameters.some((p) => p.isRequired && !p.generateWithAI) && (
              <button
                className={`saveButton ${!isAddToolEnabled(item) ? "fadeDiv" : ""}`}
                onClick={() => handleAddTool(item)}
                disabled={!isAddToolEnabled(item)}
                aria-label="Add tool">
                {t(LanguageKey.addtools)}
              </button>
            )}
            <button className="cancelButton" onClick={onClose} aria-label="Cancel and close quick reply settings">
              {t(LanguageKey.close)}
            </button>
          </div>
        </React.Fragment>
      ))}
    </>
  );
};
export default AIToolsSettings;
