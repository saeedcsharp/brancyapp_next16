import RingLoader from "brancy/components/design/loader/ringLoder";
import TextArea from "brancy/components/design/textArea/textArea";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
} from "brancy/components/notifications/notificationBox";
import { MethodType, UploadFile } from "brancy/helper/api";
import { getTotalFeatureCount } from "brancy/helper/checkFeature";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { InputType, PsgFeatureType } from "brancy/models/enums";
import { IGetImageUsageRequest, IMediaCreator, IMediaCreatorInput, IMediaCreatorModel } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import { ChangeEvent, CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./mediaCreator.module.css";
import Loading from "brancy/components/notOk/loading";
import NotFeature from "brancy/components/notOk/notFeature";
import CheckBoxButton from "brancy/components/design/checkBoxButton/checkBoxButton";
import AiModelList from "brancy/components/page/ai/popup/AiModelList";
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
  onCreateMedia?: (request: IGetImageUsageRequest, count: number) => Promise<boolean>;
  createMediaLoading?: boolean;
  setActiveTab: Dispatch<SetStateAction<MediaTab>>;
  activeTab: MediaTab;
  onOpenImagePrompts?: () => void;
  promptToUse?: { key: string; text: string } | null;
  modelSelection: { creatorKey: string; modelName: string };
  onModelSelectionChange: (selection: { creatorKey: string; modelName: string }) => void;
  onOpenModelList: () => void;
  featureUnavailable?: boolean;
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
function getDefaultInputValue(input: IMediaCreatorInput): InputValue | null {
  if (input.defaultValue === null || input.defaultValue === undefined) return null;

  const inputType = Number(input.inputType);
  const rawValue = input.defaultValue;
  if (inputType === InputType.Boolean) {
    if (typeof rawValue === "string") {
      const normalized = rawValue.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
      return null;
    }
    return Boolean(rawValue);
  }
  if (inputType === InputType.ImageArray || inputType === InputType.VideoArray || inputType === InputType.AudioArray) {
    if (Array.isArray(rawValue)) return rawValue.map(String);
    if (typeof rawValue !== "string" || !rawValue.trim()) return null;
    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed.map(String) : null;
    } catch {
      return [rawValue.trim()];
    }
  }
  if (inputType === InputType.Number || inputType === InputType.Range || inputType === InputType.IntRange) {
    if (typeof rawValue === "string" && !rawValue.trim()) return null;
    const numericValue = Number(rawValue);
    if (!Number.isFinite(numericValue)) return null;
    if (inputType === InputType.Number) return numericValue;
    const { min, max } = getRangeBounds(input);
    const clampedValue = Math.min(Math.max(numericValue, min), max);
    return inputType === InputType.IntRange ? Math.round(clampedValue) : clampedValue;
  }
  if (inputType === InputType.EnumV1 || inputType === InputType.EnumV2) {
    const options = input.enumValues ?? [];
    const normalized = String(rawValue).trim().toLowerCase();
    return options.find((option) => option.trim().toLowerCase() === normalized) ?? null;
  }
  return String(rawValue);
}
function allowsEmptyValue(input: IMediaCreatorInput): boolean {
  return Number(input.inputType) === InputType.Text && input.min === 0;
}
function getInitialValues(model: IMediaCreatorModel | undefined): Record<string, InputValue> {
  if (!model) return {};
  return model.inputModelTypes.reduce<Record<string, InputValue>>((values, input) => {
    const inputType = Number(input.inputType);
    const defaultValue = getDefaultInputValue(input);
    if (defaultValue !== null) {
      values[input.key] = defaultValue;
      return values;
    }
    if (inputType === InputType.Boolean) values[input.key] = false;
    else if (
      inputType === InputType.ImageArray ||
      inputType === InputType.VideoArray ||
      inputType === InputType.AudioArray
    )
      values[input.key] = [];
    else if (inputType === InputType.Number || inputType === InputType.Range || inputType === InputType.IntRange)
      values[input.key] = Number(input.min) || 0;
    else values[input.key] = input.enumValues?.[0] ?? "";
    return values;
  }, {});
}
function getUniqueModels(models: IMediaCreatorModel[]): IMediaCreatorModel[] {
  return models.filter((model, index) => models.findIndex((candidate) => candidate.name === model.name) === index);
}
type RangeSide = "top" | "right" | "bottom" | "left";
const rangeSides: RangeSide[] = ["top", "right", "bottom", "left"];
const rangeSquareKeyParts = [
  "topexpantionratio",
  "buttonexpantionratio",
  "rightexpantionratio",
  "leftexpantionratio",
] as const;
function getRangeSide(input: IMediaCreatorInput, index: number): RangeSide {
  const inputName = `${input.key} ${input.titleEn}`.toLowerCase();
  if (inputName.includes("button")) return "bottom";
  return rangeSides.find((side) => inputName.includes(side)) ?? rangeSides[index] ?? "top";
}
function hasRangeSquareKey(input: IMediaCreatorInput, keyPart: string): boolean {
  const inputKey = input.key.toLowerCase();
  return inputKey.includes(keyPart);
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
function serializeInputValue(value: InputValue): string {
  return Array.isArray(value) ? JSON.stringify(value) : String(value ?? "");
}
function getAspectRatio(value: string): { width: number; height: number } | null {
  const match = value.match(/^\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  return width > 0 && height > 0 ? { width, height } : null;
}
function isAspectRatioInput(input: IMediaCreatorInput): boolean {
  return `${input.key} ${input.titleEn}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .includes("aspectratio");
}
function isQualityInput(input: IMediaCreatorInput): boolean {
  return `${input.key} ${input.titleEn}`.toLowerCase().includes("quality");
}
function isSizeInput(input: IMediaCreatorInput): boolean {
  return `${input.key} ${input.titleEn}`.toLowerCase().includes("size");
}
function isBackgroundInput(input: IMediaCreatorInput): boolean {
  return `${input.key} ${input.titleEn}`.toLowerCase().includes("background");
}
function isModerationInput(input: IMediaCreatorInput): boolean {
  return `${input.key} ${input.titleEn}`.toLowerCase().includes("moderation");
}
function isThinkingLevelInput(input: IMediaCreatorInput): boolean {
  return `${input.key} ${input.titleEn}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .includes("thinkinglevel");
}
function AspectRatioIcon({ value }: { value: string }) {
  const ratio = getAspectRatio(value);
  if (!ratio) return null;
  const viewBoxSize = 15;
  const padding = 1;
  const scale = Math.min((viewBoxSize - padding * 2) / ratio.width, (viewBoxSize - padding * 2) / ratio.height);
  const iconWidth = ratio.width * scale;
  const iconHeight = ratio.height * scale;
  const iconX = (viewBoxSize - iconWidth) / 2;
  const iconY = (viewBoxSize - iconHeight) / 2;
  return (
    <svg
      className={styles.aspectRatioIcon}
      width={viewBoxSize}
      height={viewBoxSize}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      role="img"
      aria-hidden="true">
      <rect
        x={iconX}
        y={iconY}
        width={iconWidth}
        height={iconHeight}
        rx="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
function SizeIcon({ value }: { value: string }) {
  const match = value.match(/^\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*$/i);
  if (!match) return null;
  return <AspectRatioIcon value={`${match[1]}:${match[2]}`} />;
}
function BackgroundIcon({ value }: { value: string }) {
  const normalizedValue = value.trim().toLowerCase();
  const isTransparent = normalizedValue.includes("transparent");
  const isOpaque = normalizedValue.includes("opaque");
  const checkerColors = ["currentColor", "transparent", "transparent", "currentColor"];
  return (
    <svg className={styles.backgroundIcon} width="15" height="15" viewBox="0 0 15 15" role="img" aria-hidden="true">
      <rect x="1.5" y="1.5" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      {isTransparent ? (
        <>
          {checkerColors.map((color, index) => (
            <rect
              key={index}
              x={3 + (index % 2) * 4.5}
              y={3 + Math.floor(index / 2) * 4.5}
              width="4.5"
              height="4.5"
              fill={color}
              opacity={color === "currentColor" ? 0.5 : 1}
            />
          ))}
        </>
      ) : isOpaque ? (
        <rect x="3" y="3" width="9" height="9" rx="1" fill="currentColor" opacity="0.7" />
      ) : null}
    </svg>
  );
}
function ModerationIcon({ value }: { value: string }) {
  const normalizedValue = value.trim().toLowerCase();
  const level = normalizedValue === "low" ? 1 : normalizedValue === "medium" ? 2 : normalizedValue === "high" ? 3 : 0;
  const isAutomatic = normalizedValue === "auto" || normalizedValue === "automatic";
  return (
    <svg className={styles.moderationIcon} width="15" height="15" viewBox="0 0 15 15" role="img" aria-hidden="true">
      <path
        d="M7.5 1.5 12 3v3.5c0 3-1.8 5.7-4.5 7-2.7-1.3-4.5-4-4.5-7V3l4.5-1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {isAutomatic ? (
        <path
          d="m7.5 4.2.55 1.35 1.45.1-1.1.92.35 1.4-1.25-.75-1.25.75.35-1.4-1.1-.92 1.45-.1.55-1.35Z"
          fill="currentColor"
        />
      ) : (
        Array.from({ length: level }, (_, index) => (
          <rect key={index} x="5" y={9 - index * 1.8} width="5" height="1" rx="0.5" fill="currentColor" />
        ))
      )}
    </svg>
  );
}
function ThinkingLevelIcon({ value }: { value: string }) {
  const normalizedValue = value.trim().toLowerCase();
  const level = normalizedValue === "low" ? 1 : normalizedValue === "medium" ? 2 : normalizedValue === "high" ? 3 : 0;
  const isAutomatic = normalizedValue === "auto" || normalizedValue === "automatic";
  return (
    <svg className={styles.thinkingLevelIcon} width="15" height="15" viewBox="0 0 15 15" role="img" aria-hidden="true">
      <path
        d="M4.5 9.8a4.1 4.1 0 1 1 6 0c-.45.45-.7.8-.85 1.2H5.35c-.15-.4-.4-.75-.85-1.2ZM5.5 13h4M6 11h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {isAutomatic ? (
        <circle cx="7.5" cy="5.5" r="1" fill="currentColor" />
      ) : (
        Array.from({ length: level }, (_, index) => (
          <rect key={index} x="5.5" y={4.2 + index * 1.4} width="4" height="0.8" rx="0.4" fill="currentColor" />
        ))
      )}
    </svg>
  );
}
function QualityIcon({ value }: { value: string }) {
  const normalizedValue = value.trim().toLowerCase();
  const grid =
    normalizedValue === "low"
      ? { columns: 2, rows: 2 }
      : normalizedValue === "medium"
        ? { columns: 3, rows: 3 }
        : normalizedValue === "high"
          ? { columns: 4, rows: 3 }
          : null;
  if (!grid) return null;
  const pixelGap = 1;
  const pixelAreaStart = 3;
  const pixelAreaSize = 9;
  const pixelWidth = (pixelAreaSize - pixelGap * (grid.columns - 1)) / grid.columns;
  const pixelHeight = (pixelAreaSize - pixelGap * (grid.rows - 1)) / grid.rows;
  return (
    <svg className={styles.qualityIcon} width="15" height="15" viewBox="0 0 15 15" role="img" aria-hidden="true">
      <rect x="1.5" y="1.5" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      {Array.from({ length: grid.columns * grid.rows }, (_, index) => {
        const row = Math.floor(index / grid.columns);
        const column = index % grid.columns;
        return (
          <rect
            key={index}
            x={pixelAreaStart + column * (pixelWidth + pixelGap)}
            y={pixelAreaStart + row * (pixelHeight + pixelGap)}
            width={pixelWidth}
            height={pixelHeight}
            opacity="0.6"
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}
export default function MediaCreator({
  setActiveTab,
  creators,
  error,
  onRetry,
  onCreateMedia,
  createMediaLoading,
  activeTab,
  onOpenImagePrompts,
  promptToUse,
  modelSelection,
  onModelSelectionChange,
  onOpenModelList,
  featureUnavailable,
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const availableCreators = creators
    .map((item) => ({ ...item, inputModels: getUniqueModels(item.inputModels) }))
    .filter((item) => item.inputModels.length > 0);
  const creatorKey = modelSelection.creatorKey || availableCreators[0]?.key || "";
  const creator = availableCreators.find((item) => item.key === creatorKey) ?? availableCreators[0];
  const modelName = modelSelection.modelName || creator?.inputModels[0]?.name || "";
  const model = creator?.inputModels.find((item) => item.name === modelName) ?? creator?.inputModels[0];
  const [prompt, setPrompt] = useState("");
  const [values, setValues] = useState<Record<string, InputValue>>(() => getInitialValues(model));
  const [tokenUsage, setTokenUsage] = useState<number | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [previews, setPreviews] = useState<Record<string, UploadedMediaPreview[]>>({});
  const [uploadingInputKey, setUploadingInputKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggingSide, setDraggingSide] = useState<RangeSide | null>(null);
  const [dragStart, setDragStart] = useState<{ coordinate: number; value: number } | null>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mounted = true;
    const loadTokenBalance = async () => {
      if (!session) {
        setTokenBalance(null);
        return;
      }
      const totalFeatureCount = await getTotalFeatureCount(session, PsgFeatureType.AI);
      if (!mounted || totalFeatureCount === null) return;
      setTokenBalance({ total: totalFeatureCount, remaining: totalFeatureCount });
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
    if (creatorKey !== nextCreator.key || modelName !== nextModelName) {
      onModelSelectionChange({ creatorKey: nextCreator.key, modelName: nextModelName });
    }
  }, [availableCreators, creatorKey, modelName, onModelSelectionChange]);
  useEffect(() => {
    setPrompt("");
    setValues(getInitialValues(model));
    setTokenUsage(null);
    setPreviews({});
    setUploadingInputKey(null);
    setDraggingSide(null);
    setDragStart(null);
  }, [creator?.key, model?.name]);
  useEffect(() => {
    if (!promptToUse) return;
    setPrompt(promptToUse.text);
    setTokenUsage(null);
  }, [promptToUse]);
  if (error || !creator || !model) {
    return (
      <div className={styles.right}>
        <ToggleButton
          options={mediaTabOptions}
          selectedValue={selectedMediaTab}
          onChange={handleMediaTabChange}
          ariaLabel={t("Media type")}
        />
        <div className={styles.stateBox}>
          {error ? (
            <>
              <h1>{t(isVideoCreator ? "Video creator is unavailable" : "Image creator is unavailable")}</h1>
              <p>{error}</p>
              {onRetry && (
                <button type="button" onClick={onRetry}>
                  {t("Try again")}
                </button>
              )}
            </>
          ) : (
            <>{featureUnavailable ? <NotFeature onClose={() => undefined} /> : <Loading />}</>
          )}
        </div>
      </div>
    );
  }
  const promptIsValid = prompt.length >= model.minPromptLength && prompt.length <= model.maxPromptLength;
  const requiredInputsAreValid = model.inputModelTypes.every((input) => {
    if (!input.isRequired || allowsEmptyValue(input)) return true;
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
  const pastePromptFromClipboard = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.readText) return;
    try {
      const clipboardText = await navigator.clipboard.readText();
      setPrompt(clipboardText);
      invalidateUsage();
    } catch {
      return;
    }
  };
  const pasteInputFromClipboard = async (inputKey: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.readText) return;
    try {
      const clipboardText = await navigator.clipboard.readText();
      setValues((current) => ({ ...current, [inputKey]: clipboardText }));
      invalidateUsage();
    } catch {
      return;
    }
  };
  const invalidateUsage = () => setTokenUsage(null);
  const tokenUsagePercentage =
    tokenBalance && tokenBalance.total > 0 && tokenUsage !== null
      ? Math.min(100, (tokenUsage / tokenBalance.total) * 100)
      : 0;
  const handleFiles = async (event: ChangeEvent<HTMLInputElement>, input: IMediaCreatorInput, value: string[]) => {
    const requestedFiles = Array.from(event.target.files ?? []);
    const maximum = input.maxArrayLength || 1;
    const remainingCapacity = Math.max(0, maximum - value.length);
    event.target.value = "";
    if (requestedFiles.length > remainingCapacity) {
      internalNotify(InternalResponseType.ExceedPermittedUploadMedia, NotifType.Warning);
    }
    const selectedFiles = requestedFiles.slice(0, remainingCapacity);
    if (!session || selectedFiles.length === 0) return;
    setUploadingInputKey(input.key);
    setUploadProgress(0);
    const uploadedFileNames = [...value];
    for (const file of selectedFiles) {
      const response = await UploadFile(session, file, setUploadProgress);
      if (response.fileName) {
        uploadedFileNames.push(response.fileName);
        if (response.showUrl) {
          setPreviews((current) => ({
            ...current,
            [input.key]: [...(current[input.key] ?? []), { fileName: response.fileName, showUrl: response.showUrl }],
          }));
        }
        setValues((current) => ({ ...current, [input.key]: [...uploadedFileNames] }));
        invalidateUsage();
      }
      setUploadProgress(0);
    }
    setUploadingInputKey(null);
  };
  const resetForm = () => {
    setPrompt("");
    setValues(getInitialValues(model));
    setTokenUsage(null);
    setPreviews({});
    setUploadingInputKey(null);
    setUploadProgress(0);
    setDraggingSide(null);
    setDragStart(null);
  };
  return (
    <form
      className={styles.right}
      onSubmit={async (event) => {
        event.preventDefault();
        if (createMediaLoading || !promptIsValid || !requiredInputsAreValid || !onCreateMedia) return;
        const created = await onCreateMedia(
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
        if (created) resetForm();
      }}>
      {/* type */}

      <ToggleButton
        options={mediaTabOptions}
        selectedValue={selectedMediaTab}
        onChange={handleMediaTabChange}
        ariaLabel={t("Media type")}
      />

      <div className={styles.mediaCreatorContainer}>
        {/* model type */}
        <div className="headerandinput">
          <div className="title2">{t("SettingGeneralAiModelsTitle")}</div>
          <AiModelList
            creators={availableCreators}
            selectedCreatorKey={creator.key}
            selectedModelName={model.name}
            onOpen={onOpenModelList}
          />
        </div>
        {/* prompt section */}
        <label className="headerandinput">
          <span className="headerparent">
            <span className="title2">{t("Prompt")}</span>
            <span className="counter">
              ({prompt.length} / {model.maxPromptLength}){" "}
              <button
                type="button"
                aria-label={t("Paste")}
                title={t("Paste")}
                onClick={() => void pastePromptFromClipboard()}
                style={{ height: "20px", padding: 0, border: 0, background: "transparent", cursor: "pointer" }}>
                <img style={{ width: "20px", height: "20px" }} src="/copy.svg" alt="" />
              </button>
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
          {!isVideoCreator && onOpenImagePrompts && (
            <button type="button" className="cancelButton" onClick={onOpenImagePrompts}>
              {t("aiSuggestedPrompts_title")}
            </button>
          )}
          {/* {prompt.length > 0 && prompt.length < model.minPromptLength && (
            <span className={styles.validation}>
              {t("Use at least {count} characters.", { count: model.minPromptLength })}
            </span>
          )} */}
        </label>

        {/* settings section */}
        <div className="headerandinput">
          <div className="headerparent">
            <div className="title2">{t("sidebar_Setting")}</div>
            <svg
              className={styles.foldingicon}
              width="21"
              height="21"
              viewBox="0 0 22 22"
              fill="none"
              role="button"
              tabIndex={0}
              aria-label={isSettingsOpen ? t("Collapse settings") : t("Expand settings")}
              aria-expanded={isSettingsOpen}
              onClick={() => setIsSettingsOpen((current) => !current)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setIsSettingsOpen((current) => !current);
                }
              }}
              style={{
                transform: `rotate(${isSettingsOpen ? -90 : 90}deg)`,
              }}>
              <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5"></path>
              <path
                fill="var(--text-h1)"
                d="M10 14.6q-.4 0-.6-.2a1 1 0 0 1 0-1l2.1-2.2.2-.4-.2-.4-2.1-2.1a1 1 0 0 1 0-1q.5-.5 1 0l2.1 2q.6.8.6 1.5 0 .8-.6 1.5l-2 2.1z"></path>
            </svg>
          </div>
          <div
            className={`${styles.dynamicFields} ${!isSettingsOpen ? styles.dynamicFieldsCollapsed : ""}`}
            id="media-creator-settings-fields"
            aria-hidden={!isSettingsOpen}>
            {[...model.inputModelTypes]
              .sort((first, second) => first.orderId - second.orderId)
              .map((input, _, orderedInputs) => {
                const inputType = Number(input.inputType);
                const value = values[input.key];
                const title = getInputTitle(input, i18n.language || "en");
                const options = input.enumValues ?? [];
                const rangeInputs = orderedInputs.filter((item) => Number(item.inputType) === InputType.Range);
                const hasFourDirectionalRange =
                  rangeInputs.length === rangeSquareKeyParts.length &&
                  rangeSquareKeyParts.every((keyPart) =>
                    rangeInputs.some((rangeInput) => hasRangeSquareKey(rangeInput, keyPart)),
                  );
                const firstRangeInput = rangeInputs[0];
                const shouldRenderRangeSquare =
                  inputType === InputType.Range && hasFourDirectionalRange && input.key === firstRangeInput?.key;
                if (inputType === InputType.Range && hasFourDirectionalRange && !shouldRenderRangeSquare) return null;
                if (
                  inputType === InputType.ImageArray ||
                  inputType === InputType.VideoArray ||
                  inputType === InputType.AudioArray
                ) {
                  const isVideo = inputType === InputType.VideoArray;
                  const isAudio = inputType === InputType.AudioArray;
                  const fileTypes = input.fileTypes
                    ?.map((type) => type.trim())
                    .filter(Boolean)
                    .map((type) => (type.startsWith(".") ? type : `.${type}`));
                  const accept = fileTypes?.join(",") || (isVideo ? "video/*" : isAudio ? "audio/*" : "image/*");
                  const maximum = input.maxArrayLength || 1;
                  const mediaValue = Array.isArray(value) ? value : [];
                  const isUploading = uploadingInputKey === input.key;
                  return (
                    <div className="headerandinput" key={input.key}>
                      <legend className="headertext" style={{ textAlign: "start" }}>
                        {title}
                      </legend>
                      <div className={styles.fileContainer}>
                        <label className={styles.uploadBox}>
                          <img title="" width="40px" src="/icon-plus2.svg" />
                          {/* <span class {/* {styles.uploadTitle}>
                          {isUploading
                            ? t("Uploading"  { percent: uploadProgress })
                            : isVideo
                              ? t("Add video")
                              : isAudio
                                ? t("Add audio")
                                : t("Add refer  ce image")}
                        </span> */}

                          {/* <div className="IDblue" style={{ textTransform: "uppercase" }}>
                          {fileTypes?.join(" - ") || (isVideo ? t("video") : isAudio ? t("audio") : t("image"))}
                        </div> */}
                          <span className={styles.hint}>
                            ({mediaValue.length} / {maximum})
                          </span>
                          {isUploading && (
                            <span className={styles.uploadProgress}>
                              <span style={{ width: `${uploadProgress}%` }} />
                            </span>
                          )}
                          <input
                            className={styles.visuallyHidden}
                            type="file"
                            accept={accept}
                            multiple={maximum > 1}
                            disabled={isUploading || !session}
                            onChange={(event) => handleFiles(event, input, mediaValue)}
                          />
                        </label>
                        {mediaValue.length > 0 && (
                          <div className={styles.fileList}>
                            {mediaValue.map((fileName, fileIndex) => {
                              const previewUrl = previews[input.key]?.find(
                                (preview) => preview.fileName === fileName,
                              )?.showUrl;
                              return (
                                <div className={styles.fileItem} key={fileName}>
                                  {previewUrl &&
                                    (isAudio ? (
                                      <audio className={styles.mediaPreview} src={previewUrl} controls />
                                    ) : isVideo ? (
                                      <video className={styles.mediaPreview} src={previewUrl} muted />
                                    ) : (
                                      <img className={styles.mediaPreview} src={previewUrl} alt={fileName} />
                                    ))}
                                  <img
                                    onClick={() => {
                                      setValues((current) => ({
                                        ...current,
                                        [input.key]: mediaValue.filter((_, index) => index !== fileIndex),
                                      }));
                                      setPreviews((current) => ({
                                        ...current,
                                        [input.key]: (current[input.key] ?? []).filter(
                                          (preview) => preview.fileName !== fileName,
                                        ),
                                      }));
                                      invalidateUsage();
                                    }}
                                    className={styles.deleteHashtag}
                                    src="/deleteHashtag.svg"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>{" "}
                    </div>
                  );
                }
                if (inputType === InputType.Boolean) {
                  const booleanInputs = orderedInputs.filter((item) => Number(item.inputType) === InputType.Boolean);
                  if (input.key !== booleanInputs[0]?.key) return null;
                  return (
                    <div className="headerandinput" key={input.key}>
                      <legend className="headertext" style={{ textAlign: "start" }}>
                        {t("product_Properties")}
                      </legend>
                      <div className={styles.Propertieslist}>
                        {booleanInputs.map((booleanInput) => (
                          <CheckBoxButton
                            key={booleanInput.key}
                            value={Boolean(values[booleanInput.key])}
                            textlabel={`${getInputTitle(booleanInput, i18n.language || "en")}

                          `}
                            handleToggle={(event) => {
                              setValues((current) => ({
                                ...current,
                                [booleanInput.key]: event.target.checked,
                              }));
                              invalidateUsage();
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
                if (inputType === InputType.EnumV1 || inputType === InputType.EnumV2) {
                  const isAspectRatio = isAspectRatioInput(input);
                  const isQuality = isQualityInput(input);
                  const isSize = isSizeInput(input);
                  const isBackground = isBackgroundInput(input);
                  const isModeration = isModerationInput(input);
                  const isThinkingLevel = isThinkingLevelInput(input);
                  return (
                    <div className="headerandinput" key={input.key}>
                      <legend className="headertext" style={{ textAlign: "start" }}>
                        {title}
                      </legend>
                      <div className={styles.optionGrid}>
                        {options.map((option) => (
                          <button
                            className={String(value) === option ? styles.optionActive : styles.option}
                            type="button"
                            key={option}
                            onClick={() => {
                              setValues((current) => ({ ...current, [input.key]: option }));
                              invalidateUsage();
                            }}>
                            <span className={styles.optionContent}>
                              {isAspectRatio && <AspectRatioIcon value={option} />}
                              {isSize && <SizeIcon value={option} />}
                              {isQuality && <QualityIcon value={option} />}
                              {isBackground && <BackgroundIcon value={option} />}
                              {isModeration && <ModerationIcon value={option} />}
                              {isThinkingLevel && <ThinkingLevelIcon value={option} />}
                              <span>{option}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (shouldRenderRangeSquare) {
                  const sideInputs = rangeInputs.map((rangeInput, rangeIndex) => ({
                    input: rangeInput,
                    side: getRangeSide(rangeInput, rangeIndex),
                  }));
                  const getSideInput = (side: RangeSide) => sideInputs.find((item) => item.side === side);
                  const getExpansion = (side: RangeSide) => {
                    const sideInput = getSideInput(side);
                    if (!sideInput) return 0;
                    const { min, max } = getRangeBounds(sideInput.input);
                    return ((clampRangeValue(sideInput.input, values[sideInput.input.key]) - min) / (max - min)) * 75;
                  };
                  return (
                    <div className="headerandinput" key="range-square">
                      <span className="headerparent">
                        <span className="headertext" style={{ textAlign: "start" }}>
                          {getInputTitle(rangeInputs[0], i18n.language || "en")}
                        </span>
                      </span>
                      <div className={styles.rangeSquare} ref={squareRef}>
                        <span
                          className={styles.rangeExpansionFrame}
                          style={{
                            top: `${75 - getExpansion("top")}px`,
                            right: `${75 - getExpansion("right")}px`,
                            bottom: `${75 - getExpansion("bottom")}px`,
                            left: `${75 - getExpansion("left")}px`,
                          }}
                          aria-hidden="true"
                        />
                        <div className={styles.rangeSquareInner}>
                          {sideInputs.map(({ input: sideInput, side }) => (
                            <output
                              className={`${styles.rangeValue} ${styles[`rangeValue${side[0].toUpperCase()}${side.slice(1)}`]}`}
                              key={sideInput.key}>
                              {(Number(clampRangeValue(sideInput, values[sideInput.key]).toFixed(2)) * 10).toFixed(1)}
                            </output>
                          ))}
                        </div>
                        {sideInputs.map(({ input: sideInput, side }) => {
                          const { min, max } = getRangeBounds(sideInput);
                          return (
                            <button
                              type="button"
                              key={sideInput.key}
                              className={`${styles.rangeHandle} ${styles[`rangeHandle${side[0].toUpperCase()}${side.slice(1)}`]}`}
                              style={{ "--range-expansion": `${getExpansion(side)}px` } as CSSProperties}
                              role="slider"
                              tabIndex={0}
                              aria-label={getInputTitle(sideInput, i18n.language || "en")}
                              aria-valuemin={min}
                              aria-valuemax={max}
                              aria-valuenow={clampRangeValue(sideInput, values[sideInput.key])}
                              onPointerDown={(event) => {
                                event.currentTarget.setPointerCapture(event.pointerId);
                                setDraggingSide(side);
                                setDragStart({
                                  coordinate: side === "top" || side === "bottom" ? event.clientY : event.clientX,
                                  value: clampRangeValue(sideInput, values[sideInput.key]),
                                });
                              }}
                              onPointerMove={(event) => {
                                if (!draggingSide || !dragStart || draggingSide !== side) return;
                                const squareSize = squareRef.current?.getBoundingClientRect().width || 250;
                                const expandableDistance = Math.max(1, (squareSize - 100) / 2);
                                const coordinate = side === "top" || side === "bottom" ? event.clientY : event.clientX;
                                const direction = side === "top" || side === "left" ? -1 : 1;
                                const nextValue =
                                  dragStart.value +
                                  (direction * (coordinate - dragStart.coordinate) * (max - min)) / expandableDistance;
                                setValues((current) => ({
                                  ...current,
                                  [sideInput.key]: Number(Math.min(Math.max(nextValue, min), max).toFixed(2)),
                                }));
                                invalidateUsage();
                              }}
                              onPointerUp={() => {
                                setDraggingSide(null);
                                setDragStart(null);
                              }}
                              onPointerCancel={() => {
                                setDraggingSide(null);
                                setDragStart(null);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                if (inputType === InputType.Range || inputType === InputType.IntRange) {
                  const { min: rangeMin, max: rangeMax } = getRangeBounds(input);
                  const isIntegerRange = inputType === InputType.IntRange;
                  const normalizedValue = isIntegerRange ? Math.round(Number(value)) : Number(value);
                  const rangeValue = Math.min(
                    Math.max(Number.isFinite(normalizedValue) ? normalizedValue : rangeMin, rangeMin),
                    rangeMax,
                  );
                  return (
                    <label className="headerandinput" key={input.key}>
                      <span className="headerparent">
                        <span className="headertext" style={{ textAlign: "start" }}>
                          {title}
                        </span>
                        <output className="headertext" style={{ textAlign: "start" }}>
                          {isIntegerRange ? String(Math.round(rangeValue)) : rangeValue.toFixed(2)}
                        </output>
                      </span>
                      <input
                        type="range"
                        min={rangeMin}
                        max={rangeMax}
                        step={isIntegerRange ? 1 : "any"}
                        value={rangeValue}
                        onChange={(event) => {
                          const nextValue = isIntegerRange
                            ? Math.round(event.currentTarget.valueAsNumber)
                            : Number(event.currentTarget.valueAsNumber.toFixed(2));
                          setValues((current) => ({ ...current, [input.key]: nextValue }));
                          invalidateUsage();
                        }}
                      />
                    </label>
                  );
                }
                if (inputType === InputType.Number) {
                  return (
                    <label className="headerandinput" key={input.key}>
                      <span className="headertext" style={{ textAlign: "start" }}>
                        {title}
                      </span>

                      <input
                        type="number"
                        min={input.min}
                        max={input.max || undefined}
                        value={Number(value)}
                        required={input.isRequired}
                        onChange={(event) => {
                          setValues((current) => ({ ...current, [input.key]: Number(event.target.value) }));
                          invalidateUsage();
                        }}
                      />
                    </label>
                  );
                }
                return (
                  <label className="headerandinput" key={input.key}>
                    <div className="headerparent">
                      <span className="headertext" style={{ textAlign: "start" }}>
                        {title}
                      </span>
                      <img
                        style={{ cursor: "pointer", width: "20px", height: "20px" }}
                        title="ℹ️ paste"
                        role="button"
                        tabIndex={0}
                        src="/copy.svg"
                        alt="Paste"
                        onClick={() => void pasteInputFromClipboard(input.key)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            void pasteInputFromClipboard(input.key);
                          }
                        }}
                      />
                    </div>
                    <TextArea
                      className="textArea"
                      minLength={input.minTextLength || undefined}
                      maxLength={input.maxTextLength || undefined}
                      value={String(value ?? "")}
                      required={input.isRequired && !allowsEmptyValue(input)}
                      minRows={1}
                      maxRows={4}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, [input.key]: event.target.value }));
                        invalidateUsage();
                      }}
                    />
                  </label>
                );
              })}
          </div>
        </div>
      </div>

      {/* create Media and Token Usage */}
      <footer className={styles.actionBar}>
        <div className={styles.Checktoken}>
          {tokenUsage !== null && tokenBalance ? (
            <div className={styles.tokenUsagePanel} onClick={() => void getImageUsage()}>
              <div className={styles.tokenUsageProgresscolumn}>
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
              <button
                type="button"
                className={`${styles.tokenUsageRefresh} ${usageLoading ? styles.tokenUsageRefreshLoading : ""}`}
                disabled={usageLoading || !promptIsValid || !requiredInputsAreValid || createMediaLoading}
                aria-label={t("TokenUsage")}
                title={t("TokenUsage")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  color="currentColor"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="24"
                  height="24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true">
                  <path d="M12 11.5v1m1-.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7.95 1q.05-.5.05-1A9 9 0 0 0 5 6.34M3.05 11A9 9 0 0 0 19 17.66" />
                  <path d="M8 7H7c-1.41 0-2.12 0-2.56-.44S4 5.41 4 4V3m12 14h1c1.41 0 2.12 0 2.56.44S20 18.59 20 20v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={
                usageLoading || !promptIsValid || !requiredInputsAreValid || createMediaLoading
                  ? styles.tokenBalanceDisable
                  : styles.tokenBalance
              }
              disabled={usageLoading || !promptIsValid || !requiredInputsAreValid || createMediaLoading}
              onClick={getImageUsage}>
              {usageLoading ? t("Calculating...") : t("TokenUsage")}
            </button>
          )}
        </div>
        <button
          type="submit"
          className={!promptIsValid || !requiredInputsAreValid || createMediaLoading ? "disableButton" : "saveButton"}
          disabled={!promptIsValid || !requiredInputsAreValid || createMediaLoading}>
          {createMediaLoading ? <RingLoader /> : t(isVideoCreator ? "Create video" : "Create image")}
        </button>
      </footer>
    </form>
  );
}
