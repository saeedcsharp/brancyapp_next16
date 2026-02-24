import { useSession } from "next-auth/react";
import { useEffect, useReducer, useRef, useState } from "react";
import Loading from "brancy/components/notOk/loading";
import { convertArrayToLarray } from "brancy/helper/chunkArray";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { ILoadingStatus, ISession } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./general.module.css";
export default function Session({
  sessions,
  handleShowDeleteSession,
  handleGetNextSessions,
}: {
  sessions: ISession[] | null;
  handleShowDeleteSession: (sessionId: ISession) => void;
  handleGetNextSessions: (sessionId: string) => void;
}) {
  interface AutoReplyState {
    isHidden: boolean;
    showSetting: boolean;
    activeAutoDirect: boolean;
    loadingStatus: ILoadingStatus;
    swiperLoading: boolean;
  }
  type AutoReplyAction =
    | { type: "TOGGLE_HIDDEN" }
    | { type: "TOGGLE_SETTINGS" }
    | { type: "SET_AUTO_DIRECT"; payload: boolean }
    | { type: "SET_LOADING_STATUS"; payload: Partial<ILoadingStatus> }
    | { type: "TOGGLE_SWIPER_LOADING" };
  let navigationUnReactionPrevRef = useRef(null);
  let navigationUnReactionNextRef = useRef(null);
  const { data: session } = useSession();
  const [isHidden, setIsHidden] = useState(false); // New state to toggle visibility and grid-row-end
  const [state, dispatch] = useReducer(autoReplyReducer, {
    isHidden: false,
    showSetting: false,
    activeAutoDirect: true,
    loadingStatus: {
      notShopper: false,
      notBasePackage: false,
      notFeature: false,
      loading: false,
      notPassword: false,
      ok: true,
      notBusiness: false,
      notLoginByFb: false,
    },
    swiperLoading: false,
  });

  const [loading, setLoading] = useState(LoginStatus(session) && RoleAccess(session));
  const handleCircleClick = () => {
    setIsHidden(!isHidden); // Toggle visibility and grid-row-end state
  };
  function handleSwiperReachEnd() {
    if (!sessions) return;
    const lastSessionId = sessions![sessions.length - 1].sessionId;
    handleGetNextSessions(lastSessionId);
  }
  function autoReplyReducer(state: AutoReplyState, action: AutoReplyAction): AutoReplyState {
    switch (action.type) {
      case "TOGGLE_HIDDEN":
        return { ...state, isHidden: !state.isHidden };
      case "TOGGLE_SETTINGS":
        return { ...state, showSetting: !state.showSetting };
      case "SET_AUTO_DIRECT":
        return { ...state, activeAutoDirect: action.payload };
      case "SET_LOADING_STATUS":
        return {
          ...state,
          loadingStatus: { ...state.loadingStatus, ...action.payload },
        };
      case "TOGGLE_SWIPER_LOADING":
        return { ...state, swiperLoading: !state.swiperLoading };
      default:
        return state;
    }
  }
  useEffect(() => {
    if (!sessions || !LoginStatus(session)) return;
    setLoading(false);
  }, [sessions]);
  return (
    <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className="headerChild" title="↕ Resize the Card" onClick={handleCircleClick}>
        <div className="circle"> </div>
        <div className="Title">Sessions</div>
      </div>
      <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
        {loading && <Loading />}
        {!loading && sessions && RoleAccess(session) && (
          <div className={styles.autoreply}>
            <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
              <Swiper
                className={styles.swiperContent}
                onUpdate={(a) => {
                  let d = document.getElementsByClassName("swiper");
                  let classes = d[0].classList;
                  if (!classes.contains("swiper-backface-hidden")) {
                    classes.add("swiper-backface-hidden");
                  }
                }}
                onInit={() => {
                  dispatch({ type: "TOGGLE_SWIPER_LOADING" });
                }}
                slidesPerView={1}
                spaceBetween={1}
                modules={[Navigation, Pagination]}
                navigation={{
                  prevEl: navigationUnReactionPrevRef.current,
                  nextEl: navigationUnReactionNextRef.current,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                  renderBullet: function (index, className) {
                    return '<span class="' + className + '">' + (index + 1) + "</span>";
                  },
                }}
                onReachEnd={handleSwiperReachEnd}>
                {convertArrayToLarray(sessions, 4).map((v, i) => (
                  <SwiperSlide
                    key={i}
                    style={{
                      gap: "var(--gap-10)",
                      position: "relative",
                      display: "flex",
                      placeContent: "center",
                      alignItems: "center",
                      alignContent: "flex-start",
                    }}>
                    {v.map((sess) => (
                      <div key={sess.sessionId} className="headerandinput">
                        <div className="headerparent" style={{ paddingInlineEnd: "10px" }}>
                          <li
                            key={sess.sessionId}
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              padding: "10px",
                              marginBottom: "10px",
                            }}>
                            {!sess.isCurrent && (
                              <div className={`headerparent `}>
                                <img
                                  onClick={() => {
                                    handleShowDeleteSession(sess);
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
                            )}

                            <div
                              style={{
                                fontWeight: "var(--weight-600)",
                                marginBottom: "5px",
                              }}>
                              Session ID: {sess.sessionId}
                            </div>
                            <div style={{ marginBottom: "5px" }}>
                              Created Time: {new Date(sess.createdTime * 1e3).toLocaleString()}
                            </div>
                            <div style={{ marginBottom: "5px" }}>
                              expiretime Time: {new Date(sess.expireTime * 1e3).toLocaleString()}
                            </div>
                            <div style={{ marginBottom: "5px" }}>Country Code: {sess.countryCode}</div>
                            <div style={{ marginBottom: "5px" }}>User ID: {sess.userId}</div>
                            <div>Status: {sess.isCurrent ? "Current" : "Not Current"}</div>
                          </li>
                        </div>
                      </div>
                    ))}
                  </SwiperSlide>
                ))}
              </Swiper>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
