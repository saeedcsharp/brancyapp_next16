import { ChangeEvent, useState } from "react";
import CheckBoxButton from "../../design/checkBoxButton";
import InputText from "../../design/inputText";
import TextArea from "../../design/textArea/textArea";
import { IPropmt } from "../../../models/messages/properies";
import styles from "./properties.module.css";

function Prompt(props: { data: IPropmt; propmptNumber: number }) {
  const [inputText, setInputText] = useState<string>(props.data.incomeMsg);
  const [checkbox, setCheckbox] = useState<boolean>(props.data.activePrompt);
  const [textArea, settextArea] = useState<string>(props.data.answer);
  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.currentTarget.value);
    props.data.incomeMsg = e.currentTarget.value;
  };
  const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    settextArea(e.currentTarget.value);
    props.data.answer = e.currentTarget.value;
  };
  const handleChangeCheckBox = () => {
    let updatedCheck = checkbox;
    setCheckbox(!checkbox);
    props.data.activePrompt = !updatedCheck;
  };
  return (
    <div className={styles.autosection}>
      <div className={styles.autoactive}>
        <CheckBoxButton
          handleToggle={handleChangeCheckBox}
          value={checkbox}
          textlabel={"Activate prompt"}
          name={`prompt-activation-${props.propmptNumber}`}
          title="Toggle prompt activation"
          aria-label={`Activate prompt ${props.propmptNumber}`}
        />
        <div className={styles.autoline}></div>
      </div>
      <div className={`${styles.content} ${!checkbox && "fadeDiv"}`}>
        <div className="headerandinput">
          <div className={styles.autotextareaheader}>
            <div className="headertext">prompt ({props.propmptNumber})</div>
            <div className="counter">
              ( <strong>{inputText.length}</strong> / <strong>100</strong> )
            </div>
          </div>
          <InputText
            className="textinputbox"
            placeHolder="Income Message"
            handleInputChange={handleChangeInput}
            value={inputText}
            maxLength={100}
            name={"prompt-text"}
          />
        </div>
        <div className="headerandinput" style={{ height: "100%" }}>
          <div className={styles.autotextareaheader}>
            <div className="headertext">Answer</div>
            <div className="counter">
              ( <strong>0</strong> / <strong>2200</strong> )
            </div>
          </div>
          <TextArea
            className={"message"}
            placeHolder={""}
            fadeTextArea={false}
            handleInputChange={handleChangeTextArea}
            handleKeyDown={undefined}
            value={textArea}
            maxLength={2200}
            name={`prompt-answer-${props.propmptNumber}`}
            title="Prompt Answer Input"
            role="textbox"
            aria-label={`Answer for prompt ${props.propmptNumber}`}
            aria-multiline="true"
            aria-required="true"
          />
        </div>
      </div>
    </div>
  );
}

export default Prompt;
