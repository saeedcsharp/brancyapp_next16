import { useSession } from "next-auth/react";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RadioButton from "saeed/components/design/radioButton";
import TextArea from "saeed/components/design/textArea/textArea";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import Loading from "saeed/components/notOk/loading";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import {
  BusinessFilterMsgType,
  BusinessFilterNumberType,
  IBusinessMessageFilter,
} from "saeed/models/messages/properies";
import styles from "./properties.module.css";

function BusinessFilter() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.Message));

  const [businessFiltering, setbusinessFiltering] = useState<IBusinessMessageFilter>({
    activeBusinessFilter: false,
    businessMessageFilterType: BusinessFilterNumberType.SpecificWords,
    message: "",
  });

  const [radioButton, setRadioButton] = useState<BusinessFilterNumberType>(BusinessFilterNumberType.AI);
  const [message, setMessage] = useState<string>("");
  const [activeBusinessFilter, setActiveBusinessFilter] = useState<boolean>(false);

  // State to store tags
  const [tags, setTags] = useState<string[]>([]);

  const handleActiveBusinessFilter = () => {
    const active = activeBusinessFilter;
    setActiveBusinessFilter(!activeBusinessFilter);
    businessFiltering.activeBusinessFilter = !active;
  };

  function handleChangeRadioButton(e: ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.name;
    let numberType = 0;
    if (value === BusinessFilterMsgType.AI) {
      setRadioButton(BusinessFilterNumberType.AI);
      numberType = BusinessFilterNumberType.AI;
    } else if (value === BusinessFilterMsgType.SpecificWords) {
      setRadioButton(BusinessFilterNumberType.SpecificWords);
      numberType = BusinessFilterNumberType.SpecificWords;
    }
    businessFiltering.businessMessageFilterType = numberType;
  }

  function handleChangeMessage(e: ChangeEvent<HTMLTextAreaElement>) {
    if (radioButton === BusinessFilterNumberType.AI) return;
    setMessage(e.currentTarget.value);
    businessFiltering.message = e.currentTarget.value;
  }

  // Handle Enter key to add a tag
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent adding a newline
      const trimmedMessage = message.trim();
      if (trimmedMessage) {
        setTags([...tags, trimmedMessage]);
        setMessage(""); // Clear the input after adding
      }
    }
  };

  // Remove tag function
  const handleRemoveTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  function handleSave() {
    console.log("businessfiltering ", businessFiltering);
  }

  async function fetchData() {}

  const [isHidden, setIsHidden] = useState(false); // New state to toggle visibility and grid-row-end
  const handleCircleClick = () => {
    setIsHidden(!isHidden); // Toggle visibility and grid-row-end state
  };

  useEffect(() => {
    //Apt to get business message filter info
    fetchData();
  }, []);

  return (
    <div
      className="tooBigCard"
      style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }} // Update gridRowEnd based on isHidden
    >
      <div className="headerChild" onClick={handleCircleClick}>
        <div className="circle"></div>
        <div className="Title">{t(LanguageKey.messagesetting_businessmessagefiltering)}</div>
      </div>
      {loadingStatus && <Loading />}
      {/* {loadingStatus.ok &&  */}(
      <>
        <div className={`${styles.all} ${isHidden ? styles.notshow : styles.show}`}>
          <div className="headerandinput">
            <div className="headerparent" role="region" aria-label="Business message filter controls">
              <div className={styles.headertitle} role="heading" aria-level={2}>
                {t(LanguageKey.messagesetting_businessmessagefilter)}
              </div>
              <ToggleCheckBoxButton
                handleToggle={handleActiveBusinessFilter}
                checked={activeBusinessFilter}
                name="business-filter-toggle"
                title="Toggle business message filter"
                role="switch"
                aria-label="Enable or disable business message filtering"
              />
            </div>
            <div className="explain">{t(LanguageKey.messagesetting_businessmessagefilteringexplain)}</div>
          </div>
          <div className={`${styles.content} ${!activeBusinessFilter && "fadeDiv"} `}>
            <div className="headerandinput" role="radiogroup" aria-label="Filter selection options">
              <div className={styles.headerparent1}>
                <RadioButton
                  name="ai-filter"
                  id={t(LanguageKey.messagesetting_autofiltering)}
                  checked={radioButton === BusinessFilterNumberType.AI}
                  handleOptionChanged={handleChangeRadioButton}
                  aria-checked={radioButton === BusinessFilterNumberType.AI}
                  aria-label="Enable automatic AI-based filtering"
                  textlabel={t(LanguageKey.messagesetting_autofiltering)}
                />
              </div>
              <div className="headerandinput">
                <RadioButton
                  name="specific-words-filter"
                  id={t(LanguageKey.messagesetting_specificwords)}
                  checked={radioButton === BusinessFilterNumberType.SpecificWords}
                  handleOptionChanged={handleChangeRadioButton}
                  aria-checked={radioButton === BusinessFilterNumberType.SpecificWords}
                  aria-label="Enable specific words filtering"
                  textlabel={t(LanguageKey.messagesetting_specificwords)}
                />
              </div>
            </div>

            <div
              className={`headerandinput ${radioButton === BusinessFilterNumberType.AI ? "fadeDiv" : ""}`}
              style={{ height: "100%" }}
              role="region"
              aria-label="Specific words input section">
              <div className="explain" role="note"></div>
              <TextArea
                style={{ maxHeight: "200px" }}
                className={"message"}
                placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                fadeTextArea={radioButton === BusinessFilterNumberType.AI}
                handleInputChange={handleChangeMessage}
                handleKeyDown={handleKeyDown}
                value={message}
                maxLength={35}
                name="specific-words-input"
                title="Specific Words Input"
                role="textbox"
                aria-label="Enter specific words for filtering"
                aria-multiline="true"
                aria-required="true"
              />
            </div>
            <div
              className={`headerandinput ${radioButton === BusinessFilterNumberType.AI ? "fadeDiv" : ""}`}
              style={{ height: "100%", marginTop: "10px" }}>
              <div className="headerparent">
                <div className="headertext">{t(LanguageKey.messagesetting_selectedwords)}</div>
                <div className="counter">
                  ( <strong>{tags.length}</strong> )
                </div>
              </div>
              <div className={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <div key={index} className={styles.tag}>
                    {tag}
                    <span
                      style={{ cursor: "pointer", fontSize: "var(--font-10)" }}
                      onClick={() => handleRemoveTag(index)}>
                      ❌
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div onClick={handleSave} className="saveButton" style={{ minHeight: "50px" }}>
              {t(LanguageKey.save)}
            </div>
          </div>
        </div>
      </>
      ){"}"}
    </div>
  );
}

export default BusinessFilter;
