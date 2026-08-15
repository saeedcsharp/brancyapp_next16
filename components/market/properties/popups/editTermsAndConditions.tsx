import Head from "next/head";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import TextArea from "brancy/components/design/textArea/textArea";
import { LanguageKey } from "brancy/i18n";
import styles from "./featureBoxPU.module.css";

const EditTermsAndConditions = (props: {
  terms: { str: string };
  removeMask: () => void;
  saveTerms: (terms: { str: string }) => void;
}) => {
  const { t } = useTranslation();
  const [terms, setTerms] = useState<{ str: string }>({ str: props.terms?.str ?? "" });

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTerms((previous) => ({ ...previous, str: event.target.value }));
  };

  return (
    <>
      <Head>
        <title>Bran.cy ▸ {t(LanguageKey.marketProperties_BusinessTerms)}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="headerandinput">
        <div className="headerparent" role="banner" aria-label={t(LanguageKey.marketProperties_BusinessTerms)}>
          <span></span>
          <div className="counter translate" aria-live="polite">
            (<strong>{terms.str.length}</strong> / <strong>1500</strong>)
          </div>
        </div>
        <TextArea
          className="TextArea"
          value={terms.str}
          placeHolder={t(LanguageKey.marketProperties_BusinessTerms)}
          handleInputChange={handleChange}
          fadeTextArea={false}
          autoResize
          minHeight={70}
          maxLength={1500}
          aria-label={t(LanguageKey.marketProperties_BusinessTerms)}
          title={t(LanguageKey.marketProperties_BusinessTerms)}
        />
      </div>
      <div className="ButtonContainer">
        <button type="button" onClick={props.removeMask} className="cancelButton">
          {t(LanguageKey.cancel)}
        </button>
        <button type="button" onClick={() => props.saveTerms(terms)} className="saveButton">
          {t(LanguageKey.save)}
        </button>
      </div>
    </>
  );
};

export default EditTermsAndConditions;
