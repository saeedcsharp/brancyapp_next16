import Head from "next/head";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import TextArea from "brancy/components/design/textArea/textArea";
import { LanguageKey } from "brancy/i18n";
import { DetailType, IRejectTerms } from "brancy/models/advertise/adList";
import { IAdvertisingTerms } from "brancy/models/advertise/peoperties";
import styles from "brancy/components/advertise/adList/popups/adDetails.module.css";
const AdReject = (props: {
  data: IAdvertisingTerms;
  detailType: DetailType;
  removeMask: () => void;
  backToAdDetail: () => void;
  handleRejectAdvertise: (rejectTerm: IRejectTerms) => void;
  advertiseId: number;
}) => {
  const { t } = useTranslation();
  const [adTerms, setAdTerms] = useState<IAdvertisingTerms>(props.data);
  const [customeTerm, setCustomeTerm] = useState("");
  const [activeCustomeTerm, setActiveCustomeTerm] = useState(false);
  const [advertisinfTerms, setAdvertisinfTerms] = useState<IAdvertisingTerms>(props.data);
  function handleInputChange(e: ChangeEvent<HTMLTextAreaElement>) {
    if (!activeCustomeTerm) return;
    setCustomeTerm(e.target.value);
  }
  const handleDefaultInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAdvertisinfTerms((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  function handleRejectAdvertise() {
    let defaultTerms: string[] = [];
    if (adTerms.activeTerm1) defaultTerms.push(adTerms.term1);
    if (adTerms.activeTerm2) defaultTerms.push(adTerms.term2);
    if (adTerms.activeTerm3) defaultTerms.push(adTerms.term3);
    if (adTerms.activeTerm4) defaultTerms.push(adTerms.term4);
    const rejectTerm: IRejectTerms = {
      detailType: props.detailType,
      advertiseId: props.advertiseId,
      customTerm: activeCustomeTerm ? customeTerm : "",
      terms: defaultTerms,
    };
    props.handleRejectAdvertise(rejectTerm);
  }
  function handleToggle(e: ChangeEvent<HTMLInputElement>) {
    setAdvertisinfTerms((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  }
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Ad Rejection</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <>
        <div className="headerandinput">
          <h1 className="title">{t(LanguageKey.reject)}</h1>
        </div>
        <div className={styles.all} style={{ padding: "var(--padding-3)" }}>
          <div className="headerandinput">
            <div className="headerChild">
              <CheckBoxButton
                value={advertisinfTerms.activeTerm1}
                handleToggle={handleToggle}
                textlabel={t(LanguageKey.advertiseProperties_rejectreasonheader1)}
                name="activeTerm1"
                title={"switch"}
              />
            </div>
            <TextArea
              className={"captiontextarea"}
              placeHolder={""}
              fadeTextArea={!advertisinfTerms.activeTerm1}
              value={advertisinfTerms.term1}
              handleKeyDown={undefined}
              handleInputChange={handleDefaultInputChange}
              name={"term1"}
              maxLength={2200}
              role={"textbox"}
              title={" Advertising Term 1"}
            />
          </div>
          <div className="headerandinput">
            <div className="headerChild">
              <CheckBoxButton
                value={advertisinfTerms.activeTerm2}
                handleToggle={handleToggle}
                name="activeTerm2"
                textlabel={t(LanguageKey.advertiseProperties_rejectreasonheader2)}
                title={"  Enable Advertising Term 2"}
              />
            </div>
            <TextArea
              value={advertisinfTerms.term2}
              fadeTextArea={!advertisinfTerms.activeTerm2}
              className={"captiontextarea"}
              placeHolder={""}
              handleInputChange={handleDefaultInputChange}
              handleKeyDown={undefined}
              name="term2"
              maxLength={2200}
              role={" textbox"}
              title={"  Advertising Term 2"}
            />
          </div>

          <div className="headerandinput">
            <div className="headerChild">
              <CheckBoxButton
                value={advertisinfTerms.activeTerm3}
                handleToggle={handleToggle}
                name="activeTerm3"
                textlabel={t(LanguageKey.advertiseProperties_rejectreasonheader3)}
                title={" Enable Advertising Term 3"}
              />
            </div>
            <TextArea
              value={advertisinfTerms.term3}
              className={"captiontextarea"}
              placeHolder={""}
              fadeTextArea={!advertisinfTerms.activeTerm3}
              handleKeyDown={undefined}
              handleInputChange={handleDefaultInputChange}
              name="term3"
              maxLength={2200}
              role={" textbox"}
              title={"Advertising Term 3"}
            />
          </div>

          <div className="headerandinput">
            <div className="headerChild">
              <CheckBoxButton
                value={advertisinfTerms.activeTerm4}
                handleToggle={handleToggle}
                name="activeTerm4"
                textlabel={t(LanguageKey.advertiseProperties_rejectreasonheader4)}
                title={" Enable Advertising Term 4"}
              />
            </div>
            <TextArea
              value={advertisinfTerms.term4}
              className={"captiontextarea"}
              placeHolder={""}
              fadeTextArea={!advertisinfTerms.activeTerm4}
              handleKeyDown={undefined}
              handleInputChange={handleDefaultInputChange}
              name="term4"
              maxLength={2200}
              role={" textbox"}
              title={" Advertising Term 4"}
            />
          </div>

          <div className="headerandinput">
            <div className="headerChild">
              <CheckBoxButton
                handleToggle={(e) => setActiveCustomeTerm(e.target.checked)}
                value={activeCustomeTerm}
                textlabel={t(LanguageKey.custom)}
                title={" Enable Custom Term"}
              />
            </div>

            <TextArea
              style={{ minHeight: "200px" }}
              className={"captiontextarea"}
              value={customeTerm}
              fadeTextArea={!activeCustomeTerm}
              handleInputChange={handleInputChange}
              maxLength={2200}
              role={" textbox"}
              title={" Custom Term"}
            />
          </div>
        </div>
        <div className="ButtonContainer">
          <button className="cancelButton" onClick={props.backToAdDetail}>
            {t(LanguageKey.back)}
          </button>
          <button
            onClick={handleRejectAdvertise}
            className="stopButton"
            style={{
              backgroundColor: "var(--color-dark-red)",
              color: "var(--color-ffffff)",
            }}>
            {t(LanguageKey.reject)}
          </button>
        </div>
      </>
    </>
  );
};

export default AdReject;
