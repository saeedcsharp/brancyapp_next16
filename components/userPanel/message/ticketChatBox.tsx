import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import InputEmoji from "react-input-emoji";
import { DateObject } from "react-multi-date-picker";
import RingLoader from "saeed/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import { convertHeicToJpeg } from "saeed/helper/convertHeicToJPEG";
import initialzedTime from "saeed/helper/manageTimer";
import { IOwnerInbox, ISendTicketMessage, ITicket, ITicketMediaType } from "saeed/models/userPanel/message";
import LinkifyText from "../../../context/LinkifyText";
import styles from "./ticketChatBox.module.css";
const UserPanelDirectChatBox = (props: {
  userSelectId: number | null;
  chatBox: ITicket;
  sendingMessages: ISendTicketMessage[];
  showIcon: string;
  ownerInbox: IOwnerInbox;
  showUserList: () => void;
  handleShowIcon: (e: MouseEvent) => void;
  handleSendMessage: (message: ISendTicketMessage) => void;
  handleSendRead: (ticketId: number) => void;
  handleSendReport: (report: { title: string; message: string }, ticketId: number) => void;
  fetchItemData: (chatBox: ITicket) => Promise<void>;
  onImageContainerClick?: (info: { url: string; width: number; height: number }) => void;
  onSendFile: (sendFile: { file: File; threadId: string; igid: string }) => void;
  setShowReport: (show: boolean) => void;
  setReport: (
    report:
      | { title: string; message: string }
      | ((prev: { title: string; message: string }) => {
          title: string;
          message: string;
        })
  ) => void;
}) => {
  const [dateFormatToggle, setDateFormatToggle] = useState("");
  const toggleDateFormat = (itemId: string | null) => {
    if (!itemId) return;
    if (dateFormatToggle === itemId) setDateFormatToggle("");
    else setDateFormatToggle(itemId);
  };
  const formatDate = (timestamp: number, itemId: string | null) => {
    return dateFormatToggle === itemId
      ? new DateObject({
          date: timestamp,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).format("DD/MM/20YY - dddd - hh:mm A")
      : new DateObject({
          date: timestamp,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).format("ddd - hh:mm A");
  };
  const formatDate1 = (timestamp: number, itemId: string | null) => {
    return dateFormatToggle === itemId
      ? new DateObject({
          date: timestamp,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).format("hh:mm A - dddd - DD/MM/20YY")
      : new DateObject({
          date: timestamp,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).format("hh:mm A - ddd");
  };
  const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  var unixTypingTime = 0;
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [answerBox, setAnswerBox] = useState<string>("");
  const [backToButton, setBackToButton] = useState<boolean>(true);
  const [chatId, setChatId] = useState("");
  const loading = useRef(false);
  const [loading2, setLoading2] = useState(false);

  const handleInputOnChange = (value: string) => {
    if (value.length === 0) {
      unixTypingTime = 0;

      return;
    }
    if (Date.now() > unixTypingTime + 11000) {
      unixTypingTime = Date.now();
    }
    setAnswerBox(value);
  };
  const handleScroll = async () => {
    if (loading.current) return;
    const container = chatBoxRef.current;
    const atBottom = (container!.scrollHeight + container!.scrollTop) / container!.clientHeight - 1 < 0.3;
    if (container && container?.scrollTop < 0) setBackToButton(false);
    if (container && container?.scrollTop >= 0) setBackToButton(true);
    if (atBottom && !loading.current && props.chatBox.nextMaxId) {
      setLoading2(true);
      loading.current = true; // Block further calls
      await props.fetchItemData(props.chatBox).finally(() => {
        setTimeout(() => {
          loading.current = false;
        }, 500); // Reset after fetching
        setLoading2(false);
      });
    }
  };
  const handleBackToButton = () => {
    const container = chatBoxRef.current;
    if (container) container.scrollTop = 0;
    setBackToButton(true);
  };
  const handleClickOnIcon = (e: MouseEvent) => {
    setChatId(e.currentTarget.id);
    props.handleShowIcon(e);
  };
  const handleClickSubIcon = async (iconId: string) => {
    var item = props.chatBox.items.find((x) => x.itemId === chatId);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles: File[] = Array.from(e.dataTransfer.files);
    if (droppedFiles) {
      props.onSendFile({
        file: droppedFiles[0],
        threadId: props.chatBox.ticketId.toString(),
        igid: props.chatBox.fbId,
      });
    }
  };
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  const handleUploadImage = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let file = await convertHeicToJpeg(e.target.files?.[0]!);
    if (!file) return;
    if (file.type.startsWith("image/")) {
      props.onSendFile({
        file: file,
        threadId: props.chatBox.ticketId.toString(),
        igid: props.chatBox.fbId,
      });
    }
    e.target.value = "";
  };

  const handleSendText = async () => {
    try {
      var text = answerBox.replaceAll("</br>", "\n");
      if (text.length === 0) return;
      props.handleSendMessage({
        itemType: ITicketMediaType.Text,
        text: text,
        ticketId: props.chatBox.ticketId,
        imageBase64: null,
        file: null,
        clientContext: "",
      });
      setAnswerBox("");
    } catch (error) {
      setAnswerBox("");
      notify(ResponseType.Unexpected, NotifType.Error, "socket error");
    }
  };
  const handleFindEmoji = (text: string | null) => {
    if (!text) return null;
    var emojiRegex =
      /[\u{1F000}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}\u{2E80}-\u{2E99}\u{2E9B}-\u{2EF3}\u{2F00}-\u{2FD5}\u{2FF0}-\u{2FFB}\u{3000}-\u{3037}\u{303D}\u{3190}-\u{319F}\u{3200}-\u{321C}\u{3220}-\u{3243}\u{3250}-\u{32FE}\u{3300}-\u{4DBF}\u{4E00}-\u{A48C}\u{A490}-\u{A4C6}\u{A960}-\u{A97C}\u{AC00}-\u{D7A3}\u{D7B0}-\u{D7C6}\u{D7CB}-\u{D7FB}\u{F900}-\u{FAFF}\u{FE00}-\u{FE0F}\u{FE10}-\u{FE19}\u{FE30}-\u{FE52}\u{FE54}-\u{FE66}\u{FE68}-\u{FE6B}\u{FF01}-\u{FF60}\u{FFFD}\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E0000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}\u{200D}]/gu;
    var nonEmojiText = text.replace(emojiRegex, "");
    return nonEmojiText.trim();
  };
  const [lock, setLock] = useState(false);
  useEffect(() => {
    setLock(false);
    if (!props.chatBox.items.find((x) => x.timeStampUnix > props.chatBox.userLastSeenUnix)) {
      console.log("lockkkkkkkkkk");
      setLock(true);
    }
    return () => {
      console.log("timeStampUnix", props.chatBox.items[0].timeStampUnix);
      console.log("userLastSeenUnix", props.chatBox.userLastSeenUnix);
      if (
        props.chatBox.items.find((x) => x.sentByFb) &&
        props.chatBox.items.find((x) => x.sentByFb)!.timeStampUnix > props.chatBox.userLastSeenUnix
      ) {
        console.log("handleSendReaddddd");

        props.handleSendRead(props.chatBox.ticketId);
      }
    };
  }, [props.userSelectId]);

  return (
    <>
      {/* ___header ___*/}
      {
        <div className={styles.header}>
          <div className={styles.rightrow}>
            <svg onClick={props.showUserList} className={styles.backicon} fill="none" viewBox="0 0 14 11">
              <path
                d="M13 4.4H3.3l3-3A1 1 0 0 0 5 0L.3 4.7A1 1 0 0 0 .3 6l4.6 4.7a1 1 0 0 0 1.4-1.4l-3-3H13a1 1 0 0 0 0-2"
                fill="var(--color-light-blue)"
              />
            </svg>

            <div className={styles.userchat}>
              <div className={styles.onlinering}>
                <img
                  className={styles.pictureIcon}
                  alt="profile"
                  src={baseMediaUrl + props.chatBox.profileUrl}
                  onClick={() => {}}
                />
              </div>
              <div className={styles.profile}>
                {
                  <>
                    <div className={styles.username}>{props.chatBox.username ? props.chatBox.username : ""}</div>
                    {props.chatBox.username && <div className={styles.username}>@{props.chatBox.username}</div>}
                  </>
                }
              </div>
            </div>
          </div>
          <div className={styles.leftrow} role="complementary" aria-label="Settings and vanish mode controls">
            {!props.chatBox.reportedToAdmin ? (
              <img
                style={{
                  cursor: "pointer",
                  width: "30px",
                  height: "30px",
                }}
                title="ℹ️ Settings"
                src="/more.svg"
                alt="Settings icon"
                aria-label="Settings button"
                role="button"
                onClick={() => {
                  props.setReport({ title: "", message: "" });
                  props.setShowReport(true);
                }}
              />
            ) : (
              <div className="headerandinput">
                <div className="title">{"reported at"}</div>
                {new DateObject({
                  date: props.chatBox.reportTimeToAdmin! / 1000,
                  calendar: initialzedTime().calendar,
                  locale: initialzedTime().locale,
                }).format("MM/DD/YYYY hh:mm A")}
              </div>
            )}
          </div>
        </div>
      }
      {/* ___chat___*/}
      {
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onScroll={handleScroll}
          ref={chatBoxRef}
          className={styles.chat}>
          {props.sendingMessages.length > 0 && (
            <>
              {props.sendingMessages
                .map((v, i) => (
                  <div key={i} className={styles.rightchatrow}>
                    {v.itemType === ITicketMediaType.Text && (
                      <div key={i}>
                        <div className={styles.rightchat}>
                          <div
                            style={handleFindEmoji(v.text) ? { background: "var(--color-dark-blue)" } : {}}
                            className={styles.rightchatMSG}>
                            <LinkifyText text={v.text} />
                          </div>
                        </div>
                      </div>
                    )}
                    {v.itemType === ITicketMediaType.Image && (
                      <div className={styles.rightchat}>
                        <img
                          style={{
                            borderRadius: "var(--br5)",
                          }}
                          src={v.imageBase64 ? v.imageBase64 : ""}
                          alt="Image"
                          width={200}
                          height={200}
                        />
                      </div>
                    )}
                  </div>
                ))
                .reverse()}
            </>
          )}
          {props.chatBox.items
            .sort((a, b) => b.timeStampUnix - a.timeStampUnix)
            .map((v) => (
              <div key={v.itemId}>
                {/* ___left chat___*/}
                {v.sentByFb && (
                  <>
                    {props.chatBox.userLastSeenUnix < v.timeStampUnix &&
                      props.chatBox.items
                        .filter((item) => item.timeStampUnix > props.chatBox.userLastSeenUnix)
                        .sort((a, b) => a.timeStampUnix - b.timeStampUnix)
                        .indexOf(v) === 0 &&
                      !lock && (
                        <div id="unread" className={styles.unread}>
                          <div
                            style={{
                              width: "100%",
                              border: "1px solid var(--color-gray30)",
                              height: "1px",
                              boxSizing: "border-box",
                            }}></div>

                          <div style={{ width: "280px" }}>Unread Messages</div>
                          <div
                            style={{
                              width: "100%",
                              border: "1px solid var(--color-gray30)",
                              height: "1px",
                              boxSizing: "border-box",
                            }}></div>
                        </div>
                      )}
                    <div className={styles.leftchatrow}>
                      {v.itemType === ITicketMediaType.Text && (
                        <>
                          <div className={styles.leftchat}>
                            {
                              <div
                                style={
                                  handleFindEmoji(v.text)
                                    ? {
                                        background: "var(--color-light-blue30)",
                                      }
                                    : {}
                                }
                                className={styles.leftchatMSG}>
                                <LinkifyText text={v.text} />
                              </div>
                            }
                          </div>
                          <div className={styles.chatdate} onClick={() => toggleDateFormat(v.itemId)}>
                            {formatDate1(v.timeStampUnix / 1e3, v.itemId)}
                          </div>
                        </>
                      )}
                      {v.itemType === ITicketMediaType.Image && v.imageUrl && (
                        <>
                          <div className={styles.leftchat}>
                            <div
                              className={styles.imagebackground}
                              style={{ flexDirection: "row" }}
                              onClick={() => {
                                if (v.imageUrl && props.onImageContainerClick) {
                                  props.onImageContainerClick({
                                    height: 500,
                                    url: baseMediaUrl + v.imageUrl,
                                    width: 500,
                                  });
                                }
                              }}>
                              {
                                <img
                                  style={{
                                    borderRadius: "var(--br5)",
                                  }}
                                  src={baseMediaUrl + v.imageUrl}
                                  alt="Image"
                                  width={250}
                                  height={250}
                                />
                              }
                            </div>
                          </div>
                          <div className={styles.chatdate} onClick={() => toggleDateFormat(v.itemId)}>
                            {formatDate1(v.timeStampUnix / 1e3, v.itemId)}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
                {/* ___right chat___*/}
                {!v.sentByFb && (
                  <>
                    <div className={styles.rightchatrow}>
                      {v.itemType === ITicketMediaType.Text && (
                        <>
                          {
                            <div className={styles.rightchat}>
                              <div
                                style={handleFindEmoji(v.text) ? { background: "var(--color-dark-blue)" } : {}}
                                className={styles.rightchatMSG}>
                                <LinkifyText text={v.text} />
                              </div>
                            </div>
                          }
                          {v.itemId && (
                            <div className={styles.msgdetail}>
                              <div className={styles.chatdate} onClick={() => toggleDateFormat(v.itemId)}>
                                {formatDate(v.timeStampUnix / 1e3, v.itemId)}
                              </div>
                              <div className={styles.chatstatus}>
                                <div className={styles.sent}>
                                  <svg width="10" height="10" viewBox="0 0 10 7">
                                    <path
                                      fill="var(--color-light-blue)"
                                      d="M10.2.7 4 6.5a1 1 0 0 1-.9 0L.5 4a1 1 0 0 1 0-.9 1 1 0 0 1 1 0l2 2.1L9.4-.2a1 1 0 0 1 .9 0 1 1 0 0 1 0 .9"
                                    />
                                  </svg>
                                  {props.chatBox.userLastSeenUnix >= v.timeStampUnix && (
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 10 7"
                                      style={{
                                        position: "relative",
                                        right: "5px",
                                      }}>
                                      <path
                                        fill="var(--color-light-blue)"
                                        d="M10.2.7 4 6.5a1 1 0 0 1-.9 0L.5 4a1 1 0 0 1 0-.9 1 1 0 0 1 1 0l2 2.1L9.4-.2a1 1 0 0 1 .9 0 1 1 0 0 1 0 .9"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {v.itemType === ITicketMediaType.Image && v.imageUrl && (
                        <>
                          <div className={styles.imagebackground} style={{ flexDirection: "row-reverse" }}>
                            <div
                              onClick={() => {
                                if (v.imageUrl && props.onImageContainerClick) {
                                  props.onImageContainerClick({
                                    height: 500,
                                    url: baseMediaUrl + v.imageUrl,
                                    width: 500,
                                  });
                                }
                              }}>
                              {
                                <img
                                  style={{
                                    borderRadius: "var(--br5)",
                                  }}
                                  src={baseMediaUrl + v.imageUrl}
                                  alt="Image"
                                  width={250}
                                  height={250}
                                />
                              }
                            </div>
                          </div>
                          {v.itemId && (
                            <div
                              style={{
                                display: "flex",
                                gap: "var(--gap-5)",
                              }}>
                              <div className={styles.chatdate} onClick={() => toggleDateFormat(v.itemId)}>
                                {formatDate1(v.timeStampUnix / 1e3, v.itemId)}
                              </div>
                              <div className={styles.chatstatus}>
                                <div className={styles.sent}>
                                  <svg width="10" height="10" viewBox="0 0 10 7">
                                    <path
                                      fill="var(--color-light-blue)"
                                      d="M10.2.7 4 6.5a1 1 0 0 1-.9 0L.5 4a1 1 0 0 1 0-.9 1 1 0 0 1 1 0l2 2.1L9.4-.2a1 1 0 0 1 .9 0 1 1 0 0 1 0 .9"
                                    />
                                  </svg>

                                  {props.chatBox.userLastSeenUnix >= v.timeStampUnix && (
                                    <svg width="10" height="10" viewBox="0 0 10 7">
                                      <path
                                        fill="var(--color-light-blue)"
                                        d="M10.2.7 4 6.5a1 1 0 0 1-.9 0L.5 4a1 1 0 0 1 0-.9 1 1 0 0 1 1 0l2 2.1L9.4-.2a1 1 0 0 1 .9 0 1 1 0 0 1 0 .9"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          {loading2 && <RingLoader />}
        </div>
      }

      {!backToButton && (
        <div onClick={handleBackToButton} className={styles.goend}>
          <svg width="11" height="13" viewBox="0 0 11 13">
            <path
              fill="var(--color-white)"
              d="m5.4 13-.8-.4L.3 8.4a1.1 1.1 0 1 1 1.6-1.6l4.2 4.3a1.1 1.1 0 0 1-.7 1.9m.1 0a1 1 0 0 1-1-1l-.1-5.5V1.1a1 1 0 0 1 1-1.1 1 1 0 0 1 1.2 1v10.9a1 1 0 0 1-1 1m0 .1a1.1 1.1 0 0 1-.7-2l4.3-4.2a1.1 1.1 0 0 1 1.5 1.6l-4.2 4.2z"
            />
          </svg>
        </div>
      )}
      {/* ___answer___*/}
      {
        <>
          <>
            <div className={styles.answer}>
              {props.sendingMessages.length !== 0 && <RingLoader />}
              {props.sendingMessages.length === 0 && (
                <>
                  <InputEmoji
                    theme="auto"
                    value={answerBox}
                    shouldReturn={true}
                    onChange={handleInputOnChange}
                    keepOpened={true}
                    onEnter={handleSendText}
                    placeholder="Type a message"
                    shouldConvertEmojiToImage={false}
                  />
                  <svg className={styles.uploadbtn} onClick={handleUploadImage} viewBox="0 0 13 24">
                    <path d="M2.8 22.3a4 4 0 0 1-3-1.4 4 4 0 0 1-1.5-3 5 5 0 0 1 1.4-3.4l7.7-7.7a4 4 0 0 1 1.6-1 4 4 0 0 1 3.7 1 .7.7 0 1 1-1 1 2 2 0 0 0-2.2-.6l-1 .6-7.8 7.8a4 4 0 0 0-1 2.2 3 3 0 0 0 1 2 3 3 0 0 0 3 .8L5 20l8.3-8.4a4 4 0 0 0 1.3-3.1 5 5 0 0 0-1.4-3.1 4.5 4.5 0 0 0-6.3 0l-8.3 8.2a1 1 0 0 1-1 0 1 1 0 0 1 0-1L5.9 4A6 6 0 0 1 10 2.5a6 6 0 0 1 4.2 1.7 6 6 0 0 1 1.9 4.2 6 6 0 0 1-1.8 4.2l-8.2 8.3a5 5 0 0 1-2 1.2z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/jpeg,video/mp4"
                    onChange={handleImageChange}
                    ref={inputRef}
                    style={{ display: "none" }}
                  />

                  <svg onClick={handleSendText} className={styles.sendbtn} viewBox="-5 -2 25 25">
                    <path
                      fill="var(--color-ffffff)"
                      d="M19.3 11.2 2 20a1.4 1.4 0 0 1-2-2s2.2-4.3 2.8-5.4 1.2-1.4 7.5-2.2a.4.4 0 0 0 0-.8c-6.3-.8-7-1-7.5-2.2L0 2a1.4 1.4 0 0 1 2-2l17.3 8.7a1.3 1.3 0 0 1 0 2.4"
                    />
                  </svg>
                </>
              )}
            </div>
          </>
        </>
      }
      {/* ___end___*/}
    </>
  );
};

export default UserPanelDirectChatBox;
