import { ChangeEvent, KeyboardEvent, useCallback, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/page/tools/popups/hashtags/newHashtagList.module.css";
interface HashtagState {
  hashtagSourceImg: string;
  inputListName: string;
  inputHashtag: string;
  hashtags: string[];
}
type HashtagAction =
  | { type: "SET_HASHTAG_SOURCE_IMG"; payload: string }
  | { type: "SET_INPUT_LIST_NAME"; payload: string }
  | { type: "SET_INPUT_HASHTAG"; payload: string }
  | { type: "ADD_HASHTAG" }
  | { type: "DELETE_HASHTAG"; payload: number };
const hashtagReducer = (state: HashtagState, action: HashtagAction): HashtagState => {
  switch (action.type) {
    case "SET_HASHTAG_SOURCE_IMG":
      return { ...state, hashtagSourceImg: action.payload };
    case "SET_INPUT_LIST_NAME":
      return { ...state, inputListName: action.payload };
    case "SET_INPUT_HASHTAG":
      return { ...state, inputHashtag: action.payload };
    case "ADD_HASHTAG":
      if (state.inputHashtag.trim() === "") return state;
      return {
        ...state,
        hashtags: [...state.hashtags, state.inputHashtag],
        inputHashtag: "",
      };
    case "DELETE_HASHTAG": {
      const newHashtags = [...state.hashtags];
      newHashtags.splice(action.payload, 1);
      return { ...state, hashtags: newHashtags, hashtagSourceImg: "" };
    }
    default:
      return state;
  }
};
const UpdateHashtagList = (props: {
  data: { listId: number; hashtags: string[]; hashtagTitle: string };
  removeMask: () => void;
  updateHashtagInfo: (hashtags: string[], listName: string, listId: number) => void;
}) => {
  const { t } = useTranslation();
  const { listId, hashtags: initialHashtags, hashtagTitle } = props.data;

  const [state, dispatch] = useReducer(hashtagReducer, {
    hashtagSourceImg: "",
    inputListName: hashtagTitle,
    inputHashtag: "",
    hashtags: initialHashtags,
  });

  const { hashtagSourceImg, inputListName, inputHashtag, hashtags } = state;
  const handleDeleteHashtag = useCallback((id: number) => {
    dispatch({ type: "DELETE_HASHTAG", payload: id });
  }, []);
  const handleInputListNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_INPUT_LIST_NAME", payload: e.target.value });
  }, []);
  const handleInputHashtagChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_INPUT_HASHTAG", payload: e.target.value });
  }, []);
  const addHashtag = useCallback(() => {
    dispatch({ type: "ADD_HASHTAG" });
  }, []);
  const handleInputHashtagEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "Enter" || e.key === " ") && inputHashtag.trim() !== "") {
        e.preventDefault();
        addHashtag();
      }
    },
    [inputHashtag, addHashtag]
  );
  const handleMouseOver = useCallback((id: string) => {
    dispatch({ type: "SET_HASHTAG_SOURCE_IMG", payload: id });
  }, []);
  const handleMouseLeave = useCallback(() => {
    dispatch({ type: "SET_HASHTAG_SOURCE_IMG", payload: "" });
  }, []);
  const handleUpdateHashtags = useCallback(() => {
    props.updateHashtagInfo(hashtags, inputListName, listId);
  }, [hashtags, inputListName, listId, props.updateHashtagInfo]);
  const hashtagsList = useMemo(
    () =>
      hashtags.map((v, i) => (
        <div key={i} className={styles.tagHashtag}>
          <img
            onMouseOver={() => handleMouseOver(i.toString())}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleDeleteHashtag(i)}
            className={styles.hashtagicon}
            alt="hashtag"
            src={hashtagSourceImg === i.toString() ? "/deleteHashtag.svg" : "/icon-hashtag.svg"}
          />
          {v}
        </div>
      )),
    [hashtags, hashtagSourceImg, handleDeleteHashtag, handleMouseOver, handleMouseLeave]
  );
  return (
    <>
      <div className="headerandinput">
        <div className="title">
          {t(LanguageKey.edit)} {t(LanguageKey.pageTools_hashtagList)}
        </div>
      </div>
      <div className="headerandinput">
        <div className="headertext">{t(LanguageKey.pageToolspopup_Listname)}</div>
        <InputText
          className="textinputbox"
          handleInputChange={handleInputListNameChange}
          placeHolder="Type List Name"
          value={inputListName}
          maxLength={undefined}
        />
      </div>
      <div className="headerandinput" style={{ height: "100%" }}>
        <div className="headerparent">
          <div className="headertext">{t(LanguageKey.pageTools_hashtags)}</div>
          <div className="counter">
            ( <strong>{hashtags.length} </strong> / <strong>30</strong> )
          </div>
        </div>
        <div className="headerparent">
          <div style={{ width: "100%" }}>
            <div onKeyDown={handleInputHashtagEnter}>
              <InputText
                className="textinputbox"
                handleInputChange={handleInputHashtagChange}
                placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                value={inputHashtag}
                maxLength={undefined}
              />
            </div>
          </div>
          <button style={{ height: "40px", width: "80px" }} className="saveButton" onClick={addHashtag}>
            {t(LanguageKey.add)}
          </button>
        </div>
        <div className="explain">{t(LanguageKey.pageToolspopup_CreateNewListexplain)}</div>
        <div className={styles.hashtagListItem}>{hashtagsList}</div>
      </div>
      <div className="ButtonContainer">
        <button onClick={props.removeMask} className="cancelButton">
          {t(LanguageKey.cancel)}
        </button>
        <button onClick={handleUpdateHashtags} className="saveButton">
          {t(LanguageKey.update)}
        </button>
      </div>
    </>
  );
};
export default UpdateHashtagList;
