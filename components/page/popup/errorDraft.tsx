import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { ErrorPrePostType, IErrorPrePostInfo } from "brancy/models/page/post/preposts";
function ErrorDraft(props: { data: IErrorPrePostInfo; removeMask: () => void }) {
  useEffect(() => {
    console.log("draft", props.data);
  }, []);
  const { t } = useTranslation();
  return (
    <>
      <div className="headerandinput" style={{ alignItems: "center" }}>
        <svg
          height="100px"
          fillRule="evenodd"
          clipRule="evenodd"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 260 120">
          <path
            d="M55.4 111h109.5q1 0 1.8-.2l1.8.2h62.6q3.5 0 6-2.5a8.5 8.5 0 0 0-6-14.5H224q-3.5 0-6-2.5a8.5 8.5 0 0 1 6-14.5h22.9q3.4 0 6-2.5a8.5 8.5 0 0 0-6-14.5h-26.5q3.4 0 6-2.5a8.5 8.5 0 0 0-6-14.5h-77q3.4 0 5.9-2.5a8.5 8.5 0 0 0-6-14.5H74.6q-3.4 0-6 2.5a8.5 8.5 0 0 0 6 14.5H26.5q-3.5 0-6 2.5a8.5 8.5 0 0 0 6 14.5h30q3.6 0 6 2.5a8.5 8.5 0 0 1-6 14.5h-48q-3.6 0-6 2.5a8.5 8.5 0 0 0 6 14.5h46.9q-3.5 0-6 2.5a8.5 8.5 0 0 0 6 14.5m196.2 0q3.4 0 6-2.5a8.5 8.5 0 0 0-6-14.5q-3.5 0-6 2.5a8.5 8.5 0 0 0 6 14.5"
            fill="var(--color-dark-blue60)"
          />
          <path
            d="M90.5 118A26 26 0 0 1 64 92a26.6 26.6 0 0 1 28.3-25.8q-.6-3.8-.6-7.3a41 41 0 0 1 62-35 41 41 0 0 1 17.6 22l4-.3A36.4 36.4 0 0 1 212 81.8a36.6 36.6 0 0 1-33.7 36.2z"
            fill="var(--background-root)"
          />
          <path
            d="M105 118h-8.5m-6 0A26 26 0 0 1 64 92a26.6 26.6 0 0 1 28.3-25.8q-.6-3.8-.6-7.3a41 41 0 0 1 62-35 41 41 0 0 1 17.6 22l4-.3A36.4 36.4 0 0 1 212 81.8a36.6 36.6 0 0 1-33.7 36.2z"
            stroke="var(--color-dark-blue)"
          />
          <path
            d="M139.4 94.4h1.2zm-25.2-14.6a1.2 1.2 0 1 0 1.6 2zm9-5.6.7 1a1.2 1.2 0 0 0 0-2zm-7.4-7.2a1.3 1.3 0 0 0-1.6 2zm34.4 14.7a1.2 1.2 0 1 0 1.6-2zm-7.3-7.5-.8-1a1.3 1.3 0 0 0 0 2zm8.9-5.2a1.2 1.2 0 1 0-1.6-2zM133 102.3q3.2-.1 5.4-2.3l-1.8-1.8a5 5 0 0 1-3.6 1.5zm5.4-2.3a8 8 0 0 0 2.2-5.6h-2.5q0 2.3-1.5 3.8zm2.2-5.6q0-3.1-2.2-5.5l-1.8 1.8q1.5 1.5 1.5 3.7zm-2.2-5.5a8 8 0 0 0-5.4-2.3v2.5a5 5 0 0 1 3.6 1.6zm-5.4-2.3q-3.2.1-5.4 2.3l1.8 1.8A5 5 0 0 1 133 89zm-5.4 2.3a8 8 0 0 0-2.2 5.5h2.5q0-2.2 1.5-3.7zm-2.2 5.5q0 3.2 2.2 5.6l1.8-1.8q-1.5-1.5-1.5-3.8zm2.2 5.6a8 8 0 0 0 5.4 2.3v-2.5a5 5 0 0 1-3.6-1.6zm-11.8-18.3 8.1-6.5-1.6-2-8 6.6zm8-8.5-8-6.2-1.6 2 8.2 6.2zm28 6.6-8.1-6.6-1.6 2 8.1 6.5zm-8.2-4.6 8.2-6.2-1.6-2-8 6.2z"
            fill="var(--color-dark-blue)"
          />
          <path
            d="M144.3 30a23 23 0 0 1 16 16.3M178.7 18l9.8 10m.1-10.1-9.6 10M66 39.8l7.2 7.3m0-7.3L66 47M169.4 9.3a4 4 0 0 0 2.5-1 4 4 0 0 0 .8-4 4 4 0 0 0-2-2 4 4 0 0 0-3.8.8 3.7 3.7 0 0 0 0 5.1q1 1 2.5 1.1Zm37 19.5q1.5 0 2.6-1a3.7 3.7 0 0 0 0-5.2 3.5 3.5 0 0 0-5.1 0 3.7 3.7 0 0 0 0 5.2q1.1 1 2.5 1ZM82.2 31.6q1.5 0 2.6-1a3.7 3.7 0 0 0 0-5.2 3.5 3.5 0 0 0-5 0 3.7 3.7 0 0 0 0 5.2q1 1 2.4 1Z"
            stroke="var(--color-dark-blue)"
          />
        </svg>
      </div>
      <div className="headerandinput" style={{ alignItems: "center" }}>
        <div className="title">{t(LanguageKey.errorDraft_title)}:</div>

        {props.data.ErrorType === ErrorPrePostType.ConfigFailed && (
          <div className="explain">{t(LanguageKey.errorDraft_configFailed)}</div>
        )}
        {props.data.ErrorType === ErrorPrePostType.InvalidTags && (
          <div className="explain">
            {t(LanguageKey.errorDraft_invalidTags)}
            <br />
            <br />
            {props.data.InvalidTags.map((v, i) => (
              <div className="explain" key={i}>
                {v}
              </div>
            ))}
          </div>
        )}
        {props.data.ErrorType === ErrorPrePostType.Unknown && <div className="explain">{props.data.Message}</div>}
        {props.data.ErrorType === ErrorPrePostType.UploadError && (
          <div className="explain">{t(LanguageKey.errorDraft_uploadError)}</div>
        )}
        {props.data.ErrorType === ErrorPrePostType.UserCancel && (
          <div className="explain">{t(LanguageKey.errorDraft_userCancel)}</div>
        )}
        {props.data.ErrorType === ErrorPrePostType.InvalidAspectRatio && (
          <div className="explain">{t(LanguageKey.InvalidAspectRatio)}</div>
        )}
        {props.data.ErrorType === ErrorPrePostType.SizeLimitExceed && (
          <div className="explain">{t(LanguageKey.SizeLimitExceed)}</div>
        )}
        {props.data.ErrorType === ErrorPrePostType.UnSupportMediaType && (
          <div className="explain">{t(LanguageKey.UnSupportMediaType)}</div>
        )}
        {props.data.ErrorType === ErrorPrePostType.NotPublishedAtTheTime && (
          <div className="explain">{t(LanguageKey.NotPublishedAtTheTime)}</div>
        )}
        {props.data.ErrorType === ErrorPrePostType.NotSuccessLogin && (
          <div className="explain">{t(LanguageKey.NotSuccessLogin)}</div>
        )}
      </div>
      <div className="ButtonContainer">
        <button onClick={props.removeMask} className="cancelButton">
          {t(LanguageKey.close)}
        </button>
      </div>
    </>
  );
}

export default ErrorDraft;
