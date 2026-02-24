import React, { useState } from "react";
import { AIButton } from "brancy/components/design/ai/AIButton";
import AiPrompt from "brancy/components/design/ai/aiPrompt";
import styles from "./aiPrompt.module.css";

interface AIWithPromptProps {
  aiLoading: boolean;
  handleAIPromptSubmit: (prompt: string) => void;
  tags: string[];
  buttonProps?: Omit<React.ComponentProps<typeof AIButton>, "onClick" | "loading">;
}

export default function AIWithPrompt({ aiLoading, handleAIPromptSubmit, buttonProps, tags }: AIWithPromptProps) {
  const [showAIInput, setShowAIInput] = useState(false);

  const handleAIIconClick = () => {
    setShowAIInput(!showAIInput);
  };

  const handleClosePrompt = () => {
    setShowAIInput(false);
  };

  const handleSubmit = (prompt: string) => {
    handleAIPromptSubmit(prompt);
    setShowAIInput(false); // Close popup after submit
  };

  return (
    <div className={styles.aiPromptContainer}>
      <AIButton {...buttonProps} onClick={handleAIIconClick} loading={aiLoading} />
      {showAIInput && (
        <AiPrompt aiLoading={aiLoading} handleAIPromptSubmit={handleSubmit} onClose={handleClosePrompt} tags={tags} />
      )}
    </div>
  );
}

// مدل کاری به صورت فقط دکمه

//   <AIButton
//   onClick={handleAIButtonClick}
//   loading={apiLoading}
//   title="AI Caption Generator"
//   ariaLabel="AI Caption Generator"
//   />

// مدل کاری به صورت دکمه و ورودی
//   <AIWithPrompt aiLoading={aiLoading} handleAIPromptSubmit={handleAIPromptSubmit} />
