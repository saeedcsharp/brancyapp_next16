import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import CheckBoxButton from "saeed/components/design/checkBoxButton";
import InputText from "saeed/components/design/inputText";
import RingLoader from "saeed/components/design/loader/ringLoder";
import FlexibleToggleButton from "saeed/components/design/toggleButton/flexibleToggleButton";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
} from "saeed/components/notifications/notificationBox";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import { ITotalMasterFlow } from "saeed/models/messages/properies";
import styles from "./settingmodal.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
interface SettingModalProps {
  masterFlowId: string;
  snapToGridEnabled: boolean;
  setSnapToGridEnabled: (value: boolean) => void;
  showMinimap: boolean;
  setShowMinimap: (value: boolean) => void;
  panningBoundaryEnabled: boolean;
  setPanningBoundaryEnabled: (value: boolean) => void;
  exportFlow: () => void;
  importFlow: () => void;
  deleteAllNodes: () => void;
  editorState: {
    nodes: any[];
    connections: any[];
  };
  lastSaved: Date;
  historyIndex: number;
  history: any[];
  flowTitle: string;
  checkFollower: boolean;
  privateReplyCompability: boolean;
  updateFlow: (masterFlow: ITotalMasterFlow, flowStr: string) => void;
  cancelSave: () => void;
  isAutoSaving?: boolean;
  isValidFlow?: boolean;
  onSaveSuccess?: () => void;
  unsavedChanges?: {
    hasDifference: boolean;
    addedNodes?: Array<{ type: string; label: string; data: any }>;
    removedNodes?: Array<{ type: string; label: string; data: any }>;
    modifiedNodes?: Array<{
      type: string;
      label: string;
      changedProperties: Array<{
        property: string;
        apiValue: any;
        localValue: any;
      }>;
    }>;
  } | null;
}
export const SettingModal: React.FC<SettingModalProps> = ({
  masterFlowId,
  snapToGridEnabled,
  setSnapToGridEnabled,
  showMinimap,
  setShowMinimap,
  panningBoundaryEnabled,
  setPanningBoundaryEnabled,
  exportFlow,
  importFlow,
  deleteAllNodes,
  editorState,
  lastSaved,
  historyIndex,
  history,
  flowTitle,
  checkFollower: checkFollowerInitial,
  privateReplyCompability,
  updateFlow,
  cancelSave,
  isAutoSaving,
  isValidFlow,
  onSaveSuccess,
  unsavedChanges,
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [checkFollower, setCheckFollower] = useState(checkFollowerInitial);
  const [flowTitleState, setFlowTitleState] = useState(flowTitle);
  const [uploading, setUploading] = useState(false);
  const tabOptions = [
    { id: 0, label: t(LanguageKey.product_Properties) },
    { id: 1, label: t(LanguageKey.shortcuts) },
  ];
  const [snapToGridEnabledState, setSnapToGridEnabledState] =
    useState(snapToGridEnabled);
  const [panningBoundaryEnabledState, setPanningBoundaryEnabledState] =
    useState(panningBoundaryEnabled);
  const handleCreateFlow = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    12;
    event.preventDefault();
    setUploading(true);
    try {
      const res = await clientFetchApi<any, ITotalMasterFlow>("/api/flow/CreateMasterFlow", { methodType: MethodType.post, session: session, data: editorState, queries: [
          { key: "checkFollower", value: checkFollower.toString() },
          { key: "title", value: flowTitleState },
          {
            key: "masterFlowId",
            value: masterFlowId !== "newFlow" ? masterFlowId : undefined,
          },
        ], onUploadProgress: undefined });
      if (!res.succeeded) {
        notify(res.info.responseType, NotifType.Warning);
      } else {
        internalNotify(InternalResponseType.Ok, NotifType.Success);
        updateFlow(res.value, JSON.stringify(editorState));
        if (onSaveSuccess) onSaveSuccess();
      }
    } catch (error) {
      // if (!silent) notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {!isAutoSaving && (
        <div className={styles.tabContainer}>
          <FlexibleToggleButton
            options={tabOptions}
            selectedValue={selectedTab}
            onChange={setSelectedTab}
          />
        </div>
      )}
      {selectedTab === 0 && (
        <div className={styles.settingModal}>
          <div className="headerandinput">
            <div className="title">{t(LanguageKey.flowtitle)}</div>
            <InputText
              id="flowtitle"
              name="flowtitle"
              className={"textinputbox"}
              placeHolder={t(LanguageKey.pageToolspopup_typehere)}
              dangerOnEmpty
              handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFlowTitleState(e.target.value);
              }}
              value={flowTitleState}
            />
            <div className="explain">
              <strong>{t(LanguageKey.Last_Auto_saved)}: </strong>
              {new DateObject({
                date: lastSaved,
                calendar: initialzedTime().calendar,
                locale: initialzedTime().locale,
              }).format("YYYY/MM/DD - hh:mm A")}
            </div>
          </div>
          {isAutoSaving && (
            <div
              className="headerandinput"
              style={{ height: "100%", overflowY: "auto" }}>
              <div className="title">
                {t(LanguageKey.New_Flow_unsavedChanges)}
              </div>
              {unsavedChanges && (
                <div
                  className="headerandinput"
                  style={{ marginTop: "10px", alignItems: "flex-start" }}>
                  {unsavedChanges.addedNodes &&
                    unsavedChanges.addedNodes.length > 0 && (
                      <div
                        className="headerandinput"
                        style={{ marginTop: "10px", alignItems: "flex-start" }}>
                        <div className="title2" style={{ marginTop: "10px" }}>
                          {t(LanguageKey.New_Flow_addedNodes)} (
                          {unsavedChanges.addedNodes.length}):
                        </div>
                        <ul style={{ paddingLeft: "20px" }}>
                          {unsavedChanges.addedNodes.map((node, idx) => (
                            <span className="explain" key={idx}>
                              {node.label} ({node.type})
                            </span>
                          ))}
                        </ul>
                      </div>
                    )}

                  {unsavedChanges.removedNodes &&
                    unsavedChanges.removedNodes.length > 0 && (
                      <div
                        className="headerandinput"
                        style={{ marginTop: "10px", alignItems: "flex-start" }}>
                        <div className="title2" style={{ marginTop: "10px" }}>
                          {t(LanguageKey.New_Flow_removedNodes)} (
                          {unsavedChanges.removedNodes.length}):
                        </div>
                        <ul>
                          {unsavedChanges.removedNodes.map((node, idx) => (
                            <span className="explain" key={idx}>
                              {node.label} ({node.type})
                            </span>
                          ))}
                        </ul>
                      </div>
                    )}

                  {unsavedChanges.modifiedNodes &&
                    unsavedChanges.modifiedNodes.length > 0 && (
                      <div
                        className="headerandinput"
                        style={{ marginTop: "10px", alignItems: "flex-start" }}>
                        <div className="title2" style={{ marginTop: "10px" }}>
                          {t(LanguageKey.New_Flow_modifiedNodes)} (
                          {unsavedChanges.modifiedNodes.length})
                        </div>
                        <ul>
                          {unsavedChanges.modifiedNodes.map((node, idx) => {
                            const changedProps = node.changedProperties.filter(
                              (prop) => {
                                const isLocalEmpty =
                                  prop.localValue === undefined ||
                                  prop.localValue === null ||
                                  prop.localValue === "";
                                const isApiEmpty =
                                  prop.apiValue === undefined ||
                                  prop.apiValue === null ||
                                  prop.apiValue === "";
                                if (isLocalEmpty && isApiEmpty) return false;
                                return (
                                  JSON.stringify(prop.apiValue) !==
                                  JSON.stringify(prop.localValue)
                                );
                              },
                            );
                            if (changedProps.length === 0) return null;
                            return (
                              <span className="explain" key={idx}>
                                {node.label} ({node.type})
                              </span>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
          {isValidFlow !== undefined && !isValidFlow && (
            <div className="title2" style={{ marginTop: "10px" }}>
              {t(LanguageKey.New_Flow_invalidFlow_explain)}
            </div>
          )}
          {!isAutoSaving && (
            <div className="headerandinput">
              <div className="headerparent">
                <div className="title2">{t(LanguageKey.shouldFollower)}</div>
                <ToggleCheckBoxButton
                  title="Check Follower"
                  name="checkFollower"
                  role="switch"
                  handleToggle={(e) =>
                    setCheckFollower(e.currentTarget.checked)
                  }
                  checked={checkFollower}
                />
              </div>

              {!privateReplyCompability && (
                <div
                  className="explain"
                  style={{ color: "var(--color-dark-yellow)" }}>
                  {t(LanguageKey.flowProperties_notworking_privateReply)}
                </div>
              )}
            </div>
          )}
          {!isAutoSaving && (
            <>
              <div className="headerandinput">
                <CheckBoxButton
                  value={snapToGridEnabledState}
                  handleToggle={() => {
                    setSnapToGridEnabled(!snapToGridEnabled);
                    setSnapToGridEnabledState(!snapToGridEnabledState);
                  }}
                  textlabel={t(LanguageKey.snapGrid)}
                  name="snapGrid"
                  title={"switch"}
                />
                <CheckBoxButton
                  value={panningBoundaryEnabledState}
                  handleToggle={() => {
                    setPanningBoundaryEnabled(!panningBoundaryEnabled);
                    setPanningBoundaryEnabledState(
                      !panningBoundaryEnabledState,
                    );
                  }}
                  textlabel={t(LanguageKey.PanningBoundary)}
                  name="panningBoundary"
                  title={"switch"}
                />
              </div>
              <div className="headerandinput">
                <div className="title">{t(LanguageKey.Data_Management)}</div>
                <div className="explain">
                  {t(LanguageKey.Data_Management_explain)}
                </div>
                <div className="ButtonContainer">
                  <button className="cancelButton" onClick={exportFlow}>
                    {t(LanguageKey.exportJSON)}
                  </button>
                  <button className="cancelButton" onClick={importFlow}>
                    {t(LanguageKey.importJSON)}
                  </button>
                </div>
              </div>
            </>
          )}
          <div className="headerandinput">
            <div className="ButtonContainer">
              <button
                disabled={
                  isValidFlow !== undefined && !isValidFlow && uploading
                }
                className={`saveButton ${
                  isValidFlow !== undefined && !isValidFlow && "disableButton"
                } `}
                onClick={handleCreateFlow}
                title="Save Changes">
                {uploading ? <RingLoader /> : t(LanguageKey.save)}
              </button>
              {isAutoSaving && (
                <button
                  className={`cancelButton `}
                  onClick={cancelSave}
                  title="cancel Changes">
                  {t(LanguageKey.cancel)}
                </button>
              )}
              {!isAutoSaving && (
                <button
                  className={`stopButton ${
                    showDeleteConfirm ? styles.deleteConfirm : ""
                  }`}
                  onClick={() => {
                    if (showDeleteConfirm) {
                      deleteAllNodes();
                      setShowDeleteConfirm(false);
                    } else {
                      setShowDeleteConfirm(true);
                    }
                  }}
                  title="Clear All">
                  {showDeleteConfirm
                    ? t(LanguageKey.areyousure)
                    : t(LanguageKey.New_Flow_delete_all_blocks)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 1 && (
        <div className={`${styles.settingModal} ${styles.shortcutsTab}`}>
          <div className="headerandinput">
            <div className="title">{t(LanguageKey.shortcuts)}</div>
            <div className="explain">
              {t(LanguageKey.New_Flow_shortcuts_explain)}
            </div>
            <table className={`${styles.shortcutsTable} translate`}>
              <tbody>
                <tr>
                  <td>Undo</td>
                  <td>
                    <span>Ctrl</span> + <span> Z</span>
                  </td>
                </tr>
                <tr>
                  <td>Redo</td>
                  <td>
                    <span>Ctrl</span> + <span>Y</span>
                  </td>
                </tr>
                <tr>
                  <td>Copy</td>
                  <td>
                    <span>Ctrl</span> + <span>C</span>
                  </td>
                </tr>
                <tr>
                  <td>Paste</td>
                  <td>
                    <span>Ctrl</span> + <span>V</span>
                  </td>
                </tr>
                <tr>
                  <td>Duplicate</td>
                  <td>
                    <span>Ctrl</span> + <span>Q</span>
                  </td>
                </tr>
                <tr>
                  <td>Select All</td>
                  <td>
                    <span>Ctrl</span> + <span>E</span>
                  </td>
                </tr>
                <tr>
                  <td>Delete</td>
                  <td>
                    <span>Del</span>
                  </td>
                </tr>
                <tr>
                  <td>Deselect</td>
                  <td>
                    <span>Escape</span>
                  </td>
                </tr>
                <tr>
                  <td>Auto Layout</td>
                  <td>
                    <span>Ctrl</span> + <span>L</span>
                  </td>
                </tr>
                <tr>
                  <td>Reset Zoom</td>
                  <td>
                    <span>Ctrl</span> + <span>0</span>
                  </td>
                </tr>
                <tr>
                  <td>Fit Screen</td>
                  <td>
                    <span>Ctrl</span> + <span>1</span>
                  </td>
                </tr>
                <tr>
                  <td>Snap Grid</td>
                  <td>
                    <span>Ctrl</span> + <span>G</span>
                  </td>
                </tr>
                <tr>
                  <td>Panning Boundary</td>
                  <td>
                    <span>Ctrl</span> + <span>B</span>
                  </td>
                </tr>
                <tr>
                  <td>Multi Select</td>
                  <td>
                    <span>Ctrl</span> + <span>Click</span>
                  </td>
                </tr>
                <tr>
                  <td>Box Multi Select</td>
                  <td>
                    <span>Shift</span> + <span>Drag</span>
                  </td>
                </tr>
                <tr>
                  <td>Menu</td>
                  <td>
                    <span>Right Click</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
