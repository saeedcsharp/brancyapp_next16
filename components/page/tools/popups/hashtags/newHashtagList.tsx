import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import { InternalResponseType, NotifType, internalNotify } from "brancy/components/notifications/notificationBox";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/page/tools/popups/hashtags/newHashtagList.module.css";

// Reducer for hashtag management
type HashtagState = {
  hashtags: string[];
  hoveredTag: string;
};

type HashtagAction =
  | { type: "ADD_HASHTAG"; payload: string }
  | { type: "DELETE_HASHTAG"; payload: number }
  | { type: "SET_HASHTAGS"; payload: string[] }
  | { type: "SET_HOVERED_TAG"; payload: string };

const hashtagReducer = (state: HashtagState, action: HashtagAction): HashtagState => {
  switch (action.type) {
    case "ADD_HASHTAG":
      return { ...state, hashtags: [...state.hashtags, action.payload] };
    case "DELETE_HASHTAG":
      return {
        ...state,
        hashtags: state.hashtags.filter((_, index) => index !== action.payload),
      };
    case "SET_HASHTAGS":
      return { ...state, hashtags: action.payload };
    case "SET_HOVERED_TAG":
      return { ...state, hoveredTag: action.payload };
    default:
      return state;
  }
};

const MAX_HASHTAGS = 200;

const NewHashtagList = (props: {
  data: { id: number; hashtags: string[] | null };
  removeMask: () => void;
  saveHashtagInfo: (hashtags: string[], hashtagTitle: string) => void;
  hashtagTitleName: string;
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputHashtagRef = useRef<HTMLDivElement>(null);

  const [inputListName, setInputListName] = useState(
    t(LanguageKey.pageTools_hashtagList) + " " + props.hashtagTitleName
  );
  const [inputHashtag, setInputHashtag] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const [hashtagState, dispatch] = useReducer(hashtagReducer, {
    hashtags: props.data.hashtags ?? [],
    hoveredTag: "",
  });

  const { hashtags, hoveredTag } = hashtagState;

  // Memoized functions
  const trimHashtag = useCallback((hashtag: string) => {
    let newHashtag = hashtag.trim().replaceAll(/[!$@^&*+.,?؟]/g, "");

    // Remove leading numbers
    return newHashtag.replace(/^[0-9]+/, "");
  }, []);

  const handleDeleteHashtag = useCallback((id: number) => {
    dispatch({ type: "SET_HOVERED_TAG", payload: "" });
    dispatch({ type: "DELETE_HASHTAG", payload: id });
  }, []);

  const handleInputListNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputListName(e.target.value);
  }, []);

  const handleInputHashtagChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputHashtag(e.target.value);
  }, []);

  const handleAddHashtag = useCallback(() => {
    const hashtag = trimHashtag(inputHashtag);

    if (hashtag === "") return;

    if (hashtags.length >= MAX_HASHTAGS) {
      internalNotify(InternalResponseType.ExceedPermittedHashtagNumber, NotifType.Error, MAX_HASHTAGS.toString());
      setInputHashtag("");
      return;
    }

    if (hashtags.includes(hashtag)) {
      internalNotify(InternalResponseType.RepetitiveHashtagInput, NotifType.Error);
      setInputHashtag("");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    dispatch({ type: "ADD_HASHTAG", payload: hashtag });
    setInputHashtag("");
  }, [inputHashtag, hashtags, trimHashtag]);

  const handleInputHashtagEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAddHashtag();
      }
    },
    [handleAddHashtag]
  );

  const pasteFromClipboard = useCallback(async () => {
    try {
      const input = await navigator.clipboard.readText();
      const trimHashtags = trimHashtag(input);
      const hashtagList = trimHashtags
        .split("#")
        .filter(Boolean)
        .map((tag) => tag.trim());

      if (hashtagList.length > MAX_HASHTAGS) {
        internalNotify(InternalResponseType.ExceedPermittedHashtagNumber, NotifType.Error, MAX_HASHTAGS.toString());
        return;
      }

      dispatch({ type: "SET_HASHTAGS", payload: hashtagList });
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  }, [trimHashtag]);

  const handleHoverTag = useCallback((id: string) => {
    dispatch({ type: "SET_HOVERED_TAG", payload: id });
  }, []);

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: "SET_HOVERED_TAG", payload: "" });
  }, []);

  // Handle save with memoization
  const handleSave = useCallback(() => {
    if (hashtags.length > 0) {
      props.saveHashtagInfo(hashtags, inputListName);
    }
  }, [hashtags, inputListName, props.saveHashtagInfo]);

  // Memoize the save button state
  const isSaveDisabled = useMemo(() => hashtags.length === 0, [hashtags.length]);
  const saveButtonClass = useMemo(() => (hashtags.length > 0 ? "saveButton" : "disableButton"), [hashtags.length]);

  // Memoize the add button state
  const isAddDisabled = useMemo(() => inputHashtag.trim() === "", [inputHashtag]);
  const addButtonClass = useMemo(() => (inputHashtag.trim() !== "" ? "saveButton" : "disableButton"), [inputHashtag]);

  // Add event listener for keydown event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === inputHashtagRef.current?.querySelector("input")) {
        handleInputHashtagEnter(e as unknown as KeyboardEvent<HTMLInputElement>);
      }
    };

    const currentRef = inputHashtagRef.current;
    currentRef?.addEventListener("keydown", handleKeyDown as any);

    return () => {
      currentRef?.removeEventListener("keydown", handleKeyDown as any);
    };
  }, [handleInputHashtagEnter]);

  return (
    <>
      <div className="headerandinput">
        <div className="title">{t(LanguageKey.pageTools_CreateNewList)}</div>
      </div>

      <div className="headerandinput">
        <div className="headertext">{t(LanguageKey.pageToolspopup_Listname)}</div>
        <InputText
          dangerOnEmpty
          name="listNameInput"
          className="textinputbox"
          handleInputChange={handleInputListNameChange}
          placeHolder={t(LanguageKey.pageToolspopup_Listname)}
          value={inputListName}
          maxLength={undefined}
        />
      </div>
      <div className="headerandinput" style={{ height: "100%" }}>
        <div className="headerparent">
          <div className="headertext">{t(LanguageKey.pageToolspopup_hashtags)}</div>
          <div className="counter">
            ( <strong>{hashtags.length}</strong> /<strong>{MAX_HASHTAGS}</strong> )
            <img
              onClick={pasteFromClipboard}
              style={{
                cursor: "pointer",
                width: "20px",
                height: "20px",
              }}
              title="ℹ️ paste"
              src="/copy.svg"
            />
          </div>
        </div>
        <div className="headerparent">
          <div style={{ width: "100%" }} ref={inputHashtagRef} className={isShaking ? styles.shake : ""}>
            <InputText
              name="hashtagInput"
              className="textinputbox"
              handleInputChange={handleInputHashtagChange}
              placeHolder={t(LanguageKey.pageToolspopup_typehere)}
              value={inputHashtag}
              maxLength={undefined}
            />
          </div>
          <button
            style={{ height: "40px", width: "80px" }}
            className={addButtonClass}
            disabled={isAddDisabled}
            onClick={handleAddHashtag}>
            {t(LanguageKey.add)}
          </button>
        </div>
        <div className="explain">{t(LanguageKey.pageToolspopup_CreateNewListexplain)}</div>
        <div
          className={styles.hashtagListItem}
          onClick={() => {
            inputRef.current?.focus();
          }}>
          {hashtags.map((v, i) => (
            <div key={i} className={styles.tagHashtag}>
              <img
                onMouseOver={() => handleHoverTag(i.toString())}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleDeleteHashtag(i)}
                className={styles.deletebtn}
                alt="delete"
                src={hoveredTag === i.toString() ? "/deleteHashtag.svg" : "/icon-hashtag.svg"}
              />
              {v}
            </div>
          ))}
        </div>
      </div>

      <div className="ButtonContainer">
        <button onClick={props.removeMask} className="cancelButton">
          {t(LanguageKey.cancel)}
        </button>
        <button disabled={isSaveDisabled} onClick={handleSave} className={saveButtonClass}>
          {t(LanguageKey.save)}
        </button>
      </div>
    </>
  );
};

export default NewHashtagList;
