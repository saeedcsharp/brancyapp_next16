// #region
import { useSession } from "next-auth/react";
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import RingLoader from "brancy/components/design/loader/ringLoder";
import ToggleCheckBoxButton from "brancy/components/design/switchButton/switchButton";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import styles from "./persistent_icebreaker.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { IceOrPersistent, PartnerRole, SpecialPayLoad, PayloadType } from "brancy/models/enums";
import { IIceBreaker, IDetailPrompt } from "brancy/models/interfaces";
const PersistentMenu = React.memo(
  ({
    updateLoading,
    persiatantMenus,
    handleDeletePrompt,
    handleActivePersistentMenu: originalHandleActivePersistentMenu,
    handleShowSpecialPayLoad,
  }: {
    updateLoading: boolean;
    persiatantMenus: IIceBreaker;
    handleDeletePrompt: (id: number) => void;
    handleActivePersistentMenu: (e: ChangeEvent<HTMLInputElement>) => void;
    handleShowSpecialPayLoad: (type: IceOrPersistent) => void;
  }) => {
    const { data: session } = useSession();
    const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.Message));
    const { t } = useTranslation();
    const [isHidden, setIsHidden] = useState(false);
    const [explanationsVisible, setExplanationsVisible] = useState<boolean[]>([]);
    const [isFading, setIsFading] = useState(false);
    const [promptLoading, setPromptLoading] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<IDetailPrompt[]>([]);
    const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const toggleExplanation = (index: number) => {
      setExplanationsVisible((prev) => {
        const newState = Array(prev.length).fill(false);
        if (!prev[index]) {
          newState[index] = true;
        }
        return newState;
      });
    };
    const toggleExplanationForAI = async (index: number, promptId: string | null) => {
      if (!promptId) return;
      try {
        setPromptLoading(true);
        setExplanationsVisible((prev) => {
          const newState = Array(prev.length).fill(false);
          if (!prev[index]) {
            newState[index] = true;
          }
          return newState;
        });
        if (selectedPrompt.find((p) => p.promptId === promptId)) return;
        const res = await clientFetchApi<boolean, IDetailPrompt>(`/api/ai/GetPrompt`, {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [{ key: "promptId", value: promptId }],
          onUploadProgress: undefined,
        });
        if (res.succeeded) setSelectedPrompt((prev) => [...prev, res.value]);
        else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setPromptLoading(false);
      }
    };
    const handleCircleClick = useCallback(() => {
      setIsHidden((prev) => !prev);
    }, []);
    const specialPayloadTextMap = {
      [SpecialPayLoad.CreateTicket]: {
        title: t(LanguageKey.messagesetting_Createanewsupportticket),
        explain: t(LanguageKey.messagesetting_CreateanewsupportticketExplain),
      },
      [SpecialPayLoad.ChangeLanguage]: {
        title: t(LanguageKey.messagesetting_Changeapplicationlanguage),
        explain: t(LanguageKey.messagesetting_ChangeapplicationlanguageExplain),
      },
      [SpecialPayLoad.ViewShop]: {
        title: t(LanguageKey.messagesetting_ViewStoreandproducts),
        explain: t(LanguageKey.messagesetting_ViewStoreandproductsExplain),
      },
      [SpecialPayLoad.ViewWebsite]: {
        title: t(LanguageKey.messagesetting_Visityourwebsite),
        explain: t(LanguageKey.messagesetting_VisityourwebsiteExplain),
      },
      [SpecialPayLoad.ViewRole]: {
        title: t(LanguageKey.messagesetting_Viewuserrolesandpermissions),
        explain: t(LanguageKey.messagesetting_ViewuserrolesandpermissionsExplain),
      },
      [SpecialPayLoad.ViewBusinessTime]: {
        title: t(LanguageKey.messagesetting_Viewbusinesshourschart),
        explain: t(LanguageKey.messagesetting_ViewbusinesshourschartExplain),
      },
      [SpecialPayLoad.ViewPrice]: {
        title: t(LanguageKey.messagesetting_Viewpricinginformation),
        explain: t(LanguageKey.messagesetting_ViewpricinginformationExplain),
      },
      [SpecialPayLoad.SearchProduct]: {
        title: t(LanguageKey.messagesetting_Searchforproducts),
        explain: t(LanguageKey.messagesetting_SearchforproductsExplain),
      },
    };
    const handleActivePersistentMenu = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        originalHandleActivePersistentMenu(e);
        setIsFading(true);
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }
        fadeTimeoutRef.current = setTimeout(() => {
          setIsFading(false);
          fadeTimeoutRef.current = null;
        }, 3000);
      },
      [originalHandleActivePersistentMenu],
    );
    useEffect(() => {
      return () => {
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }
      };
    }, []);
    useEffect(() => {
      if (persiatantMenus && persiatantMenus.profileButtons) {
        setExplanationsVisible(Array(persiatantMenus.profileButtons.items.length).fill(false));
        setLoadingStaus(false);
      }
    }, [persiatantMenus]);
    return (
      // #endregion
      <>
        <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
          <div className="headerChild" onClick={handleCircleClick}>
            <div className="circle"></div>
            <div className="Title">{t(LanguageKey.messagesetting_PersistentMenu)}</div>
          </div>
          <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
            <div className="headerparent">
              <div className="title">
                {t(LanguageKey.activate)}
                <Tooltip
                  triggerType="tooltip"
                  onClick={true}
                  position="bottom"
                  tooltipValue={
                    <div>
                      <div className="headerparent" style={{ marginBottom: "10px" }}>
                        {t(LanguageKey.messagesetting_PersistentMenu)}
                      </div>
                      <img
                        style={{ borderRadius: "var(--br10)", width: "100%" }}
                        loading="lazy"
                        decoding="async"
                        title="ℹ️ Persistent Menu"
                        src="/Persistent-Menu.png"
                      />
                    </div>
                  }></Tooltip>
              </div>
              <div className={isFading ? "fadeDiv" : ""}>
                <ToggleCheckBoxButton
                  handleToggle={handleActivePersistentMenu}
                  checked={persiatantMenus.isActive}
                  name="Persistent Menu"
                  title={"Persistent Menu"}
                  role={"switch"}
                />
              </div>
            </div>
            <div className="explain">{t(LanguageKey.messagesetting_PersistentMenuexplain)}</div>
            <div
              className={`${styles.addnewlink} ${persiatantMenus.profileButtons.items.length === 5 ? "fadeDiv" : ""}`}
              onClick={() => handleShowSpecialPayLoad(IceOrPersistent.PersistentMenu)}
              title="◰ create new persiatant Menu">
              <div className={styles.addnewicon}>
                <svg width="22" height="22" viewBox="0 0 22 22">
                  <path
                    d="M22 11q-.1 1.5-1.6 1.6h-7.8v7.8a1.6 1.6 0 1 1-3.2 0v-7.8H1.6a1.6 1.6 0 1 1 0-3.2h7.8V1.6a1.6 1.6 0 1 1 3.2 0v7.8h7.8q1.5.1 1.6 1.6"
                    fill="var(--color-dark-blue)"
                  />
                </svg>
              </div>
              <div className={styles.addnewcontent}>
                <div className={styles.addnewheader}>
                  {t(LanguageKey.messagesetting_addNewButton)}
                  <div className="explain">({persiatantMenus.profileButtons.items.length}/5)</div>
                </div>
                <div className="explain">{t(LanguageKey.messagesetting_addPersistentMenuexplain)}</div>
              </div>
            </div>
            <div className={`${styles.contentArea} ${!persiatantMenus.isActive && "fadeDiv"}`}>
              {(loadingStatus || updateLoading) && <Loading />}
              {!loadingStatus && !updateLoading && (
                <>
                  {persiatantMenus.profileButtons.items.map((v, i) => (
                    <div key={i} className="headerandinput">
                      {v.payloadType === PayloadType.Special && (
                        <>
                          <div className="headerparent">
                            <div className="title2">{specialPayloadTextMap[v.specialPayload!]?.title}</div>
                            <img
                              onClick={() => {
                                handleDeletePrompt(i);
                              }}
                              style={{
                                cursor: "pointer",
                                width: "20px",
                                height: "20px",
                              }}
                              title="ℹ️ delete button"
                              src="/delete.svg"
                              role="button"
                            />
                          </div>
                          <div className={styles.qasection}>
                            <div className={styles.seeanswer} onClick={() => toggleExplanation(i)}>
                              {explanationsVisible[i] ? (
                                <> </>
                              ) : (
                                // <span>{t(LanguageKey.Hide)} </span>
                                <span> {t(LanguageKey.show)}</span>
                              )}
                              {t(LanguageKey.Efficiency)}
                            </div>
                            {explanationsVisible[i] && (
                              <div className="explain" role="textbox" aria-label={`Answer for prompt ${i + 1}`}>
                                {specialPayloadTextMap[v.specialPayload!]?.explain}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {v.payloadType === PayloadType.Custom && (
                        <>
                          <div className="headerparent">
                            <div className="title2">{v.title}</div>

                            <img
                              onClick={() => {
                                handleDeletePrompt(i);
                              }}
                              style={{
                                cursor: "pointer",
                                width: "20px",
                                height: "20px",
                              }}
                              title="ℹ️ delete button"
                              src="/delete.svg"
                              role="button"
                            />
                          </div>
                          <div className={styles.qasection}>
                            <div className={styles.seeanswer} onClick={() => toggleExplanation(i)}>
                              {explanationsVisible[i] ? <> </> : <span> {t(LanguageKey.show)}</span>}
                              {t(LanguageKey.AIFlow_quick_reply)}
                            </div>
                            {explanationsVisible[i] && (
                              <div className="explain" role="textbox" aria-label={`Answer for prompt ${i + 1}`}>
                                {v.response}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {v.payloadType === PayloadType.AI && (
                        <>
                          <div className="headerparent">
                            {v.prompt && <div className="title2">{v.title}</div>}

                            <img
                              onClick={() => {
                                handleDeletePrompt(i);
                              }}
                              style={{
                                cursor: "pointer",
                                width: "20px",
                                height: "20px",
                              }}
                              title="ℹ️ delete button"
                              src="/delete.svg"
                              role="button"
                            />
                          </div>

                          <div className={styles.qasection}>
                            {v.prompt && <div className="headertext">{v.prompt.title}</div>}
                            <div className="headerandinput">
                              <div className={styles.seeanswer} onClick={() => toggleExplanationForAI(i, v.promptId)}>
                                {explanationsVisible[i] ? (
                                  <> </>
                                ) : (
                                  // <span>{t(LanguageKey.Hide)} </span>
                                  <span> {t(LanguageKey.show)}</span>
                                )}
                                {t(LanguageKey.Answer)} {t(LanguageKey.AI)}
                              </div>
                              {explanationsVisible[i] && (
                                <div className="explain" role="textbox" aria-label={`Answer for prompt ${i + 1}`}>
                                  {promptLoading && <RingLoader />}
                                  {!promptLoading &&
                                    selectedPrompt.length > 0 &&
                                    selectedPrompt.find((p) => p.promptId === v.promptId)?.promptStr}
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      {v.payloadType === PayloadType.Flow && (
                        <>
                          <div className="headerparent">
                            <div className="title2">
                              {" "}
                              {v.masterFlow && <strong className="title2">{v.title}</strong>}
                            </div>
                            <img
                              onClick={() => {
                                handleDeletePrompt(i);
                              }}
                              style={{
                                cursor: "pointer",
                                width: "20px",
                                height: "20px",
                              }}
                              title="ℹ️ delete button"
                              src="/delete.svg"
                              role="button"
                            />
                          </div>
                          <div className={styles.qasection}>
                            {v.masterFlow && <div className="headertext">{v.masterFlow.title}</div>}
                            <div className={styles.seeanswer} onClick={() => toggleExplanation(i)}>
                              <span> {t(LanguageKey.show)}</span>
                              {t(LanguageKey.Answer)} {t(LanguageKey.Flow)}
                            </div>
                          </div>
                        </>
                      )}
                      {v.payloadType === PayloadType.GeneralAI && (
                        <>
                          <div className="headerparent">
                            <div className="title2">{v.title}</div>
                            <img
                              onClick={() => {
                                handleDeletePrompt(i);
                              }}
                              style={{
                                cursor: "pointer",
                                width: "20px",
                                height: "20px",
                              }}
                              title="ℹ️ delete button"
                              src="/delete.svg"
                              role="button"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  },
);
export default PersistentMenu;
