import { ChangeEvent, useEffect, useState } from "react";
import gregorian from "react-date-object/calendars/gregorian";
import english from "react-date-object/locales/gregorian_en";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import SetTimeAndDate from "brancy/components/dateAndTime/setTimeAndDate";
import IncrementStepper from "brancy/components/design/incrementStepper"; // Import IncrementStepper
import InputText from "brancy/components/design/inputText";
import Modal from "brancy/components/design/modal";
import RadioButton from "brancy/components/design/radioButton";
import { internalNotify, InternalResponseType, NotifType } from "brancy/components/notifications/notificationBox";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { IDiscount_ForClient } from "brancy/models/store/IProduct";
import styles from "brancy/components/store/products/productDetail/notInstanceProduct/popups/discount.module.css";

const Discount = (props: {
  data: IDiscount_ForClient;
  removeMask: () => void;
  saveDicount: (dicount: IDiscount_ForClient) => void;
}) => {
  const { t } = useTranslation();
  const [calendar, setCalendar] = useState(gregorian);
  const [locale, setLocale] = useState(english);
  const [subProduct, setSubProduct] = useState(props.data);
  const [amountWarning, setAmountWarning] = useState(false);
  const [countWarning, setCountWarning] = useState(false);
  // Change count state to number
  const [count, setCount] = useState<number>(props.data?.maxCount ?? 1);
  const [showSetDateAndTime, setShowSetDateAndTime] = useState(false);
  const [dateAndTime, setDateAndTime] = useState<number | null>(props.data?.maxTime!);
  const [amount, setAmount] = useState(props.data!.value.toString());
  // Add state for shake animation
  const [isShaking, setIsShaking] = useState(false);
  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    if (/^\d*\.?\d*$/.test(inputValue)) {
      const numericValue = parseFloat(inputValue);
      setAmount(inputValue.length === 0 ? "0" : inputValue);
      setAmountWarning(numericValue < 0.1 || numericValue > 80 || inputValue.length === 0);
      setSubProduct((prev) => ({
        ...prev,
        value: Number(inputValue),
      }));
    }
  }

  // Remove handleUserCountChange function
  // function handleUserCountChange(e: ChangeEvent<HTMLInputElement>) { ... }

  // Add increment/decrement handlers
  function handleIncrementCount() {
    setCount((prevCount) => {
      const newCount = prevCount + 1;
      const isInvalid = newCount < 1 || newCount > 1000;
      setCountWarning(isInvalid);
      if (!isInvalid) {
        setSubProduct((prev) => ({
          ...prev,
          maxCount: newCount,
        }));
      }
      return newCount;
    });
  }

  // Update handleDecrementCount to add shake animation when count is 1
  function handleDecrementCount() {
    if (count <= 1) {
      // Trigger shake animation
      setIsShaking(true);
      // Remove animation class after it finishes
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setCount((prevCount) => {
      const newCount = prevCount - 1;
      const isInvalid = newCount < 1 || newCount > 1000;
      setCountWarning(isInvalid);
      if (newCount >= 1) {
        setSubProduct((prev) => ({
          ...prev,
          maxCount: newCount,
        }));
        return newCount;
      }
      return prevCount;
    });
  }

  function saveDateAndTime(date: string | undefined) {
    if (date !== undefined) {
      let dateInt = parseInt(date);
      if (dateInt < Date.now() + 3600000) {
        internalNotify(InternalResponseType.TimeExpire, NotifType.Info);
        return;
      }
      setDateAndTime(dateInt);
      setSubProduct((prev) => ({
        ...prev,
        maxTime: dateInt,
      }));
      setShowSetDateAndTime(false);
    }
  }
  useEffect(() => {
    // Initialize countWarning based on initial data
    if (props.data?.maxCount !== null) {
      setCountWarning(props.data.maxCount < 1 || props.data.maxCount > 1000);
    }
  }, []);
  return (
    <>
      <div className="dialogBg" onClick={props.removeMask} style={{ borderRadius: "var(--br25)" }} />
      {!showSetDateAndTime && (
        <div className="popup" style={{ alignItems: "flex-start" }}>
          <div className="title">{t(LanguageKey.product_Discount)}</div>
          <div className={styles.all}>
            <div className="headerandinput" style={{ maxWidth: "150px" }}>
              <div className="headertext">{t(LanguageKey.product_Amount)}</div>
              <div className="headerandinput">
                <div className={styles.subinput}>%</div>
                <InputText
                  name=""
                  className={parseFloat(amount) < 1 || parseFloat(amount) > 80 ? "danger" : "textinputbox"}
                  placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                  handleInputChange={(e) => {
                    const inputValue = e.target.value;

                    // If current value is "0" and user types a new digit, replace the "0"
                    if (amount === "0" && /^0[1-9]$/.test(inputValue)) {
                      const newDigit = inputValue.substring(1);
                      setAmount(newDigit);
                      const numericValue = parseFloat(newDigit);
                      setAmountWarning(numericValue < 0.1 || numericValue > 80);
                      setSubProduct((prev) => ({
                        ...prev,
                        value: numericValue,
                      }));
                      return;
                    }

                    handleAmountChange(e);
                  }}
                  value={amount}
                  numberType={true}
                />
                {amountWarning && (
                  <div className="explain" style={{ color: "var(--color-dark-red)" }}>
                    MIN <strong>1%</strong>   ▪  MAX <strong>80%</strong>
                  </div>
                )}
              </div>
            </div>
            <div className="headerandinput" style={{ gap: "var(--gap-20)" }}>
              <div className="title">{t(LanguageKey.product_NUMBEROFUSES)}</div>
              <div className="headerandinput" style={{ gap: "var(--gap-10)" }}>
                <RadioButton
                  name={"UNLIMITED"}
                  id={t(LanguageKey.product_UNLIMITED)}
                  checked={subProduct?.maxCount !== null ? false : true}
                  handleOptionChanged={() => {
                    setCountWarning(false); // Reset warning when switching to unlimited
                    setSubProduct((prev) => ({
                      ...prev,
                      maxCount: null,
                    }));
                  }}
                  textlabel={t(LanguageKey.product_UNLIMITED)}
                />
                <div className="headerandinput">
                  <div className="headerparent" style={{ maxWidth: "100px" }}>
                    <RadioButton
                      name={"LIMITED"}
                      id={t(LanguageKey.product_LIMITED)}
                      checked={subProduct?.maxCount !== null ? true : false}
                      handleOptionChanged={() => {
                        // Set initial count to 1 if switching to limited or if current count is invalid
                        const initialCount =
                          subProduct?.maxCount === null || subProduct?.maxCount < 1 || subProduct?.maxCount > 1000
                            ? 1
                            : subProduct.maxCount;
                        setCount(initialCount);
                        const isInvalid = initialCount < 1 || initialCount > 1000;
                        setCountWarning(isInvalid);
                        setSubProduct((prev) => ({
                          ...prev,
                          maxCount: initialCount,
                        }));
                      }}
                      textlabel={t(LanguageKey.product_LIMITED)}
                      title={t(LanguageKey.product_LIMITED)}
                    />
                    {/* Replace InputText with IncrementStepper */}
                    {/* Apply shake animation class conditionally */}
                    <div
                      className={`${subProduct?.maxCount === null && "fadeDiv"} ${
                        isShaking ? styles.shakeAnimation : ""
                      }`}>
                      <IncrementStepper
                        data={count}
                        increment={handleIncrementCount}
                        decrement={handleDecrementCount}
                        id={"count"}
                      />
                    </div>
                  </div>
                  {countWarning &&
                    subProduct?.maxCount !== null && ( // Show warning only when limited is selected
                      <div className="explain" style={{ color: "var(--color-dark-red)" }}>
                        MIN <strong>1</strong>   ▪  MAX <strong>1000</strong>
                      </div>
                    )}
                </div>
              </div>
            </div>
            <div className="headerandinput" style={{ gap: "var(--gap-20)" }}>
              <div className="title">{t(LanguageKey.product_USINGTIMES)}</div>

              <div className="headerandinput" style={{ gap: "var(--gap-20)" }}>
                <RadioButton
                  name={"UNLIMITED TIME"}
                  id={t(LanguageKey.product_UNLIMITEDTIME)}
                  checked={subProduct.maxTime !== null ? false : true}
                  handleOptionChanged={() => {
                    setSubProduct((prev) => ({
                      ...prev,
                      maxTime: null,
                    }));
                  }}
                  textlabel={t(LanguageKey.product_UNLIMITEDTIME)}
                  title={t(LanguageKey.product_UNLIMITEDTIME)}
                />
                <div className="headerandinput">
                  <RadioButton
                    name={"LIMITED Time"}
                    id={t(LanguageKey.product_LIMITEDTIME)}
                    checked={subProduct?.maxTime ? true : false}
                    handleOptionChanged={() => {
                      setDateAndTime(dateAndTime);
                      setSubProduct((prev) => ({
                        ...prev,
                        maxTime: prev.maxTime ? prev.maxTime : Date.now() + 4200000,
                      }));
                    }}
                    textlabel={t(LanguageKey.product_LIMITEDTIME)}
                    title={t(LanguageKey.product_LIMITEDTIME)}
                  />
                  <div className={`${styles.dateTime} ${!subProduct?.maxTime && "fadeDiv"}`}>
                    <div className={styles.input} style={{ width: "35%" }}>
                      <div className={styles.instagramer}>
                        <span>
                          {new DateObject({
                            date: dateAndTime !== null ? dateAndTime : Date.now() + 4200000,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("MM/DD/YYYY")}
                        </span>
                      </div>
                    </div>
                    <div className={styles.input} style={{ width: "18%" }}>
                      <div className={styles.instagramer}>
                        {new DateObject({
                          date: dateAndTime !== null ? dateAndTime : Date.now() + 4200000,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("hh:mm")}
                      </div>
                    </div>
                    <div className={styles.input} style={{ width: "22%" }}>
                      <div className={styles.instagramer}>
                        {new DateObject({
                          date: dateAndTime !== null ? dateAndTime : Date.now() + 4200000,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("A")}
                      </div>
                    </div>

                    <div
                      onClick={() => setShowSetDateAndTime(true)}
                      className="saveButton"
                      style={{
                        position: "relative",
                        height: "40px",
                        width: "40px",
                        maxWidth: "40px",
                        minWidth: "40px",
                        maxHeight: "40px",
                        minHeight: "40px",
                        borderRadius: "10px",
                        padding: "var(--padding-10)",
                      }}>
                      <img title="calendar" className={styles.Calendaricon} alt="calendar" src="/selectDate-item.svg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ButtonContainer">
            <button onClick={props.removeMask} className="cancelButton">
              {t(LanguageKey.cancel)}
            </button>
            <button
              disabled={amountWarning || countWarning}
              onClick={() => {
                props.saveDicount(subProduct);
              }}
              className={amountWarning || countWarning ? "disableButton" : "saveButton"}>
              {t(LanguageKey.save)}
            </button>
          </div>
        </div>
      )}
      <Modal closePopup={props.removeMask} classNamePopup={"popup"} showContent={showSetDateAndTime}>
        <SetTimeAndDate
          removeMask={props.removeMask}
          saveDateAndTime={saveDateAndTime}
          backToNormalPicker={() => setShowSetDateAndTime(false)}
          endUnix={Date.now() + 31449600000}
          fromUnix={Date.now() + 4200000}
          startDay={subProduct.maxTime!}
        />
      </Modal>
    </>
  );
};

export default Discount;
