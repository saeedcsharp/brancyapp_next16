import Head from "next/head";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import TimerSlider from "brancy/components/design/sliders/timerSlider";
import ToggleCheckBoxButton from "brancy/components/design/switchButton/switchButton";
import { findDayName, findDayNumber } from "brancy/helper/findDayName";
import { LanguageKey } from "brancy/i18n";
import styles from "./businessHours.module.css";
import { BusinessDay } from "brancy/models/enums";
import { IBusinessHour, IActiveBusinessHour } from "brancy/models/interfaces";

const EditBusinessHours = (props: {
  businessInfo: IBusinessHour[];
  removeMask: () => void;
  saveBusinessHour: (info: IBusinessHour[]) => void;
}) => {
  const isBusinessHourActive = (businessHour: IBusinessHour) =>
    businessHour.beginTime !== 0 || businessHour.endTime !== 0;

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
    friday: isBusinessHourActive(props.businessInfo[BusinessDay.Friday]),
    monday: isBusinessHourActive(props.businessInfo[BusinessDay.Monday]),
    saturday: isBusinessHourActive(props.businessInfo[BusinessDay.Saturday]),
    sunday: isBusinessHourActive(props.businessInfo[BusinessDay.Sunday]),
    thursday: isBusinessHourActive(props.businessInfo[BusinessDay.Thursday]),
    tuesday: isBusinessHourActive(props.businessInfo[BusinessDay.Tuesday]),
    wednesday: isBusinessHourActive(props.businessInfo[BusinessDay.Wednesday]),
  });
  function changeSliderValue(info: IBusinessHour) {
    setBusinessHours((prev) =>
      prev.map((x) => (x.weekday === info.weekday ? { ...x, beginTime: info.beginTime, endTime: info.endTime } : x)),
    );
  }
  function changeActiveBusinessHour(e: ChangeEvent<HTMLInputElement>) {
    setActiveBusinessHour((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    setBusinessHours((prev) =>
      prev.map((x) =>
        x.weekday === findDayNumber(e.target.name)
          ? {
              ...x,
              beginTime: e.target.checked ? (x.beginTime === 0 && x.endTime === 0 ? 0 : x.beginTime) : 0,
              endTime: e.target.checked ? (x.beginTime === 0 && x.endTime === 0 ? 84600 : x.endTime) : 0,
            }
          : x,
      ),
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Edit Business Hours</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
      </Head>
      <div className={styles.all}>
        <div className={styles.section}>
          <div className={styles.left}>
            <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Monday].weekday))}</div>
            <div className={styles.setting}>
              <ToggleCheckBoxButton
                name="monday"
                handleToggle={changeActiveBusinessHour}
                checked={activeBusinessHour.monday}
                title="Monday"
                role="switch button"
              />
            </div>
          </div>
          <div className={`${styles.right} ${!activeBusinessHour.monday && "fadeDiv"}`}>
            <TimerSlider
              key={`monday-${activeBusinessHour.monday}`}
              info={businessHours[BusinessDay.Monday]}
              changeSliderValue={changeSliderValue}
              activeTimer={activeBusinessHour.monday}
            />
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.left}>
            <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Tuesday].weekday))}</div>
            <div className={styles.setting}>
              <ToggleCheckBoxButton
                name="tuesday"
                handleToggle={changeActiveBusinessHour}
                checked={activeBusinessHour.tuesday}
                title="Tuesday"
                role="switch button"
              />
            </div>
          </div>
          <div className={`${styles.right} ${!activeBusinessHour.tuesday && "fadeDiv"}`}>
            <TimerSlider
              key={`tuesday-${activeBusinessHour.tuesday}`}
              info={businessHours[BusinessDay.Tuesday]}
              changeSliderValue={changeSliderValue}
              activeTimer={activeBusinessHour.tuesday}
            />
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.left}>
            <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Wednesday].weekday))}</div>
            <div className={styles.setting}>
              <ToggleCheckBoxButton
                name="wednesday"
                handleToggle={changeActiveBusinessHour}
                checked={activeBusinessHour.wednesday}
                title="Wednesday"
                role="switch button"
              />
            </div>
          </div>
          <div className={`${styles.right} ${!activeBusinessHour.wednesday && "fadeDiv"}`}>
            <TimerSlider
              key={`wednesday-${activeBusinessHour.wednesday}`}
              info={businessHours[BusinessDay.Wednesday]}
              changeSliderValue={changeSliderValue}
              activeTimer={activeBusinessHour.wednesday}
            />
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.left}>
            <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Thursday].weekday))}</div>
            <div className={styles.setting}>
              <ToggleCheckBoxButton
                name="thursday"
                handleToggle={changeActiveBusinessHour}
                checked={activeBusinessHour.thursday}
                title="Thursday"
                role="switch button"
              />
            </div>
          </div>
          <div className={`${styles.right} ${!activeBusinessHour.thursday && "fadeDiv"}`}>
            <TimerSlider
              key={`thursday-${activeBusinessHour.thursday}`}
              info={businessHours[BusinessDay.Thursday]}
              changeSliderValue={changeSliderValue}
              activeTimer={activeBusinessHour.thursday}
            />
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.left}>
            <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Friday].weekday))}</div>
            <div className={styles.setting}>
              <ToggleCheckBoxButton
                name="friday"
                handleToggle={changeActiveBusinessHour}
                checked={activeBusinessHour.friday}
                title="Friday"
                role="switch button"
              />
            </div>
          </div>
          <div className={`${styles.right} ${!activeBusinessHour.friday && "fadeDiv"}`}>
            <TimerSlider
              key={`friday-${activeBusinessHour.friday}`}
              info={businessHours[BusinessDay.Friday]}
              changeSliderValue={changeSliderValue}
              activeTimer={activeBusinessHour.friday}
            />
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.left}>
            <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Saturday].weekday))}</div>
            <div className={styles.setting}>
              <ToggleCheckBoxButton
                name="saturday"
                handleToggle={changeActiveBusinessHour}
                checked={activeBusinessHour.saturday}
                title="Saturday"
                role="switch button"
              />
            </div>
          </div>
          <div className={`${styles.right} ${!activeBusinessHour.saturday && "fadeDiv"}`}>
            <TimerSlider
              key={`saturday-${activeBusinessHour.saturday}`}
              info={businessHours[BusinessDay.Saturday]}
              changeSliderValue={changeSliderValue}
              activeTimer={activeBusinessHour.saturday}
            />
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.left}>
            <div className={styles.day}>{t(findDayName(businessHours[BusinessDay.Sunday].weekday))}</div>
            <div className={styles.setting}>
              <ToggleCheckBoxButton
                name="sunday"
                handleToggle={changeActiveBusinessHour}
                checked={activeBusinessHour.sunday}
                title="Sunday"
                role="switch button"
              />
            </div>
          </div>
          <div className={`${styles.right} ${!activeBusinessHour.sunday && "fadeDiv"}`}>
            <TimerSlider
              key={`sunday-${activeBusinessHour.sunday}`}
              info={businessHours[BusinessDay.Sunday]}
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
  );
};

export default EditBusinessHours;
