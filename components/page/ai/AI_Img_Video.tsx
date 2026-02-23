import { useSession } from "next-auth/react";
import router, { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "../../design/inputText";
import FlexibleToggleButton from "../../design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "../../design/toggleButton/types";
import { NotifType, notify, ResponseType } from "../../notifications/notificationBox";
import Loading from "../../notOk/loading";
import { LoginStatus, RoleAccess } from "../../../helper/loadingStatus";
import { LanguageKey } from "../../../i18n/languageKeys";
import { PartnerRole } from "../../../models/_AccountInfo/InstagramerAccountInfo";
import styles from "./AI_Img_Video.module.css";
let firstTime = 0;
let touchMove = 0;
let touchStart = 0;
let firstPos = { x: 0, y: 0 };
let downFlagLeft = false;
let downFlagRight = false;
let hideDivIndex: string | number | null = null;
export default function AIPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const routerHook = useRouter();
  const userListRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [toggleOrder, setToggleOrder] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [displayRight, setDisplayRight] = useState("");
  const [displayLeft, setDisplayLeft] = useState("");
  const [searchbox, setSearchbox] = useState("");
  const [showDivIndex, setShowDivIndex] = useState<string | number | null>(null);
  const handleResize = () => {
    if (typeof window !== undefined) {
      var width = window.innerWidth;
      if (width < 1024 && userSelectedId !== null) {
        setDisplayLeft("none");
        setDisplayRight("");
      } else if (width < 1024 && userSelectedId === null) {
        setDisplayRight("none");
        setDisplayLeft("");
      } else if (width >= 1024) {
        setDisplayLeft("");
        setDisplayRight("");
      }
    }
  };
  async function fetchFirstData() {
    try {
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }
  const handleToggleChange = (order: ToggleOrder) => {
    const container = userListRef.current;
    if (container) {
      container.scrollTop = 0;
    }
    setUserSelectedId(null);
    hideDivIndex = null;
    setToggleOrder(order);
  };
  const handleScroll = () => {
    const container = userListRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight) {
      // loadMoreItems();
    }
  };
  const handleMouseMove = (index: string | number) => {
    if (downFlagLeft && mousePos.x - firstPos.x < -10) {
      setShowDivIndex(index);
      downFlagLeft = false;
      downFlagRight = false;
    }
    if (downFlagRight && mousePos.x - firstPos.x > 10 && showDivIndex !== null) {
      downFlagRight = false;
      downFlagLeft = false;
      setTimeout(() => {
        hideDivIndex = index;
        setShowDivIndex(null);
      }, 700);
    }
  };
  const handleTouchEnd = (index: string | number) => {
    if (touchMove === 0) return;
    if (touchMove - touchStart < -35) {
      setShowDivIndex(index);
    } else if (touchMove - touchStart > 0) {
      setTimeout(() => {
        hideDivIndex = index;
        setShowDivIndex(null);
      }, 700);
    }
  };
  const handleMouseUp = () => {
    downFlagRight = false;
    downFlagLeft = false;
  };
  const handleMouseDown = () => {
    firstPos = mousePos;
    firstTime = new Date().getTime();
    downFlagLeft = true;
    downFlagRight = true;
  };
  useEffect(() => {
    if (routerHook && routerHook.query && routerHook.query.flowId) {
      const fid = Array.isArray(routerHook.query.flowId) ? routerHook.query.flowId[0] : routerHook.query.flowId;
      if (fid) {
        setToggleOrder(ToggleOrder.FirstToggle);
        setUserSelectedId(String(fid));
      }
    }
    console.log(" ✅ Console ⋙ Session", session, session?.user.username);
    if (
      session === undefined ||
      session?.user.username === undefined ||
      !LoginStatus(session) ||
      !RoleAccess(session, PartnerRole.Automatics)
    )
      return;
    fetchFirstData();
    const handleMouseMove = (event: { clientX: number; clientY: number }) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    const handleTouchMove = (e: TouchEvent) => {
      touchMove = e.touches[0].clientX;
    };
    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientX;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      hideDivIndex = null;
    };
  }, [session]);
  /* ___dragDropSidebar___ */
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [userSelectedId]);
  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <div className={`pincontainerMSG translate`}>
          {/* ___left ___*/}
          <div className={styles.left} style={{ display: displayLeft }}>
            {/* ___search ___*/}

            <InputText
              className={"serachMenuBar"}
              placeHolder={t(LanguageKey.searchKeyword)}
              handleInputChange={(e) => setSearchbox(e.target.value)}
              value={searchbox}
              maxLength={undefined}
              name="Search from People or Keyword"
            />

            {/* ___switch button ___*/}
            <FlexibleToggleButton
              onChange={handleToggleChange}
              selectedValue={toggleOrder}
              options={[
                { label: t(LanguageKey.Flow), id: 0 },
                { label: t(LanguageKey.AI), id: 1 },
              ]}
            />
            {toggleOrder === ToggleOrder.FirstToggle && (
              <>
                <div
                  onClick={() => {
                    setUserSelectedId("newFlow");
                  }}
                  className={styles.addnewlink}
                  title="◰ Create new Flow">
                  <div className={styles.addnewicon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 36 36">
                      <path
                        d="m15.4 7.5 6 19M14.7 6.7l8 4"
                        stroke="var(--color-dark-blue)"
                        strokeOpacity=".4"
                        strokeWidth="4"
                      />
                      <path
                        d="M2 7.5c0-1.4 0-2 .2-2.7a4 4 0 0 1 2.6-2.6Q5.6 2 7.5 2h3c1.4 0 2 0 2.7.2a4 4 0 0 1 2.6 2.6q.3.8.2 2.7c0 1.4 0 2-.2 2.7a4 4 0 0 1-2.6 2.6q-.7.3-2.7.2h-3c-1.4 0-2 0-2.7-.2a4 4 0 0 1-2.6-2.6Q2 9.4 2 7.5m19 6c0-1.4 0-2 .2-2.7a4 4 0 0 1 2.6-2.6q.8-.2 2.7-.2h3c1.4 0 2 0 2.7.2a4 4 0 0 1 2.6 2.6q.3.7.2 2.7c0 1.4 0 2-.2 2.7a4 4 0 0 1-2.6 2.6q-.7.3-2.7.2h-3c-1.4 0-2 0-2.7-.2a4 4 0 0 1-2.6-2.6q-.2-.7-.2-2.7m-2 15c0-1.4 0-2 .2-2.7a4 4 0 0 1 2.6-2.6q.8-.2 2.7-.2h3c1.4 0 2 0 2.7.2a4 4 0 0 1 2.6 2.6q.3.8.2 2.7c0 1.4 0 2-.2 2.7a4 4 0 0 1-2.6 2.6q-.7.3-2.7.2h-3c-1.4 0-2 0-2.7-.2a4 4 0 0 1-2.6-2.6q-.2-.7-.2-2.7"
                        fill="var(--color-dark-blue)"
                      />
                    </svg>
                  </div>

                  <div className={styles.addnewcontent}>
                    <div className={styles.addnewheader}>{t(LanguageKey.CreateAutomationFlow)}</div>
                    <div className="explain">{t(LanguageKey.CreateAutomationFlowExplain)}</div>
                  </div>
                </div>
              </>
            )}
            {toggleOrder === ToggleOrder.SecondToggle && (
              <div onClick={() => setUserSelectedId("")} className={styles.addnewlink} title="◰ Create new Flow">
                <div className={styles.addnewicon}>
                  <svg width="36" height="36" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path
                      opacity=".2"
                      d="M14.2 20.9a8.4 8.4 0 0 0 7.8-8v-2.4a8.4 8.4 0 0 0-7.8-8H9.8a8.4 8.4 0 0 0-7.8 8V13q.3 2.3 1.6 4.2.6 1.3-.3 2.8-.6 1-.4 1.2.3.4 1.1.3 1.7 0 2.7-.8l.7-.4 1 .3 1.4.3z"
                      fill="var(--color-dark-blue)"
                    />
                    <path
                      d="m7.5 15 1.8-5.5a.7.7 0 0 1 1.4 0l1.8 5.5m3-6v6m-7-2h3m2.7 7.9a8.4 8.4 0 0 0 7.8-8v-2.4a8.4 8.4 0 0 0-7.8-8H9.8a8.4 8.4 0 0 0-7.8 8V13q.3 2.3 1.6 4.2.6 1.3-.3 2.8-.6 1-.4 1.2.3.4 1.1.3 1.7 0 2.7-.8l.7-.4 1 .3 1.4.3z"
                      stroke="var(--color-dark-blue)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className={styles.addnewcontent}>
                  <div className={styles.addnewheader}>{t(LanguageKey.CreateAutomationAI)}</div>
                  <div className="explain">{t(LanguageKey.CreateAutomationAIExplain)}</div>
                </div>
              </div>
            )}
            {/* ___list of user ___*/}
            <div className={styles.userslist} ref={userListRef} onScroll={handleScroll}>
              {/* {toggleOrder === ToggleOrder.FirstToggle &&
                !showSearchThread.searchMode &&
                masterFlow &&
                masterFlow.items.map((v) => (
                  <div
                    className={styles.userbackground}
                    style={v.masterFlowId === userSelectedId ? { background: "var(--color-gray30)" } : {}}
                    key={v.masterFlowId}
                    onMouseDown={() => handleMouseDown()}
                    onMouseUp={() => handleMouseUp()}
                    onMouseMove={() => handleMouseMove(v.masterFlowId)}
                    onTouchEnd={() => handleTouchEnd(v.masterFlowId)}
                    onClick={() => {
                      handleShowFlow(v.masterFlowId);
                    }}>
                    {(() => {
                      const thumbnailStyle = getThumbnailStyle(v.title, {
                        backgroundOpacity: 60,
                        characterCount: 2,
                        textColorMode: "background-dark",
                      });
                      return (
                        <div
                          className={styles.thumbnail}
                          style={{
                            background: thumbnailStyle.backgroundColor,
                            color: thumbnailStyle.color,
                          }}>
                          {thumbnailStyle.text}
                        </div>
                      );
                    })()}
                    <div className="instagramprofiledetail">
                      <div className="instagramusername" title={v.title}>
                        {v.title}
                      </div>
                      <div className="instagramid" title="ℹ️ Flow ID">
                        # {v.masterFlowId}
                      </div>
                      <div className={styles.chattime}>
                        {new DateObject({
                          date: convertToMilliseconds(v.createdTime),
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("YYYY/MM/DD - h:mm a")}
                      </div>
                    </div>
                  </div>
                ))} */}
              {/* {toggleOrder === ToggleOrder.SecondToggle &&
                !showSearchThread.searchMode &&
                promptInbox &&
                promptInbox.items.map((v) => (
                  <div
                    key={v.promptId}
                    onMouseDown={() => handleMouseDown()}
                    onMouseUp={() => handleMouseUp()}
                    onMouseMove={() => handleMouseMove(v.promptId)}
                    onTouchEnd={() => handleTouchEnd(v.promptId)}
                    onClick={() => handleShowAI(v.promptId)}
                    className={styles.userbackground}
                    style={v.promptId === userSelectedId ? { background: "var(--color-gray30)" } : {}}>
                    {(() => {
                      const thumbnailStyle = getThumbnailStyle(v.title, {
                        backgroundOpacity: 60,
                        characterCount: 2,
                        textColorMode: "background-dark",
                      });
                      return (
                        <div
                          className={styles.thumbnail}
                          style={{
                            background: thumbnailStyle.backgroundColor,
                            color: thumbnailStyle.color,
                          }}>
                          {thumbnailStyle.text}
                        </div>
                      );
                    })()}

                    <div className="instagramprofiledetail">
                      <div className="instagramusername" title={v.title}>
                        {v.title}
                      </div>
                      <div className="instagramid" title="ℹ️ Prompt ID">
                        # {v.promptId}
                      </div>
                      <div className={styles.chattime}>
                        {new DateObject({
                          date: convertToMilliseconds(v.updatedTime),
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("YYYY/MM/DD - h:mm a")}
                      </div>
                    </div>
                  </div>
                ))} */}
              {/* {showSearchThread.searchMode &&
                toggleOrder === ToggleOrder.FirstToggle &&
                session?.user.messagePermission && (
                  <>
                    {showSearchThread.loading && <RingLoader />}
                    {showSearchThread.noResult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                    {!showSearchThread.loading &&
                      !showSearchThread.noResult &&
                      searchMasterFlowInbox &&
                      searchMasterFlowInbox.items.map((v) => (
                        <div
                          className={styles.userbackground}
                          style={v.masterFlowId === userSelectedId ? { background: "var(--color-gray30)" } : {}}
                          key={v.masterFlowId}
                          onMouseDown={() => handleMouseDown()}
                          onMouseUp={() => handleMouseUp()}
                          onMouseMove={() => handleMouseMove(v.masterFlowId)}
                          onTouchEnd={() => handleTouchEnd(v.masterFlowId)}
                          onClick={() => {
                            handleShowFlow(v.masterFlowId);
                          }}>
                          {(() => {
                            const thumbnailStyle = getThumbnailStyle(v.title, {
                              backgroundOpacity: 60,
                              characterCount: 2,
                              textColorMode: "background-dark",
                            });
                            return (
                              <div
                                className={styles.thumbnail}
                                style={{
                                  background: thumbnailStyle.backgroundColor,
                                  color: thumbnailStyle.color,
                                }}>
                                {thumbnailStyle.text}
                              </div>
                            );
                          })()}
                          <div className="instagramprofiledetail">
                            <div className="instagramusername" title={v.title}>
                              {v.title}
                            </div>
                            <div className="instagramid" title="ℹ️ Flow ID">
                              # {v.masterFlowId}
                            </div>
                            <div className={styles.chattime}>
                              {new DateObject({
                                date: convertToMilliseconds(v.createdTime),
                                calendar: initialzedTime().calendar,
                                locale: initialzedTime().locale,
                              }).format("YYYY/MM/DD - h:mm a")}
                            </div>
                          </div>
                        </div>
                      ))}
                  </>
                )} */}
              {/* {showSearchThread.searchMode && toggleOrder === ToggleOrder.SecondToggle && (
                <>
                  {showSearchThread.loading && <RingLoader />}
                  {showSearchThread.noResult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                  {!showSearchThread.loading &&
                    !showSearchThread.noResult &&
                    searchPromptInbox?.items.map((v) => (
                      <div
                        key={v.promptId}
                        onMouseDown={() => handleMouseDown()}
                        onMouseUp={() => handleMouseUp()}
                        onMouseMove={() => handleMouseMove(v.promptId)}
                        onTouchEnd={() => handleTouchEnd(v.promptId)}
                        onClick={() => handleShowAI(v.promptId)}
                        className={styles.userbackground}
                        style={v.promptId === userSelectedId ? { background: "var(--color-gray30)" } : {}}>
                        {(() => {
                          const thumbnailStyle = getThumbnailStyle(v.title, {
                            backgroundOpacity: 60,
                            characterCount: 2,
                            textColorMode: "background-dark",
                          });
                          return (
                            <div
                              className={styles.thumbnail}
                              style={{
                                background: thumbnailStyle.backgroundColor,
                                color: thumbnailStyle.color,
                              }}>
                              {thumbnailStyle.text}
                            </div>
                          );
                        })()}

                        <div className="instagramprofiledetail">
                          <div className="instagramusername" title={v.title}>
                            {v.title}
                          </div>
                          <div className="instagramid" title="ℹ️ Prompt ID">
                            # {v.promptId}
                          </div>
                          <div className={styles.chattime}>
                            {new DateObject({
                              date: convertToMilliseconds(v.updatedTime),
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("YYYY/MM/DD - h:mm a")}
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )} */}
            </div>
          </div>
          {/* ___right ___*/}
          {userSelectedId !== null && toggleOrder === ToggleOrder.FirstToggle && (
            <div className={styles.right} style={{ display: displayRight }}>
              {/* <Flow
                flowId={userSelectedId}
                showUserList={showUserList}
                onOpenSettings={handleOpenSettings}
                onOpenLiveTest={handleOpenLiveTest}
                onOpenTutorial={handleOpenTutorial}
                onRegisterGetEditorState={handleRegisterGetEditorState}
                onRegisterReload={handleRegisterReload}
                existingFlows={masterFlow?.items || []}
              /> */}
            </div>
          )}
          {/* {userSelectedId !== null && toggleOrder === ToggleOrder.SecondToggle && (
            <div className={styles.rightAI} style={{ display: displayRight }}>
              <AIPromptBox
                aiTools={aiTools}
                userSelectId={userSelectedId}
                showUserList={showUserList}
                updateAIPrompt={updateAIPrompt}
                showAIToolsSettings={showAIToolsSettings}
                setShowAIToolsSettings={setShowAIToolsSettings}
                selectedAITool={selectedAITool}
                setSelectedAITool={setSelectedAITool}
                onAddToPromptRef={addToPromptRef}
                showLiveChatPopup={showLiveChatPopup}
                setShowLiveChatPopup={setShowLiveChatPopup}
                promptInfo={promptInfo}
                setPromptInfo={setPromptInfo}
              />
            </div>
          )} */}
          {userSelectedId === null && (
            <div className={styles.disableRight} style={{ display: displayRight }}>
              <img className={styles.disableRightimage} alt="Welcome illustration" src="/disableright.svg" />
              <div>
                <h3>{t(LanguageKey.flowmanagement)}</h3>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
