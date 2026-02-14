import Head from "next/head";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "saeed/components/design/inputText";
import {
  convertFormatedStringToNumber,
  numberToFormattedString,
  numberToFormattedString2,
} from "saeed/helper/numberFormater";
import { LanguageKey } from "saeed/i18n";
import { IEditTariff, ITariff } from "saeed/models/advertise/peoperties";
import styles from "./tariff.module.css";
const EditTariff = (props: { removeMask: () => void; saveTariift: (tariif: ITariff) => void; tariif: ITariff }) => {
  const { t } = useTranslation();
  const [editTariff, setEditTarrif] = useState<IEditTariff>({
    basicPostSemiDay: numberToFormattedString2(props.tariif.basicTariif.post.semiDayPrice),
    basicStorySemiDay: numberToFormattedString2(props.tariif.basicTariif.story.semiDayPrice),
    basicPostFullday: numberToFormattedString2(props.tariif.basicTariif.post.fullDayPrice),
    basicStoryFullDay: numberToFormattedString2(props.tariif.basicTariif.story.fullDayPrice),
    campaignPostFullDay: numberToFormattedString2(props.tariif.campaign.post.fullDayPrice),
    campaignStoryFullDay: numberToFormattedString2(props.tariif.campaign.story.fullDayPrice),
    todayPostSemiDay: numberToFormattedString2(props.tariif.todayTariff.post.semiDayPrice),
    todayStorySemiDay: numberToFormattedString2(props.tariif.todayTariff.story.semiDayPrice),
    todayPostFullDay: numberToFormattedString2(props.tariif.todayTariff.post.fullDayPrice),
    todayStoryFullDay: numberToFormattedString2(props.tariif.todayTariff.story.semiDayPrice),
  });
  function handleChangeTodayPostSemiDay(e: ChangeEvent<HTMLInputElement>) {
    var input = e.target.value;
    var checkInput = convertFormatedStringToNumber(input);
    setEditTarrif((prev) => ({
      ...prev,
      [e.target.name]: numberToFormattedString(checkInput ? checkInput : 0),
    }));
  }
  function saveTariif() {
    const tariifInof: ITariff = {
      basicTariif: {
        post: {
          fullDayPrice: convertFormatedStringToNumber(editTariff.basicPostFullday) ?? 0,
          semiDayPrice: convertFormatedStringToNumber(editTariff.basicPostSemiDay) ?? 0,
        },
        story: {
          fullDayPrice: convertFormatedStringToNumber(editTariff.basicStoryFullDay) ?? 0,
          semiDayPrice: convertFormatedStringToNumber(editTariff.basicStorySemiDay) ?? 0,
        },
      },
      campaign: {
        post: {
          fullDayPrice: convertFormatedStringToNumber(editTariff.campaignPostFullDay) ?? 0,
        },
        story: {
          fullDayPrice: convertFormatedStringToNumber(editTariff.campaignStoryFullDay) ?? 0,
        },
      },
      todayTariff: {
        post: {
          fullDayPrice: convertFormatedStringToNumber(editTariff.todayPostFullDay) ?? 0,
          semiDayPrice: convertFormatedStringToNumber(editTariff.todayPostSemiDay) ?? 0,
        },
        story: {
          fullDayPrice: convertFormatedStringToNumber(editTariff.todayStoryFullDay) ?? 0,
          semiDayPrice: convertFormatedStringToNumber(editTariff.todayStorySemiDay) ?? 0,
        },
      },
    };
    props.saveTariift(tariifInof);
  }
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Edit Page Tariff</title>
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
          <h1 className="title">{t(LanguageKey.marketProperties_yourtariff)}</h1>
        </div>
        <div className={styles.all}>
          <div className="headerandinput">
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.advertisecalendar_TODAY)}</div>
              {/* <div className="explain">
                {t(LanguageKey.advertisecalendar_TODAYexplain)} This tariff
                define for <strong> </strong>
              </div> */}
            </div>
            <div className={styles.content}>
              <div className={styles.column}>
                <div className={styles.type} style={{ marginBottom: "15px" }}></div>
                <div className={styles.halfday}>{t(LanguageKey.advertiseProperties_tariff12hours)}</div>
                <div className={styles.fullday}>{t(LanguageKey.advertiseProperties_tariff24hours)}</div>
              </div>
              <div className={styles.column}>
                <div className={styles.type}>{t(LanguageKey.pageStatistics_post)}</div>
                <div className={styles.input}>
                  <InputText
                    name="todayPostSemiDay"
                    maxLength={undefined}
                    className="textinputbox"
                    placeHolder="10,000,000 "
                    handleInputChange={handleChangeTodayPostSemiDay}
                    value={editTariff.todayPostSemiDay}
                  />
                </div>
                <div className={styles.input}>
                  <InputText
                    name="todayPostFullDay"
                    maxLength={undefined}
                    className="textinputbox"
                    placeHolder="10,000,000 "
                    handleInputChange={handleChangeTodayPostSemiDay}
                    value={editTariff.todayPostFullDay}
                  />
                </div>
              </div>
              <div className={styles.column}>
                <div className={styles.type}>{t(LanguageKey.pageStatistics_stories)}</div>
                <div className={styles.input}>
                  <InputText
                    name="todayStorySemiDay"
                    maxLength={undefined}
                    className="textinputbox"
                    placeHolder="10,000,000 "
                    handleInputChange={handleChangeTodayPostSemiDay}
                    value={editTariff.todayStorySemiDay}
                  />
                </div>
                <div className={styles.input}>
                  <InputText
                    name="todayStoryFullDay"
                    maxLength={undefined}
                    className="textinputbox"
                    placeHolder="10,000,000 "
                    handleInputChange={handleChangeTodayPostSemiDay}
                    value={editTariff.todayStoryFullDay}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="headerandinput">
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.advertiseProperties_otherdays)}</div>
              {/* <div className="explain">
                This tariff define for{" "}
                <strong> {t(LanguageKey.advertiseProperties_otherdays)}</strong>
              </div> */}
            </div>
            <div className={styles.content}>
              <div className={styles.column}>
                <div className={styles.type} style={{ marginBottom: "15px" }}></div>
                <div className={styles.halfday}>{t(LanguageKey.advertiseProperties_tariff12hours)}</div>
                <div className={styles.fullday}>{t(LanguageKey.advertiseProperties_tariff24hours)}</div>
              </div>
              <div className={styles.column}>
                <div className={styles.type}>{t(LanguageKey.pageStatistics_post)}</div>
                <div className={styles.input}>
                  <InputText
                    name="basicPostSemiDay"
                    maxLength={undefined}
                    className="textinputbox"
                    placeHolder="10,000,000 "
                    handleInputChange={handleChangeTodayPostSemiDay}
                    value={editTariff.basicPostSemiDay}
                  />
                </div>
                <div className={styles.input}>
                  <InputText
                    name="basicPostFullday"
                    maxLength={undefined}
                    className="textinputbox"
                    placeHolder="10,000,000 "
                    handleInputChange={handleChangeTodayPostSemiDay}
                    value={editTariff.basicPostFullday}
                  />
                </div>
              </div>
              <div className={styles.column}>
                <div className={styles.type}>{t(LanguageKey.pageStatistics_stories)}</div>
                <div className={styles.input}>
                  <InputText
                    name="basicStorySemiDay"
                    maxLength={undefined}
                    className="textinputbox"
                    placeHolder="10,000,000 "
                    handleInputChange={handleChangeTodayPostSemiDay}
                    value={editTariff.basicStorySemiDay}
                  />
                </div>
                <div className={styles.input}>
                  <InputText
                    name="basicStoryFullDay"
                    maxLength={undefined}
                    className="textinputbox"
                    placeHolder="10,000,000 "
                    handleInputChange={handleChangeTodayPostSemiDay}
                    value={editTariff.basicStoryFullDay}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="headerandinput">
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.advertiseProperties_Campaign)}</div>
              {/* <div className="explain">
                This tariff define for all{" "}
                <strong> {t(LanguageKey.advertiseProperties_Campaign)}</strong>
              </div> */}
            </div>
            <div className={styles.content}>
              <div className={styles.column}>
                <div className={styles.type} style={{ marginBottom: "15px", width: "60px" }}></div>
                <div className={styles.fullday}> {t(LanguageKey.advertiseProperties_tariff24hours)}</div>
              </div>
              <div className={styles.column}>
                <div className={styles.type}>{t(LanguageKey.pageStatistics_post)}</div>
                <div className={styles.input}>
                  <InputText
                    name="campaignPostFullDay"
                    maxLength={undefined}
                    className="textinputbox"
                    placeHolder="10,000,000 "
                    handleInputChange={handleChangeTodayPostSemiDay}
                    value={editTariff.campaignPostFullDay}
                  />
                </div>
              </div>
              <div className={styles.column}>
                <div className={styles.type}>{t(LanguageKey.pageStatistics_stories)}</div>
                <div className={styles.input}>
                  <InputText
                    name="campaignStoryFullDay"
                    maxLength={undefined}
                    className="textinputbox"
                    placeHolder="10,000,000 "
                    handleInputChange={handleChangeTodayPostSemiDay}
                    value={editTariff.campaignStoryFullDay}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="ButtonContainer">
          <button onClick={props.removeMask} className="cancelButton">
            {t(LanguageKey.cancel)}
          </button>
          <div onClick={saveTariif} className="saveButton">
            {t(LanguageKey.save)}
          </div>
        </div>
      </>
    </>
  );
};

export default EditTariff;
