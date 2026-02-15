import { useSession } from "next-auth/react";
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "saeed/components/design/inputText";
import RingLoader from "saeed/components/design/loader/ringLoder";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { IDetailPrompt } from "saeed/models/AI/prompt";
import { MethodType } from "saeed/helper/apihelper";
import { IceOrPersistent, PayloadType, SpecialPayLoad } from "saeed/models/messages/enum";
import { IIceBreaker } from "saeed/models/messages/properies";
import styles from "./properties.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
// Wrap component with React.memo for performance
const IceBreaker = React.memo(
  ({
    iceBeakerUpdateLoading,
    iceBreakers,
    handleDeletePrompt,
    handleActiveIceBreaker: originalHandleActiveIceBreaker, // Rename prop
    handleShowSpecialPayLoad,
  }: {
    iceBeakerUpdateLoading: boolean;
    iceBreakers: IIceBreaker;
    handleDeletePrompt: (id: number) => void;
    handleActiveIceBreaker: (e: ChangeEvent<HTMLInputElement>) => void;
    handleShowSpecialPayLoad: (type: IceOrPersistent) => void;
  }) => {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const [isHidden, setIsHidden] = useState(false);
    // Add a state to track visibility of each explanation
    const [explanationsVisible, setExplanationsVisible] = useState<boolean[]>([]);
    // Add state for fading effect
    const [isFading, setIsFading] = useState(false);
    const [promptLoading, setPromptLoading] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<IDetailPrompt[]>([]);
    const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID

    // Initialize the visibility state when iceBreakers changes
    useEffect(() => {
      if (iceBreakers && iceBreakers.profileButtons) {
        setExplanationsVisible(Array(iceBreakers.profileButtons.items.length).fill(false));
      }
    }, [iceBreakers]);

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
        if (selectedPrompt.find((x) => x.promptId === promptId)) return;
        const res = await clientFetchApi<boolean, IDetailPrompt>(`/api/ai/GetPrompt`, { methodType: MethodType.get, session: session, data: null, queries: [{ key: "promptId", value: promptId }], onUploadProgress: undefined });
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
    const handleActiveIceBreaker = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        originalHandleActiveIceBreaker(e); // Call the original handler passed via props

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
      [originalHandleActiveIceBreaker]
    );

    // Cleanup timeout on component unmount
    useEffect(() => {
      return () => {
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }
      };
    }, []);

    return (
      <>
        <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
          <div className="headerChild" onClick={handleCircleClick}>
            <div className="circle"></div>
            <div className="Title">{t(LanguageKey.messagesetting_icebreaker)}</div>
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
                          {t(LanguageKey.messagesetting_icebreaker)}
                        </div>
                        <img
                          style={{ borderRadius: "var(--br10)", width: "100%" }}
                          loading="lazy"
                          decoding="async"
                          title="ℹ️ Persistent Menu"
                          src="/ice-Breaker.png"
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
                    handleToggle={handleActiveIceBreaker}
                    checked={iceBreakers.isActive}
                    name=" iceBreaker"
                    title={" iceBreaker"}
                    role={" switch"}
                  />
                </div>
              </div>
              <div className="explain">{t(LanguageKey.messagesetting_icebreakerexplain)}</div>
            </div>

            <div className={`${styles.contenticebraker} ${!iceBreakers.isActive && "fadeDiv"}`}>
              <div
                className={`${styles.addnewlink} ${iceBreakers.profileButtons.items.length === 4 ? "fadeDiv" : ""}`}
                onClick={() => handleShowSpecialPayLoad(IceOrPersistent.IceBreaker)}
                title="◰ create new Ice Breaker">
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
                    <div className="explain">({iceBreakers.profileButtons.items.length}/4)</div>
                  </div>
                  <div className="explain">{t(LanguageKey.messagesetting_addicebreakerexplain)}</div>
                </div>
              </div>
              {iceBeakerUpdateLoading && <Loading />}
              {!iceBeakerUpdateLoading && (
                <>
                  <div className={styles.qanda}>
                    {iceBreakers.profileButtons.items.map((v, i) => (
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
                                      selectedPrompt.find((x) => x.promptId === v.promptId)?.promptStr}
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
                  onClick={handleSaveIceBreaker}
                  style={{ minHeight: "50px" }}
                  className={handleCheck() ? "disableButton" : "saveButton"}>
                  {t(LanguageKey.save)}
                </div> */}
          </div>
        </div>
      </>
    );
  }
);
export default IceBreaker;
