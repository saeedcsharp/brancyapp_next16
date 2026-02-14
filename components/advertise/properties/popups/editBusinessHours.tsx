import Head from "next/head";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import TimerSlider from "saeed/components/design/sliders/timerSlider";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import { findDayName, findDayNumber } from "saeed/helper/findDayName";
import { LanguageKey } from "saeed/i18n";
import { BusinessDay, IActiveBusinessHour, IBusinessHour } from "saeed/models/advertise/peoperties";
import styles from "./businessHours.module.css";

const EditBusinessHours = (props: {
  businessInfo: IBusinessHour[];
  removeMask: () => void;
  saveBusinessHour: (info: IBusinessHour[]) => void;
}) => {
  const [businessHours, setBusinessHours] = useState<IBusinessHour[]>([
    props.businessInfo[BusinessDay.Monday],
    props.businessInfo[BusinessDay.Tuesday],
    props.businessInfo[BusinessDay.Wednesday],
    props.businessInfo[BusinessDay.Thursday],
    props.businessInfo[BusinessDay.Friday],
    props.businessInfo[BusinessDay.Saturday],
    props.businessInfo[BusinessDay.Sunday],
  ]);
  const { t } = useTranslation();
  const [activeBusinessHour, setActiveBusinessHour] = useState<IActiveBusinessHour>({
    friday: props.businessInfo[BusinessDay.Friday].timerInfo ? true : false,
    monday: props.businessInfo[BusinessDay.Monday].timerInfo ? true : false,
    saturday: props.businessInfo[BusinessDay.Saturday].timerInfo ? true : false,
    sunday: props.businessInfo[BusinessDay.Sunday].timerInfo ? true : false,
    thursday: props.businessInfo[BusinessDay.Thursday].timerInfo ? true : false,
    tuesday: props.businessInfo[BusinessDay.Tuesday].timerInfo ? true : false,
    wednesday: props.businessInfo[BusinessDay.Wednesday].timerInfo ? true : false,
  });
  function changeSliderValue(info: IBusinessHour) {
    setBusinessHours((prev) => prev.map((x) => (x.dayName === info.dayName ? { ...x, timerInfo: info.timerInfo } : x)));
  }
  function changeActiveBusinessHour(e: ChangeEvent<HTMLInputElement>) {
    setActiveBusinessHour((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
    setBusinessHours((prev) =>
      prev.map((x) =>
        x.dayName === findDayNumber(e.target.name) ? { ...x, timerInfo: e.target.checked ? x.timerInfo : null } : x
      )
    );
  }

  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Edit Business Hours</title>
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
        <div className={styles.all}>
          <div className={styles.section}>
            <div className={styles.left}>
              <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Monday].dayName))}</div>
              <div className={styles.setting}>
                <ToggleCheckBoxButton
                  name="monday"
                  handleToggle={changeActiveBusinessHour}
                  checked={activeBusinessHour.monday}
                  title={"Monday"}
                  role={"switch button"}
                />
              </div>
            </div>

            <div className={`${styles.right} ${!activeBusinessHour.monday && "fadeDiv"}`}>
              <TimerSlider
                info={props.businessInfo[businessHours[BusinessDay.Monday].dayName]}
                changeSliderValue={changeSliderValue}
                activeTimer={activeBusinessHour.monday}
              />
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.left}>
              <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Tuesday].dayName))}</div>
              <div className={styles.setting}>
                <ToggleCheckBoxButton
                  name="tuesday"
                  handleToggle={changeActiveBusinessHour}
                  checked={activeBusinessHour.tuesday}
                  title={"  Tuesday"}
                  role={" switch button"}
                />
              </div>
            </div>

            <div className={`${styles.right} ${!activeBusinessHour.tuesday && "fadeDiv"}`}>
              <TimerSlider
                info={props.businessInfo[businessHours[BusinessDay.Tuesday].dayName]}
                changeSliderValue={changeSliderValue}
                activeTimer={activeBusinessHour.tuesday}
              />
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.left}>
              <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Wednesday].dayName))}</div>
              <div className={styles.setting}>
                <ToggleCheckBoxButton
                  name="wednesday"
                  handleToggle={changeActiveBusinessHour}
                  checked={activeBusinessHour.wednesday}
                  title={" Wednesday"}
                  role={" switch button"}
                />
              </div>
            </div>

            <div className={`${styles.right} ${!activeBusinessHour.wednesday && "fadeDiv"}`}>
              <TimerSlider
                info={props.businessInfo[businessHours[BusinessDay.Wednesday].dayName]}
                changeSliderValue={changeSliderValue}
                activeTimer={activeBusinessHour.wednesday}
              />
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.left}>
              <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Thursday].dayName))}</div>
              <div className={styles.setting}>
                <ToggleCheckBoxButton
                  name="thursday"
                  handleToggle={changeActiveBusinessHour}
                  checked={activeBusinessHour.thursday}
                  title={" Thursday"}
                  role={" switch button"}
                />
              </div>
            </div>

            <div className={`${styles.right} ${!activeBusinessHour.thursday && "fadeDiv"}`}>
              <TimerSlider
                info={props.businessInfo[businessHours[BusinessDay.Thursday].dayName]}
                changeSliderValue={changeSliderValue}
                activeTimer={activeBusinessHour.thursday}
              />
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.left}>
              <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Friday].dayName))}</div>
              <div className={styles.setting}>
                <ToggleCheckBoxButton
                  name="friday"
                  handleToggle={changeActiveBusinessHour}
                  checked={activeBusinessHour.friday}
                  title={" Friday"}
                  role={" switch button"}
                />
              </div>
            </div>

            <div className={`${styles.right} ${!activeBusinessHour.friday && "fadeDiv"}`}>
              <TimerSlider
                info={props.businessInfo[businessHours[BusinessDay.Friday].dayName]}
                changeSliderValue={changeSliderValue}
                activeTimer={activeBusinessHour.friday}
              />
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.left}>
              <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Saturday].dayName))}</div>
              <div className={styles.setting}>
                <ToggleCheckBoxButton
                  name="saturday"
                  handleToggle={changeActiveBusinessHour}
                  checked={activeBusinessHour.saturday}
                  title={" Saturday"}
                  role={" switch button"}
                />
              </div>
            </div>

            <div className={`${styles.right} ${!activeBusinessHour.saturday && "fadeDiv"}`}>
              <TimerSlider
                info={props.businessInfo[businessHours[BusinessDay.Saturday].dayName]}
                changeSliderValue={changeSliderValue}
                activeTimer={activeBusinessHour.saturday}
              />
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.left}>
              <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Sunday].dayName))}</div>
              <div className={styles.setting}>
                <ToggleCheckBoxButton
                  name="sunday"
                  handleToggle={changeActiveBusinessHour}
                  checked={activeBusinessHour.sunday}
                  title={" Sunday"}
                  role={" switch button"}
                />
              </div>
            </div>

            <div className={`${styles.right} ${!activeBusinessHour.sunday && "fadeDiv"}`}>
              <TimerSlider
                info={props.businessInfo[businessHours[BusinessDay.Sunday].dayName]}
                changeSliderValue={changeSliderValue}
                activeTimer={activeBusinessHour.sunday}
              />
            </div>
          </div>
        </div>
        <div className="ButtonContainer">
          <button onClick={props.removeMask} className="cancelButton">
            {t(LanguageKey.cancel)}
          </button>
          <div onClick={() => props.saveBusinessHour(businessHours)} className="saveButton">
            {t(LanguageKey.save)}
          </div>
        </div>
      </>
    </>
  );
};

export default EditBusinessHours;
