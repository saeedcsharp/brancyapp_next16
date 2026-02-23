import React, { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import InputText from "brancy/components/design/inputText";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/store/order/popup/OrderProgress.module.css";

const OrderProgress = () => {
  const { t } = useTranslation();

  const shippingData = [
    { id: 0, size: 1, dimensions: [15, 10, 10], weight: 46 },
    { id: 1, size: 2, dimensions: [20, 15, 10], weight: 80 },
    { id: 2, size: 3, dimensions: [20, 20, 15], weight: 132 },
    { id: 3, size: 4, dimensions: [30, 20, 20], weight: 175 },
    { id: 4, size: 5, dimensions: [35, 25, 20], weight: 502 },
    { id: 5, size: 6, dimensions: [40, 30, 25], weight: 612 },
    { id: 6, size: 7, dimensions: [45, 25, 20], weight: 519 },
    { id: 7, size: 8, dimensions: [45, 40, 30], weight: 926 },
    { id: 8, size: 9, dimensions: [55, 45, 35], weight: 1239 },
  ];

  const renderDimensions = (dimensions: any[]) =>
    dimensions.map((dim, index) => (
      <React.Fragment key={index}>
        <div style={{ fontWeight: "var(--weight-400)" }}>{dim}</div>
        {index < dimensions.length - 1 && (
          <div
            style={{
              fontSize: "var(--font-10)",
              fontWeight: "var(--weight-300)",
              color: "var(--color-gray)",
            }}>
            x
          </div>
        )}
      </React.Fragment>
    ));

  const shippingselect = shippingData.map((item) => (
    <div id={item.id.toString()} style={{ display: "flex", gap: "var(--gap-3)" }} key={item.id}>
      {t(LanguageKey.product_box)}
      <div
        style={{
          justifyContent: "center",
          width: "10px",
          fontWeight: "var(--weight-700)",
          display: "flex",
          gap: "var(--gap-5)",
        }}>
        {item.id + 1}
      </div>
      <div style={{ fontWeight: "var(--weight-300)", color: "var(--color-gray)" }}>|</div>
      <div
        style={{
          justifyContent: "center",
          width: "70px",
          display: "flex",
          gap: "var(--gap-1)",
          alignItems: "flex-end",
        }}>
        {renderDimensions(item.dimensions)}
      </div>
      <div style={{ fontWeight: "var(--weight-300)", color: "var(--color-gray)" }}>/</div>
      <div
        style={{
          width: "35px",
          fontWeight: "var(--weight-700)",
          display: "flex",
          gap: "var(--gap-5)",
          justifyContent: "center",
        }}>
        {item.weight}
      </div>
      <div style={{ fontWeight: "var(--weight-400)" }}>{t(LanguageKey.Storeproduct_gram)}</div>
    </div>
  ));

  shippingselect.push(
    <div id="10" style={{ fontWeight: "var(--weight-700)" }}>
      {t(LanguageKey.Storeproduct_OutOfStandardSize)}
    </div>
  );

  function handleshippingselect(id: number) {
    if (id == 10) {
      setSettingInfo((prev) => ({
        ...prev,
        productBox: {
          height: 10,
          length: 15,
          weight: 46,
          width: 10,
        },
        defaultShippingId: null,
      }));
    } else {
      setSettingInfo((prev) => ({
        ...prev,
        defaultShippingId: id,
        productBox: {
          length: shippingData.find((x) => x.id == id)!.dimensions[0],
          width: shippingData.find((x) => x.id == id)!.dimensions[1],
          height: shippingData.find((x) => x.id == id)!.dimensions[2],
          weight: shippingData.find((x) => x.id == id)!.weight,
        },
        minWeight: null,
      }));
    }
  }

  const [settingInfo, setSettingInfo] = useState<{
    activeShipping: boolean;
    productBox: {
      length: number;
      width: number;
      height: number;
      weight: number;
    };
    weight: number;
    defaultShippingId: number | null;
    minWeight: null;
  }>({
    activeShipping: true,
    productBox: {
      length: 15,
      width: 10,
      height: 10,
      weight: 46,
    },
    weight: 60,
    defaultShippingId: 0,
    minWeight: null,
  });

  const breakable = [<div id="0">{t(LanguageKey.Yes)}</div>, <div id="1">{t(LanguageKey.No)}</div>];

  function handlebreakable(id: any) {
    setSettingInfo((prev) => ({ ...prev, breakable: id == 0 }));
  }

  function handleNetWeightChange(e: ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      setSettingInfo((prev) => ({
        ...prev,
        weight: inputValue.length > 0 ? parseInt(inputValue) : 60,
      }));
    }
  }

  // Box3D component copied from Setting
  const Box3D = ({ width, length, height }: { width: number; length: number; height: number }) => {
    // Calculate scale based on maximum dimension
    const maxDimension = Math.max(width, length, height);
    const scale = 180 / maxDimension;

    const w = width * scale;
    const l = length * scale;
    const h = height * scale;

    // Center the box
    const startX = (300 - (w + l / 2)) / 2;
    const startY = (300 - (h + l / 2)) / 2;

    // Calculate volume in cubic centimeters and liters
    const volumeCm3 = width * length * height;
    const volumeLiters = volumeCm3 / 1000;

    // Calculate surface areas and perimeters for each face
    const frontFace = {
      area: width * height,
      perimeter: 2 * (width + height),
    };
    const sideFace = {
      area: length * height,
      perimeter: 2 * (length + height),
    };
    const topFace = {
      area: width * length,
      perimeter: 2 * (width + length),
    };

    const [selectedFace, setSelectedFace] = useState<string | null>(null);

    const points = {
      frontBottom: `M ${startX},${startY + l / 2} l ${w},0 l 0,${h} l -${w},0 z`,
      rightBottom: `M ${startX + w},${startY + l / 2} l ${l / 2},-${l / 2} l 0,${h} l -${l / 2},${l / 2} z`,
      topFace: `M ${startX},${startY + l / 2} l ${w},0 l ${l / 2},-${l / 2} l -${w},0 z`,
    };

    // Handle click on face
    const handleFaceClick = (face: string) => {
      setSelectedFace(face);
    };

    return (
      <>
        <svg className={styles.boxsvg} viewBox="0 0 300 300">
          <path d={points.frontBottom} onClick={() => handleFaceClick("front")} />
          <path d={points.rightBottom} onClick={() => handleFaceClick("side")} />
          <path d={points.topFace} onClick={() => handleFaceClick("top")} />

          {/* Width label */}
          <text
            x={startX + w / 2}
            y={startY + l / 2 + h + 10}
            textAnchor="middle"
            fill="var(--text-h1)"
            fontSize="var(--font-20)">
            {width}
          </text>

          {/* Height label */}
          <text
            x={startX + 16}
            y={startY + l / 2 + h / 1.65}
            textAnchor="end"
            fill="var(--text-h1)"
            fontSize="var(--font-20)">
            {height}
          </text>

          {/* Length label */}
          <text
            x={startX + w + l / 4}
            y={startY + l / 3.5}
            textAnchor="middle"
            transform={`rotate(-45 ${startX + w + l / 4} ${startY + l / 4})`}
            fill="var(--text-h1)"
            fontSize="var(--font-20)">
            {length}
          </text>
        </svg>

        {/* Volume information */}
        <div className={styles.selectedFace}>
          {t(LanguageKey.Volume)}:<strong>{volumeCm3.toLocaleString()}</strong> cm³ - (
          <strong>{volumeLiters.toFixed(2)}</strong> {t(LanguageKey.Liter)})
        </div>

        {/* Face information */}
        {selectedFace && (
          <div className={styles.selectedFace}>
            {selectedFace === "front" && (
              <>
                {t(LanguageKey.FrontFace)}: ( {t(LanguageKey.Area)}: <strong>{frontFace.area}</strong> cm² |{" "}
                {t(LanguageKey.Perimeter)}: <strong>{frontFace.perimeter}</strong> cm )
              </>
            )}
            {selectedFace === "side" && (
              <>
                {t(LanguageKey.SideFace)}: ( {t(LanguageKey.Area)}: <strong>{sideFace.area}</strong> cm² |{" "}
                {t(LanguageKey.Perimeter)}: <strong>{sideFace.perimeter} </strong>
                cm )
              </>
            )}
            {selectedFace === "top" && (
              <>
                {t(LanguageKey.TopFace)}: ( {t(LanguageKey.Area)}: <strong>{topFace.area}</strong> cm² |{" "}
                {t(LanguageKey.Perimeter)}: <strong>{topFace.perimeter}</strong> cm )
              </>
            )}
          </div>
        )}
      </>
    );
  };

  function handleChangeCustomWeight(e: ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      const numValue = inputValue.length > 0 ? parseInt(inputValue) : 0;
      if (numValue >= 10 && numValue <= 100) {
        setSettingInfo((prev) => ({
          ...prev,
          productBox: {
            ...prev.productBox,
            [e.currentTarget.name]: numValue,
          },
        }));
      }
    }
  }

  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsConfirmed(e.target.checked);
  };

  const [showWaybill, setShowWaybill] = useState(false);

  const handleNextStep = () => {
    if (isConfirmed) {
      setShowWaybill(true);
    }
  };

  const handleBack = () => {
    setShowWaybill(false);
  };

  return (
    <>
      {!showWaybill ? (
        <div className={styles.sizeconfirm}>
          <div className="headerandinput">
            <div className={`${styles.parsel} ${isConfirmed ? "fadeDiv" : ""}`}>
              <div className="headerandinput">
                <div className="headertext">{t(LanguageKey.Product_shippingSize)}</div>
                <DragDrop
                  data={shippingselect}
                  handleOptionSelect={handleshippingselect}
                  item={settingInfo.defaultShippingId === null ? 9 : settingInfo.defaultShippingId}
                />
              </div>
              {/* Breakable - weights */}
              <div className={styles.customsizedimention}>
                <div className="headerandinput" style={{ maxWidth: " 185px", minWidth: "32%" }}>
                  <div className="headertext">{t(LanguageKey.Product_Breakable)}</div>
                  <DragDrop data={breakable} handleOptionSelect={handlebreakable} />
                </div>

                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.finalWeight)}</div>

                  <div className={styles.inputandsub}>
                    <div className={styles.subinput}>{t(LanguageKey.Storeproduct_gram)}</div>
                    <InputText
                      name=""
                      className={settingInfo.weight >= 60 ? "textinputbox" : "danger"}
                      placeHolder="Net Weight "
                      handleInputChange={handleNetWeightChange}
                      value={settingInfo.weight!.toString()}
                      numberType={true}
                    />
                  </div>
                  {settingInfo.weight < 60 && (
                    <div className="explain" style={{ color: "var(--color-dark-red)" }}>
                      Min <strong>60 Gr</strong>
                    </div>
                  )}
                  {settingInfo.weight > 3000 && (
                    <div className="explain" style={{ color: "var(--color-dark-red)" }}>
                      Max <strong>3000 Gr</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.test}>
                {/* length width height */}
                <div className={styles.lengthwidthheight}>
                  <div
                    className="headerandinput"
                    // style={{ maxWidth: "32%", minWidth: "90px" }}
                  >
                    <div className="headertext">{t(LanguageKey.length)}</div>
                    <div className={styles.inputandsub}>
                      <div className={styles.subinput}>CM</div>
                      <InputText
                        name="length"
                        className={
                          settingInfo.productBox.length < 10 || settingInfo.productBox.length > 100
                            ? "danger"
                            : "textinputbox"
                        }
                        placeHolder="Length"
                        handleInputChange={handleChangeCustomWeight}
                        value={settingInfo.productBox.length.toString()}
                        numberType={true}
                      />
                    </div>
                  </div>

                  <div
                    className="headerandinput"
                    // style={{ maxWidth: "32%", minWidth: "90px" }}
                  >
                    <div className="headertext">{t(LanguageKey.width)}</div>
                    <div className={styles.inputandsub}>
                      <div className={styles.subinput}>CM</div>
                      <InputText
                        name="width"
                        className={
                          settingInfo.productBox.width < 10 || settingInfo.productBox.width > 100
                            ? "danger"
                            : "textinputbox"
                        }
                        placeHolder="Width"
                        handleInputChange={handleChangeCustomWeight}
                        value={settingInfo.productBox.width.toString()}
                        numberType={true}
                      />
                    </div>
                  </div>

                  <div
                    className="headerandinput"
                    // style={{ maxWidth: "32%", minWidth: "90px" }}
                  >
                    <div className="headertext">{t(LanguageKey.height)}</div>
                    <div className={styles.inputandsub}>
                      <div className={styles.subinput}>CM</div>
                      <InputText
                        name="height"
                        className={
                          settingInfo.productBox.height < 10 || settingInfo.productBox.height > 100
                            ? "danger"
                            : "textinputbox"
                        }
                        placeHolder="Height"
                        handleInputChange={handleChangeCustomWeight}
                        value={settingInfo.productBox.height.toString()}
                        numberType={true}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.shippingboxnew}>
                  <Box3D
                    width={settingInfo.productBox.width}
                    length={settingInfo.productBox.length}
                    height={settingInfo.productBox.height}
                  />
                </div>
              </div>
            </div>
            <div className={styles.isConfirmed}>
              <CheckBoxButton
                handleToggle={handleConfirmChange}
                value={isConfirmed}
                textlabel={t(LanguageKey.Storeorder_ParselisConfirmed)}
                title="confirm"
              />
            </div>
          </div>
          <div className="headerandinput">
            <div className={styles.attention}>
              <svg
                fill="none"
                style={{ minWidth: "24px", width: "24px" }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path
                  opacity=".4"
                  d="M12.25 2.79c-7.2 0-9.75 2.55-9.75 9.75s2.55 9.75 9.75 9.75S22 19.73 22 12.54c0-7.2-2.55-9.75-9.75-9.75"
                  stroke="var(--text-h2)"
                  strokeWidth="1.5"
                />
                <path
                  d="M11.5 16.04c0 .4.34.75.76.75a.75.75 0 0 0 0-1.5h-.01a.75.75 0 0 0-.75.75m.75-8.14a.75.75 0 0 0-.75.74v3.9a.75.75 0 0 0 1.5 0v-3.9a.75.75 0 0 0-.75-.75"
                  fill="var(--text-h2)"
                  strokeWidth="2"
                />
              </svg>
              <div className="explain">{t(LanguageKey.Storeorder_ParselisConfirmedExplain)}</div>
            </div>
            <div className={`ButtonContainer translate`} style={{ paddingInline: "5px" }}>
              <div className="stopButton" style={{ maxWidth: "35%" }}>
                {t(LanguageKey.Storeorder_CancelOrder)}
              </div>
              <div className={!isConfirmed ? "disableButton" : "saveButton"} onClick={handleNextStep}>
                {t(LanguageKey.Storeorder_nextWaybill)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.waybillContent}>
          <div className="headerandinput">
            <div className={styles.waybill}>
              <img loading="lazy" decoding="async" title="ℹ️ paste" src="/icon-plus2.svg" />
            </div>

            <div className={styles.setting}>
              <div className={styles.settingbutton} title="ℹ️ print waybill">
                <svg fill="none" width="35" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M16 14H7.5c-1.54 0-.64 4-.9 4-2.13 0-3.26-1.2-3.5-2.12-.1-.35-.1-.76-.1-1.6v-1.97c0-1.51 0-2.26.3-2.84.25-.5.67-.92 1.17-1.18C5.05 8 5.81 8 7.32 8h9.36c1.51 0 2.27 0 2.85.3.5.25.92.66 1.18 1.17.29.58.29 1.33.29 2.84v1.97c0 .84 0 1.25-.1 1.6-.24.93-2.58 2.12-3.4 2.12s.3-4-1.5-4"
                    fill="var(--color-gray30)"
                  />
                  <path
                    d="M17.4 7.5V5.88c0-1 0-1.51-.2-1.9a2 2 0 0 0-.78-.78c-.39-.2-.9-.2-1.9-.2H9.48c-1 0-1.51 0-1.9.2a2 2 0 0 0-.78.78c-.2.39-.2.9-.2 1.9V7.5m0 9.9c-.84 0-1.26 0-1.6-.1a2.7 2.7 0 0 1-1.9-1.9c-.1-.34-.1-.76-.1-1.6v-1.98c0-1.51 0-2.27.3-2.85.25-.5.67-.92 1.17-1.18.58-.29 1.34-.29 2.85-.29h9.36c1.51 0 2.27 0 2.85.3.5.25.92.67 1.18 1.17.29.58.29 1.34.29 2.85v1.98c0 .84 0 1.26-.1 1.6a2.7 2.7 0 0 1-1.9 1.9c-.34.1-.76.1-1.6.1m-2.7-6.75h2.7M9.48 21h5.04c1 0 1.51 0 1.9-.2q.52-.26.78-.78c.2-.39.2-.9.2-1.9v-1.44c0-1 0-1.51-.2-1.9a2 2 0 0 0-.78-.78c-.39-.2-.9-.2-1.9-.2H9.48c-1 0-1.51 0-1.9.2a2 2 0 0 0-.78.78c-.2.39-.2.9-.2 1.9v1.44c0 1 0 1.51.2 1.9q.26.52.78.78c.39.2.9.2 1.9.2"
                    stroke="var(--color-gray)"
                  />
                </svg>
                print
              </div>

              <div className={styles.settingbutton} title="ℹ️ JPG download">
                <img
                  style={{
                    cursor: "pointer",
                    width: "35px",
                    height: "35px",
                  }}
                  title="ℹ️ JPG download"
                  src="/jpg.svg"
                />
                Save
              </div>
              <div className={styles.settingbutton} title="ℹ️ PDF download">
                <img
                  style={{
                    cursor: "pointer",
                    width: "35px",
                    height: "35px",
                  }}
                  title="ℹ️ PDF download"
                  src="/pdf.svg"
                />
                Save
              </div>
            </div>
          </div>
          <div className="headerandinput">
            <div className={styles.attention}>
              <svg
                style={{ minWidth: "24px", width: "24px" }}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path
                  opacity=".4"
                  d="M12.25 2.79c-7.2 0-9.75 2.55-9.75 9.75s2.55 9.75 9.75 9.75S22 19.73 22 12.54c0-7.2-2.55-9.75-9.75-9.75"
                  stroke="var(--text-h2)"
                  strokeWidth="1.5"
                />
                <path
                  d="M11.5 16.04c0 .4.34.75.76.75a.75.75 0 0 0 0-1.5h-.01a.75.75 0 0 0-.75.75m.75-8.14a.75.75 0 0 0-.75.74v3.9a.75.75 0 0 0 1.5 0v-3.9a.75.75 0 0 0-.75-.75"
                  fill="var(--text-h2)"
                  strokeWidth="2"
                />
              </svg>
              <div className="explain">
                لطفا ابتدا مشخصات بار نامه خود را پرینت کرده و روی بسته بندی خود بچسبانید بعد از آن این مرحله را تایید
                کنید.
              </div>
            </div>
            <div className={`ButtonContainer translate`} style={{ paddingInline: "5px" }}>
              <div className="cancelButton" style={{ maxWidth: "35%" }} onClick={handleBack}>
                {t(LanguageKey.back)}
              </div>
              <div className={!isConfirmed ? "disableButton" : "saveButton"}>درخواست جمع آوری</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderProgress;
