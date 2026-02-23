import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n/languageKeys";
import styles from "brancy/components/messages/aiflow/popup/popup.module.css";
interface AIToolParameter {
  name: string;
  description: string;
  type: string;
  isRequired: boolean;
}
interface AITool {
  name: string;
  description: string;
  completeDescription: string;
  tokenUsage: number;
  parameters: AIToolParameter[];
}
interface AIToolsSettingsProps {
  onClose: () => void;
  aiTools: AITool[];
  selectedAITool: AITool | null;
  onAddToPrompt: (text: string) => void;
}

interface CustomFields {
  [key: string]: {
    token?: string;
    message?: string;
    channelname?: string;
  };
}

const AIToolsSettings: React.FC<AIToolsSettingsProps> = ({
  onClose,
  aiTools,
  selectedAITool,
  onAddToPrompt,
}) => {
  const { t } = useTranslation();
  const [customFields, setCustomFields] = useState<CustomFields>({});
  // اضافه کردن آیتم username به لیست ابزارها
  const usernameItem: AITool = {
    name: "{SENDER_USERNAME}",
    description: "Use username in your prompt",
    completeDescription: "Use username in your prompt",
    tokenUsage: 0,
    parameters: [],
  };
  // اگر ابزار خاصی انتخاب شده باشد، فقط آن را نمایش بده
  const toolsToDisplay = selectedAITool
    ? [selectedAITool]
    : [usernameItem, ...aiTools];

  const handleFieldChange = (
    itemName: string,
    fieldName: string,
    value: string
  ) => {
    setCustomFields((prev) => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        [fieldName]: value,
      },
    }));
  };

  const handleAddToPrompt = (item: AITool) => {
    let promptText = item.name;
    const fields = customFields[item.name];

    if (fields) {
      if (item.name === "send_sms_ir_code" && fields.token && fields.message) {
        promptText = `${item.name} token:${fields.token} message:${fields.message}`;
      } else if (
        item.name === "send_to_telegram" &&
        fields.token &&
        fields.channelname
      ) {
        promptText = `${item.name} token:${fields.token} channelname:${fields.channelname}`;
      }
    }

    onAddToPrompt(promptText);
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
              </div>
            ))}

            {/* {item.name === "send_sms_ir_code" && (
              <>
                <div className="headerandinput">
                  <div className="title2">token</div>
                  <InputText
                    className="textinputbox"
                    value={customFields[item.name]?.token || ""}
                    handleInputChange={(e) => handleFieldChange(item.name, "token", e.target.value)}
                    placeHolder="Enter token"
                  />
                </div>
                <div className="headerandinput">
                  <div className="title2">template message</div>
                  <InputText
                    className="textinputbox"
                    value={customFields[item.name]?.message || ""}
                    handleInputChange={(e) => handleFieldChange(item.name, "message", e.target.value)}
                    placeHolder="Enter message"
                  />
                </div>
              </>
            )}

            {item.name === "send_to_telegram" && (
              <>
                <div className="headerandinput">
                  <div className="title2">token</div>
                  <InputText
                    className="textinputbox"
                    value={customFields[item.name]?.token || ""}
                    handleInputChange={(e) => handleFieldChange(item.name, "token", e.target.value)}
                    placeHolder="Enter token"
                  />
                </div>
                <div className="headerandinput">
                  <div className="title2">channel name</div>

                  <InputText
                    className="textinputbox"
                    value={customFields[item.name]?.channelname || ""}
                    handleInputChange={(e) => handleFieldChange(item.name, "channelname", e.target.value)}
                    placeHolder="Enter channel name"
                  />
                </div>
              </>
            )} */}
          </div>

          <div className="ButtonContainer" role="group">
            {/* <button
              className="saveButton"
              onClick={() => handleAddToPrompt(item)}
              aria-label="Save quick reply settings">
              {t(LanguageKey.usethisPrompt)}
            </button> */}
            <button
              className="cancelButton"
              onClick={onClose}
              aria-label="Cancel and close quick reply settings">
              {t(LanguageKey.close)}
            </button>
          </div>
        </React.Fragment>
      ))}
    </>
  );
};
export default AIToolsSettings;
