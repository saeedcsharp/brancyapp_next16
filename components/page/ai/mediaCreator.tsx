import RingLoader from "brancy/components/design/loader/ringLoder";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
} from "brancy/components/notifications/notificationBox";
import { MethodType, UploadFile } from "brancy/helper/api";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { InputType } from "brancy/models/enums";
import { IGetImageUsageRequest, IMediaCreator, IMediaCreatorInput, IMediaCreatorModel } from "brancy/models/interfaces";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./mediaCreator.module.css";

type InputValue = string | number | boolean | string[];
type MediaTab = "image" | "video" | "createimage" | "createvideo";
interface UploadedMediaPreview {
  fileName: string;
  showUrl: string;
}

interface MediaCreatorProps {
  creators: IMediaCreator[];
  error?: string;
  onRetry?: () => void;
  onCreateImage?: (request: IGetImageUsageRequest, count: number) => void;
  createImageLoading?: boolean;
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
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>
        {title} {input.isRequired && <span className={styles.required}>*</span>}
      </legend>
      <label className={styles.uploadBox}>
        <span className={styles.uploadIcon}>{isVideo ? "▶" : "+"}</span>
        <span className={styles.uploadTitle}>
          {uploading ? `Uploading ${uploadProgress}%` : isVideo ? "Add video" : "Add reference image"}
        </span>
        <span className={styles.hint}>
          {value.length} / {maximum} {input.fileTypes?.join(", ") || (isVideo ? "video" : "image")}
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
    </fieldset>
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
      <label className={styles.field}>
        <span className={styles.label}>{title}</span>
        <select
          value={String(value ?? "")}
          required={input.isRequired}
          onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (inputType === InputType.EnumV2) {
    return (
      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>{title}</legend>
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
      </fieldset>
    );
  }

  if (inputType === InputType.Range) {
    const rangeMinValue = Number(input.min);
    const rangeMaxValue = Number(input.max);
    const rangeMin = Number.isFinite(rangeMinValue) ? rangeMinValue : 0;
    const rangeMax = Number.isFinite(rangeMaxValue) && rangeMaxValue > rangeMin ? rangeMaxValue : rangeMin + 1;
    const valueNumber = Number(value);
    const rangeValue = Math.min(Math.max(Number.isFinite(valueNumber) ? valueNumber : rangeMin, rangeMin), rangeMax);

    return (
      <label className={styles.field}>
        <span className={styles.labelRow}>
          <span className={styles.label}>{title}</span>
          <output>{rangeValue}</output>
        </span>
        <input
          type="range"
          min={rangeMin}
          max={rangeMax}
          step="any"
          value={rangeValue}
          onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
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
  onCreateImage,
  createImageLoading,
  activeTab,
}: MediaCreatorProps) {
  const { data: session } = useSession();
  const { t, i18n } = useTranslation();
  const availableCreators = creators.filter((item) => item.inputModels.length > 0);
  const [creatorKey, setCreatorKey] = useState(availableCreators[0]?.key ?? "");
  const creator = availableCreators.find((item) => item.key === creatorKey) ?? availableCreators[0];
  const [modelName, setModelName] = useState(creator?.inputModels[0]?.name ?? "");
  const model = creator?.inputModels.find((item) => item.name === modelName) ?? creator?.inputModels[0];
  const [prompt, setPrompt] = useState("");
  const [values, setValues] = useState<Record<string, InputValue>>(() => getInitialValues(model));
  const [tokenUsage, setTokenUsage] = useState<number | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

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

  if (error) {
    return (
      <main className={styles.stateBox}>
        <h1>{t("Image creator is unavailable")}</h1>
        <p>{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            {t("Try again")}
          </button>
        )}
      </main>
    );
  }

  if (!creator || !model) {
    return (
      <main className={styles.stateBox}>
        <h1>{t("No image models found")}</h1>
        <p>{t("There are no image generation models available for this account.")}</p>
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

  const selectCreator = (nextCreatorKey: string) => {
    const nextCreator = availableCreators.find((item) => item.key === nextCreatorKey);
    if (!nextCreator || nextCreator.key === creator.key) return;
    setCreatorKey(nextCreator.key);
    setModelName(nextCreator.inputModels[0].name);
  };

  return (
    <main className={styles.page}>
      <div className={styles.backRow}>
        <div
          className={styles.backLink}
          onClick={() => {
            activeTab === "createimage" ? setActiveTab("image") : setActiveTab("video");
          }}
          role="button"
          tabIndex={0}>
          <span aria-hidden="true">←</span>
          {activeTab === "createimage" ? t("Back to images") : t("Back to videos")}
        </div>
      </div>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>AI studio</span>
          <h1>{activeTab === "createimage" ? t("Create an image") : t("Create a video")}</h1>
          <p>{t("Choose a model, tune its settings, and describe the image you want.")}</p>
        </div>
      </header>

      {availableCreators.length > 1 && (
        <section className={styles.creatorPanel} aria-labelledby="creator-heading">
          <div className={styles.creatorHeading}>
            <span id="creator-heading">{t("AI provider")}</span>
            <small>{t("Choose a provider to see its available models")}</small>
          </div>
          <div className={styles.creatorList}>
            {availableCreators.map((item) => {
              const isActive = item.key === creator.key;
              return (
                <button
                  className={isActive ? styles.creatorActive : styles.creator}
                  type="button"
                  aria-pressed={isActive}
                  key={item.key}
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
                      {item.inputModels.length} {item.inputModels.length === 1 ? "model" : "models"}
                    </small>
                  </span>
                  <span className={styles.creatorCheck} aria-hidden="true">
                    {isActive ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className={styles.workspace}>
        <section className={styles.modelPanel} aria-label="Image models">
          <div className={styles.sectionHeading}>
            <span className={styles.step}>1</span>
            <div>
              <h2>{t("Choose a model")}</h2>
              <p>{creator.displayName}</p>
            </div>
          </div>
          <div className={styles.modelList}>
            {creator.inputModels.map((item) => (
              <button
                type="button"
                className={item.name === model.name ? styles.modelActive : styles.model}
                key={item.name}
                onClick={() => setModelName(item.name)}>
                <span className={styles.modelMark}>
                  {item.displayName ? item.displayName.slice(0, 1) : item.name.slice(0, 1)}
                </span>
                <span className={styles.modelText}>
                  <strong>{item.displayName ?? item.name}</strong>
                  <small>{item.name}</small>
                </span>
                <span className={styles.cost} aria-label={`Cost level ${item.expensiveType + 1}`}>
                  {"$".repeat(item.expensiveType + 1)}
                </span>
              </button>
            ))}
          </div>
        </section>

        <form
          className={styles.settingsPanel}
          onSubmit={(event) => {
            event.preventDefault();
            if (tokenUsage === null) {
              getImageUsage();
            } else if (onCreateImage) {
              onCreateImage(
                {
                  creatorKey: creator.key,
                  version: model.name,
                  inputs: model.inputModelTypes.map((input) => ({
                    key: input.key,
                    value: serializeInputValue(values[input.key]),
                  })),
                  prompt,
                },
                tokenUsage,
              );
            }
          }}>
          <div className={styles.sectionHeading}>
            <span className={styles.step}>2</span>
            <div>
              <h2>{t("Describe and customize")}</h2>
              <p>{model.displayName}</p>
            </div>
          </div>

          <label className={styles.promptField}>
            <span className={styles.labelRow}>
              <span className={styles.label}>{t("Prompt")}</span>
              <span>
                {prompt.length} / {model.maxPromptLength}
              </span>
            </span>
            <textarea
              value={prompt}
              minLength={model.minPromptLength}
              maxLength={model.maxPromptLength}
              placeholder={t("Describe the subject, setting, light, composition, and style...")}
              onChange={(event) => {
                setPrompt(event.target.value);
                invalidateUsage();
              }}
            />
            {prompt.length > 0 && prompt.length < model.minPromptLength && (
              <span className={styles.validation}>
                {t("Use at least {count} characters.", { count: model.minPromptLength })}
              </span>
            )}
          </label>

          <div className={styles.dynamicFields}>
            {[...model.inputModelTypes]
              .sort((first, second) => first.orderId - second.orderId)
              .map((input) => (
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
              ))}
          </div>

          <footer className={styles.actionBar}>
            <div>
              <strong>{model.displayName}</strong>
              {tokenUsage === null ? (
                <span>{t("Check token usage before creating the image")}</span>
              ) : (
                <span className={styles.tokenUsage}>{tokenUsage.toLocaleString()} tokens</span>
              )}
            </div>
            <button
              type="submit"
              disabled={usageLoading || !promptIsValid || !requiredInputsAreValid || createImageLoading}>
              {createImageLoading ? (
                <RingLoader />
              ) : usageLoading ? (
                "Calculating..."
              ) : tokenUsage === null ? (
                "Check usage"
              ) : (
                "Create image"
              )}
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
}
