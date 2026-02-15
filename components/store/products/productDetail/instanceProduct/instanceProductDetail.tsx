import { useSession } from "next-auth/react";
import router from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RingLoader from "saeed/components/design/loader/ringLoder";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import { LanguageKey } from "saeed/i18n";
import { IResult, MethodType } from "saeed/helper/apihelper";
import { IDetailsPost } from "saeed/models/page/post/posts";
import { MediaType } from "saeed/models/page/post/preposts";
import { ParcelPocketDeliveryType, Steps } from "saeed/models/store/enum";
import {
  ICustomMedia,
  IDefaultMedia,
  IMaxSize,
  IMediaInstanceInfo,
  IProduct_CreateSubProduct,
  IProduct_FullProduct,
  IProduct_Information,
  IProduct_Media,
  IProduct_Setting,
  IProduct_SettingUpdate,
  IProduct_ShortProduct,
  IProduct_UpdateChildrenMedia,
  ISpecification,
  ISpecificationOrder,
  ISubProduct_Create,
  ISubProduct_CreateForInstance,
  ISuggestedMedia,
  ITitleVariationVariation,
  IUploadMedia,
} from "saeed/models/store/IProduct";
import GeneralInstance from "./generalInstance";
import InformationInstance from "./informationInstance";
import styles from "./instanceProductDetail.module.css";
import MediaInstance from "./mediaInstance";
import SettingInstance from "./settingInstance";
import SpecificationsInstance from "./specificationInstance";
import InstanceVariation from "./variationInstance";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
export default function InstanceProductDetail({
  fullProduct,
  maxSize,
  postInfo,
  shortProduct,
}: {
  fullProduct: IProduct_FullProduct;
  maxSize: IMaxSize;
  postInfo: IDetailsPost;
  shortProduct: IProduct_ShortProduct;
}) {
  const { data: session } = useSession();
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isUpdateing, setIsUpdateing] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
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
  const [information, setInformation] = useState<IProduct_Information>({
    caption: postInfo.caption,
    description: fullProduct.secondaryInfo.description ? fullProduct.secondaryInfo.description : "",
  });
  const [subProductInfo, setSubProductInfo] = useState<ISubProduct_CreateForInstance[]>(
    fullProduct.subProducts.map((x) => ({
      colorId: x.colorId !== null ? x.colorId : 0,
      colorVariation: x.colorVariation,
      createdTime: x.createdTime,
      customVariation: x.customVariation,
      disCount: x.disCount
        ? {
            maxCount: x.disCount.maxUseCount,
            maxTime: x.disCount.maxTime ? x.disCount.maxTime * 1000 : null,
            value: x.disCount.value,
          }
        : null,
      id: x.id!,
      isActive: x.isActive,
      price: x.price,
      priceType: x.priceType,
      productInId: x.productInId!,
      stock: x.stock,
      variations: x.variations.map((u) => ({
        categoryId: u.variation.language,
        language: u.variation.language,
        langValue: u.variation.langValue,
        variationId: u.variation.variationId,
        variationTitleId: u.variation.variationTitleId,
      })),
    }))
  );
  const [deActiveSubProducts, setDeActiveSubProducts] = useState<number[]>([]);
  const [specificationInfo, setSpecificationInfo] = useState(fullProduct.specifications);
  const [mediaInfo, setMediaInfo] = useState<IMediaInstanceInfo[]>(
    fullProduct.medias
      .filter((y) => y.childMedia?.orderId !== 0)
      .map((x) => ({
        childMedia: x.childMedia,
        customMedia: x.customMedia,
        index: x.index,
        isHidden: x.isHidden,
        mediaType: x.mediaType,
        uploadMedia: null,
        key: null,
      }))
  );
  const [suggestedMediaList, setSuggestedMediaList] = useState<ISuggestedMedia>({ medias: [] });
  const [setting, setSetting] = useState<IProduct_Setting>({
    availabilityStatus: fullProduct.shortProduct.availabilityStatus,
    gauranteeStatus: fullProduct.secondaryInfo.gaurantee,
    guaranteeLenght: fullProduct.secondaryInfo.garanteeLength,
    breakable: fullProduct.secondaryInfo.isBreakable,
    maxInEachCard: fullProduct.secondaryInfo.maxInEachCard,
    orginalityStatus: fullProduct.productInstance.orginalityStatus,
    productBox: fullProduct.secondaryInfo.deliveryInfo.boxSize,
    readyForShipDayLong: fullProduct.secondaryInfo.readyForShipDays,
    weight: fullProduct.secondaryInfo.weight,
    deliveryType: fullProduct.secondaryInfo.deliveryInfo.deliveryType,
    envelopeAvailableCount: fullProduct.secondaryInfo.deliveryInfo.envelopeAvailableCount,
    isLiquid: fullProduct.secondaryInfo.isLiquid,
    maxSize: maxSize,
  });
  function upadteCteateFromInformation(info: IProduct_Information, isNext: boolean) {
    setInformation(info);
    if (isNext) setCurrentStep(Steps.Properties);
    else setCurrentStep(Steps.General);
  }
  function upadteCteateFromgeneral() {
    setCurrentStep(Steps.Information);
  }
  function compareVariations(a: ITitleVariationVariation[], b: ITitleVariationVariation[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((variationA, index) => {
      const variationB = b[index];
      return (
        variationA.variationTitleId === variationB.variationTitleId && variationA.variationId === variationB.variationId
      );
    });
  }
  function findGroupedIndices(arr: ISubProduct_CreateForInstance[]): number[][] {
    const groupedIndices: number[][] = [];
    const visited: boolean[] = new Array(arr.length).fill(false); // To track visited objects

    for (let i = 0; i < arr.length; i++) {
      if (visited[i]) continue; // Skip if already part of a group

      const currentGroup: number[] = [i]; // Start a new group with the current index
      visited[i] = true;

      for (let j = i + 1; j < arr.length; j++) {
        if (
          arr[i].customVariation === arr[j].customVariation &&
          arr[i].colorId === arr[j].colorId &&
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
  function upadteCteateFromVariation(
    deActiveSubProducts: number[],
    subProducts: ISubProduct_CreateForInstance[],
    isNext: boolean
  ) {
    console.log("subProducts", subProducts);
    console.log("deActiveSubProducts", deActiveSubProducts);
    setSubProductInfo(subProducts);
    setDeActiveSubProducts(deActiveSubProducts);
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
  }
  function upadteCteateFromSpecifications(isNext: boolean, specificationInfo: ISpecification[]) {
    setSpecificationInfo(specificationInfo);
    if (isNext) setCurrentStep(Steps.Media);
    else setCurrentStep(Steps.Properties);
  }
  function upadteCteateFromMeida(isNext: boolean, media: IMediaInstanceInfo[]) {
    console.log("mediaaaaaaa", media);
    setMediaInfo(media);
    if (isNext) setCurrentStep(Steps.Setting);
    else setCurrentStep(Steps.Specification);
  }
  function upadteCteateFromSetting(isNext: boolean, setting: IProduct_Setting) {
    const errors = [
      setting.deliveryType !== ParcelPocketDeliveryType.None && setting.weight! <= 0,
      setting.deliveryType === ParcelPocketDeliveryType.PostBox &&
        setting.productBox &&
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
    setSetting(setting);
    if (isNext) handleUpdateProductInstance(setting);
    else setCurrentStep(Steps.Media);
  }
  async function handleUploadMedia(uploadMedias: IUploadMedia[]) {
    if (uploadMedias.length > 0) {
      const mediaUploadPromises = uploadMedias.map(async (media) =>
        clientFetchApi<IUploadMedia, boolean>("/api/product/InsertProductMedia", { methodType: MethodType.post, session: session, data: media, queries: [
          {
            key: "productId",
            value: fullProduct.productInstance.productId.toString(),
          },
        ], onUploadProgress: undefined })
      );
      return await Promise.all(mediaUploadPromises);
    }
    return [];
  }
  async function handleUpdateCustomMedia(customMedias: ICustomMedia[]) {
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
    if (customMedias.length > 0) {
      result = await clientFetchApi<{ items: ICustomMedia[] }, boolean>("/api/product/UpdateSelfMediaStatus", { methodType: MethodType.post, session: session, data: { items: customMedias }, queries: [
          {
            key: "productId",
            value: fullProduct.productInstance.productId.toString(),
          },
        ], onUploadProgress: undefined });
    }
    return result;
  }
  async function handleUpdateSpecification(specs: ISpecificationOrder) {
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
    if (specs.items.length > 0) {
      result = await clientFetchApi<ISpecificationOrder, boolean>("/api/product/UpdateSpecificationOrder", { methodType: MethodType.post, session: session, data: specs, queries: undefined, onUploadProgress: undefined });
    }
    return result;
  }
  async function handleUpdateChildrenMedia(defaultMedias: IDefaultMedia[]) {
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
    if (defaultMedias.length > 0) {
      result = await clientFetchApi<IProduct_UpdateChildrenMedia, boolean>("/api/product/UpdateChildrenMediaStatus", { methodType: MethodType.post, session: session, data: { items: defaultMedias }, queries: [
          {
            key: "productId",
            value: fullProduct.productInstance.productId.toString(),
          },
        ], onUploadProgress: undefined });
    }
    return result;
  }
  async function handleUpdateProductInstance(setting: IProduct_Setting) {
    if (isUpdateing) return;
    setIsUpdateing(true);
    const updatedSubProducts: ISubProduct_Create[] = subProductInfo.map((x) => ({
      colorVariation: x.colorId ? x.colorId : null,
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
    const updatedSetting: IProduct_SettingUpdate = {
      description: information.description,
      gauranteeLength: setting.guaranteeLenght,
      gauranteeStatus: setting.gauranteeStatus,
      isBreakable: setting.breakable,
      isLiquid: setting.isLiquid,
      maxInEachCard: setting.maxInEachCard,
      availabilityStatus: setting.availabilityStatus,
      deliveryInfo: {
        productBox: setting.productBox
          ? {
              height: setting.productBox.height,
              length: setting.productBox.length,
              width: setting.productBox.width,
              isSack: setting.productBox.isSack,
            }
          : null,
        weight: setting.weight ? setting.weight : null,
        deliveryType: setting.deliveryType,
        productEnvelope: setting.envelopeAvailableCount
          ? { envelopeAvailableCount: setting.envelopeAvailableCount }
          : null,
      },
      readyForShipDayLong: setting.readyForShipDayLong,
    };
    const specificationOrder: ISpecificationOrder = {
      productId: fullProduct.productInstance.productId,
      items: specificationInfo.map((x) => ({
        customSpecificationId: x.customSpecification !== null ? x.customSpecification.id : null,
        defaultSpecificationId: x.defaultSpecification !== null ? x.defaultSpecification.id : null,
        index: specificationInfo.indexOf(x),
      })),
    };
    const defaultMedias: IDefaultMedia[] = [];
    const customMedias: ICustomMedia[] = [];
    const uploadMedias: IUploadMedia[] = [];
    const suggestedMedia: { key: string; index: number }[] = [];
    for (let media of mediaInfo) {
      if (media.childMedia) {
        defaultMedias.push({
          childrenId: media.childMedia.childrenId,
          index: media.index,
          isHidden: media.isHidden,
        });
      }
    }
    for (let media of mediaInfo) {
      if (media.customMedia && media.customMedia.id !== 0) {
        customMedias.push({
          id: media.customMedia.id,
          index: media.index,
          isHidden: media.isHidden,
        });
      }
    }
    for (let media of mediaInfo) {
      if (media.uploadMedia) {
        uploadMedias.push({
          base64Url: media.uploadMedia.base64Url,
          index: media.index,
          mediaType: media.uploadMedia.mediaType,
          thumbnailMediaUrl: media.uploadMedia.thumbnailMediaUrl,
        });
      }
    }
    for (let media of mediaInfo) {
      if (media.customMedia && media.customMedia.key) {
        suggestedMedia.push({
          index: media.index,
          key: media.customMedia.key,
        });
      }
    }
    console.log("updatedSubProducts", updatedSubProducts);
    console.log("updatedSetting", updatedSetting);
    console.log("defaultMedia", defaultMedias);
    console.log("customMedia", customMedias);
    console.log("uploadMedia", uploadMedias);
    console.log("specificationOrder", specificationOrder);
    console.log("suggestedMedia", suggestedMedia);
    try {
      const [
        subProductRes,
        updateSettingRes,
        updateSepOrderRes,
        uploadMediaRes,
        updateChildrenMeidaRes,
        updateCustomMediaRes,
        suggestedMediaRes,
      ] = await Promise.all([
        // First API call
        clientFetchApi<IProduct_CreateSubProduct, boolean>("/api/product/CreateSubProducts", { methodType: MethodType.post, session: session, data: {
            productId: fullProduct.productInstance.productId,
            subProducts: updatedSubProducts,
            deActiveSubProducts: deActiveSubProducts,
          }, queries: undefined, onUploadProgress: undefined }),
        clientFetchApi<IProduct_SettingUpdate, boolean>("/api/product/UpdateSecondaryProductDetails", { methodType: MethodType.post, session: session, data: updatedSetting, queries: [
            {
              key: "productId",
              value: fullProduct.productInstance.productId.toString(),
            },
          ], onUploadProgress: undefined }),
        handleUpdateSpecification(specificationOrder),
        handleUploadMedia(uploadMedias),
        handleUpdateChildrenMedia(defaultMedias),
        handleUpdateCustomMedia(customMedias),
        handleUploadSuggestedMedia(suggestedMedia),
      ]);

      if (!subProductRes.succeeded) notify(subProductRes.info.responseType, NotifType.Warning);
      if (!updateChildrenMeidaRes.succeeded) notify(updateChildrenMeidaRes.info.responseType, NotifType.Warning);
      for (let res of uploadMediaRes) {
        if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      }
      if (!updateSettingRes.succeeded) notify(updateSettingRes.info.responseType, NotifType.Warning);
      if (!updateCustomMediaRes.succeeded) notify(updateCustomMediaRes.info.responseType, NotifType.Warning);
      if (!updateSepOrderRes.succeeded) notify(updateSepOrderRes.info.responseType, NotifType.Warning);
      // if (!suggestedMediaRes.succeeded)
      //   notify(suggestedMediaRes.info.responseType, NotifType.Warning);
      if (updateSettingRes.succeeded) router.push("/store/products");
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsUpdateing(false);
    }
  }
  async function handleUploadSuggestedMedia(suggestedMedia: { key: string; index: number }[]) {
    const mediaUploadPromises = suggestedMedia.map(async (media) =>
      clientFetchApi<boolean, boolean>("/api/product/InsertProductMedia", { methodType: MethodType.get, session: session, data: null, queries: [
        {
          key: "productId",
          value: shortProduct.productId.toString(),
        },
        { key: "key", value: media.key },
        { key: "index", value: media.index.toString() },
      ], onUploadProgress: undefined })
    );
    return mediaUploadPromises;
  }
  async function handleInsertMedia() {
    if (!session) return;
    const medias: IProduct_Media[] = [];
    for (let child of postInfo.children.filter((x) => postInfo.children.indexOf(x) !== 0)) {
      medias.push({
        childrenId: child.childrenId,
        index: postInfo.children.indexOf(child),
        isHidden: child.mediaType === MediaType.Video && postInfo.children.indexOf(child) >= 2,
        mediaType: child.mediaType,
        thumbnailMediaUrl: child.thumbnailMediaUrl,
        base64Url: "",
        isDefault: true,
        key: null,
      });
    }
    try {
      var res2 = await clientFetchApi<boolean, ISuggestedMedia>("/api/product/GetMediaSuggestion", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "productId", value: shortProduct.productId.toString() }], onUploadProgress: undefined });
      console.log("GetMediaSuggestion", res2);
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
  useEffect(() => {
    setThumbnails([postInfo.thumbnailMediaUrl]);
    handleInsertMedia();
    console.log("fullProduct", fullProduct);
    setLoading(false);
  }, []);
  return (
    <>
      {/* ___menu___*/}
      <div className={styles.stepleft}>
        <></>
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
              <img alt="back" src="/back-blue.svg" />
            </div>

            <div style={{ minWidth: "90px", maxHeight: "46px" }} onClick={handleNextStep} className="saveButton">
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
          <GeneralInstance
            productInstance={fullProduct.productInstance}
            toggleNext={toggleNextButton.general}
            upadteCteateFromgeneral={upadteCteateFromgeneral}
          />
        )}
        {currentStep === Steps.Information && (
          <InformationInstance
            info={information}
            toggleNext={toggleNextButton.information}
            upadteCteateFromInformation={upadteCteateFromInformation}
          />
        )}
        {currentStep === Steps.Properties && (
          <InstanceVariation
            titleVariation={fullProduct.titleVariations}
            subProductInfo={subProductInfo}
            productInstance={fullProduct.productInstance}
            upadteCteateFromVariation={upadteCteateFromVariation}
            toggleNext={toggleNextButton.properties}
            shortProduct={shortProduct}
          />
        )}
        {currentStep === Steps.Specification && (
          <SpecificationsInstance
            specificationInfo={specificationInfo}
            upadteCteateFromSpecifications={upadteCteateFromSpecifications}
            toggleNext={toggleNextButton.specification}
          />
        )}
        {currentStep === Steps.Media && (
          <MediaInstance
            coverUrl={postInfo.thumbnailMediaUrl}
            productMedia={mediaInfo}
            upadteCteateFromMeida={upadteCteateFromMeida}
            toggleNext={toggleNextButton.media}
            suggestedMedias={suggestedMediaList}
          />
        )}
        {currentStep === Steps.Setting && (
          <SettingInstance
            setting={setting}
            toggleNext={toggleNextButton.setting}
            upadteCteateFromSetting={upadteCteateFromSetting}
          />
        )}
      </div>
    </>
  );
}
