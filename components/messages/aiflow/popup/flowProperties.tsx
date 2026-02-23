import React from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import ToggleCheckBoxButton from "brancy/components/design/toggleCheckBoxButton";
import { LanguageKey } from "brancy/i18n";

interface FlowPropertiesProps {
  isOpen: boolean;
  onClose: () => void;
  titleFlow: string;
  setTitleFlow: (value: string) => void;
  checkFollower: boolean;
  setCheckFollower: (value: boolean) => void;
  privateReplyCompability: boolean;
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (value: boolean) => void;
  restrictorEnabled: boolean;
  setRestrictorEnabled: (value: boolean) => void;
  snapGridEnabled: boolean;
  setSnapGridEnabled: (value: boolean) => void;
  panBoundaryEnabled: boolean;
  setPanBoundaryEnabled: (value: boolean) => void;
  isLoading: boolean;
  outputCount: number;
  imageCount: number;
  voiceCount: number;
  quickReplyCount: number;
  weblinkCount: number;
  genericCount: number;
  onRemoveAllNodes: () => Promise<void>;
  onConfirmPopup: (message: string) => Promise<boolean>;
  onSave: () => void;
  isNewFlow?: boolean;
}

export default function FlowProperties({
  isOpen,
  onClose,
  titleFlow,
  setTitleFlow,
  checkFollower,
  setCheckFollower,
  privateReplyCompability,
  autoSaveEnabled,
  setAutoSaveEnabled,
  restrictorEnabled,
  setRestrictorEnabled,
  snapGridEnabled,
  setSnapGridEnabled,
  panBoundaryEnabled,
  setPanBoundaryEnabled,
  isLoading,
  outputCount,
  imageCount,
  voiceCount,
  quickReplyCount,
  weblinkCount,
  genericCount,
  onRemoveAllNodes,
  onConfirmPopup,
  onSave,
  isNewFlow = false,
}: FlowPropertiesProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const hasBlocks = outputCount + imageCount + voiceCount + quickReplyCount + weblinkCount + genericCount > 0;

  return (
    <>
      <div className="dialogBg" onClick={onClose} />
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <h3 className="title">{t(LanguageKey.product_Properties)}</h3>
        <div className="headerandinput">
          <div className="headertext">{t(LanguageKey.flowtitle)}</div>
          <InputText
            className={"textinputbox"}
            handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitleFlow(e.target.value)}
            value={titleFlow}
            placeHolder={t(LanguageKey.pageToolspopup_typehere)}
            dangerOnEmpty
          />
          <div className="headerparent" style={{ marginBlock: "var(--gap-10)" }}>
            <div className="title2">{t(LanguageKey.shouldFollower)}</div>
            <ToggleCheckBoxButton
              handleToggle={(e: React.ChangeEvent<HTMLInputElement>) => setCheckFollower(e.target.checked)}
              checked={checkFollower}
              title="Check Follower"
              name="checkFollower"
              role="switch"
            />
          </div>
          {!checkFollower && !privateReplyCompability && (
            <div className="explain" style={{ color: "var(--color-dark-yellow)" }}>
              {t(LanguageKey.flowProperties_notworking_privateReply)}
            </div>
          )}
        </div>
        <div className="popup-content">
          {!isNewFlow && (
            <div className="headerandinput" style={{ gap: "var(--gap-20)" }}>
              <div className="title">{t(LanguageKey.AdvanceSettings)}</div>
              <div className="headerparent">
                <div className="title2">{t(LanguageKey.autosave)} (30s)</div>
                <ToggleCheckBoxButton
                  handleToggle={(e: React.ChangeEvent<HTMLInputElement>) => setAutoSaveEnabled(e.target.checked)}
                  checked={autoSaveEnabled}
                  title="Auto Save (30s)"
                  name="autosave "
                  role="switch"
                />
              </div>

              <div className="headerparent">
                <div className="title2">{t(LanguageKey.Restrictorzoom)}</div>
                <ToggleCheckBoxButton
                  handleToggle={(e: React.ChangeEvent<HTMLInputElement>) => setRestrictorEnabled(e.target.checked)}
                  checked={restrictorEnabled}
                  title="Restrictor"
                  name="restrictor"
                  role="switch"
                />
              </div>

              <div className="headerparent">
                <div className="title2">{t(LanguageKey.snapGrid)}</div>
                <ToggleCheckBoxButton
                  handleToggle={(e: React.ChangeEvent<HTMLInputElement>) => setSnapGridEnabled(e.target.checked)}
                  checked={snapGridEnabled}
                  title="Snap Grid"
                  name="snapGrid"
                  role="switch"
                />
              </div>

              <div className="headerparent">
                <div className="title2">{t(LanguageKey.PanningBoundary)}</div>
                <ToggleCheckBoxButton
                  handleToggle={(e: React.ChangeEvent<HTMLInputElement>) => setPanBoundaryEnabled(e.target.checked)}
                  checked={panBoundaryEnabled}
                  title="Panning Boundary"
                  name="panBoundary"
                  role="switch"
                />
              </div>
            </div>
          )}

          {!isNewFlow && (
            <button
              onClick={async () => {
                const ok = await onConfirmPopup(t(LanguageKey.AIFlow_Deleteallblocks_alert));
                if (ok) await onRemoveAllNodes();
              }}
              disabled={isLoading || !hasBlocks}
              className="stopButton">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="aiflow-btn-svg" viewBox="0 0 24 24">
                <path
                  opacity=".3"
                  d="M19.6 15.7q0 1.8-.3 3-.1 1.2-.7 2t-1.4 1.4q-1 .6-2.1.6H8.9q-1.2 0-2-.6t-1.5-1.3q-.6-.9-.7-2.1-.2-1.2-.3-3l-.7-11h16.6z"
                  fill="var(--color-dark-red)"
                />
                <path
                  d="M9.5 18a1 1 0 0 1-.7-.8v-6a.8.8 0 0 1 1.4 0v6q0 .7-.7.8M14.5 10.5q.7 0 .8.7v6a.7.7 0 1 1-1.6 0v-6q.1-.6.8-.7M13.3 1.3a3 3 0 0 1 1.6.5l.8 1 .6 1 .4 1H21a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h4.4l.4-.8.5-1.2.8-1a3 3 0 0 1 1.6-.5h2.6M9.6 4.8h4.9l-.5-1a1 1 0 0 0-.8-.5h-2.3a1 1 0 0 0-.8.5z"
                  fill="var(--color-dark-red)"
                />
              </svg>
              {t(LanguageKey.AIFlow_delete_all_blocks)}
            </button>
          )}
        </div>
        <div className="ButtonContainer">
          <button
            onClick={onSave}
            disabled={isLoading || (!isNewFlow && !hasBlocks) || (isNewFlow && !titleFlow.trim())}
            className={isNewFlow && !titleFlow.trim() ? "disableButton" : "saveButton"}>
            {isNewFlow ? t(LanguageKey.start) : t(LanguageKey.save)}
          </button>

          <button className="cancelButton" onClick={onClose}>
            {isNewFlow ? t(LanguageKey.cancel) : t(LanguageKey.close)}
          </button>
        </div>
      </div>
    </>
  );
}
