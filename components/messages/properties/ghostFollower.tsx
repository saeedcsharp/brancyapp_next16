import { ChangeEvent } from "react";
import TextArea from "saeed/components/design/textArea/textArea";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import styles from "./properties.module.css";
function GhostFollower() {
  return (
    <div className="bigcard">
      <div className="headerChild">
        <div className="circle"></div>
        <div className="Title">ghost visitor message (soon)</div>
      </div>
      <div className={styles.all} style={{ opacity: "0.3" }}>
        <div className="headerandinput">
          <div
            className="headerparent"
            style={{ opacity: "0.4" }}
            role="region"
            aria-label="Ghost visitor message settings">
            <div className={styles.headertitle} role="heading" aria-level={2}>
              ghost visitor message
            </div>
            <ToggleCheckBoxButton
              name="ghost-visitor-toggle"
              handleToggle={function (): void {
                throw new Error("Function not implemented.");
              }}
              checked={false}
              title="Toggle ghost visitor message"
              role="switch"
              aria-label="Enable ghost visitor message"
            />
          </div>
          <div className="explain" style={{ opacity: "0.4" }}>
            This will be sent exclusively to who have only seen your profile Automatically
            <br></br>
            *This option can only be activated for pages with less than 5K followers
          </div>
        </div>
        <div className="headerandinput">
          <div className="headerparent">
            <div className={styles.headertitle}>Sent messages</div>
            <div className={styles.sentcounter}> 0 </div>
          </div>
        </div>
        <div className="headerandinput" style={{ height: "100%" }}>
          <div className="headerparent">
            <div className="headertext">message</div>
            <div className="c</div>ounter">
              ( <strong>0</strong> / <strong>2200</strong> )
            </div>
          </div>

          <TextArea
            name="ghost-visitor-message"
            className={"message"}
            placeHolder={"Enter message for ghost visitors"}
            fadeTextArea={false}
            handleInputChange={function (e: ChangeEvent<HTMLTextAreaElement>): void {
              throw new Error("Function not implemented.");
            }}
            handleKeyDown={undefined}
            value={""}
            maxLength={2200}
            title="Ghost Visitor Message Input"
            role="textbox"
            aria-label="Enter message for ghost visitors"
            aria-multiline="true"
            aria-required="true"
          />
          <div className="explain">
            *By placing "<strong>@</strong>" in the text, the username will be automatically written by system
          </div>
        </div>
      </div>
    </div>
  );
}

export default GhostFollower;
