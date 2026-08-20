import TextArea from "brancy/components/design/textArea/textArea";
import { LanguageKey } from "brancy/i18n";
import Head from "next/head";
import { useTranslation } from "react-i18next";
export default function BusinessTermsPopup(props: { removeMask: () => void; terms: { str: string } }) {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>Bran.cy ▸ {t(LanguageKey.biolinkProperties_BusinessTerms)}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="headerandinput">
        <div className="headerparent" role="banner" aria-label={t(LanguageKey.biolinkProperties_BusinessTerms)}>
          <span></span>
          {/* <div className="counter translate" aria-live="polite">
            (<strong>{props.terms.str.length}</strong> / <strong>1500</strong>)
          </div> */}
        </div>
        <TextArea
          className="TextArea"
          value={props.terms.str}
          placeHolder={t(LanguageKey.biolinkProperties_BusinessTerms)}
          fadeTextArea={false}
          minHeight={70}
          maxLength={1500}
          initialHeight={400}
          aria-label={t(LanguageKey.biolinkProperties_BusinessTerms)}
          title={t(LanguageKey.biolinkProperties_BusinessTerms)}
        />
      </div>
      <div className="ButtonContainer">
        <button type="button" onClick={props.removeMask} className="cancelButton">
          {t(LanguageKey.cancel)}
        </button>
      </div>
    </>
  );
}
