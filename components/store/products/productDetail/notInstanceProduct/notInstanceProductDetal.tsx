import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RingLoader from "saeed/components/design/loader/ringLoder";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { IResult, MethodType } from "saeed/helper/api";
import { IDetailsPost } from "saeed/models/page/post/posts";
import { MediaType } from "saeed/models/page/post/preposts";
import {
  AvailabilityStatus,
  GauranteeLength,
  GauranteeStatus,
  OrginalityStatus,
  ParcelPocketDeliveryType,
  Steps,
} from "saeed/models/store/enum";
import {
  ICreateInstance_ForSpecification,
  ICreateInstance_ForVariation,
  ICustomSpecificationItem,
  IGeneralInfo,
  IMaxSize,
  IProduct_CreateInstance,
  IProduct_CreateSubProduct,
  IProduct_Information,
  IProduct_Media,
  IProduct_Setting,
  IProduct_ShortProduct,
  IProduct_UpdateChildrenMedia,
  IProduct_Variation,
  ISpecificationItem,
  ISubProduct_Create,
  ISuggestedPrice,
  IUploadMedia,
  IVariation_Create,
} from "saeed/models/store/IProduct";
import General from "./general";
import Information from "./information";
import Media from "./media";
import styles from "./notinstanceproduct.module.css";
import Setting from "./setting";
import Specifications from "./specifications";
import Variation from "./Variation";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

export default function NotInstanceProductDetail({
  maxSize,
  productId,
  shortProduct,
  postInfo,
}: {
  maxSize: IMaxSize | null;
  productId: number;
  shortProduct: IProduct_ShortProduct;
  postInfo: IDetailsPost;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rightLoading, setrightLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [createInstance, setCreateInstance] = useState<IProduct_CreateInstance>({
    availabilityStatus: AvailabilityStatus.Available,
    brandId: null,
    categoryId: 0,
    isLiquid: false,
    customTitleVariation: "",
    evat: 0,
    gauranteeStatus: GauranteeStatus.No,
    isColorVariation: false,
    maxInEachCard: 0,
    orginalityStatus: OrginalityStatus.Fake,
    productId: 0,
    readyForShipDayLong: 0,
    specificationItems: [],
    subCategoryId: 0,
    title: "",
    variationTitles: [],
    descriptions: null,
    breakable: true,
    gauranteeLength: GauranteeLength.OneYear,
    deliveryInfo: {
      deliveryType: ParcelPocketDeliveryType.None,
      productEnvelope: { envelopeAvailableCount: 0 },
      weight: 60,
      productBox: {
        height: 10,
        length: 15,
        width: 10,
        isSack: false,
      },
    },
  });
  const [createInstanceForVariation, setCreateInstanceForVariation] = useState<ICreateInstance_ForVariation>({
    customTitleVariation: null,
    isColorVariation: null,
    variationTitles: [],
  });
  const [createInstanceVariationForSpec, setCreateInstanceVariationForSpec] =
    useState<ICreateInstance_ForSpecification>({
      isColorVariation: null,
      specificationItems: [],
      variationTitles: [],
    });
  const [generalInfo, setGeneralInfo] = useState<IGeneralInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.General);
  const [toggleNextButton, setToggleNextButton] = useState<{
    general: boolean;
    information: { toggle: boolean; isNext: boolean };
    properties: { toggle: boolean; isNext: boolean };
    specification: { toggle: boolean; isNext: boolean };
    media: { toggle: boolean; isNext: boolean };
    setting: { toggle: boolean; isNext: boolean };
  }>({
    general: false,
    information: { toggle: false, isNext: true },
    properties: { toggle: false, isNext: true },
    specification: { toggle: false, isNext: true },
    media: { toggle: false, isNext: true },
    setting: { toggle: false, isNext: true },
  });
  const [subProducts, setSubProducts] = useState<ISubProduct_Create[]>([]);
  const [information, setInformation] = useState<IProduct_Information>({
    caption: postInfo.caption,
    description: "",
  });
  const [variation, setVariation] = useState<IProduct_Variation>({
    colorCategories: [],
    variations: [],
  });
  const [productMedia, setProductMedia] = useState<IProduct_Media[]>([]);
  const [customMedia, setCustomMedia] = useState<IUploadMedia[]>([]);
  const [suggestedMedia, setSuggestedMedia] = useState<{ key: string; index: number }[]>([]);
  const [suggestedMediaList, setSuggestedMediaList] = useState<{
    medias: { url: string; key: string }[];
  }>({ medias: [] });
  const [defaultMedia, setDefaultMedia] = useState<IProduct_UpdateChildrenMedia>({ items: [] });
  const [setting, setSetting] = useState<IProduct_Setting>({
    availabilityStatus: AvailabilityStatus.Available,
    gauranteeStatus: GauranteeStatus.NotSet,
    guaranteeLenght: GauranteeLength.NotSet,
    maxInEachCard: 100,
    productBox: {
      height: 10,
      length: 15,
      isSack: false,
      width: 10,
    },
    readyForShipDayLong: 1,
    weight: 60,
    orginalityStatus: OrginalityStatus.Original,
    breakable: false,
    deliveryType: 0,
    envelopeAvailableCount: 0,
    isLiquid: false,
    maxSize: maxSize,
  });
  // لیست تصاویر کوچک
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isUpdateing, setIsUpdateing] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<ISuggestedPrice[]>([]);
  function handleThumbnailClick(index: SetStateAction<number>) {
    setSelectedIndex(index);
  }
  function handleNextClickpostpreview() {
    setSelectedIndex((prevIndex) => (prevIndex < thumbnails.length - 1 ? prevIndex + 1 : 0));
  }
  function handlePrevClickpostpreview() {
    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : thumbnails.length - 1));
  }
  function compareVariations(a: IVariation_Create[], b: IVariation_Create[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((variationA, index) => {
      const variationB = b[index];
      return (
        variationA.variationTitleId === variationB.variationTitleId && variationA.variationId === variationB.variationId
      );
    });
  }
  function findGroupedIndices(arr: ISubProduct_Create[]): number[][] {
    const groupedIndices: number[][] = [];
    const visited: boolean[] = new Array(arr.length).fill(false); // To track visited objects

    for (let i = 0; i < arr.length; i++) {
      if (visited[i]) continue; // Skip if already part of a group

      const currentGroup: number[] = [i]; // Start a new group with the current index
      visited[i] = true;

      for (let j = i + 1; j < arr.length; j++) {
        if (
          arr[i].customVariation === arr[j].customVariation &&
          arr[i].colorVariation === arr[j].colorVariation &&
          compareVariations(arr[i].variations, arr[j].variations)
        ) {
          currentGroup.push(j); // Add matching index to the current group
          visited[j] = true; // Mark as visited
        }
      }

      if (currentGroup.length > 1) {
        groupedIndices.push(currentGroup); // Only add if more than one object matches
      }
    }

    return groupedIndices;
  }
  async function handleSaveProductSuggestion(key: string | null) {
    console.log("keyyyyyyyyyy", key);
    var res = await clientFetchApi<boolean, boolean>("/api/product/SaveProductSuggestion", { methodType: MethodType.get, session: session, data: null, queries: [
        { key: "productId", value: productId.toString() },
        {
          key: "key",
          value: key ? key : undefined,
        },
      ], onUploadProgress: undefined });
    if (res.succeeded) {
      try {
        var res2 = await clientFetchApi<boolean, { medias: { url: string; key: string }[] }>("/api/product/GetMediaSuggestion", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "productId", value: productId.toString() }], onUploadProgress: undefined });
        if (res2.succeeded) {
          if (res2.value.medias.length === 0) return;
          setSuggestedMediaList(res2.value);
        } else if (res2.info.responseType === ResponseType.NotSavedSuggestions) {
          return;
        } else notify(res2.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    }
  }
  function upadteCteateFromgeneral(general: IGeneralInfo) {
    console.log("generalllll", general);
    handleSaveProductSuggestion(general.suggestionKey);
    setGeneralInfo(general);
    setCreateInstanceForVariation({
      customTitleVariation: null,
      isColorVariation: null,
      variationTitles: [],
    });
    setSubProducts([]);
    setCreateInstanceVariationForSpec({
      isColorVariation: null,
      specificationItems: [],
      variationTitles: [],
    });
    setCreateInstance((prev) => ({
      ...prev,
      brandId: general.createInstance.brandId ? general.createInstance.brandId : null,
      categoryId: general.createInstance.categoryId,
      subCategoryId: general.createInstance.subcategoryId ? general.createInstance.subcategoryId : null,
      productId: general.createInstance.productId,
      title: general.createInstance.title,
    }));
    setCurrentStep(Steps.Information);
  }
  function upadteCteateFromInformation(info: IProduct_Information, isNext: boolean) {
    console.log("upadteCteateFromInformation", info.description);
    setInformation(info);
    setCreateInstance((prev) => ({
      ...prev,
      descriptions: info.description.length === 0 ? null : info.description,
    }));
    if (isNext) setCurrentStep(Steps.Properties);
    else setCurrentStep(Steps.General);
  }
  function upadteCteateFromVariation(
    createInstanceForVariation: ICreateInstance_ForVariation,
    variation: IProduct_Variation,
    subProducts: ISubProduct_Create[],
    isNext: boolean
  ) {
    console.log("variation", variation);
    console.log("subProducts", subProducts);
    if (createInstanceForVariation.variationTitles.length > 0) {
      for (let subProduct of subProducts) {
        if (subProduct.variations.find((x) => x.variationId === 0)) {
          internalNotify(InternalResponseType.FillRedBorderFields, NotifType.Warning);
          return;
        }
      }
    }
    if (createInstanceForVariation.isColorVariation && subProducts.find((x) => !x.colorVariation)) {
      internalNotify(InternalResponseType.FillRedBorderFields, NotifType.Warning);
      return;
    }

    if (createInstanceForVariation.customTitleVariation) {
      for (let subProduct of subProducts) {
        if (!subProduct.customVariation) {
          internalNotify(InternalResponseType.FillRedBorderFields, NotifType.Warning);
          return;
        }
      }
    }
    if (findGroupedIndices(subProducts).length > 0) {
      internalNotify(InternalResponseType.RepeatedVariation, NotifType.Warning);
      return;
    }
    if (subProducts.find((x) => x.price === 0)) {
      internalNotify(InternalResponseType.FillRedBorderFields, NotifType.Warning);
      return;
    }

    if (isNext) setCurrentStep(Steps.Specification);
    else setCurrentStep(Steps.Information);
    setCreateInstance((prev) => ({
      ...prev,
      isColorVariation: createInstanceForVariation.isColorVariation ? true : false,
      variationTitles: createInstanceForVariation.variationTitles,
      customTitleVariation: createInstanceForVariation.customTitleVariation,
    }));
    setCreateInstanceForVariation(createInstanceForVariation);
    setCreateInstanceVariationForSpec((prev) => ({
      ...prev,
      isColorVariation: createInstanceForVariation.isColorVariation,
      variationTitles: createInstanceForVariation.variationTitles,
    }));
    setSubProducts(subProducts);
    setVariation(variation);
  }
  function upadteCteateFromSpecifications(
    isNext: boolean,
    specificationItems: {
      customSpecification: ICustomSpecificationItem | null;
      defaultSpecification: ISpecificationItem | null;
    }[]
  ) {
    console.log("specificationItems", specificationItems);
    for (let spec of specificationItems) {
      if (spec.customSpecification) {
        if (spec.customSpecification.value.length === 0 || spec.customSpecification.key.length === 0) {
          internalNotify(InternalResponseType.FillRedBorderFields, NotifType.Warning);
          return;
        }
      } else if (spec.defaultSpecification) {
        if (spec.defaultSpecification.value === 0 || spec.defaultSpecification.variationTitle === 0) {
          internalNotify(InternalResponseType.FillRedBorderFields, NotifType.Warning);
          return;
        }
      }
    }
    setCreateInstance((prev) => ({
      ...prev,
      specificationItems: specificationItems,
    }));
    setCreateInstanceVariationForSpec((prev) => ({
      ...prev,
      specificationItems: specificationItems,
    }));
    if (isNext) setCurrentStep(Steps.Media);
    else setCurrentStep(Steps.Properties);
  }
  function upadteCteateFromMeida(isNext: boolean, media: IProduct_Media[]) {
    console.log("inserMedia", media);
    setProductMedia(media);
    setSuggestedMedia(
      media
        .filter((x) => !x.isDefault && x.key)
        .map((x) => ({
          index: x.index,
          key: x.key!,
        }))
    );
    setCustomMedia(
      media
        .filter((x) => !x.isDefault && !x.key)
        .map((x) => ({
          base64Url: x.base64Url,
          index: x.index,
          mediaType: x.mediaType,
          thumbnailMediaUrl: x.thumbnailMediaUrl,
        }))
    );
    setDefaultMedia({
      items: media
        .filter((x) => x.isDefault)
        .map((x) => ({
          childrenId: x.childrenId!,
          index: x.index,
          isHidden: x.isHidden,
        })),
    });
    if (isNext) setCurrentStep(Steps.Setting);
    else setCurrentStep(Steps.Specification);
  }
  function upadteCreateFromSetting(isNext: boolean, setting: IProduct_Setting) {
    const errors = [
      setting.deliveryType !== ParcelPocketDeliveryType.None && setting.weight! <= 0,
      setting.productBox &&
        setting.deliveryType === ParcelPocketDeliveryType.PostBox &&
        (setting.productBox.length <= 0 ||
          setting.productBox.width <= 0 ||
          setting.productBox.height <= 0 ||
          setting.productBox.length > setting.maxSize?.limitBox.length! ||
          setting.productBox.width > setting.maxSize?.limitBox.width! ||
          setting.productBox.height > setting.maxSize?.limitBox.height! ||
          setting.weight! > setting.maxSize?.limitBox.weight!),
      setting.deliveryType === ParcelPocketDeliveryType.PostEnvelope &&
        setting.envelopeAvailableCount &&
        (setting.envelopeAvailableCount <= 0 || setting.weight! > setting.maxSize?.maxEnvelopeWeight!),
    ];
    if (errors[0] || errors[1] || errors[2]) return;
    console.log("setting", setting);
    setSetting(setting);
    const newCreate = createInstance;
    newCreate.availabilityStatus = setting.availabilityStatus;
    newCreate.breakable = setting.breakable;
    newCreate.isLiquid = setting.isLiquid;
    newCreate.gauranteeLength = setting.guaranteeLenght;
    newCreate.gauranteeStatus = setting.gauranteeStatus;
    newCreate.maxInEachCard = setting.maxInEachCard;
    newCreate.orginalityStatus = setting.orginalityStatus;
    newCreate.readyForShipDayLong = setting.readyForShipDayLong;
    newCreate.deliveryInfo = {
      productBox:
        setting.productBox && setting.deliveryType === ParcelPocketDeliveryType.PostBox
          ? {
              height: setting.productBox.height,
              length: setting.productBox.length,
              width: setting.productBox.width,
              isSack: setting.productBox.isSack,
            }
          : null,
      weight: setting.deliveryType !== ParcelPocketDeliveryType.None ? setting.weight : null,
      deliveryType: setting.deliveryType,
      productEnvelope:
        setting.deliveryType === ParcelPocketDeliveryType.PostEnvelope && setting.envelopeAvailableCount
          ? {
              envelopeAvailableCount: setting.envelopeAvailableCount,
            }
          : null,
    };
    if (isNext) {
      createInstanceProduct(newCreate);
    } else setCurrentStep(Steps.Media);
  }
  async function handleUploadMedia() {
    if (customMedia.length > 0) {
      const mediaUploadPromises = customMedia.map(async (media) =>
        clientFetchApi<IUploadMedia, boolean>("shopper" + "" + "/Product/InsertProductMedia", { methodType: MethodType.post, session: session, data: media, queries: [
            {
              key: "productId",
              value: productId.toString(),
            },
          ], onUploadProgress: undefined })
      );
      return await Promise.all(mediaUploadPromises);
    }
    return [];
  }
  async function handleUploadSuggestedMedia() {
    if (customMedia.length > 0) {
      const mediaUploadPromises = suggestedMedia.map(async (media) =>
        clientFetchApi<boolean, boolean>("shopper" + "" + "/Product/InsertProductMedia", { methodType: MethodType.get, session: session, data: null, queries: [
            {
              key: "productId",
              value: productId.toString(),
            },
            { key: "key", value: media.key },
            { key: "index", value: media.index.toString() },
          ], onUploadProgress: undefined })
      );
      return await Promise.all(mediaUploadPromises);
    }
    return [];
  }
  async function handleUpdateChildrenMedia() {
    let result: IResult<boolean> = {
      errorMessage: "",
      info: {
        actionBlockEnd: null,
        exception: null,
        message: "",
        needsChallenge: false,
        responseType: ResponseType.Ok,
      },
      statusCode: 0,
      succeeded: true,
      value: true,
    };
    if (defaultMedia.items.length > 0) {
      result = await clientFetchApi<IProduct_UpdateChildrenMedia, boolean>("shopper" + "" + "/Product/UpdateChildrenMediaStatus", { methodType: MethodType.post, session: session, data: defaultMedia, queries: [
          {
            key: "productId",
            value: productId.toString(),
          },
        ], onUploadProgress: undefined });
    }
    return result;
  }
  async function handleCreateSubProduct() {
    let result: IResult<boolean> = {
      errorMessage: "",
      info: {
        actionBlockEnd: null,
        exception: null,
        message: "",
        needsChallenge: false,
        responseType: ResponseType.Ok,
      },
      statusCode: 0,
      succeeded: true,
      value: true,
    };
    const newSubProducts: ISubProduct_Create[] = subProducts.map((x) => ({
      colorVariation: x.colorVariation,
      customVariation: x.customVariation,
      disCount:
        x.disCount !== null
          ? {
              maxCount: x.disCount.maxCount,
              maxTime: x.disCount.maxTime ? Math.floor(x.disCount.maxTime / 1000) : null,
              value: x.disCount.value,
            }
          : null,
      price: x.price,
      stock: x.stock,
      variations: x.variations.map((y) => ({
        variationTitleId: y.variationTitleId,
        variationId: y.variationId,
      })),
    }));
    console.log("newSubProduct", newSubProducts);
    result = await clientFetchApi<IProduct_CreateSubProduct, boolean>("shopper" + "" + "/Product/CreateSubProducts", { methodType: MethodType.post, session: session, data: {
        productId: productId,
        subProducts: newSubProducts,
        deActiveSubProducts: [],
      }, queries: undefined, onUploadProgress: undefined });
    console.log("fffffffffffffffffffff", result);
    return result;
  }
  async function createSubProductAndMedia() {
    try {
      const [subProductRes, insertMediaRes, insertSuggestedMedia, updateMeidaOrderRes] = await Promise.all([
        handleCreateSubProduct(),
        handleUploadMedia(),
        handleUploadSuggestedMedia(),
        handleUpdateChildrenMedia(),
      ]);

      if (!subProductRes.succeeded) notify(subProductRes.info.responseType, NotifType.Warning);
      if (!updateMeidaOrderRes.succeeded) notify(updateMeidaOrderRes.info.responseType, NotifType.Warning);
      for (let res of insertMediaRes) {
        if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      }
      for (let res of insertSuggestedMedia) {
        if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      }
      router.push("/store/products");
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function createInstanceProduct(createInstance: IProduct_CreateInstance) {
    console.log("create instance", createInstance);
    console.log("customMedia", customMedia);
    console.log("defaultMedia", defaultMedia);
    console.log("suggestedMedia", suggestedMedia);
    if (isUpdateing) return;
    setIsUpdateing(true);
    try {
      const res = await clientFetchApi<IProduct_CreateInstance, boolean>("shopper" + "" + "/Product/CreateProductInstance", { methodType: MethodType.post, session: session, data: createInstance, queries: [
          {
            key: "shouldOverride",
            value: "true",
          },
        ], onUploadProgress: undefined });
      console.log("CreateProductInstance", res);
      if (res.succeeded) {
        createSubProductAndMedia();
      } else {
        setIsUpdateing(false);
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsUpdateing(false);
    }
  }
  function handleNextStep() {
    if (currentStep === Steps.General) {
      setToggleNextButton((prev) => ({ ...prev, general: !prev.general }));
    } else if (currentStep === Steps.Information) {
      setToggleNextButton((prev) => ({
        ...prev,
        information: { isNext: true, toggle: !prev.information.toggle },
      }));
    } else if (currentStep === Steps.Specification) {
      setToggleNextButton((prev) => ({
        ...prev,
        specification: { isNext: true, toggle: !prev.specification.toggle },
      }));
    } else if (currentStep === Steps.Properties) {
      setToggleNextButton((prev) => ({
        ...prev,
        properties: { isNext: true, toggle: !prev.properties.toggle },
      }));
    } else if (currentStep === Steps.Media) {
      setToggleNextButton((prev) => ({
        ...prev,
        media: { isNext: true, toggle: !prev.media.toggle },
      }));
    } else if (currentStep === Steps.Setting) {
      setToggleNextButton((prev) => ({
        ...prev,
        setting: { isNext: true, toggle: !prev.setting.toggle },
      }));
    }
  }
  function handleBackStep() {
    if (currentStep === Steps.Information) {
      setToggleNextButton((prev) => ({
        ...prev,
        information: { isNext: false, toggle: !prev.information.toggle },
      }));
    } else if (currentStep === Steps.Properties) {
      setToggleNextButton((prev) => ({
        ...prev,
        properties: { isNext: false, toggle: !prev.properties.toggle },
      }));
    } else if (currentStep === Steps.Specification) {
      setToggleNextButton((prev) => ({
        ...prev,
        specification: { isNext: false, toggle: !prev.specification.toggle },
      }));
    } else if (currentStep === Steps.Media) {
      setToggleNextButton((prev) => ({
        ...prev,
        media: { isNext: false, toggle: !prev.media.toggle },
      }));
    } else if (currentStep === Steps.Setting) {
      setToggleNextButton((prev) => ({
        ...prev,
        setting: { isNext: false, toggle: !prev.setting.toggle },
      }));
    }
  }
  function handleInsertMedia() {
    const medias: IProduct_Media[] = [];
    const videoMedias = postInfo.children.filter((x) => x.mediaType === MediaType.Video);
    for (let child of postInfo.children.filter((x) => postInfo.children.indexOf(x) !== 0)) {
      medias.push({
        childrenId: child.childrenId,
        index: postInfo.children.indexOf(child),
        isHidden: child.mediaType === MediaType.Video && videoMedias.indexOf(child) >= 2,
        mediaType: child.mediaType,
        thumbnailMediaUrl: child.thumbnailMediaUrl,
        base64Url: "",
        isDefault: true,
        key: null,
      });
    }
    setProductMedia(medias);
  }
  async function getSuggestedPrice() {
    try {
      const res = await clientFetchApi<boolean, ISuggestedPrice[]>("shopper" + "" + "/Product/GetSuggestedPrice", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "productId", value: productId.toString() }], onUploadProgress: undefined });
      console.log("GetSuggestedPrice", res);
      if (res.succeeded && res.value.length > 0) {
        setSuggestedPrice(res.value);
      } else if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setrightLoading(false);
    }
  }
  useEffect(() => {
    if (!session) return;
    setThumbnails([postInfo.thumbnailMediaUrl]);
    handleInsertMedia();
    getSuggestedPrice();
    setLoading(false);
  }, [session]);
  return (
    <>
      {rightLoading && <Loading />}
      {!rightLoading && (
        <div className={styles.stepleft}>
          <div className={styles.header}>
            <div className={styles.stepprogressmobile}>
              {[0, 1, 2, 3, 4, 5, 6].map((step, number) => (
                <div
                  key={number}
                  className={
                    currentStep === step
                      ? styles[`step${step}Active`]
                      : currentStep > step
                      ? styles[`step${step}Done`]
                      : styles[`step${step}`]
                  }>
                  <div className={styles.mobilecircle}> </div>
                  <div className={styles.stepprogressmobileinfo}>
                    <div className={styles.stepcounter}>
                      <div
                        className={
                          currentStep > step
                            ? styles[`status${step}Done`]
                            : currentStep === step
                            ? styles[`status${step}Active`]
                            : styles.status
                        }>
                        {currentStep > step ? "✔" : step}
                      </div>
                      <div> / 6</div>
                    </div>
                    {step === Steps.General && t(LanguageKey.product_General)}
                    {step === Steps.Specification && t(LanguageKey.product_Specifications)}
                    {step === Steps.Information && t(LanguageKey.product_Information)}
                    {step === Steps.Media && t(LanguageKey.product_Media)}
                    {step === Steps.Properties && t(LanguageKey.product_Properties)}
                    {step === Steps.Setting && t(LanguageKey.product_Setting)}
                  </div>
                </div>
              ))}
            </div>
            <div
              className={styles.stepprogress}
              // style={{
              //   display: currentStep === 0 || currentStep === 8 ? "none" : "",
              // }}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((step, number) => (
                <div
                  key={number}
                  className={
                    currentStep === step
                      ? styles[`step${step}Active`]
                      : currentStep > step
                      ? styles[`step${step}Done`]
                      : styles[`step${step}`]
                  }>
                  <div
                    className={
                      currentStep > step
                        ? styles[`status${step}Done`]
                        : currentStep === step
                        ? styles[`status${step}Active`]
                        : styles.status
                    }>
                    {currentStep > step ? "✔" : step}
                  </div>
                  {step === Steps.General && t(LanguageKey.product_General)}
                  {step === Steps.Specification && t(LanguageKey.product_Specifications)}
                  {step === Steps.Information && t(LanguageKey.product_Information)}
                  {step === Steps.Media && t(LanguageKey.product_Media)}
                  {step === Steps.Properties && t(LanguageKey.product_Properties)}
                  {step === Steps.Setting && t(LanguageKey.product_Setting)}
                </div>
              ))}
            </div>

            <div className={styles.titleCard}>
              <div
                onClick={handleBackStep}
                className={`cancelButton ${currentStep === Steps.General ? "disableCancelButton" : ""}`}
                style={{ minWidth: "46px", maxHeight: "46px" }}>
                <img
                  className={styles.backicon}
                  title="Go back"
                  src="/back-blue.svg"
                  alt="Back button"
                  role="button"
                  aria-label="Go back to previous step"
                />
              </div>

              <div
                style={{ minWidth: "90px", maxHeight: "46px" }}
                onClick={handleNextStep}
                className="saveButton"
                title="Next Step"
                role="button"
                aria-label="Go to next step">
                {Steps.Setting === currentStep ? (
                  isUpdateing ? (
                    <div className={styles.loader}>
                      <RingLoader />
                    </div>
                  ) : (
                    t(LanguageKey.save)
                  )
                ) : (
                  t(LanguageKey.next)
                )}
              </div>
            </div>
          </div>
          {currentStep === Steps.General && (
            <General
              productId={productId}
              suggestedPrice={suggestedPrice}
              info={generalInfo}
              toggleNext={toggleNextButton.general}
              upadteCteateFromgeneral={upadteCteateFromgeneral}
            />
          )}
          {currentStep === Steps.Setting && (
            <Setting
              setting={setting}
              toggleNext={toggleNextButton.setting}
              upadteCteateFromSetting={upadteCreateFromSetting}
            />
          )}
          {currentStep === Steps.Information && (
            <Information
              upadteCteateFromInformation={upadteCteateFromInformation}
              toggleNext={toggleNextButton.information}
              data={information}
            />
          )}
          {currentStep === Steps.Properties && (
            <Variation
              createInstanceInfo={createInstanceForVariation}
              categoryId={createInstance.categoryId}
              subProductsCreate={subProducts}
              upadteCteateFromVariation={upadteCteateFromVariation}
              toggleNext={toggleNextButton.properties}
              shortProduct={shortProduct}
            />
          )}
          {currentStep === Steps.Specification && (
            <Specifications
              categoryId={createInstance.categoryId}
              createInstanceInfo={createInstanceVariationForSpec}
              variation={variation}
              upadteCteateFromSpecifications={upadteCteateFromSpecifications}
              toggleNext={toggleNextButton.specification}
            />
          )}
          {currentStep === Steps.Media && (
            <Media
              coverUrl={postInfo.thumbnailMediaUrl}
              mediaSuggested={suggestedMediaList}
              productMedia={productMedia}
              upadteCteateFromMeida={upadteCteateFromMeida}
              toggleNext={toggleNextButton.media}
            />
          )}
        </div>
      )}
    </>
  );
}
