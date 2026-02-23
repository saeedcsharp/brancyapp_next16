import { useSession } from "next-auth/react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"; // Added useRef, useCallback
import { useTranslation } from "react-i18next";
import Dotmenu from "../../design/dotMenu/dotMenu";
import DragDrop from "../../design/dragDrop/dragDrop";
import InputText from "../../design/inputText";
import ToggleCheckBoxButton from "../../design/toggleCheckBoxButton";
import Tooltip from "../../design/tooltip/tooltip";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "../../notifications/notificationBox";
import { LoginStatus } from "../../../helper/loadingStatus";
import { LanguageKey } from "../../../i18n";
import { MethodType } from "../../../helper/api";
import { Language } from "../../../models/messages/enum";
import { IMessagePanel } from "../../../models/messages/properies";
import styles from "./properties.module.css";
import { clientFetchApi } from "../../../helper/clientFetchApi";

function MessagePanel({
  messagePanel,
  handleHideRobotReply,
  handleLikeRobotReply,
  handleToggleFollowTemplate,
  handleChangeTitle,
  handleChangeContent,
  handleSaveFollowerTemplate,
  handleSaveLanguage,
  handleChangeDragDrop,
}: {
  messagePanel: IMessagePanel;
  handleHideRobotReply: (e: ChangeEvent<HTMLInputElement>) => void;
  handleLikeRobotReply: (e: ChangeEvent<HTMLInputElement>) => void;
  handleToggleFollowTemplate: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangeTitle: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangeContent: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangeDragDrop: (id: any) => void;
  handleSaveFollowerTemplate: () => void;
  handleSaveLanguage: () => void;
}) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const languageArr = [
    <div id={Language.English.toString()}>{Language[Language.English]}</div>,
    <div id={Language.Persian.toString()}>{Language[Language.Persian]}</div>,
    <div id={Language.Arabic.toString()}>{Language[Language.Arabic]}</div>,
    <div id={Language.Turkey.toString()}>{Language[Language.Turkey]}</div>,
    <div id={Language.French.toString()}>{Language[Language.French]}</div>,
    <div id={Language.Russian.toString()}>{Language[Language.Russian]}</div>,
    <div id={Language.German.toString()}>{Language[Language.German]}</div>,
  ];
  const [isHidden, setIsHidden] = useState(false);
  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };

  // Use useCallback for AutoreplyPerPost if it depends on props/state that don't change often
  const AutoreplyPerPost = useCallback(
    async (on: boolean) => {
      // Wrapped in useCallback
      if (!LoginStatus(session)) return;
      try {
        const res = await clientFetchApi<boolean, boolean>("Instagramer" + "" + `/Message${on ? "/ResumeAllAutoReplies" : "/PauseAllAutoReplies"}`, { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
        if (res.succeeded)
          internalNotify(on ? InternalResponseType.AutoReplyOn : InternalResponseType.AutoReplyOff, NotifType.Success);
        else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session]
  ); // Added session dependency

  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  // Replace popup state and refs with settings menu state and refs
  const [showSetting, setShowSetting] = useState(false);
  const settingsButtonRef = useRef<HTMLDivElement>(null); // Changed ref name
  const menuRef = useRef<HTMLDivElement>(null); // Changed ref name

  // Add handleClickOnIcon handler (adapted from autoreply.tsx)
  const handleClickOnIcon = useCallback(
    (id: string) => {
      switch (id) {
        case t(LanguageKey.activateAll):
          {
            AutoreplyPerPost(true);
            setShowSetting(false); // Close menu after action
          }
          break;
        case t(LanguageKey.DeactivateAll):
          {
            AutoreplyPerPost(false);
            setShowSetting(false); // Close menu after action
          }
          break;
      }
    },
    [AutoreplyPerPost, t] // Added dependencies
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click was outside both the menu and the settings button
      if (
        showSetting &&
        menuRef.current &&
        settingsButtonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setShowSetting(false);
      }
    };

    // Add event listener when menu is shown
    if (showSetting) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSetting]);

  useEffect(() => {
    if (selectedLanguage !== null) {
      handleSaveLanguage();
      setSelectedLanguage(null);
    }
  }, [selectedLanguage, handleSaveLanguage]);
  console.log("messagePanel:", messagePanel);
  return (
    <>
      <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
        <div className="headerChild" onClick={handleCircleClick}>
          <div className="circle"></div>
          <div className="Title">{t(LanguageKey.AdvanceSettings)}</div>
        </div>
        {
          <>
            <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
              <div className="headerandinput">
                <div className="headerparent">
                  <div className="title2">{t(LanguageKey.messagesetting_HideRobotReply)}</div>
                  <ToggleCheckBoxButton
                    handleToggle={handleHideRobotReply}
                    checked={messagePanel.robotReply}
                    name=" hideRobotReply"
                    title={" hideRobotReply"}
                    role={" switch"}
                  />
                </div>
                <div className="explain">{t(LanguageKey.messagesetting_HideRobotReplyExplain)}</div>
              </div>

              <div className="headerandinput">
                <div className="headerparent">
                  <div className="title2">{t(LanguageKey.messagesetting_LikeRobotReply)}</div>
                  <ToggleCheckBoxButton
                    handleToggle={handleLikeRobotReply}
                    checked={messagePanel.likeReplyStory}
                    name=" likeRobotReply"
                    title={" likeRobotReply"}
                    role={" switch"}
                  />
                </div>
                <div className="explain">{t(LanguageKey.messagesetting_LikeRobotReplyExplain)}</div>
              </div>
              <div className="headerandinput">
                <div className="headerparent">
                  <div className="title2">
                    {t(LanguageKey.messagesetting_automaticreplysystem)}
                    <Tooltip
                      tooltipValue={t(LanguageKey.messagesetting_automaticreplysystemforallposttooltip)}
                      onClick={true}
                      position="bottom">
                      <img
                        style={{
                          marginInline: "5px",
                          cursor: "pointer",
                          width: "15px",
                          height: "15px",
                        }}
                        alt="ℹ️ tooltip"
                        src="/tooltip.svg"
                      />
                    </Tooltip>
                  </div>
                  {/* START: Replace 3-dot button and popup with 2-dot button and menu */}
                  <Dotmenu
                    showSetting={showSetting}
                    onToggle={(isOpen) => setShowSetting(isOpen)}
                    handleClickOnIcon={handleClickOnIcon}
                    data={[
                      {
                        icon: "/Activate_All.svg",
                        value: t(LanguageKey.activateAll),
                      },
                      {
                        icon: "/Deactive_All.svg",
                        value: t(LanguageKey.DeactivateAll),
                      },
                    ]}
                  />
                  {/* END: Replace 3-dot button and popup with 2-dot button and menu */}
                </div>
                <div className="explain">{t(LanguageKey.messagesetting_automaticreplysystemforallpost)}</div>
              </div>

              <div className="headerandinput" style={{ gap: "1px" }}>
                <div className="headerparent">
                  <div className="title2">{t(LanguageKey.messagesetting_messagePanellanguage)}</div>
                  <div style={{ minWidth: "40%" }} className={messagePanel.language === 1e6 ? "fadeDiv" : ""}>
                    <DragDrop
                      data={languageArr}
                      handleOptionSelect={(id) => {
                        handleChangeDragDrop(id);
                        setSelectedLanguage(id);
                      }}
                      item={messagePanel.language}
                    />
                  </div>
                </div>
                <div className="explain">{t(LanguageKey.messagesetting_messagePanellanguageExplain)}</div>
              </div>
              <div
                className="headerandinput"
                style={{
                  padding: "var(--padding-10) var(--padding-14)",
                  width: "calc(100% + 24px)",
                  alignSelf: "center",
                  backgroundColor: "var(--color-gray10)",
                  borderRadius: "var(--br15)",
                }}>
                <div className="headerandinput">
                  <div className="headerparent">
                    <div className="title2">{t(LanguageKey.messagesetting_AutoReplyPerFollow)}</div>

                    <ToggleCheckBoxButton
                      handleToggle={handleToggleFollowTemplate}
                      checked={messagePanel.followTemplate.isActive}
                      name="likeRobotReply"
                      title={"likeRobotReply"}
                      role={"switch"}
                    />
                  </div>
                  <div className="explain">{t(LanguageKey.messagesetting_AutoReplyPerFollowExplain)}</div>
                </div>

                <div className={`headerandinput ${!messagePanel.followTemplate.isActive && "fadeDiv"}`}>
                  <div className="headerandinput">
                    <div className="headerparent">
                      <div className="headertext">{t(LanguageKey.messagesetting_AutoReplyPerFollowtitle)}</div>
                      <div className="counter">
                        <strong>{messagePanel.followTemplate.title.length}</strong>/ <strong>50</strong>
                      </div>
                    </div>
                    <InputText
                      name="title"
                      className={"textinputbox"}
                      handleInputChange={handleChangeTitle}
                      value={messagePanel.followTemplate.title}
                      placeHolder={t(LanguageKey.messagesetting_AutoReplyPerFollowtitlesample)}
                      fadeTextArea={!messagePanel.followTemplate.isActive}
                      maxLength={50}
                    />
                  </div>
                  <div className="headerandinput">
                    <div className="headerparent">
                      <div className="headertext">{t(LanguageKey.messagesetting_AutoReplyPerFollowbtn)}</div>
                      <div className="counter">
                        <strong>{messagePanel.followTemplate.content.length}</strong>/ <strong>15</strong>
                      </div>
                    </div>
                    <InputText
                      name="content"
                      handleInputChange={handleChangeContent}
                      className={"textinputbox"}
                      value={messagePanel.followTemplate.content}
                      placeHolder={t(LanguageKey.messagesetting_AutoReplyPerFollowbtnsample)}
                      fadeTextArea={!messagePanel.followTemplate.isActive}
                      maxLength={15}
                    />
                  </div>

                  <button
                    disabled={!messagePanel.followTemplate.isActive}
                    onClick={handleSaveFollowerTemplate}
                    style={{ minHeight: "40px" }}
                    className={messagePanel.followTemplate.isActive ? "saveButton" : "disableButton"}>
                    {t(LanguageKey.save)}
                  </button>
                </div>
              </div>
            </div>
          </>
        }
      </div>
    </>
  );
}

export default MessagePanel;
