import { useTranslation } from "react-i18next";
import CheckBoxButton from "saeed/components/design/checkBoxButton";
import { LanguageKey } from "saeed/i18n";
import styles from "./timeline.module.css";

// import RangeBar from "../../graphs/rangeBar";
const Timeline = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.timeline}>
        <div className="headerChild" title="↕ Resize the Card">
          <div className="circle"></div>
          <div className="Title">{t(LanguageKey.advertisecalendar_Timeline)}</div>
        </div>
        <div className={styles.Section}>
          <div className={styles.headerparent}>
            <div className={styles.selectedtime}>03/04/21</div>

            <div
              className="ButtonContainer"
              style={{
                minWidth: "90px",
                width: "100%",
                maxWidth: "250px",
                height: "40px",
                gap: "var(--gap-10)",
              }}>
              <button
                className="cancelButton"
                style={{
                  height: "40px",
                  fontSize: "var(--font-12)",
                  fontWeight: "var(--weight-700)",
                }}>
                {t(LanguageKey.advertisecalendar_TODAY)}
              </button>
              <button
                className="saveButton"
                style={{
                  maxHeight: "40px",
                  minHeight: "40px",
                  fontSize: "var(--font-12)",
                  fontWeight: "var(--weight-700)",
                }}>
                {t(LanguageKey.advertisecalendar_BookaTime)}
              </button>
            </div>
          </div>
        </div>
        {/* ___timeline___*/}
        <div className={styles.Section} style={{ height: "550px" }}>
          <div className={`${styles.timelinemodule} translate`}>
            {/* ___ تعداد و مقدار از سعید باید گرفته شود و تعداد هم اکنون به صورت تست میباشد___*/}

            <div className={styles.adschart} style={{ gridTemplateColumns: "repeat(48, minmax(11px, 80px))" }}>
              {/* باشد opacity: "40%"  تبلیغات پایان یافته باید به صورت  */}

              {/* ___تبلیغات  ___*/}
              {/* تبلیغ پست  */}
              <div
                className={styles.post}
                style={{
                  backgroundColor: "var(--color-purple)",
                  gridColumn: "1/49",
                }}>
                <div className={styles.detail}>
                  <div className={styles.instagramprofile}>
                    <img
                      className={styles.instagramimage}
                      alt="profile image"
                      src="/no-profile.svg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className={styles.instagramprofiledetail}>
                      <div className={styles.instagramusername}>ّFull name</div>
                      <div className={styles.instagramid}>@Username</div>
                    </div>
                  </div>
                  <div className={styles.addetail}>
                    <div
                      className={styles.adtype}
                      style={{
                        color: "var(--color-purple)",
                        backgroundColor: "var(--color-purple30)",
                      }}>
                      post ad
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      12 hours
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      24 hours
                    </div>
                  </div>
                </div>
              </div>
              {/* تبلیغ استوری  */}
              <div
                className={styles.story}
                style={{
                  backgroundColor: "var(--color-light-blue)",
                  gridColumn: "25/49",
                }}>
                <div className={styles.detail}>
                  <div className={styles.instagramprofile}>
                    <img
                      className={styles.instagramimage}
                      alt="profile image"
                      src="/no-profile.svg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className={styles.instagramprofiledetail}>
                      <div className={styles.instagramusername}>ّFull name</div>
                      <div className={styles.instagramid}>@Username</div>
                    </div>
                  </div>
                  <div className={styles.addetail}>
                    <div
                      className={styles.adtype}
                      style={{
                        color: "var(--color-light-blue)",
                        backgroundColor: "var(--color-light-blue30)",
                      }}>
                      Story ad
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      12 hours
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      24 hours
                    </div>
                  </div>
                </div>
              </div>
              {/* تبلیغ کمپین  */}
              <div
                className={styles.campaign}
                style={{
                  backgroundColor: "var(--color-light-yellow)",
                }}>
                <div className={styles.detail}>
                  <div className={styles.instagramprofile}>
                    <img
                      className={styles.instagramimage}
                      alt="profile image"
                      src="/no-profile.svg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className={styles.instagramprofiledetail}>
                      <div className={styles.instagramusername}>ّFull name</div>
                      <div className={styles.instagramid}>@Username</div>
                    </div>
                  </div>
                  <div className={styles.addetail}>
                    <div
                      className={styles.adtype}
                      style={{
                        color: "var(--color-light-yellow)",
                        backgroundColor: "var(--color-light-yellow30)",
                      }}>
                      campaign
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      12 hours
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      24 hours
                    </div>
                  </div>
                </div>
              </div>

              {/* ___ تبلیغات از گذشته ___*/}
              {/* تبلیغ پست از گذشته */}
              <div
                className={styles.postpast}
                style={{
                  backgroundColor: "var(--color-purple)",
                  gridColumn: "1/7",
                }}>
                <div className={styles.detailpast}>
                  <div className={styles.instagramprofile}>
                    <img
                      className={styles.instagramimage}
                      alt="profile image"
                      src="/no-profile.svg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className={styles.instagramprofiledetail}>
                      <div className={styles.instagramusername}>ّFull name</div>
                      <div className={styles.instagramid}>@Username</div>
                    </div>
                  </div>
                  <div className={styles.addetail}>
                    <div
                      className={styles.adtype}
                      style={{
                        color: "var(--color-purple)",
                        backgroundColor: "var(--color-purple30)",
                      }}>
                      post ad
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      24 hours
                    </div>
                  </div>
                </div>
              </div>
              {/* تبلیغ استوری از گذشته */}
              <div className={styles.storypast} style={{ backgroundColor: "var(--color-light-blue)" }}>
                <div className={styles.detailpast}>
                  <div className={styles.instagramprofile}>
                    <img
                      className={styles.instagramimage}
                      alt="profile image"
                      src="/no-profile.svg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className={styles.instagramprofiledetail}>
                      <div className={styles.instagramusername}>ّFull name</div>
                      <div className={styles.instagramid}>@Username</div>
                    </div>
                  </div>
                  <div className={styles.addetail}>
                    <div
                      className={styles.adtype}
                      style={{
                        color: "var(--color-light-blue)",
                        backgroundColor: "var(--color-light-blue30)",
                      }}>
                      Story ad
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      24 hours
                    </div>
                  </div>
                </div>
              </div>
              {/* تبلیغ کمپین از گذشته */}
              <div
                className={styles.campaignpast}
                style={{
                  backgroundColor: "var(--color-light-yellow)",
                }}>
                <div className={styles.detailpast}>
                  <div className={styles.instagramprofile}>
                    <img
                      className={styles.instagramimage}
                      alt="profile image"
                      src="/no-profile.svg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className={styles.instagramprofiledetail}>
                      <div className={styles.instagramusername}>ّFull name</div>
                      <div className={styles.instagramid}>@Username</div>
                    </div>
                  </div>
                  <div className={styles.addetail}>
                    <div
                      className={styles.adtype}
                      style={{
                        color: "var(--color-light-yellow)",
                        backgroundColor: "var(--color-light-yellow30)",
                      }}>
                      campaign
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      12 hours
                    </div>
                  </div>
                </div>
              </div>

              {/* ___ تبلیغات به آینده ___*/}
              {/* تبلیغ پست به آینده */}
              <div className={styles.postnext} style={{ backgroundColor: "var(--color-purple)" }}>
                <div className={styles.detailnext}>
                  <div className={styles.instagramprofile}>
                    <img
                      className={styles.instagramimage}
                      alt="profile image"
                      src="/no-profile.svg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className={styles.instagramprofiledetail}>
                      <div className={styles.instagramusername}>ّFull name</div>
                      <div className={styles.instagramid}>@Username</div>
                    </div>
                  </div>
                  <div className={styles.addetail}>
                    <div
                      className={styles.adtype}
                      style={{
                        color: "var(--color-purple)",
                        backgroundColor: "var(--color-purple30)",
                      }}>
                      post ad
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      24 hours
                    </div>
                  </div>
                </div>
              </div>
              {/* تبلیغ استوری به آینده */}
              <div className={styles.storynext} style={{ backgroundColor: "var(--color-light-blue)" }}>
                <div className={styles.detailnext}>
                  <div className={styles.instagramprofile}>
                    <img
                      className={styles.instagramimage}
                      alt="profile image"
                      src="/no-profile.svg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className={styles.instagramprofiledetail}>
                      <div className={styles.instagramusername}>ّFull name</div>
                      <div className={styles.instagramid}>@Username</div>
                    </div>
                  </div>
                  <div className={styles.addetail}>
                    <div
                      className={styles.adtype}
                      style={{
                        color: "var(--color-light-blue)",
                        backgroundColor: "var(--color-light-blue30)",
                      }}>
                      Story ad
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      24 hours
                    </div>
                  </div>
                </div>
              </div>
              {/* تبلیغ کمپین به آینده */}
              <div
                className={styles.campaignnext}
                style={{
                  backgroundColor: "var(--color-light-yellow)",
                }}>
                <div className={styles.detailnext}>
                  <div className={styles.instagramprofile}>
                    <img
                      className={styles.instagramimage}
                      alt="profile image"
                      src="/no-profile.svg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className={styles.instagramprofiledetail}>
                      <div className={styles.instagramusername}>ّFull name</div>
                      <div className={styles.instagramid}>@Username</div>
                    </div>
                  </div>
                  <div className={styles.addetail}>
                    <div
                      className={styles.adtype}
                      style={{
                        color: "var(--color-light-yellow)",
                        backgroundColor: "var(--color-light-yellow30)",
                      }}>
                      campaign
                    </div>
                    <div
                      className={styles.adtime}
                      style={{
                        color: "var(--color-gray)",
                        backgroundColor: "var(--color-gray30)",
                      }}>
                      12 hours
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ___ تعداد و مقدار از سعید باید گرفته شود و تعداد هم اکنون به صورت تست میباشد___*/}

            <div
              className={styles.chartlines}
              style={{
                gridTemplateColumns: "repeat(24, minmax(22px, 160px))",
              }}>
              <span className={styles.lines}>
                <div className={styles.hour0}>
                  12:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour2}>
                  1:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour1}>
                  2:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour2}>
                  3:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour1}>
                  4:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour2}>
                  5:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour0}>
                  6:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour2}>
                  7:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour1}>
                  8:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour2}>
                  9:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour1}>
                  10:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines} style={{ backgroundColor: "var(--color-light-blue10)" }}>
                <div className={styles.hour2}>
                  11:00<br></br>pm
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour0}>
                  12:00<br></br>am
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour2}>
                  1:00<br></br>am
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour1}>
                  2:00<br></br>am
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour2}>
                  3:00<br></br>am
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour1}>
                  4:00<br></br>am
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour2}>
                  5:00<br></br>am
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour0}>
                  6:00<br></br>am
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour2}>
                  7:00<br></br>am
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour1}>
                  8:00<br></br>am
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour2}>
                  9:00<br></br>am
                </div>
              </span>
              <span className={styles.lines}>
                <div className={styles.hour1}>
                  10:00<br></br>am
                </div>
              </span>
              <span className={styles.lines} style={{ borderRight: "1px dashed var(--color-gray30)" }}>
                <div className={styles.hour2}>
                  11:00<br></br>am
                </div>
              </span>
            </div>
          </div>
        </div>
        {/* ___timeline___*/}
        <div className={styles.Section}>
          <div className={styles.headerparent}>
            <div className={styles.submenu}>{t(LanguageKey.advertisecalendar_TIMELINEZOOM)}</div>
          </div>

          <div className={styles.submenu1}>
            <CheckBoxButton
              handleToggle={function (): void {
                throw new Error("Function not implemented.");
              }}
              value={false}
              textlabel={"Post Ad"}
              name="Post Ad"
              title={""}
            />
            <CheckBoxButton
              name="Story Ad"
              handleToggle={function (): void {
                throw new Error("Function not implemented.");
              }}
              value={false}
              textlabel={"Story Ad"}
              title={""}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Timeline;
