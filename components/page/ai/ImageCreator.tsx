import { ChangeEvent, useEffect, useState } from "react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
} from "brancy/components/notifications/notificationBox";
import { MethodType, UploadFile } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { InputType } from "brancy/models/enums";
import { IGetImageUsageRequest, IImageCreator, IImageCreatorInput, IImageCreatorModel } from "brancy/models/interfaces";
import styles from "./ImageCreator.module.css";

type InputValue = string | number | boolean | string[];

interface UploadedMediaPreview {
  fileName: string;
  showUrl: string;
}

interface ImageCreatorProps {
  creators: IImageCreator[];
  error?: string;
  onRetry?: () => void;
  onCreateImage?: (selection: ImageCreatorSelection) => void;
}

export interface ImageCreatorSelection {
  creatorKey: string;
  modelName: string;
  prompt: string;
  values: Record<string, InputValue>;
}

const titleByLanguage: Record<string, keyof IImageCreatorInput> = {
  en: "titleEn",
  fa: "titleFa",
  tr: "titleTr",
  ar: "titleAr",
  fr: "titleFr",
  de: "titleDe",
  az: "titleAz",
};

function getInputTitle(input: IImageCreatorInput, language: string): string {
  const languageKey = titleByLanguage[language.split("-")[0]] ?? "titleEn";
  const localizedTitle = input[languageKey];
  return typeof localizedTitle === "string" && localizedTitle.trim() ? localizedTitle : input.titleEn || input.key;
}

function getInitialValues(model: IImageCreatorModel | undefined): Record<string, InputValue> {
  if (!model) return {};

  return model.inputModelTypes.reduce<Record<string, InputValue>>((values, input) => {
    if (input.inputType === InputType.Boolean) values[input.key] = false;
    else if (input.inputType === InputType.ImageArray || input.inputType === InputType.VideoArray)
      values[input.key] = [];
    else if (input.inputType === InputType.Number || input.inputType === InputType.Range) values[input.key] = input.min;
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
  input: IImageCreatorInput;
  value: string[];
  title: string;
  session: Session | null;
  onChange: (value: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews] = useState<UploadedMediaPreview[]>([]);
  const isVideo = input.inputType === InputType.VideoArray;
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
  input: IImageCreatorInput;
  value: InputValue;
  language: string;
  session: Session | null;
  onChange: (value: InputValue) => void;
}) {
  const title = getInputTitle(input, language);
  const options = input.enumValues ?? [];

  if (input.inputType === InputType.ImageArray || input.inputType === InputType.VideoArray) {
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

  if (input.inputType === InputType.Boolean) {
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

  if (input.inputType === InputType.EnumV1) {
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

  if (input.inputType === InputType.EnumV2) {
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

  if (input.inputType === InputType.Range) {
    return (
      <label className={styles.field}>
        <span className={styles.labelRow}>
          <span className={styles.label}>{title}</span>
          <output>{Number(value)}</output>
        </span>
        <input
          type="range"
          min={input.min}
          max={input.max}
          value={Number(value)}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
    );
  }

  if (input.inputType === InputType.Number) {
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

export default function ImageCreator({ creators, error, onRetry, onCreateImage }: ImageCreatorProps) {
  const { data: session } = useSession();
  const { i18n } = useTranslation();
  const [creatorKey, setCreatorKey] = useState(creators[0]?.key ?? "");
  const creator = creators.find((item) => item.key === creatorKey) ?? creators[0];
  const [modelName, setModelName] = useState(creator?.inputModels[0]?.name ?? "");
  const model = creator?.inputModels.find((item) => item.name === modelName) ?? creator?.inputModels[0];
  const [prompt, setPrompt] = useState("");
  const [values, setValues] = useState<Record<string, InputValue>>(() => getInitialValues(model));
  const [tokenUsage, setTokenUsage] = useState<number | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => {
    const nextCreator = creators.find((item) => item.key === creatorKey) ?? creators[0];
    if (!nextCreator) return;
    if (!creatorKey) setCreatorKey(nextCreator.key);
    if (!nextCreator.inputModels.some((item) => item.name === modelName))
      setModelName(nextCreator.inputModels[0]?.name ?? "");
  }, [creators, creatorKey, modelName]);

  useEffect(() => {
    setPrompt("");
    setValues(getInitialValues(model));
    setTokenUsage(null);
  }, [model?.name]);

  if (error) {
    return (
      <main className={styles.stateBox}>
        <h1>Image creator is unavailable</h1>
        <p>{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        )}
      </main>
    );
  }

  if (!creator || !model) {
    return (
      <main className={styles.stateBox}>
        <h1>No image models found</h1>
        <p>There are no image generation models available for this account.</p>
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
    const response = await clientFetchApi<IGetImageUsageRequest, number>("/api/mediaai/GetImageUsage", {
      session,
      methodType: MethodType.post,
      data: request,
    });
    setUsageLoading(false);

    if (response.succeeded && typeof response.value === "number") {
      setTokenUsage(response.value);
      return;
    }

    notify(response.info?.responseType, NotifType.Error, response.info?.message || response.errorMessage);
  };

  const invalidateUsage = () => setTokenUsage(null);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>AI studio</span>
          <h1>Create an image</h1>
          <p>Choose a model, tune its settings, and describe the image you want.</p>
        </div>
        {creators.length > 1 && (
          <label className={styles.creatorSelect}>
            <span>Provider</span>
            <select value={creator.key} onChange={(event) => setCreatorKey(event.target.value)}>
              {creators.map((item) => (
                <option value={item.key} key={item.key}>
                  {item.displayName}
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      <div className={styles.workspace}>
        <section className={styles.modelPanel} aria-label="Image models">
          <div className={styles.sectionHeading}>
            <span className={styles.step}>1</span>
            <div>
              <h2>Choose a model</h2>
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
                <span className={styles.modelMark}>{item.displayName.slice(0, 1)}</span>
                <span className={styles.modelText}>
                  <strong>{item.displayName}</strong>
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
              onCreateImage({ creatorKey: creator.key, modelName: model.name, prompt, values });
            }
          }}>
          <div className={styles.sectionHeading}>
            <span className={styles.step}>2</span>
            <div>
              <h2>Describe and customize</h2>
              <p>{model.displayName}</p>
            </div>
          </div>

          <label className={styles.promptField}>
            <span className={styles.labelRow}>
              <span className={styles.label}>Prompt</span>
              <span>
                {prompt.length} / {model.maxPromptLength}
              </span>
            </span>
            <textarea
              value={prompt}
              minLength={model.minPromptLength}
              maxLength={model.maxPromptLength}
              placeholder="Describe the subject, setting, light, composition, and style..."
              onChange={(event) => {
                setPrompt(event.target.value);
                invalidateUsage();
              }}
            />
            {prompt.length > 0 && prompt.length < model.minPromptLength && (
              <span className={styles.validation}>Use at least {model.minPromptLength} characters.</span>
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
                <span>Check token usage before creating the image</span>
              ) : (
                <span className={styles.tokenUsage}>{tokenUsage.toLocaleString()} tokens</span>
              )}
            </div>
            <button type="submit" disabled={usageLoading || !promptIsValid || !requiredInputsAreValid}>
              {usageLoading ? "Calculating..." : tokenUsage === null ? "Check usage" : "Create image"}
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
}
