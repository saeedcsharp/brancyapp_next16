import { useSession } from "next-auth/react";
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import RingLoader from "brancy/components/design/loader/ringLoder";
import ToggleCheckBoxButton from "brancy/components/design/toggleCheckBoxButton";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { PartnerRole } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import { IDetailPrompt } from "brancy/models/AI/prompt";
import { MethodType } from "brancy/helper/api";
import { IceOrPersistent, PayloadType, SpecialPayLoad } from "brancy/models/messages/enum";
import { IIceBreaker } from "brancy/models/messages/properies";
import styles from "brancy/components/messages/properties/properties.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
// function PersistentMenu
const PersistentMenu = React.memo(
  ({
    updateLoading,
    persiatantMenus,
    handleDeletePrompt,
    handleActivePersistentMenu: originalHandleActivePersistentMenu, // Rename prop
    handleShowSpecialPayLoad,
  }: {
    updateLoading: boolean;
    persiatantMenus: IIceBreaker;
    handleDeletePrompt: (id: number) => void;
    handleActivePersistentMenu: (e: ChangeEvent<HTMLInputElement>) => void; // Keep original prop type
    handleShowSpecialPayLoad: (type: IceOrPersistent) => void;
  }) => {
    const { data: session } = useSession();
    const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.Message));
    const { t } = useTranslation();
    const [isHidden, setIsHidden] = useState(false);
    // Add a state to track visibility of each explanation
    const [explanationsVisible, setExplanationsVisible] = useState<boolean[]>([]);
    // Add state and ref for fading effect
    const [isFading, setIsFading] = useState(false);
    const [promptLoading, setPromptLoading] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<IDetailPrompt[]>([]);
    const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID

    // Toggle function to show/hide explanations
    const toggleExplanation = (index: number) => {
      setExplanationsVisible((prev) => {
        // Create a new array with all values set to false (all closed)
        const newState = Array(prev.length).fill(false);
        // If the clicked item was already open, leave all closed
        // Otherwise, set only the clicked index to true
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
          // Create a new array with all values set to false (all closed)
          const newState = Array(prev.length).fill(false);
          // If the clicked item was already open, leave all closed
          // Otherwise, set only the clicked index to true
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

    // Wrapper function to handle toggle and fading effect
    const handleActivePersistentMenu = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        originalHandleActivePersistentMenu(e); // Call the original handler passed via props

        setIsFading(true); // Start fading

        // Clear any existing timeout to prevent conflicts
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }

        // Set a new timeout to stop fading after 3 seconds
        fadeTimeoutRef.current = setTimeout(() => {
          setIsFading(false);
          fadeTimeoutRef.current = null; // Clear the ref after timeout executes
        }, 3000);
      },
      [originalHandleActivePersistentMenu],
    );

    // Cleanup timeout on component unmount
    useEffect(() => {
      return () => {
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }
      };
    }, []);

    // Initialize the visibility state when persiatantMenus changes
    useEffect(() => {
      if (persiatantMenus && persiatantMenus.profileButtons) {
        setExplanationsVisible(Array(persiatantMenus.profileButtons.items.length).fill(false));
        setLoadingStaus(false);
      }
    }, [persiatantMenus]);
    return (
      <>
        <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
          <div className="headerChild" onClick={handleCircleClick}>
            <div className="circle"></div>
            <div className="Title">{t(LanguageKey.messagesetting_PersistentMenu)}</div>
          </div>

          <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
            <div className="headerandinput">
              <div className="headerparent">
                <div className="title">
                  {t(LanguageKey.activate)}
                  <Tooltip
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
                    }
                    onClick={true}
                    position="bottom">
                    <img
                      style={{
                        marginInline: "5px",
                        cursor: "pointer",
                        width: "18px",
                        height: "18px",
                      }}
                      title="ℹ️ tooltip"
                      src="/tooltip.svg"
                    />
                  </Tooltip>
                </div>
                {/* Apply fadeDiv class conditionally to the parent div */}
                <div className={isFading ? "fadeDiv" : ""}>
                  <ToggleCheckBoxButton
                    handleToggle={handleActivePersistentMenu} // Use the wrapper function
                    checked={persiatantMenus.isActive}
                    name="Persistent Menu"
                    title={"Persistent Menu"}
                    role={"switch"}
                  />
                </div>
              </div>
              <div className="explain">{t(LanguageKey.messagesetting_PersistentMenuexplain)}</div>
            </div>
            <div className={`${styles.contenticebraker} ${!persiatantMenus.isActive && "fadeDiv"}`}>
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
              {(loadingStatus || updateLoading) && <Loading />}
              {!loadingStatus && !updateLoading && (
                <>
                  <div className={styles.qanda}>
                    {persiatantMenus.profileButtons.items.map((v, i) => (
                      <div key={i} className={styles.qasection}>
                        <div className="headerandinput">
                          {v.payloadType === PayloadType.Special && (
                            <>
                              <div className="headerparent">
                                <div className={styles.headertitle}>
                                  {specialPayloadTextMap[v.specialPayload!]?.title}
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
                              <div className="headerandinput">
                                <div className={styles.seeanswer} onClick={() => toggleExplanation(i)}>
                                  {explanationsVisible[i] ? (
                                    <span>{t(LanguageKey.Hide)}</span>
                                  ) : (
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
                                <div className={styles.headertitle}>{v.title}</div>
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
                              <div className="headerandinput">
                                <div className={styles.seeanswer} onClick={() => toggleExplanation(i)}>
                                  {explanationsVisible[i] ? (
                                    <span>{t(LanguageKey.Hide)}</span>
                                  ) : (
                                    <span> {t(LanguageKey.show)}</span>
                                  )}
                                  {t(LanguageKey.Efficiency)}
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
                                {v.prompt && (
                                  <div className="headerandinput">
                                    <div className="headertext">{"Button " + t(LanguageKey.SettingGeneral_Title)}</div>
                                    <div className="headerparent">
                                      <div className={styles.headertitle}>{v.title}</div>
                                    </div>
                                    <div className="headertext">{"AI " + t(LanguageKey.SettingGeneral_Title)}</div>
                                    <InputText
                                      className={"textinputbox"}
                                      handleInputChange={() => {}}
                                      value={v.prompt.title}
                                    />
                                  </div>
                                )}
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
                              <div className="headerandinput">
                                <div className={styles.seeanswer} onClick={() => toggleExplanationForAI(i, v.promptId)}>
                                  {explanationsVisible[i] ? (
                                    <span>{t(LanguageKey.Hide)}</span>
                                  ) : (
                                    <span> {t(LanguageKey.show)}</span>
                                  )}
                                  {t(LanguageKey.Answer)}
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
                            </>
                          )}
                          {v.payloadType === PayloadType.Flow && (
                            <>
                              <div className="headerparent">
                                {v.masterFlow && (
                                  <div className="headerandinput">
                                    <div className="headertext">{"Button " + t(LanguageKey.SettingGeneral_Title)}</div>
                                    <div className="headerparent">
                                      <div className={styles.headertitle}>{v.title}</div>
                                    </div>
                                    <div className="headertext">{"Flow " + t(LanguageKey.SettingGeneral_Title)}</div>
                                    <InputText
                                      className={"textinputbox"}
                                      handleInputChange={() => {}}
                                      value={v.masterFlow.title}
                                    />
                                  </div>
                                )}
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
                              <div className="headerandinput">
                                <div className={styles.seeanswer} onClick={() => toggleExplanation(i)}>
                                  <span> {t(LanguageKey.show)}</span>
                                  {t(LanguageKey.Efficiency)}
                                </div>
                              </div>
                            </>
                          )}
                          {v.payloadType === PayloadType.GeneralAI && (
                            <>
                              <div className="headerparent">
                                <div className={styles.headertitle}>{v.title}</div>
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
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* <div
                  onClick={handleSavePersistentMenu}
                  style={{ minHeight: "50px" }}
                  className={handleCheck() ? "disableButton" : "saveButton"}>
                  {t(LanguageKey.save)}
                </div> */}
          </div>
        </div>
      </>
    );
  },
);
export default PersistentMenu;
