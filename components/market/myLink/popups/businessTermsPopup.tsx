import TextArea from "brancy/components/design/textArea/textArea";
import EmptyPopupState from "brancy/components/EmptyPopupState";
import { LanguageKey } from "brancy/i18n";
import Head from "next/head";
import { useTranslation } from "react-i18next";
export default function BusinessTermsPopup(props: { removeMask: () => void; terms: string }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="frameParent">
        <div className="headerChild" title={t(LanguageKey.marketProperties_BusinessTerms)}>
          <div className="circle"></div>
          <div className="Title">{t(LanguageKey.marketProperties_BusinessTerms)}</div>
        </div>
      </div>
      {!props.terms.trim() ? (
        <EmptyPopupState label={t(LanguageKey.marketProperties_BusinessTerms)} />
      ) : (
        <div className="headerandinput">
          <div className="headerparent" role="banner" aria-label={t(LanguageKey.marketProperties_BusinessTerms)}>
            <span></span>
            {/* <div className="counter translate" aria-live="polite">
              (<strong>{props.terms.str.length}</strong> / <strong>1500</strong>)
            </div> */}
          </div>
          <TextArea
            className="TextArea"
            value={props.terms}
            placeHolder={t(LanguageKey.marketProperties_BusinessTerms)}
            fadeTextArea={false}
            minHeight={70}
            maxLength={1500}
            initialHeight={400}
            aria-label={t(LanguageKey.marketProperties_BusinessTerms)}
            title={t(LanguageKey.marketProperties_BusinessTerms)}
          />
        </div>
      )}
      <div className="ButtonContainer">
        <button type="button" onClick={props.removeMask} className="cancelButton">
          {t(LanguageKey.cancel)}
        </button>
      </div>
    </>
  );
}
