import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InputType } from "brancy/models/enums";
import { IImageCreator, IImageCreatorInput, IImageCreatorModel } from "brancy/models/interfaces";
import styles from "./ImageCreator.module.css";

type InputValue = string | number | boolean | File[];

interface ImageCreatorProps {
  creators: IImageCreator[];
  error?: string;
  onRetry?: () => void;
  onGenerate?: (selection: ImageCreatorSelection) => void;
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
  onChange,
}: {
  input: IImageCreatorInput;
  value: File[];
  title: string;
  onChange: (value: File[]) => void;
}) {
  const isVideo = input.inputType === InputType.VideoArray;
  const accept = input.fileTypes?.map((type) => `.${type}`).join(",") || (isVideo ? "video/*" : "image/*");
  const maximum = input.maxArrayLength || 1;

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []).slice(0, Math.max(0, maximum - value.length));
    onChange([...value, ...selectedFiles]);
    event.target.value = "";
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>
        {title} {input.isRequired && <span className={styles.required}>*</span>}
      </legend>
      <label className={styles.uploadBox}>
        <span className={styles.uploadIcon}>{isVideo ? "▶" : "+"}</span>
        <span className={styles.uploadTitle}>{isVideo ? "Add video" : "Add reference image"}</span>
        <span className={styles.hint}>
          {value.length} / {maximum} {input.fileTypes?.join(", ") || (isVideo ? "video" : "image")}
        </span>
        <input
          className={styles.visuallyHidden}
          type="file"
          accept={accept}
          multiple={maximum > 1}
          disabled={value.length >= maximum}
          onChange={handleFiles}
        />
      </label>
      {value.length > 0 && (
        <div className={styles.fileList}>
          {value.map((file, index) => (
            <div className={styles.fileItem} key={`${file.name}-${file.lastModified}`}>
              <span title={file.name}>{file.name}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}

function DynamicInput({
  input,
  value,
  language,
  onChange,
}: {
  input: IImageCreatorInput;
  value: InputValue;
  language: string;
  onChange: (value: InputValue) => void;
}) {
  const title = getInputTitle(input, language);
  const options = input.enumValues ?? [];

  if (input.inputType === InputType.ImageArray || input.inputType === InputType.VideoArray) {
    return <FileInput input={input} value={Array.isArray(value) ? value : []} title={title} onChange={onChange} />;
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

export default function ImageCreator({ creators, error, onRetry, onGenerate }: ImageCreatorProps) {
  const { i18n } = useTranslation();
  const [creatorKey, setCreatorKey] = useState(creators[0]?.key ?? "");
  const creator = creators.find((item) => item.key === creatorKey) ?? creators[0];
  const [modelName, setModelName] = useState(creator?.inputModels[0]?.name ?? "");
  const model = creator?.inputModels.find((item) => item.name === modelName) ?? creator?.inputModels[0];
  const [prompt, setPrompt] = useState("");
  const [values, setValues] = useState<Record<string, InputValue>>(() => getInitialValues(model));

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
            if (onGenerate && promptIsValid && requiredInputsAreValid) {
              onGenerate({ creatorKey: creator.key, modelName: model.name, prompt, values });
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
              onChange={(event) => setPrompt(event.target.value)}
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
                  onChange={(value) => setValues((current) => ({ ...current, [input.key]: value }))}
                />
              ))}
          </div>

          {onGenerate && (
            <footer className={styles.actionBar}>
              <div>
                <strong>{model.displayName}</strong>
                <span>Review the selected options before generating</span>
              </div>
              <button type="submit" disabled={!promptIsValid || !requiredInputsAreValid}>
                Generate image
              </button>
            </footer>
          )}
        </form>
      </div>
    </main>
  );
}
