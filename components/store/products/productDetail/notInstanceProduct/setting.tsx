import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import InputText from "brancy/components/design/inputText";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import Loading from "brancy/components/notOk/loading";
import { LanguageKey } from "brancy/i18n";
import { IProduct_Setting } from "brancy/models/store/IProduct";
import { GauranteeLength, GauranteeStatus, ParcelPocketDeliveryType } from "brancy/models/store/enum";
import styles from "./setting.module.css";

function Setting({
  setting,
  toggleNext,
  upadteCteateFromSetting,
}: {
  setting: IProduct_Setting;
  toggleNext: { toggle: boolean; isNext: boolean };
  upadteCteateFromSetting: (isNext: boolean, setting: IProduct_Setting) => void;
}) {
  const { t } = useTranslation();
  const originalityselect = [
    <div id="0">{t(LanguageKey.product_original)}</div>,
    <div id="1">{t(LanguageKey.product_HighCopy)}</div>,
    <div id="2">{t(LanguageKey.product_notoriginal)}</div>,
    <div id="3">{t(LanguageKey.product_Miscellaneous)}</div>,
    <div id="4">{t(LanguageKey.product_fake)}</div>,
  ];
  const preperingselect = [
    <div id="1">{t(LanguageKey.tomorrow)}</div>,
    <div id="2">2 {t(LanguageKey.pageTools_Day)}</div>,
    <div id="3">3 {t(LanguageKey.pageTools_Day)}</div>,
    <div id="4">4 {t(LanguageKey.pageTools_Day)}</div>,
    <div id="5">5 {t(LanguageKey.pageTools_Day)}</div>,
    <div id="6">6 {t(LanguageKey.pageTools_Day)}</div>,
    <div id="7">1 {t(LanguageKey.pageTools_Week)}</div>,
  ];
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

  const Availablityselect = [
    <div className={styles.Availablityselect} id="0" style={{ color: "var(--color-light-green)" }}>
      <img width="18px" alt="Available" title="ℹ️ Available" src="/product_Available.svg" />
      {t(LanguageKey.product_Available)}
    </div>,
    <div className={styles.Availablityselect} id="1" style={{ color: "var(--color-light-blue)" }}>
      <img width="18px" alt="supplying" title="ℹ️ supplying" src="/product_supplying.svg" />
      {t(LanguageKey.product_supplying)}
    </div>,
    <div className={styles.Availablityselect} id="2" style={{ color: "var(--color-light-red)" }}>
      <img width="18px" alt="Out Of Stock" title="ℹ️ Out Of Stock" src="/product_OutOfStock.svg" />
      {t(LanguageKey.product_OutOfStock)}
    </div>,
    <div className={styles.Availablityselect} id="3" style={{ color: "var(--color-gray)" }}>
      <img width="18px" alt="Stopped sale" title="ℹ️ Stopped sale" src="/product_Stoppedsale.svg" />
      {t(LanguageKey.product_Stoppedsale)}
    </div>,
  ];
  // const subcategoryselect = [
  //   <div>Sub Category 1</div>,
  //   <div>Sub Category 2</div>,
  //   <div>Sub Category 3</div>,
  //   <div>Sub Category 4</div>,
  //   <div>Sub Category 5</div>,
  //   <div>Sub Category 6</div>,
  // ];
  const maxincart = [
    <div id={"1"}>1</div>,
    <div id={"2"}>2</div>,
    <div id={"3"}>3</div>,
    <div id={"4"}>4</div>,
    <div id={"5"}>5</div>,
    <div id={"10"}>+5</div>,
    <div id={"25"}>+10</div>,
    <div id={"75"}>+50</div>,
    <div id={"100"}>100</div>,
  ];

  // const Evatselect = [
  //   <div id="0">None</div>,
  //   <div id="1">5 %</div>,
  //   <div id="2">9 %</div>,
  //   <div id="3">10 %</div>,
  // ];
  const Guaranteeselect = [
    <div id="0">{t(LanguageKey.Undefined)}</div>,
    <div id="1">{t(LanguageKey.Yes)}</div>,
    <div id="2">{t(LanguageKey.No)}</div>,
  ];
  const EvatSelect = [
    <div id="-1">{t(LanguageKey.Pleaseselect)}</div>,
    <div id="0">{t(LanguageKey.No)}</div>,
    <div id="1">{t(LanguageKey.Yes)}</div>,
  ];
  const Guaranteelength = [
    <div id="3">3 {t(LanguageKey.pageTools_Day)}</div>,
    <div id="7">1 {t(LanguageKey.pageTools_Week)}</div>,
    <div id="14">2 {t(LanguageKey.pageTools_Week)}</div>,
    <div id="30">1 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="60">2 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="90">3 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="120">4 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="150">5 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="180">6 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="360">12 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="540">18 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="730">24 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="1080">36 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="1440">48 {t(LanguageKey.pageTools_Month)}</div>,
    <div id="1800">72 {t(LanguageKey.pageTools_Month)}</div>,
  ];
  const breakable = [<div id="0">{t(LanguageKey.Yes)}</div>, <div id="1">{t(LanguageKey.No)}</div>];
  const liquid = [<div id="0">{t(LanguageKey.Yes)}</div>, <div id="1">{t(LanguageKey.No)}</div>];
  const sackOptions = [<div id="0">{t(LanguageKey.Yes)}</div>, <div id="1">{t(LanguageKey.No)}</div>];
  const deliveryTypes = [
    <div id="-1">{t(LanguageKey.Pleaseselect)}</div>,
    <div id="0">{t(LanguageKey.Storeorder_bymyself)}</div>,
    <div id="2">{t(LanguageKey.Storeorder_postparselbox)}</div>,
    <div id="1">{t(LanguageKey.Storeorder_Envelope)}</div>,
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
    <div id={item.id.toString()} style={{ display: "flex", gap: "var(--gap-5)" }} key={item.id}>
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
    </div>,
  );
  const router = useRouter();
  const { query } = router;
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [settingInfo, setSettingInfo] = useState<IProduct_Setting>(setting);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hoverData, setHoverData] = useState({
    size: "Box",
    width: "W",
    length: "L",
    height: "H",
    weight: "weight",
  });
  const [refreshEvat, setRefresfEvat] = useState(false);
  function togglePopup() {
    setIsPopupOpen(!isPopupOpen);
  }
  function handleMouseEnter(size: any, width: any, length: any, height: any, weight: any) {
    setHoverData({ size, width, length, height, weight });
  }
  function handleMouseLeave() {
    setHoverData({
      size: "Box",
      width: "W",
      length: "L",
      height: "H",
      weight: "weight",
    });
  }
  function handleAvailablityselect(id: any) {
    setSettingInfo((prev) => ({ ...prev, availabilityStatus: Number(id) }));
  }
  function handleoriginalityselect(id: any) {
    setSettingInfo((prev) => ({ ...prev, orginalityStatus: Number(id) }));
  }
  function handlemaxincart(id: any) {
    setSettingInfo((prev) => ({ ...prev, maxInEachCard: Number(id) }));
  }
  function handlebreakable(id: any) {
    setSettingInfo((prev) => ({ ...prev, breakable: id == 0 }));
  }
  function handleIsLiquid(id: any) {
    setSettingInfo((prev) => ({ ...prev, isLiquid: id == 0 }));
  }
  function handleSackSelect(id: any) {
    setSettingInfo((prev) => ({
      ...prev,
      productBox: {
        ...prev.productBox!,
        isSack: id == 0,
      },
    }));
  }
  function handleEnvelopCountChange(e: ChangeEvent<HTMLInputElement>) {
    setSettingInfo((prev) => ({
      ...prev,
      envelopeAvailableCount: Number(e.target.value),
    }));
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
  function handleGuaranteelength(id: any) {
    setSettingInfo((prev) => ({ ...prev, guaranteeLenght: Number(id) }));
  }
  function handleGuaranteeselect(id: any) {
    setSettingInfo((prev) => ({
      ...prev,
      gauranteeStatus: Number(id),
      guaranteeLenght: id == 0 || id == 2 ? 0 : GauranteeLength.ThreeDays,
    }));
  }
  function handlepreperingselect(id: any) {
    setSettingInfo((prev) => ({ ...prev, readyForShipDayLong: Number(id) }));
  }
  // function handleshippingselect(id: number) {
  //   if (id == 10) {
  //     setSettingInfo((prev) => ({
  //       ...prev,
  //       productBox: {
  //         height: 10,
  //         length: 15,
  //         weight: 46,
  //         width: 10,
  //       },
  //       defaultShippingId: null,
  //     }));
  //   } else {
  //     setSettingInfo((prev) => ({
  //       ...prev,
  //       defaultShippingId: id,
  //       productBox: {
  //         length: shippingData.find((x) => x.id == id)!.dimensions[0],
  //         width: shippingData.find((x) => x.id == id)!.dimensions[1],
  //         height: shippingData.find((x) => x.id == id)!.dimensions[2],
  //         weight: shippingData.find((x) => x.id == id)!.weight,
  //       },
  //       minWeight: null,
  //     }));
  //   }
  // }
  const handleSelectDeliveryType = (id: any) => {
    setSettingInfo((prev) => ({
      ...prev,
      deliveryType: Number(id),
    }));
  };
  // function handleChangeBoxWeight(e: ChangeEvent<HTMLInputElement>) {
  //   if (settingInfo.defaultShippingId !== null) return;
  //   const inputValue = e.target.value;
  //   if (/^\d*$/.test(inputValue)) {
  //     setSettingInfo((prev) => ({
  //       ...prev,
  //       productBox: {
  //         ...prev.productBox,
  //         weight: parseFloat(inputValue),
  //         // parseFloat(inputValue) > prev.minWeight!
  //         //   ? parseFloat(inputValue)
  //         //   : prev.minWeight!,
  //       },
  //     }));
  //   }
  // }
  function handleChangeCustomWeight(e: ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      console.log("inputValue", inputValue);
      const numValue = inputValue.length > 0 ? parseInt(inputValue) : 0;
      // Only update if value is within range
      setSettingInfo((prev) => ({
        ...prev,
        productBox: {
          ...prev.productBox!,
          [e.currentTarget.name]: numValue,
        },
      }));
    }
  }
  function getBoxWeight(length: number, width: number, height: number) {
    if (length === 0 || width === 0 || height === 0) return 0;
    // Sort the dimensions so that length is the largest, width is the middle, and height is the smallest
    let dimensions = [length, width, height];
    dimensions.sort((a, b) => b - a);

    // Assign sorted values
    [length, width, height] = dimensions;

    // Now proceed with calculations
    const volume = length * width * height;
    const area = 2 * length * width + 2 * width * height + 2 * length * height;

    if (length <= 15) {
      return Math.floor(0.0575 * area);
    }

    if (length <= 20) {
      if (width <= 15) {
        return Math.floor(0.062307692 * area);
      } else {
        return Math.floor(0.066 * area);
      }
    }

    if (length <= 30) {
      return Math.floor(0.0546875 * area);
    }

    if (length <= 35) {
      return Math.floor(0.121204819 * area);
    }

    if (length <= 40) {
      return Math.floor(0.103728814 * area);
    }

    if (length <= 45) {
      if (width <= 25) {
        return Math.floor(0.102970297 * area);
      } else {
        return Math.floor(0.106551724 * area);
      }
    }

    return Math.floor(0.10376569 * area);
  }
  function handleSpcefiyMaxCartItem() {
    switch (settingInfo.maxInEachCard) {
      case 1:
        return maxincart.findIndex((x) => x.props.id == 1);
      case 2:
        return maxincart.findIndex((x) => x.props.id == 2);
      case 3:
        return maxincart.findIndex((x) => x.props.id == 3);
      case 4:
        return maxincart.findIndex((x) => x.props.id == 4);
      case 5:
        return maxincart.findIndex((x) => x.props.id == 5);
      case 10:
        return maxincart.findIndex((x) => x.props.id == 10);
      case 20:
        return maxincart.findIndex((x) => x.props.id == 25);
      case 75:
        return maxincart.findIndex((x) => x.props.id == 75);
      case 100:
        return maxincart.findIndex((x) => x.props.id == 100);
    }
  }
  function handleSpcefiyForShipItem() {
    switch (settingInfo.readyForShipDayLong) {
      case 1:
        return preperingselect.findIndex((x) => x.props.id == "1");
      case 2:
        return preperingselect.findIndex((x) => x.props.id == "2");
      case 3:
        return preperingselect.findIndex((x) => x.props.id == "3");
      case 4:
        return preperingselect.findIndex((x) => x.props.id == "4");
      case 5:
        return preperingselect.findIndex((x) => x.props.id == "5");
      case 6:
        return preperingselect.findIndex((x) => x.props.id == "6");
      case 7:
        return preperingselect.findIndex((x) => x.props.id == "7");
    }
  }
  function handleSpcefiyForGuarateeLenght() {
    switch (settingInfo.guaranteeLenght) {
      case 3:
        return Guaranteelength.findIndex((x) => x.props.id == "3");
      case 7:
        return Guaranteelength.findIndex((x) => x.props.id == "7");
      case 14:
        return Guaranteelength.findIndex((x) => x.props.id == "14");
      case 30:
        return Guaranteelength.findIndex((x) => x.props.id == "30");
      case 60:
        return Guaranteelength.findIndex((x) => x.props.id == "60");
      case 90:
        return Guaranteelength.findIndex((x) => x.props.id == "90");
      case 120:
        return Guaranteelength.findIndex((x) => x.props.id == "120");
      case 150:
        return Guaranteelength.findIndex((x) => x.props.id == "150");
      case 180:
        return Guaranteelength.findIndex((x) => x.props.id == "180");
      case 360:
        return Guaranteelength.findIndex((x) => x.props.id == "360");
      case 540:
        return Guaranteelength.findIndex((x) => x.props.id == "730");
      case 730:
        return Guaranteelength.findIndex((x) => x.props.id == "360");
      case 1080:
        return Guaranteelength.findIndex((x) => x.props.id == "1080");
      case 1440:
        return Guaranteelength.findIndex((x) => x.props.id == "1440");
      case 1800:
        return Guaranteelength.findIndex((x) => x.props.id == "1800");
    }
  }
  function handleSpecifyForShipping() {
    console.log("settingInfo.deliveryType", settingInfo.deliveryType);
    if (
      settingInfo.deliveryType === undefined ||
      settingInfo.deliveryType === null ||
      settingInfo.deliveryType === ParcelPocketDeliveryType.NotSet
    )
      return deliveryTypes.findIndex((x) => x.props.id == "-1");
    switch (settingInfo.deliveryType) {
      case ParcelPocketDeliveryType.None:
        return deliveryTypes.findIndex((x) => x.props.id == "0");
      case ParcelPocketDeliveryType.PostEnvelope:
        return deliveryTypes.findIndex((x) => x.props.id == "1");
      case ParcelPocketDeliveryType.PostBox:
        return deliveryTypes.findIndex((x) => x.props.id == "2");
    }
  }
  function handleEvatSelecteselect(id: any) {
    let newEvat = -1;
    if (id == "0") newEvat = 0;
    else if (id == "1") newEvat = 1;
    setSettingInfo((prev) => ({
      ...prev,
      evat: newEvat,
    }));
  }
  function handleChangeEVat(e: ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    if (inputValue === "0" || inputValue.length === 0) setRefresfEvat(!refreshEvat);
    if (/^\d*\.?\d*$/.test(inputValue)) {
      setSettingInfo((prev) => ({
        ...prev,
        evat: inputValue.length > 0 ? parseFloat(inputValue) : 0,
      }));
    }
  }

  // useEffect(() => {
  //   if (loading) return;
  //   setSettingInfo((prev) => ({
  //     ...prev,
  //     productBox: {
  //       ...prev.productBox,
  //       weight: getBoxWeight(
  //         settingInfo.productBox.length,
  //         settingInfo.productBox.width,
  //         settingInfo.productBox.height
  //       ),
  //     },
  //     minWeight: getBoxWeight(
  //       settingInfo.productBox.length,
  //       settingInfo.productBox.width,
  //       settingInfo.productBox.height
  //     ),
  //   }));
  // }, [
  //   settingInfo.productBox.height,
  //   settingInfo.productBox.length,
  //   settingInfo.productBox.width,
  // ]);
  useEffect(() => {
    if (loading) {
      setLoading(false);
      return;
    }
    // اگر deliveryType انتخاب نشده اجازه رفتن به مرحله بعد را نده
    if (
      settingInfo.deliveryType === undefined ||
      settingInfo.deliveryType === null ||
      settingInfo.deliveryType === -1
    ) {
      return;
    }
    upadteCteateFromSetting(toggleNext.isNext, settingInfo);
  }, [toggleNext.toggle]);

  // Add useEffect to monitor productBox dimension changes
  useEffect(() => {
    // This will trigger re-render when productBox dimensions change
    // The Box3D component will automatically receive updated props
  }, [settingInfo.productBox?.length, settingInfo.productBox?.width, settingInfo.productBox?.height]);

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
        <svg className={styles.boxsvg} width="250" height="250" viewBox="0 0 300 300">
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
            x={startX - 10}
            y={startY + l / 2 + h / 2}
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
  return (
    <>
      <div className={styles.setting}>
        {loading && <Loading />}
        {!loading && (
          <>
            {/* ___basic___*/}
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.product_BasicDetail)}</div>
              <div className={styles.basic}>
                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.Product_Availablity)}</div>
                  <DragDrop
                    data={Availablityselect}
                    handleOptionSelect={handleAvailablityselect}
                    item={settingInfo.availabilityStatus}
                  />
                </div>
                <div className={styles.headerandinputhalf}>
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.Product_maxincart)}</div>
                    <DragDrop data={maxincart} handleOptionSelect={handlemaxincart} item={handleSpcefiyMaxCartItem()} />
                  </div>
                </div>
                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.Product_originality)}</div>
                  <DragDrop
                    data={originalityselect}
                    handleOptionSelect={handleoriginalityselect}
                    item={settingInfo.orginalityStatus}
                  />
                </div>
                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.Product_preperingforship)}</div>
                  <DragDrop
                    data={preperingselect}
                    handleOptionSelect={handlepreperingselect}
                    item={handleSpcefiyForShipItem()}
                  />
                </div>
                <div className={styles.headerandinputhalf}>
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.Product_Guarantee)}</div>
                    <DragDrop
                      data={Guaranteeselect}
                      handleOptionSelect={handleGuaranteeselect}
                      item={settingInfo.gauranteeStatus}
                    />
                  </div>
                  {settingInfo.gauranteeStatus === GauranteeStatus.Yes && (
                    <div className="headerandinput">
                      <div className="headertext">{t(LanguageKey.Product_Guaranteelength)}</div>
                      <DragDrop
                        data={Guaranteelength}
                        handleOptionSelect={handleGuaranteelength}
                        item={handleSpcefiyForGuarateeLenght()}
                      />
                    </div>
                  )}
                </div>

                <div className="headerandinput">
                  <div className="headertext">
                    {t(LanguageKey.Product_packageshipping)}
                    <Tooltip tooltipValue={t(LanguageKey.Product_packageshippingexplain)} position="top" onClick={true}>
                      <img
                        style={{
                          marginInline: "5px",
                          cursor: "pointer",
                          width: "15px",
                          height: "15px",
                        }}
                        title="ℹ️ tooltip"
                        src="/tooltip.svg"
                      />
                    </Tooltip>
                  </div>
                  <DragDrop
                    data={deliveryTypes}
                    handleOptionSelect={handleSelectDeliveryType}
                    item={handleSpecifyForShipping()}
                    dangerBorder={
                      settingInfo.deliveryType === undefined ||
                      settingInfo.deliveryType === null ||
                      settingInfo.deliveryType === -1
                    }
                  />
                </div>
              </div>
            </div>
            {/* ___shipping___*/}
            {settingInfo.deliveryType !== ParcelPocketDeliveryType.None &&
              settingInfo.deliveryType !== ParcelPocketDeliveryType.NotSet && (
                <div className="headerandinput" style={{ animation: "var(--fadeIn4)" }}>
                  <div className="title">{t(LanguageKey.Product_shippingSize)}</div>

                  {settingInfo.deliveryType === ParcelPocketDeliveryType.PostBox && (
                    <>
                      <div className={styles.basic1}>
                        <div className={styles.customsize}>
                          <div className="headerandinput">
                            <div className="headertext">{t(LanguageKey.Product_Breakable)}</div>
                            <DragDrop
                              data={breakable}
                              handleOptionSelect={handlebreakable}
                              item={settingInfo.breakable ? 0 : 1}
                            />
                          </div>
                          <div className="headerandinput">
                            <div className="headertext">{t(LanguageKey.Product_Luquid)}</div>
                            <DragDrop
                              data={liquid}
                              handleOptionSelect={handleIsLiquid}
                              item={settingInfo.isLiquid ? 0 : 1}
                            />
                          </div>
                        </div>
                        <div className={styles.customsize}>
                          <div className="headerandinput">
                            <div className="headertext">
                              {t(LanguageKey.Product_sack)}
                              <Tooltip tooltipValue={t(LanguageKey.Product_sackExplain)} position="top" onClick={true}>
                                <img
                                  style={{
                                    marginInline: "5px",
                                    cursor: "pointer",
                                    width: "15px",
                                    height: "15px",
                                  }}
                                  title="ℹ️ tooltip"
                                  src="/tooltip.svg"
                                />
                              </Tooltip>
                            </div>
                            <DragDrop
                              data={sackOptions}
                              handleOptionSelect={handleSackSelect}
                              item={settingInfo.productBox?.isSack ? 0 : 1}
                            />
                          </div>
                          <div className="headerandinput">
                            <div className="headertext">
                              {t(LanguageKey.Product_Productweights)}
                              <Tooltip
                                tooltipValue={t(LanguageKey.Product_Productweightsexplian)}
                                position="top"
                                onClick={true}>
                                <img
                                  style={{
                                    marginInline: "5px",
                                    cursor: "pointer",
                                    width: "15px",
                                    height: "15px",
                                  }}
                                  title="ℹ️ tooltip"
                                  src="/tooltip.svg"
                                />
                              </Tooltip>
                            </div>
                            {
                              <div className={styles.inputandsub}>
                                <div className={styles.subinput}>{t(LanguageKey.Storeproduct_gram)}</div>
                                <InputText
                                  name=""
                                  className={
                                    settingInfo.weight && settingInfo.weight < setting.maxSize?.limitBox.weight!
                                      ? "textinputbox"
                                      : "danger"
                                  }
                                  placeHolder="Net Weight "
                                  handleInputChange={handleNetWeightChange}
                                  value={settingInfo.weight!.toString()}
                                  numberType={true}
                                />
                              </div>
                            }
                          </div>
                        </div>
                        <div className="headerandinput">
                          <div className={styles.customsize}>
                            <div
                              className="headerandinput"
                              style={{
                                maxWidth: "calc(33% - 20px)",
                                minWidth: "40px",
                              }}>
                              <div className="headertext">{t(LanguageKey.length)}</div>
                              <div className={styles.inputandsub}>
                                <div className={styles.subinput}>CM</div>
                                <InputText
                                  name="length"
                                  className={
                                    settingInfo.productBox!.length > setting.maxSize?.limitBox.length! ||
                                    settingInfo.productBox!.length <= 0
                                      ? "danger"
                                      : "textinputbox"
                                  }
                                  placeHolder="Net Price + BOX"
                                  handleInputChange={handleChangeCustomWeight}
                                  value={settingInfo.productBox!.length.toString()}
                                  numberType={true}
                                />
                              </div>
                            </div>
                            <div
                              className="headerandinput"
                              style={{
                                maxWidth: "calc(33% - 20px)",
                                minWidth: "40px",
                              }}>
                              <div className="headertext">{t(LanguageKey.width)}</div>
                              <div className={styles.inputandsub}>
                                <div className={styles.subinput}>CM</div>
                                <InputText
                                  name="width"
                                  className={
                                    settingInfo.productBox!.width > setting.maxSize?.limitBox.width! ||
                                    settingInfo.productBox!.width <= 0
                                      ? "danger"
                                      : "textinputbox"
                                  }
                                  placeHolder="Net Price + BOX"
                                  handleInputChange={handleChangeCustomWeight}
                                  value={settingInfo.productBox!.width.toString()}
                                  numberType={true}
                                />
                              </div>
                            </div>
                            <div
                              className="headerandinput"
                              style={{
                                maxWidth: "calc(33% - 20px)",
                                minWidth: "40px",
                              }}>
                              <div className="headertext">{t(LanguageKey.height)}</div>
                              <div className={styles.inputandsub}>
                                <div className={styles.subinput}>CM</div>
                                <InputText
                                  name="height"
                                  className={
                                    settingInfo.productBox!.height > setting.maxSize?.limitBox.height! ||
                                    settingInfo.productBox!.height <= 0
                                      ? "danger"
                                      : "textinputbox"
                                  }
                                  placeHolder="Net Price + BOX"
                                  handleInputChange={handleChangeCustomWeight}
                                  value={settingInfo.productBox!.height.toString()}
                                  numberType={true}
                                />
                              </div>
                            </div>
                            <div className="headerandinput" style={{ maxWidth: "40px", minWidth: "40px" }}>
                              <div className="headertext"> </div>
                              <img className={styles.popupbtn} onClick={togglePopup} src="/info.svg" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.shippingboxnew}>
                        <Box3D
                          width={settingInfo.productBox?.width || 0}
                          length={settingInfo.productBox?.length || 0}
                          height={settingInfo.productBox?.height || 0}
                        />
                      </div>
                    </>
                  )}

                  {settingInfo.deliveryType === ParcelPocketDeliveryType.PostEnvelope && (
                    <div className={styles.basic}>
                      <div className={styles.customsize}>
                        <div className="headerandinput">
                          <div className="headertext">{t(LanguageKey.Product_Breakable)}</div>
                          <DragDrop
                            data={breakable}
                            handleOptionSelect={handlebreakable}
                            item={settingInfo.breakable ? 0 : 1}
                          />
                        </div>
                        <div className="headerandinput">
                          <div className="headertext">{t(LanguageKey.Product_Luquid)}</div>
                          <DragDrop
                            data={liquid}
                            handleOptionSelect={handleIsLiquid}
                            item={settingInfo.isLiquid ? 0 : 1}
                          />
                        </div>
                      </div>
                      <div className="headerandinput">
                        <div className="headertext">
                          {t(LanguageKey.Product_Productweights)}
                          <Tooltip
                            tooltipValue={t(LanguageKey.Product_Productweightsexplian)}
                            position="top"
                            onClick={true}>
                            <img
                              style={{
                                marginInline: "5px",
                                cursor: "pointer",
                                width: "15px",
                                height: "15px",
                              }}
                              title="ℹ️ tooltip"
                              src="/tooltip.svg"
                            />
                          </Tooltip>
                        </div>
                        {
                          <div className={styles.inputandsub}>
                            <div className={styles.subinput}>{t(LanguageKey.Storeproduct_gram)}</div>
                            <InputText
                              name=""
                              className={
                                settingInfo.weight && settingInfo.weight < setting.maxSize?.maxEnvelopeWeight!
                                  ? "textinputbox"
                                  : "danger"
                              }
                              placeHolder="Net Weight "
                              handleInputChange={handleNetWeightChange}
                              value={settingInfo.weight!.toString()}
                              numberType={true}
                            />
                          </div>
                        }
                      </div>
                      <div className="headerandinput">
                        <div className="headertext">
                          {t(LanguageKey.Storeorder_pocketenveloptitle)}
                          <Tooltip
                            tooltipValue={t(LanguageKey.Storeorder_pocketenveloptitleExplain)}
                            position="top"
                            onClick={true}>
                            <img
                              style={{
                                marginInline: "5px",
                                cursor: "pointer",
                                width: "15px",
                                height: "15px",
                              }}
                              title="ℹ️ tooltip"
                              src="/tooltip.svg"
                            />
                          </Tooltip>
                        </div>
                        {
                          <div className={styles.inputandsub}>
                            <div className={styles.subinput}>{t(LanguageKey.Storeorder_quantityorder)}</div>
                            <InputText
                              name=""
                              className={
                                settingInfo.envelopeAvailableCount && settingInfo.envelopeAvailableCount > 0
                                  ? "textinputbox"
                                  : "danger"
                              }
                              placeHolder="Net Weight "
                              handleInputChange={handleEnvelopCountChange}
                              value={
                                settingInfo.envelopeAvailableCount ? settingInfo.envelopeAvailableCount.toString() : "0"
                              }
                              numberType={true}
                            />
                          </div>
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
          </>
        )}
      </div>
      {/* ___size box popup ___*/}
      {isPopupOpen && (
        <>
          <div className="dialogBg" onClick={togglePopup} style={{ borderRadius: "var(--br25)" }}></div>

          <div className={styles.popupContent}>
            <div className={styles.boxicon}>
              <div className={styles.sizevalue}>Size {hoverData.size}</div>
              <div className={styles.widthvalue}>{hoverData.width}</div>
              <div className={styles.lengthvalue}>{hoverData.length}</div>
              <div className={styles.heightvalue}>{hoverData.height}</div>
              <div className={styles.weightvalue}>{hoverData.weight} Gr</div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 251 200">
                <path
                  fill="var(--color-dark-blue)"
                  d="m239.6 102.6-2.2 1.5v2.3l6.4-4.8v-2.3l-2.5 2 .4-85.4 2-1.4v-2.3l-6.4 4.8v2.2l2.7-2zM96.4 195.4 7.3 163.5l3.6-2.6-2-.9-8.3 6.2 2 .7 2.9-2 89.1 31.7-3.6 2.8 2 .6 8.3-6-2-.8zM240 128.6l3.9 1.4-89 57.6-3.4-1.2-1.5 1.3 10.1 3.8 1.8-1.2-5-1.9 89-57.6 3.2 1.2 1.6-1.4-9.1-3.5z"
                />
                <path
                  fill="var(--text-h1)"
                  d="M123.3 0 32 59v87.3l91.8 32.5 91.7-59.2.1-87.3zM75.8 107l-9.7 5.6V72.8l21.3 7.6v39.4zm-9-35.6 90-58 20.7 7.2-90 58.1zm56.7-69.6 31.3 10.9-89.8 58-31.1-11zm-1.2 174.8-88.8-31.5V61.3l31 11v41.1l.7 1.5 10.3-5.9L88 122.7l1-1.1V80.8l33.4 11.8zm.8-85.3-33.7-12 90-58L213.2 33zm91 27.4L123.7 177V92.7L214 34.4z"
                />
              </svg>
            </div>
            <table className={styles.boxtable}>
              <thead>
                <tr className={styles.boxsizeheader}>
                  <th>{t(LanguageKey.Product_shippingSize)}</th>
                  <th>
                    {t(LanguageKey.width)}
                    <div className="explain">(cm)</div>
                  </th>
                  <th>
                    {t(LanguageKey.length)}
                    <div className="explain">(cm)</div>
                  </th>
                  <th>
                    {t(LanguageKey.height)}
                    <div className="explain">(cm)</div>
                  </th>
                  <th>
                    {t(LanguageKey.Weight)}
                    <div className="explain">({t(LanguageKey.Storeproduct_gram)})</div>
                  </th>
                </tr>
              </thead>
              <tbody className={styles.boxsizebody}>
                {[
                  {
                    size: "1",
                    width: "15",
                    length: "10",
                    height: "10",
                    weight: "46",
                  },
                  {
                    size: "2",
                    width: "20",
                    length: "15",
                    height: "10",
                    weight: "80",
                  },
                  {
                    size: "3",
                    width: "20",
                    length: "20",
                    height: "15",
                    weight: "132",
                  },
                  {
                    size: "4",
                    width: "40",
                    length: "25",
                    height: "20",
                    weight: "175",
                  },
                  {
                    size: "5",
                    width: "35",
                    length: "25",
                    height: "20",
                    weight: "502",
                  },
                  {
                    size: "6",
                    width: "45",
                    length: "25",
                    height: "20",
                    weight: "612",
                  },
                  {
                    size: "7",
                    width: "40",
                    length: "30",
                    height: "55",
                    weight: "519",
                  },
                  {
                    size: "8",
                    width: "45",
                    length: "40",
                    height: "30",
                    weight: "926",
                  },
                  {
                    size: "9",
                    width: "55",
                    length: "45",
                    height: "35",
                    weight: "1239",
                  },
                ].map((box, index) => (
                  <tr
                    key={index}
                    onMouseEnter={() => handleMouseEnter(box.size, box.width, box.length, box.height, box.weight)}
                    onMouseLeave={handleMouseLeave}>
                    <td>{box.size}</td>
                    <td>{box.width}</td>
                    <td>{box.length}</td>
                    <td>{box.height}</td>
                    <td>{box.weight}</td>
                  </tr>
                ))}
                <tr>
                  <td>+10</td>
                  <td style={{ width: "80%" }}>{t(LanguageKey.Storeproduct_OutOfStandardSize)}</td>
                </tr>
              </tbody>
            </table>
            <div className="cancelButton" onClick={togglePopup}>
              {t(LanguageKey.close)}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Setting;
