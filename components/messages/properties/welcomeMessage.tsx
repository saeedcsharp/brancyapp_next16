import { useSession } from "next-auth/react";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TextArea from "saeed/components/design/textArea/textArea";
import FlexibleToggleButton from "saeed/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "saeed/components/design/toggleButton/types";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import Loading from "saeed/components/notOk/loading";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import {
  IWelcomingMessage_Figure,
  IWelcomingMessage_GetCondition,
  IWelcomingMessage_GetSentMessage,
} from "saeed/models/messages/properies";
import styles from "./properties.module.css";
function WelcomeMessage() {
  const [icebreakerToggle, seticebreakerToggle] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [loadingStatus, setLoadingStaus] = useState(RoleAccess(session, PartnerRole.Message) && LoginStatus(session));
  const [activeWelcome, setActiveWelcome] = useState<boolean>(true);
  const [activeGoodbye, setActiveGoodby] = useState<boolean>(true);
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const [goodbyeMessage, setGoodbyeMessage] = useState<string>("");
  const [isTextChanged, setIsTextChanged] = useState<boolean>(false);
  const [welcomepopup, setwelcomepopup] = useState<boolean>(false); // state برای پاپ‌آپ
  const [goodbyepopup, setgoodbyepopup] = useState<boolean>(false); // state برای پاپ‌آپ
  const [condition, setCondition] = useState<IWelcomingMessage_GetCondition>();
  const [figure, setFigure] = useState<IWelcomingMessage_Figure>();
  const [sentMessages, setSentMessages] = useState<IWelcomingMessage_GetSentMessage[]>();
  function handleActiveWelcome(e: ChangeEvent<HTMLInputElement>) {
    setActiveWelcome(e.target.checked);
  }

  function handleActiveGoodbye(e: ChangeEvent<HTMLInputElement>) {
    setActiveGoodby(e.target.checked);
  }

  function handleChangeWelcomeMessage(e: ChangeEvent<HTMLTextAreaElement>) {
    setWelcomeMessage(e.currentTarget.value);
    setIsTextChanged(true);
  }

  function handleChangeGoodbyMessage(e: ChangeEvent<HTMLTextAreaElement>) {
    setGoodbyeMessage(e.currentTarget.value);
    setIsTextChanged(true);
  }

  function handleSave() {
    setIsTextChanged(false);
  }
  async function fetchData() {
    setLoadingStaus(false);
    // let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    // try {
    //   const [checkRes, conditionRes, figureRes, acceptedFollowersRes] =
    //     await Promise.all([
    //       GetServerResult<boolean, boolean>(
    //         MethodType.get,
    //         session,
    //         "Instagramer" +
    //           instagramerId +
    //           "/SendWelcomeMessage/CheckAvailability"
    //       ),
    //       GetServerResult<boolean, IWelcomingMessage_GetCondition>(
    //         MethodType.get,
    //         session,
    //         "Instagramer"+ "/SendWelcomeMessage/GetCondition"
    //       ),
    //       GetServerResult<boolean, IWelcomingMessage_Figure>(
    //         MethodType.get,
    //         session,
    //         "Instagramer"+ "/SendWelcomeMessage/GetFigure"
    //       ),
    //       GetServerResult<boolean, IWelcomingMessage_GetSentMessage[]>(
    //         MethodType.get,
    //         session,
    //         "Instagramer" +
    //           instagramerId +
    //           "/SendWelcomeMessage/GetSendMessages"
    //       ),
    //     ]);
    //   if (checkRes.value) {
    //     setCondition(conditionRes.value);
    //     setFigure(figureRes.value);
    //     setSentMessages(acceptedFollowersRes.value);
    //     setLoadingStaus((prev) => ({ ...prev, loading: false, ok: true }));
    //   } else if (checkRes.info.responseType === ResponseType.PasswordRequired)
    //     setLoadingStaus((prev) => ({
    //       ...prev,
    //       loading: false,
    //       notPassword: true,
    //     }));
    //   else if (
    //     checkRes.info.responseType === ResponseType.PackageRequiredInThisTime
    //   )
    //     setLoadingStaus((prev) => ({
    //       ...prev,
    //       loading: false,
    //       notBasePackage: true,
    //     }));
    //   else if (
    //     checkRes.info.responseType === ResponseType.FeatureRequiredInThisTime
    //   )
    //     setLoadingStaus((prev) => ({
    //       ...prev,
    //       loading: false,
    //       notFeature: true,
    //     }));
    // } catch (error) {
    //   console.error("One of the requests failed:", error);
    //   internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
    // }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // تابع برای نمایش پاپ‌آپ
  function handlePopupTogglewelcome() {
    setwelcomepopup(!welcomepopup);
  }
  // تابع برای نمایش پاپ‌آپ
  function handlePopupTogglegoodbye() {
    setgoodbyepopup(!goodbyepopup);
  }
  const [isHidden, setIsHidden] = useState(false); // New state to toggle visibility and grid-row-end
  const handleCircleClick = () => {
    setIsHidden(!isHidden); // Toggle visibility and grid-row-end state
  };
  return (
    <div
      className="tooBigCard"
      style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }} // Update gridRowEnd based on isHidden
    >
      <div className="headerChild" onClick={handleCircleClick}>
        <div className="circle"></div>
        <div className="Title">{t(LanguageKey.messagesetting_welcomingmessage)}</div>
      </div>
      {loadingStatus && <Loading />}
      {!loadingStatus && (
        <>
          <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
            <FlexibleToggleButton
              options={[
                { label: t(LanguageKey.messagesetting_welcome), id: 0 },
                { label: t(LanguageKey.messagesetting_goodbye), id: 1 },
              ]}
              onChange={seticebreakerToggle}
              selectedValue={icebreakerToggle}
            />

            {icebreakerToggle === ToggleOrder.FirstToggle && (
              <>
                <div className="headerandinput">
                  <div className="headerparent">
                    <div className={styles.headertitle}>{t(LanguageKey.messagesetting_Activewelcomingmessage)}</div>
                    <ToggleCheckBoxButton
                      handleToggle={handleActiveWelcome}
                      checked={activeWelcome}
                      name="welcome-message-toggle"
                      aria-label="Activate welcome message"
                      title="Toggle welcome message on/off"
                      role="switch"
                      aria-checked={activeWelcome}
                    />
                  </div>
                  <div className="explain">{t(LanguageKey.messagesetting_Activewelcomemessageexplain)}</div>
                </div>
                <div className={`${styles.content} ${!activeWelcome && "fadeDiv"} `}>
                  <div className="headerandinput" onClick={handlePopupTogglewelcome}>
                    <div className="headerparent" style={{ cursor: "pointer" }}>
                      <div className={styles.headertitle}>{t(LanguageKey.messagesetting_Sentmessages)}</div>
                      <div className={styles.sentcounter}>{/* {sentMessages.length} */}</div>
                    </div>
                  </div>

                  {welcomepopup && (
                    <div className={styles.welcomingpopup}>
                      <div className="headerparent" onClick={handlePopupTogglewelcome} style={{ cursor: "pointer" }}>
                        <div className={styles.headertitle}>{t(LanguageKey.messagesetting_Sentmessages)}</div>
                        <div className={styles.sentcounter}>{/* {sentMessages.length} */}</div>
                      </div>
                      <div className={styles.popupchart}> </div>
                      <div className={styles.popupclist}> </div>

                      <button className="cancelButton" style={{ minHeight: "50px" }} onClick={handlePopupTogglewelcome}>
                        {t(LanguageKey.back)}
                      </button>
                    </div>
                  )}

                  <div className="headerandinput" style={{ height: "100%" }}>
                    <div className="headerparent">
                      <div className="headertext">{t(LanguageKey.message)}</div>
                      <div className="counter">
                        ( <strong>{welcomeMessage.length}</strong> / <strong>2200</strong> )
                      </div>
                    </div>
                    <TextArea
                      className={"message"}
                      placeHolder={""}
                      fadeTextArea={false}
                      handleInputChange={handleChangeWelcomeMessage}
                      handleKeyDown={undefined}
                      value={welcomeMessage}
                      maxLength={2200}
                      name="welcome-message"
                      title="Welcome Message Input"
                      role="textbox"
                      aria-label="Enter welcome message text"
                    />
                  </div>

                  <button
                    style={{ minHeight: "50px" }}
                    onClick={isTextChanged ? handleSave : undefined}
                    className={isTextChanged ? "saveButton" : "disableButton"}
                    disabled={!isTextChanged}>
                    {t(LanguageKey.save)}
                  </button>
                </div>
              </>
            )}

            {icebreakerToggle === ToggleOrder.SecondToggle && (
              <>
                <div className="headerandinput">
                  <div className="headerparent">
                    <div className={styles.headertitle}>{t(LanguageKey.messagesetting_ActiveFarewellmessage)}</div>
                    <ToggleCheckBoxButton
                      handleToggle={handleActiveGoodbye}
                      checked={activeGoodbye}
                      name="goodbye-message-toggle"
                      aria-label="Activate farewell message"
                      title="Toggle farewell message on/off"
                      role="switch"
                      aria-checked={activeGoodbye}
                    />
                  </div>
                  <div className="explain">{t(LanguageKey.messagesetting_ActiveFarewellmessageexplain)}</div>
                </div>
                <div className={`${styles.content} ${!activeGoodbye && "fadeDiv"} `}>
                  <div className="headerandinput" onClick={handlePopupTogglegoodbye} style={{ cursor: "pointer" }}>
                    <div className="headerparent">
                      <div className={styles.headertitle}>{t(LanguageKey.messagesetting_Sentmessages)}</div>
                      <div className={styles.sentcounter}>{/* {welcomingMessage.goodbye.sentMessage} */}</div>
                    </div>
                  </div>
                  {goodbyepopup && (
                    <div className={styles.welcomingpopup}>
                      <div className="headerparent" onClick={handlePopupTogglegoodbye} style={{ cursor: "pointer" }}>
                        <div className={styles.headertitle}>{t(LanguageKey.messagesetting_Sentmessages)}</div>
                        <div className={styles.sentcounter}>{/* {welcomingMessage.goodbye.sentMessage} */}</div>
                      </div>
                      <div className={styles.popupchart}> </div>
                      <div className={styles.popupclist}> </div>

                      <button className="cancelButton" style={{ minHeight: "50px" }} onClick={handlePopupTogglegoodbye}>
                        {t(LanguageKey.back)}
                      </button>
                    </div>
                  )}
                  <div className="headerandinput" style={{ height: "100%" }}>
                    <div className="headerparent">
                      <div className="headertext">{t(LanguageKey.message)}</div>
                      <div className="counter">
                        ( <strong>{goodbyeMessage.length}</strong> / <strong>2200</strong> )
                      </div>
                    </div>
                    <TextArea
                      className={"message"}
                      placeHolder={""}
                      fadeTextArea={false}
                      handleInputChange={handleChangeGoodbyMessage}
                      handleKeyDown={undefined}
                      value={goodbyeMessage}
                      maxLength={2200}
                      name="goodbye-message"
                      title="Goodbye Message Input"
                      role="textbox"
                      aria-label="Enter goodbye message text"
                    />
                  </div>
                  <button
                    style={{ minHeight: "50px" }}
                    onClick={isTextChanged ? handleSave : undefined}
                    className={isTextChanged ? "saveButton" : "disableButton"}
                    disabled={!isTextChanged}>
                    {t(LanguageKey.save)}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default WelcomeMessage;
