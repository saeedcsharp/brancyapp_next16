import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n/languageKeys";
import TextArea from "brancy/components/design/textArea/textArea";
import { ToolType } from "brancy/models/enums";
import { ITool } from "brancy/models/interfaces";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import styles from "./AIToolsSettings.module.css";
import { AIToolParameter } from "brancy/models/interfaces";
interface AITool {
  name: string;
  description: string;
  completeDescription: string;
  completeDescriptionEn: string;
  completeDescriptionRu: string;
  completeDescriptionFa: string;
  completeDescriptionDe: string;
  completeDescriptionTr: string;
  completeDescriptionAz: string;
  completeDescriptionAr: string;
  completeDescriptionFr: string;
  displayNameEn: string;
  displayNameFa: string;
  displayNameRu: string;
  displayNameDe: string;
  displayNameTr: string;
  displayNameAz: string;
  displayNameAr: string;
  displayNameFr: string;
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
  existingTools?: ITool[];
  paramValues: ParamValues;
  setParamValues: React.Dispatch<React.SetStateAction<ParamValues>>;
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
  existingTools = [],
  paramValues,
  setParamValues,
}) => {
  const { t, i18n } = useTranslation();
  const buildParamValues = (tools: ITool[], allAITools: AITool[]): ParamValues => {
    const initial: ParamValues = {};
    tools.forEach((existingTool) => {
      const matchingTool = allAITools.find((t) => String(t.toolType) === existingTool.toolId);
      const key = matchingTool ? matchingTool.name : existingTool.toolId;
      initial[key] = {};
      existingTool.parameters.forEach((p) => {
        initial[key][p.name] = p.value;
      });
    });
    return initial;
  };
  useEffect(() => {
    setParamValues((prev) => {
      const merged = { ...prev };
      const incoming = buildParamValues(existingTools, aiTools);
      Object.entries(incoming).forEach(([toolName, params]) => {
        merged[toolName] = { ...(merged[toolName] ?? {}), ...params };
      });
      return merged;
    });
  }, [existingTools]);
  // افزودن placeholder نام کاربری فرستنده به پرامپت
  const usernameItem: AITool = {
    name: "SENDER_USERNAME",
    description: "Use username in your prompt",
    completeDescription: "Use username in your prompt",
    completeDescriptionEn: "",
    completeDescriptionRu: "",
    completeDescriptionFa: "",
    completeDescriptionDe: "",
    completeDescriptionTr: "",
    completeDescriptionAz: "",
    completeDescriptionAr: "",
    completeDescriptionFr: "",
    displayNameEn: "",
    displayNameFa: "",
    displayNameRu: "",
    displayNameDe: "",
    displayNameTr: "",
    displayNameAz: "",
    displayNameAr: "",
    displayNameFr: "",
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

  const handlePasteFromMemory = async (toolName: string, paramName: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const current = paramValues[toolName]?.[paramName] ?? "";
        handleParamChange(toolName, paramName, current + text);
      } else {
        // fallback: do nothing or you could prompt the user
        console.warn("Clipboard API not available");
      }
    } catch (e) {
      console.error("Failed to read clipboard:", e);
    }
  };
  const isAddToolEnabled = (item: AITool): boolean => {
    const requiredManualParams = item.parameters.filter((p) => p.isRequired && !p.generateWithAI);
    if (requiredManualParams.length === 0) return true;
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
    onAddToPrompt(`[${item.name}]`);
    onClose();
  };

  const overrideContentMap: Record<
    string,
    {
      description: string;
      completeDescription: string;
      howWork: string;
      howUse: string;
    }
  > = {
    send_sms_ir_code: {
      description: LanguageKey.send_sms_ir_code_description,
      completeDescription: LanguageKey.send_sms_ir_code_completeDescription,
      howUse: LanguageKey.send_sms_ir_code_howUse,
      howWork: LanguageKey.send_sms_ir_code_howWork,
    },

    send_to_telegram: {
      description: LanguageKey.send_to_telegram_description,
      completeDescription: LanguageKey.send_to_telegram_completeDescription,
      howUse: LanguageKey.send_to_telegram_howUse,
      howWork: LanguageKey.send_to_telegram_howWork,
    },

    SENDER_USERNAME: {
      description: LanguageKey.sender_username_description,
      completeDescription: LanguageKey.sender_username_completeDescription,
      howUse: LanguageKey.sender_username_howUse,
      howWork: LanguageKey.sender_username_howWork,
    },
  };

  // 👇 مهم: اینجا t() اضافه شد
  const getDisplayName = (item: AITool) => {
    if (item.name === "SENDER_USERNAME") return t(LanguageKey.senderusername);

    const language = (i18n.language ?? "en").split("-")[0].toLowerCase();
    const displayNames: Record<string, string> = {
      en: item.displayNameEn,
      ru: item.displayNameRu,
      fa: item.displayNameFa,
      de: item.displayNameDe,
      gr: item.displayNameDe,
      tr: item.displayNameTr,
      az: item.displayNameAz,
      ar: item.displayNameAr,
      fr: item.displayNameFr,
    };

    return displayNames[language] || item.displayNameEn || item.name;
  };

  const getDescription = (item: any) => {
    const key = overrideContentMap[item.name]?.description ?? item.description;

    return t(key);
  };

  const getCompleteDescription = (item: any) => {
    if (item.name === "SENDER_USERNAME") {
      return t(overrideContentMap[item.name].completeDescription);
    }

    const language = (i18n.language ?? "en").split("-")[0].toLowerCase();
    const descriptions: Record<string, string> = {
      en: item.completeDescriptionEn,
      ru: item.completeDescriptionRu,
      fa: item.completeDescriptionFa,
      de: item.completeDescriptionDe,
      gr: item.completeDescriptionDe,
      tr: item.completeDescriptionTr,
      az: item.completeDescriptionAz,
      ar: item.completeDescriptionAr,
      fr: item.completeDescriptionFr,
    };

    return descriptions[language] || item.completeDescriptionEn || item.completeDescription;
  };

  const getHowWork = (item: any) => {
    const key = overrideContentMap[item.name]?.howWork ?? item.howWork;

    return t(key);
  };

  const getHowUse = (item: any) => {
    const key = overrideContentMap[item.name]?.howUse ?? item.howUse;

    return t(key);
  };

  const getParameterDescription = (parameter: AIToolParameter): string => {
    const language = (i18n.language ?? "en").split("-")[0].toLowerCase();
    const descriptions: Record<string, string> = {
      en: parameter.completeDescriptionEn,
      ru: parameter.completeDescriptionRu,
      fa: parameter.completeDescriptionFa,
      gr: parameter.completeDescriptionDe,
      tr: parameter.completeDescriptionTr,
      az: parameter.completeDescriptionAz,
      ar: parameter.completeDescriptionAr,
      fr: parameter.completeDescriptionFr,
    };

    return descriptions[language] || parameter.completeDescriptionEn || parameter.description;
  };
  return (
    <>
      {toolsToDisplay.map((item, index) => (
        <React.Fragment key={index}>
          <div className="headerandinput">
            <div className="title"> {getDisplayName(item)}</div>
            {/* <div className="explain" style={{ whiteSpace: "pre-line" }}>
              {getDescription(item)}
            </div> */}
          </div>
          <div className={styles.container}>
            <div className="explain" style={{ whiteSpace: "pre-line" }}>
              {getCompleteDescription(item)}
            </div>
            {item.parameters.length > 0 ? (
              item.parameters
                .filter((des) => !des.generateWithAI)
                .map((des, i) => (
                  <div key={i} className="headerandinput">
                    <div className="headerparent">
                      <div className="title2">{des.name}</div>
                      <img
                        title="ℹ️ paste"
                        src="/copy.svg"
                        onClick={() => handlePasteFromMemory(item.name, des.name)}
                        style={{ cursor: "pointer", width: "16px", height: "16px" }}></img>
                    </div>
                    {des.isRequired && (
                      <>
                        <TextArea
                          className="TextArea"
                          role="textbox"
                          title={des.name}
                          placeHolder={getParameterDescription(des)}
                          style={{ maxHeight: "80px" }}
                          value={paramValues[item.name]?.[des.name] ?? ""}
                          handleInputChange={(e) => handleParamChange(item.name, des.name, e.target.value)}
                          required
                          dangerOnEmpty
                        />
                      </>
                    )}
                  </div>
                ))
            ) : (
              <></>
            )}
            <div className="headerparent">
              <div className="title2">
                {t(LanguageKey.TokenUsage)}
                <Tooltip
                  triggerType="tooltip"
                  position="bottom"
                  onHover
                  tooltipValue={t(LanguageKey.tool_token_usage_guide)}
                />
              </div>
              <div className="IDblue" style={{ fontSize: "var(--font-14)" }}>
                {item.tokenUsage}
              </div>
            </div>
          </div>

          <div className="ButtonContainer" role="group">
            {item.name === "SENDER_USERNAME" ? (
              <button className="saveButton" onClick={() => handleAddToPrompt(item)} aria-label="Add sender username">
                {t(LanguageKey.usethisPrompt)}
              </button>
            ) : (
              (item.parameters.length === 0 || item.parameters.some((p) => p.isRequired && !p.generateWithAI)) && (
                <button
                  className={`saveButton ${!isAddToolEnabled(item) ? "fadeDiv" : ""}`}
                  onClick={() => handleAddTool(item)}
                  disabled={!isAddToolEnabled(item)}
                  aria-label="Add tool">
                  {t(LanguageKey.addtools)}
                </button>
              )
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
