import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import InputBox from "brancy/components/design/inputBox/inputBox";
import TextArea from "brancy/components/design/textArea/textArea";
import ToggleCheckBoxButton from "brancy/components/design/switchButton/switchButton";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import { LanguageKey } from "brancy/i18n";
import { IMessagePanel } from "brancy/models/interfaces";
import styles from "./messagePanel.module.css";

function Customization({
  messagePanel,
  handleToggleFollowTemplate,
  handleChangeTitle,
  handleChangeContent,
  handleSaveFollowerTemplate,
  handleToggleInitialEngagementTemplate,
  handleChangeInitialEngagementTitle,
  handleChangeInitialEngagementContent,
  handleSaveInitialEngagementTemplate,
}: {
  messagePanel: IMessagePanel;
  handleToggleFollowTemplate: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangeTitle: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangeContent: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSaveFollowerTemplate: () => void;
  handleToggleInitialEngagementTemplate: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangeInitialEngagementTitle: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleChangeInitialEngagementContent: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSaveInitialEngagementTemplate: () => void;
}) {
  const { t } = useTranslation();
  const [isHidden, setIsHidden] = useState(false);
  return (
    <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className="headerChild" onClick={() => setIsHidden(!isHidden)}>
        <div className="circle"></div>
        <div className="Title">{t(LanguageKey.messagesetting_Customization)}</div>
      </div>
      <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
        <div className={styles.answercontainer}>
          <div className="headerandinput">
            <div className="headerparent">
              <div className="title2">
                {t(LanguageKey.messagesetting_AutoReplyPerFollow)}
                <Tooltip
                  triggerType="tooltip"
                  tooltipValue={t(LanguageKey.messagesetting_AutoReplyPerFollowtooltip)}
                  onClick={true}
                  position="bottom"
                />
              </div>

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
                  <>{messagePanel.followTemplate.title.length}/50</>
                </div>
              </div>
              <InputBox
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
                  <>{messagePanel.followTemplate.content.length}/15</>
                </div>
              </div>
              <InputBox
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
        <div className={styles.answercontainer}>
          <div className="headerandinput">
            <div className="headerparent">
              <div className="title2">
                {t(LanguageKey.messagesetting_InitialEngagement)}
                <Tooltip
                  triggerType="tooltip"
                  tooltipValue={t(LanguageKey.messagesetting_InitialEngagementtooltip)}
                  onClick={true}
                  position="bottom"
                />
              </div>

              <ToggleCheckBoxButton
                handleToggle={handleToggleInitialEngagementTemplate}
                checked={messagePanel.initialEngagementTemplate.isActive}
                name="initialEngagementTemplate"
                title={"initialEngagementTemplate"}
                role={"switch"}
              />
            </div>
            <div className="explain">{t(LanguageKey.messagesetting_InitialEngagementExplain)}</div>
          </div>

          <div className={`headerandinput ${!messagePanel.initialEngagementTemplate.isActive && "fadeDiv"}`}>
            <div className="headerandinput">
              <div className="headerparent">
                <div className="headertext">{t(LanguageKey.messagesetting_AutoReplyPerFollowtitle)}</div>
                <div className="counter">
                  <>{messagePanel.initialEngagementTemplate.title.length}/200</>
                </div>
              </div>
              <TextArea
                name="initialEngagementTitle"
                className="TextArea"
                onChange={handleChangeInitialEngagementTitle}
                value={messagePanel.initialEngagementTemplate.title}
                placeholder={t(LanguageKey.messagesetting_InitialEngagementtitlesample)}
                fadeTextArea={!messagePanel.initialEngagementTemplate.isActive}
                maxLength={200}
                role="textbox"
                title="initialEngagementTitle"
              />
            </div>
            <div className="headerandinput">
              <div className="headerparent">
                <div className="headertext">{t(LanguageKey.messagesetting_AutoReplyPerFollowbtn)}</div>
                <div className="counter">
                  <>{messagePanel.initialEngagementTemplate.content.length}/15</>
                </div>
              </div>
              <InputBox
                name="initialEngagementContent"
                handleInputChange={handleChangeInitialEngagementContent}
                className={"textinputbox"}
                value={messagePanel.initialEngagementTemplate.content}
                placeHolder={t(LanguageKey.messagesetting_InitialEngagementbtnsample)}
                fadeTextArea={!messagePanel.initialEngagementTemplate.isActive}
                maxLength={15}
              />
            </div>

            <button
              disabled={!messagePanel.initialEngagementTemplate.isActive}
              onClick={handleSaveInitialEngagementTemplate}
              style={{ minHeight: "40px" }}
              className={messagePanel.initialEngagementTemplate.isActive ? "saveButton" : "disableButton"}>
              {t(LanguageKey.save)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customization;
