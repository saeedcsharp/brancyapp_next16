import RingLoader from "brancy/components/design/loader/ringLoder";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
} from "brancy/components/notifications/notificationBox";
import { MethodType, UploadFile } from "brancy/helper/api";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { InputType, PsgFeatureType } from "brancy/models/enums";
import {
  IGetImageUsageRequest,
  IMediaCreator,
  IMediaCreatorInput,
  IMediaCreatorModel,
  IPsgFeatureInfo,
} from "brancy/models/interfaces";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { ChangeEvent, CSSProperties, Dispatch, PointerEvent, SetStateAction, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./mediaCreator.module.css";
import { t } from "i18next";
import TextArea from "brancy/components/design/textArea/textArea";
type InputValue = string | number | boolean | string[];
type MediaTab = "image" | "video" | "createimage" | "createvideo";
interface UploadedMediaPreview {
  fileName: string;
  showUrl: string;
}
interface TokenBalance {
  total: number;
  remaining: number;
}
interface MediaCreatorProps {
  creators: IMediaCreator[];
  error?: string;
  onRetry?: () => void;
  onCreateMedia?: (request: IGetImageUsageRequest, count: number) => void;
  createMediaLoading?: boolean;
  setActiveTab: Dispatch<SetStateAction<MediaTab>>;
  activeTab: MediaTab;
}
export interface MediaCreatorSelection {
  creatorKey: string;
  modelName: string;
  prompt: string;
  values: Record<string, InputValue>;
}
const titleByLanguage: Record<string, keyof IMediaCreatorInput> = {
  en: "titleEn",
  fa: "titleFa",
  tr: "titleTr",
  ar: "titleAr",
  fr: "titleFr",
  de: "titleDe",
  az: "titleAz",
};
function getInputTitle(input: IMediaCreatorInput, language: string): string {
  const languageKey = titleByLanguage[language.split("-")[0]] ?? "titleEn";
  const localizedTitle = input[languageKey];
  return typeof localizedTitle === "string" && localizedTitle.trim() ? localizedTitle : input.titleEn || input.key;
}
function getInitialValues(model: IMediaCreatorModel | undefined): Record<string, InputValue> {
  if (!model) return {};
  return model.inputModelTypes.reduce<Record<string, InputValue>>((values, input) => {
    const inputType = Number(input.inputType);
    if (inputType === InputType.Boolean) values[input.key] = false;
    else if (inputType === InputType.ImageArray || inputType === InputType.VideoArray) values[input.key] = [];
    else if (inputType === InputType.Number || inputType === InputType.Range)
      values[input.key] = Number(input.min) || 0;
    else values[input.key] = input.enumValues?.[0] ?? "";
    return values;
  }, {});
}
type RangeSide = "top" | "right" | "bottom" | "left";
const rangeSides: RangeSide[] = ["top", "right", "bottom", "left"];
function getRangeSide(input: IMediaCreatorInput, index: number): RangeSide {
  const inputName = `${input.key} ${input.titleEn}`.toLowerCase();
  return rangeSides.find((side) => inputName.includes(side)) ?? rangeSides[index] ?? "top";
}
function getRangeBounds(input: IMediaCreatorInput) {
  const minValue = Number(input.min);
  const maxValue = Number(input.max);
  const min = Number.isFinite(minValue) ? minValue : 0;
  const max = Number.isFinite(maxValue) && maxValue > min ? maxValue : min + 1;
  return { min, max };
}
function clampRangeValue(input: IMediaCreatorInput, value: InputValue): number {
  const { min, max } = getRangeBounds(input);
  const numericValue = Number(value);
  return Math.min(Math.max(Number.isFinite(numericValue) ? numericValue : min, min), max);
}
function RangeSquareInput({
  inputs,
  values,
  language,
  onChange,
}: {
  inputs: IMediaCreatorInput[];
  values: Record<string, InputValue>;
  language: string;
  onChange: (key: string, value: number) => void;
}) {
  const [draggingSide, setDraggingSide] = useState<RangeSide | null>(null);
  const [dragStart, setDragStart] = useState<{ coordinate: number; value: number } | null>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const sideInputs = inputs.map((input, index) => ({ input, side: getRangeSide(input, index) }));
  const getSideInput = (side: RangeSide) => sideInputs.find((item) => item.side === side);
  const getExpansion = (side: RangeSide) => {
    const sideInput = getSideInput(side);
    if (!sideInput) return 0;
    const { min, max } = getRangeBounds(sideInput.input);
    return ((clampRangeValue(sideInput.input, values[sideInput.input.key]) - min) / (max - min)) * 75;
  };
  const beginDrag = (event: PointerEvent<HTMLButtonElement>, side: RangeSide) => {
    const sideInput = getSideInput(side);
    if (!sideInput) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingSide(side);
    setDragStart({
      coordinate: side === "top" || side === "bottom" ? event.clientY : event.clientX,
      value: clampRangeValue(sideInput.input, values[sideInput.input.key]),
    });
  };
  const updateDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingSide || !dragStart) return;
    const sideInput = getSideInput(draggingSide);
    if (!sideInput) return;
    const squareSize = squareRef.current?.getBoundingClientRect().width || 250;
    const expandableDistance = Math.max(1, (squareSize - 100) / 2);
    const coordinate = draggingSide === "top" || draggingSide === "bottom" ? event.clientY : event.clientX;
    const direction = draggingSide === "top" || draggingSide === "left" ? -1 : 1;
    const { min, max } = getRangeBounds(sideInput.input);
    const nextValue =
      dragStart.value + (direction * (coordinate - dragStart.coordinate) * (max - min)) / expandableDistance;
    onChange(sideInput.input.key, Number(Math.min(Math.max(nextValue, min), max).toFixed(2)));
  };
  const endDrag = () => {
    setDraggingSide(null);
    setDragStart(null);
  };
  return (
    <div className="headerandinput">
      <span className="headerparent">
        <span className="headertext">
          {t("resize aspect ratio")}
          {/* {getInputTitle(inputs[0], language)} */}
        </span>
      </span>
      <div className={styles.rangeSquare} ref={squareRef}>
        <span
          className={styles.rangeExpansionFrame}
          style={
            {
              top: `${75 - getExpansion("top")}px`,
              right: `${75 - getExpansion("right")}px`,
              bottom: `${75 - getExpansion("bottom")}px`,
              left: `${75 - getExpansion("left")}px`,
            } as CSSProperties
          }
          aria-hidden="true"
        />
        <div className={styles.rangeSquareInner}>
          {sideInputs.map(({ input, side }) => (
            <output
              className={`${styles.rangeValue} ${styles[`rangeValue${side[0].toUpperCase()}${side.slice(1)}`]}`}
              key={input.key}>
              {/* {side}: */}
              {(Number(clampRangeValue(input, values[input.key]).toFixed(2)) * 10).toFixed(1)}
            </output>
          ))}
        </div>
        {sideInputs.map(({ input, side }) => {
          const { min, max } = getRangeBounds(input);
          return (
            <button
              type="button"
              key={input.key}
              className={`${styles.rangeHandle} ${styles[`rangeHandle${side[0].toUpperCase()}${side.slice(1)}`]}`}
              style={{ "--range-expansion": `${getExpansion(side)}px` } as CSSProperties}
              role="slider"
              tabIndex={0}
              aria-label={getInputTitle(input, language)}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={clampRangeValue(input, values[input.key])}
              onPointerDown={(event) => beginDrag(event, side)}
              onPointerMove={updateDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />
          );
        })}
      </div>
    </div>
  );
}
function FileInput({
  input,
  value,
  title,
  session,
  onChange,
}: {
  input: IMediaCreatorInput;
  value: string[];
  title: string;
  session: Session | null;
  onChange: (value: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews] = useState<UploadedMediaPreview[]>([]);
  const { t } = useTranslation();
  const isVideo = Number(input.inputType) === InputType.VideoArray;
  const accept = input.fileTypes?.map((type) => `.${type}`).join(",") || (isVideo ? "video/*" : "image/*");
  const maximum = input.maxArrayLength || 1;
  useEffect(() => {
    setPreviews((current) => current.filter((preview) => value.includes(preview.fileName)));
  }, [value]);
  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const requestedFiles = Array.from(event.target.files ?? []);
    const remainingCapacity = Math.max(0, maximum - value.length);
    event.target.value = "";
    if (requestedFiles.length > remainingCapacity) {
      internalNotify(InternalResponseType.ExceedPermittedUploadMedia, NotifType.Warning);
    }
    const selectedFiles = requestedFiles.slice(0, remainingCapacity);
    if (!session || selectedFiles.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    const uploadedFileNames = [...value];
    for (const file of selectedFiles) {
      const response = await UploadFile(session, file, setUploadProgress);
      if (response.fileName) {
        uploadedFileNames.push(response.fileName);
        if (response.showUrl) {
          setPreviews((current) => [...current, { fileName: response.fileName, showUrl: response.showUrl }]);
        }
        onChange([...uploadedFileNames]);
      }
      setUploadProgress(0);
    }
    setUploading(false);
  };
  return (
    <div className="headerandinput">
      <legend className="headertext">
        {title}
        {/* {input.isRequired && <span className={styles.required}>*</span>} */}
      </legend>
      <label className={styles.uploadBox}>
        <img title="" width="40px" src="/icon-plus2.svg" />
        {/* <span className={styles.uploadIcon}>

          {isVideo ? "▶" : "+"}
          </span> */}
        <span className={styles.uploadTitle}>
          {uploading
            ? t("Uploading", { percent: uploadProgress })
            : isVideo
              ? t("Add video")
              : t("Add reference image")}
        </span>
        <span className={styles.hint}>{input.fileTypes?.join(", ") || (isVideo ? t("video") : t("image"))}</span>
        <span className={styles.hint}>
          {value.length} / {maximum}
        </span>

        {uploading && (
          <span className={styles.uploadProgress}>
            <span style={{ width: `${uploadProgress}%` }} />
          </span>
        )}
        <input
          className={styles.visuallyHidden}
          type="file"
          accept={accept}
          multiple={maximum > 1}
          disabled={uploading || !session}
          onChange={handleFiles}
        />
      </label>
      {value.length > 0 && (
        <div className={styles.fileList}>
          {value.map((fileName, index) => {
            const previewUrl = previews.find((preview) => preview.fileName === fileName)?.showUrl;
            return (
              <div className={styles.fileItem} key={fileName}>
                {previewUrl &&
                  (isVideo ? (
                    <video className={styles.mediaPreview} src={previewUrl} muted />
                  ) : (
                    <img className={styles.mediaPreview} src={previewUrl} alt={fileName} />
                  ))}
                <button
                  type="button"
                  aria-label={`Remove ${fileName}`}
                  onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function DynamicInput({
  input,
  value,
  language,
  session,
  onChange,
}: {
  input: IMediaCreatorInput;
  value: InputValue;
  language: string;
  session: Session | null;
  onChange: (value: InputValue) => void;
}) {
  const title = getInputTitle(input, language);
  const options = input.enumValues ?? [];
  const inputType = Number(input.inputType);
  if (inputType === InputType.ImageArray || inputType === InputType.VideoArray) {
    return (
      <FileInput
        input={input}
        value={Array.isArray(value) ? value : []}
        title={title}
        session={session}
        onChange={onChange}
      />
    );
  }
  if (inputType === InputType.Boolean) {
    return (
      <label className={styles.booleanField}>
        <span>
          <strong>{title}</strong>
          {input.isRequired && <span className={styles.required}> *</span>}
        </span>
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
      </label>
    );
  }
  if (inputType === InputType.EnumV1) {
    return (
      <div className="headerandinput">
        <legend className="headertext">
          {title}
          {/* {input.isRequired && <span className={styles.required}>*</span>} */}
        </legend>
        <div className={styles.optionGrid}>
          {options.map((option) => (
            <button
              className={String(value) === option ? styles.optionActive : styles.option}
              type="button"
              key={option}
              onClick={() => onChange(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (inputType === InputType.EnumV2) {
    return (
      <div className="headerandinput">
        <legend className="headertext">{title}</legend>
        <div className={styles.optionGrid}>
          {options.map((option) => (
            <button
              className={String(value) === option ? styles.optionActive : styles.option}
              type="button"
              key={option}
              onClick={() => onChange(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (inputType === InputType.Range) {
    const rangeMinValue = Number(input.min);
    const rangeMaxValue = Number(input.max);
    const rangeMin = Number.isFinite(rangeMinValue) ? rangeMinValue : 0;
    const rangeMax = Number.isFinite(rangeMaxValue) && rangeMaxValue > rangeMin ? rangeMaxValue : rangeMin + 1;
    const valueNumber = Number(value);
    const rangeValue = Math.min(Math.max(Number.isFinite(valueNumber) ? valueNumber : rangeMin, rangeMin), rangeMax);
    const displayedRangeValue = rangeValue.toFixed(2);
    return (
      <label className="headerandinput">
        <span className="headerparent">
          <span className="headertext">{title}</span>
          <output className="headertext">{displayedRangeValue}</output>
        </span>
        <input
          type="range"
          min={rangeMin}
          max={rangeMax}
          step="any"
          value={rangeValue}
          onChange={(event) => onChange(Number(event.currentTarget.valueAsNumber.toFixed(2)))}
        />
      </label>
    );
  }
  if (inputType === InputType.Number) {
    return (
      <label className={styles.field}>
        <span className={styles.label}>{title}</span>
        <input
          type="number"
          min={input.min}
          max={input.max || undefined}
          value={Number(value)}
          required={input.isRequired}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
    );
  }
  return (
    <label className={styles.field}>
      <span className={styles.label}>{title}</span>
      <input
        type="text"
        minLength={input.minTextLength || undefined}
        maxLength={input.maxTextLength || undefined}
        value={String(value ?? "")}
        required={input.isRequired}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
function serializeInputValue(value: InputValue): string {
  return Array.isArray(value) ? JSON.stringify(value) : String(value ?? "");
}
export default function MediaCreator({
  setActiveTab,
  creators,
  error,
  onRetry,
  onCreateMedia,
  createMediaLoading,
  activeTab,
}: MediaCreatorProps) {
  const { data: session } = useSession();
  const { t, i18n } = useTranslation();
  const isVideoCreator = activeTab === "createvideo";
  const mediaTabOptions = [
    { id: 0, label: t("Images") },
    { id: 1, label: t("Videos") },
  ];
  const selectedMediaTab = isVideoCreator ? 1 : 0;
  const handleMediaTabChange = (tab: number) => setActiveTab(tab === 1 ? "video" : "image");
  const availableCreators = creators.filter((item) => item.inputModels.length > 0);
  const [creatorKey, setCreatorKey] = useState(availableCreators[0]?.key ?? "");
  const creator = availableCreators.find((item) => item.key === creatorKey) ?? availableCreators[0];
  const [modelName, setModelName] = useState(creator?.inputModels[0]?.name ?? "");
  const model = creator?.inputModels.find((item) => item.name === modelName) ?? creator?.inputModels[0];
  const [prompt, setPrompt] = useState("");
  const [values, setValues] = useState<Record<string, InputValue>>(() => getInitialValues(model));
  const [tokenUsage, setTokenUsage] = useState<number | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  useEffect(() => {
    let mounted = true;
    const loadTokenBalance = async () => {
      if (!session) {
        setTokenBalance(null);
        return;
      }
      const response = await clientFetchApi<boolean, IPsgFeatureInfo>("/api/psg/GetPackageFeatureDetails", {
        session,
        methodType: MethodType.get,
      });
      if (!mounted || !response.succeeded || !response.value) return;
      const aiFeature = response.value.features.find((feature) => feature.featureId === PsgFeatureType.AI);
      const packages = [aiFeature?.packageFeature, aiFeature?.reserveFeature].filter(
        (item): item is NonNullable<typeof item> => item !== null && item !== undefined,
      );
      const remaining = packages.reduce((total, item) => total + Math.max(0, item.maxCount - item.count), 0);
      setTokenBalance({ total: remaining, remaining });
    };
    loadTokenBalance();
    return () => {
      mounted = false;
    };
  }, [session]);
  useEffect(() => {
    const nextCreator = availableCreators.find((item) => item.key === creatorKey) ?? availableCreators[0];
    if (!nextCreator) return;
    const nextModelName = nextCreator.inputModels.some((item) => item.name === modelName)
      ? modelName
      : nextCreator.inputModels[0].name;
    if (creatorKey !== nextCreator.key) setCreatorKey(nextCreator.key);
    if (modelName !== nextModelName) setModelName(nextModelName);
  }, [creators, creatorKey, modelName]);
  useEffect(() => {
    setPrompt("");
    setValues(getInitialValues(model));
    setTokenUsage(null);
  }, [creator?.key, model?.name]);
  const stateContent = error ? (
    <>
      <h1>{t(isVideoCreator ? "Video creator is unavailable" : "Image creator is unavailable")}</h1>
      <p>{error}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          {t("Try again")}
        </button>
      )}
    </>
  ) : !creator || !model ? (
    <>
      <h1>{t(isVideoCreator ? "No video models found" : "No image models found")}</h1>
      <p>
        {t(
          isVideoCreator
            ? "There are no video generation models available for this account."
            : "There are no image generation models available for this account.",
        )}
      </p>
    </>
  ) : null;
  if (stateContent) {
    return (
      <main className={styles.workspace}>
        <section className={styles.modelPanel} aria-label={isVideoCreator ? t("Video models") : t("Image models")}>
          <ToggleButton
            options={mediaTabOptions}
            selectedValue={selectedMediaTab}
            onChange={handleMediaTabChange}
            ariaLabel={t("Media type")}
          />
        </section>
        <section className={styles.settingsPanel} aria-live="polite">
          <div className={styles.stateBox}>{stateContent}</div>
        </section>
      </main>
    );
  }
  const promptIsValid = prompt.length >= model.minPromptLength && prompt.length <= model.maxPromptLength;
  const requiredInputsAreValid = model.inputModelTypes.every((input) => {
    if (!input.isRequired) return true;
    const value = values[input.key];
    return Array.isArray(value) ? value.length >= input.minArrayLength : value !== "" && value !== undefined;
  });
  const getImageUsage = async () => {
    if (!session || !promptIsValid || !requiredInputsAreValid) return;
    const request: IGetImageUsageRequest = {
      creatorKey: creator.key,
      version: model.name,
      inputs: model.inputModelTypes.map((input) => ({
        key: input.key,
        value: serializeInputValue(values[input.key]),
      })),
      prompt,
    };
    setUsageLoading(true);
    const response = await clientFetchApi<IGetImageUsageRequest, number>(
      `/api/mediaai/${activeTab === "createimage" ? "GetImageUsage" : "GetVideoUsage"}`,
      {
        session,
        methodType: MethodType.post,
        data: request,
      },
    );
    setUsageLoading(false);
    if (response.succeeded && typeof response.value === "number") {
      setTokenUsage(response.value);
      return;
    }
    notify(response.info?.responseType, NotifType.Error, response.info?.message || response.errorMessage);
  };
  const invalidateUsage = () => setTokenUsage(null);
  const tokenUsagePercentage =
    tokenBalance && tokenBalance.total > 0 && tokenUsage !== null
      ? Math.min(100, (tokenUsage / tokenBalance.total) * 100)
      : 0;
  const selectCreator = (nextCreatorKey: string) => {
    const nextCreator = availableCreators.find((item) => item.key === nextCreatorKey);
    if (!nextCreator || nextCreator.key === creator.key) return;
    setCreatorKey(nextCreator.key);
    setModelName(nextCreator.inputModels[0].name);
  };
  return (
    <main className={styles.workspace}>
      <section className={styles.modelPanel} aria-label={isVideoCreator ? t("Video models") : t("Image models")}>
        <ToggleButton
          options={mediaTabOptions}
          selectedValue={selectedMediaTab}
          onChange={handleMediaTabChange}
          ariaLabel={t("Media type")}
        />
        {availableCreators.map((item) => {
          const isActive = item.key === creator.key;
          return (
            <div className={styles.creatorBranch} key={item.key}>
              <button
                className={isActive ? styles.creatorActive : styles.creator}
                type="button"
                aria-expanded={isActive}
                aria-controls={`models-${item.key}`}
                onClick={() => selectCreator(item.key)}>
                <span className={styles.creatorLogo}>
                  {item.logo ? (
                    <img src={getClientMediaBaseUrl() + item.logo} alt="" />
                  ) : (
                    item.displayName.slice(0, 1).toUpperCase()
                  )}
                </span>
                <span className={styles.creatorText}>
                  <strong>{item.displayName}</strong>
                  <small>
                    {item.inputModels.length} {item.inputModels.length === 1 ? t("model") : t("models")}
                  </small>
                </span>
                <span className={styles.creatorCheck} aria-hidden="true">
                  <img src="/down-arrow.svg" alt="" />
                </span>
              </button>
              <div className={`${styles.modelListWrapper} ${isActive ? styles.modelListWrapperOpen : ""}`}>
                <div className={styles.modelList} id={`models-${item.key}`} aria-hidden={!isActive}>
                  {item.inputModels.map((modelItem) => (
                    <button
                      type="button"
                      className={modelItem.name === model.name ? styles.modelActive : styles.model}
                      key={modelItem.name}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setModelName(modelItem.name)}>
                      <div className="headerandinput" style={{ gap: "4px" }}>
                        <div className="headerparent">
                          <div className="title2">{modelItem.displayName ?? modelItem.name}</div>
                          <span
                            className={styles.cost}
                            aria-label={t("Cost level {level}", { level: modelItem.expensiveType + 1 })}>
                            {"$".repeat(modelItem.expensiveType + 1)}
                          </span>
                        </div>
                        <div className="headerparent">
                          <div className="explain">{modelItem.name}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </section>
      <form
        className={styles.settingsPanel}
        onSubmit={(event) => {
          event.preventDefault();
          if (onCreateMedia) {
            onCreateMedia(
              {
                creatorKey: creator.key,
                version: model.name,
                inputs: model.inputModelTypes.map((input) => ({
                  key: input.key,
                  value: serializeInputValue(values[input.key]),
                })),
                prompt,
              },
              tokenUsage ?? 0,
            );
          }
        }}>
        <label className="headerandinput">
          <span className="headerparent">
            <span className="title2">{t("Prompt")}</span>
            <span className="explain">
              ({prompt.length} / {model.maxPromptLength})
            </span>
          </span>
          <TextArea
            className="textArea"
            id="prompt"
            minRows={5}
            maxRows={10}
            value={prompt}
            autoResize
            minLength={model.minPromptLength}
            maxLength={model.maxPromptLength}
            placeholder={t("Describe the subject, setting, light, composition, and style...")}
            onChange={(event) => {
              setPrompt(event.target.value);
              invalidateUsage();
            }}
          />
          {/* {prompt.length > 0 && prompt.length < model.minPromptLength && (
            <span className={styles.validation}>
              {t("Use at least {count} characters.", { count: model.minPromptLength })}
            </span>
          )} */}
        </label>
        <div className="headerandinput">
          <div className="title2">{t("sidebar_Setting")}</div>
          <div className={styles.dynamicFields}>
            {(() => {
              const orderedInputs = [...model.inputModelTypes].sort((first, second) => first.orderId - second.orderId);
              const rangeInputs = orderedInputs.filter((input) => Number(input.inputType) === InputType.Range);
              let rangeRendered = false;
              return orderedInputs.map((input) => {
                if (Number(input.inputType) === InputType.Range) {
                  if (rangeRendered) return null;
                  rangeRendered = true;
                  return (
                    <RangeSquareInput
                      key="range-square"
                      inputs={rangeInputs}
                      values={values}
                      language={i18n.language || "en"}
                      onChange={(key, value) => {
                        setValues((current) => ({ ...current, [key]: value }));
                        invalidateUsage();
                      }}
                    />
                  );
                }
                return (
                  <DynamicInput
                    key={input.key}
                    input={input}
                    value={values[input.key]}
                    language={i18n.language || "en"}
                    session={session}
                    onChange={(value) => {
                      setValues((current) => ({ ...current, [input.key]: value }));
                      invalidateUsage();
                    }}
                  />
                );
              });
            })()}
          </div>
        </div>
        <div className={styles.Checktoken}>
          {tokenBalance && (
            <div className={`${styles.tokenUsagePanel} `}>
              <div
                className={styles.tokenProgress}
                role="progressbar"
                aria-label={t("Requested token usage")}
                aria-valuemin={0}
                aria-valuemax={tokenBalance.total}
                aria-valuenow={tokenUsage ?? 0}>
                <span className={styles.tokenProgressRequested} style={{ width: `${tokenUsagePercentage}%` }} />
              </div>
              <div className={styles.tokenUsageLabels}>
                <span>{tokenUsage === null ? "-" : tokenUsage.toLocaleString()}</span>
                <span>{tokenBalance.total.toLocaleString()}</span>
              </div>
            </div>
          )}
          <button
            type="button"
            className={
              usageLoading || !promptIsValid || !requiredInputsAreValid || createMediaLoading
                ? "disableButton"
                : "cancelButton"
            }
            disabled={usageLoading || !promptIsValid || !requiredInputsAreValid || createMediaLoading}
            onClick={getImageUsage}>
            {usageLoading ? t("Calculating...") : t("TokenUsage")}
          </button>
        </div>
        <footer className={styles.actionBar}>
          <button
            type="submit"
            className={!promptIsValid || !requiredInputsAreValid || createMediaLoading ? "disableButton" : "saveButton"}
            disabled={!promptIsValid || !requiredInputsAreValid || createMediaLoading}>
            {createMediaLoading ? <RingLoader /> : t(isVideoCreator ? "Create video" : "Create image")}
          </button>
        </footer>
      </form>
    </main>
  );
}
