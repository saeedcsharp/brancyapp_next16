import InputBox from "brancy/components/design/inputBox/inputBox";
import SwitchButton from "brancy/components/design/switchButton/switchButton";
import TextArea from "brancy/components/design/textArea/textArea";
import { internalNotify, InternalResponseType, NotifType } from "brancy/components/notifications/notificationBox";
import MediaCreator, { getUniqueModels } from "brancy/components/page/ai/mediaCreator";
import { UploadFile } from "brancy/helper/api";
import { CharacterType, InputType } from "brancy/models/enums";
import { IGetImageUsageRequest, IMediaCreator } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CharacterSheet.module.css";

type IdentityType = "human" | "product" | "object" | "animal" | "custom";
type CharacterSheetMode = "auto" | "advanced";
type SectionKey = "type" | "references" | "prompt" | "settings";

interface ReferenceItem {
  id: string;
  name: string;
  url: string;
  slotId: string;
  slotLabel: string;
  // null while the upload is in progress
  fileName: string | null;
}

interface ReferenceSlot {
  id: string;
  label: string;
  description: string;
}

interface CharacterSheetProps {
  creators: IMediaCreator[];
  onCreateMedia: (request: IGetImageUsageRequest, count: number) => Promise<boolean>;
  createMediaLoading: boolean;
  modelSelection: { creatorKey: string; modelName: string };
  onModelSelectionChange: (selection: { creatorKey: string; modelName: string }) => void;
  onOpenModelList: () => void;
}

const CHARACTER_SHEET_DRAFT_KEY = "character-sheet-local-draft-v2";
const DEFAULT_OPEN_SECTIONS: SectionKey[] = ["type", "references", "prompt", "settings"];
const SECTION_KEYS: SectionKey[] = ["type", "references", "prompt", "settings"];
const CHARACTER_TYPE_BY_IDENTITY: Record<IdentityType, CharacterType> = {
  human: CharacterType.Human,
  product: CharacterType.Product,
  object: CharacterType.Object,
  animal: CharacterType.Animal,
  custom: CharacterType.Custom,
};
const IDENTITY_TYPES: Array<{ id: IdentityType; label: string; description: string }> = [
  { id: "human", label: "Human", description: "People, characters, faces, clothing, and poses" },
  { id: "product", label: "Product", description: "Products, packaging, materials, and branding" },
  { id: "object", label: "Object", description: "Objects, shape, scale, texture, and details" },
  { id: "animal", label: "Animal", description: "Animals, anatomy, fur, and markings" },
  { id: "custom", label: "Custom", description: "Any other subject with a flexible identity" },
];
const REFERENCE_SLOTS: Record<IdentityType, ReferenceSlot[]> = {
  human: [
    { id: "face", label: "Face", description: "Clear front and 3/4 face references with visible features." },
    { id: "full-body", label: "Full body", description: "Head-to-toe view for proportions and silhouette." },
    { id: "style", label: "Style and clothing", description: "Outfit, styling, colors, and clothing details." },
    { id: "hair", label: "Hair and makeup", description: "Hair shape, color, texture, and makeup details." },
    { id: "body", label: "Body and proportions", description: "Clear body shape, posture, and proportion references." },
    { id: "accessories", label: "Accessories", description: "Glasses, jewelry, bags, shoes, or signature items." },
    { id: "details", label: "Distinctive details", description: "Scars, tattoos, marks, or other identity details." },
  ],
  product: [
    { id: "front", label: "Front view", description: "Primary product view with the full silhouette visible." },
    { id: "back-sides", label: "Back and sides", description: "Back, side, and construction details." },
    { id: "logo-branding", label: "Brand and logo", description: "Logo, brand mark, typography, and placement." },
    { id: "packaging", label: "Packaging", description: "Packaging shape, labels, and printed details." },
    {
      id: "material",
      label: "Material and surface",
      description: "Texture, finish, reflectivity, and material response.",
    },
    {
      id: "scale",
      label: "Scale and dimensions",
      description: "Product scale beside a hand, person, or known object.",
    },
    {
      id: "details",
      label: "Product details",
      description: "Buttons, ports, seams, caps, and distinctive components.",
    },
  ],
  object: [
    { id: "main-view", label: "Main view", description: "Primary view showing the complete object silhouette." },
    { id: "all-sides", label: "All sides", description: "Side, back, top, or underside views." },
    { id: "scale", label: "Scale reference", description: "Object beside a hand, person, table, or known object." },
    { id: "material", label: "Material and texture", description: "Surface, texture, finish, and material details." },
    { id: "components", label: "Components", description: "Separate parts, attachments, and construction details." },
    {
      id: "distinctive-details",
      label: "Distinctive details",
      description: "Marks, damage, patterns, or unique features.",
    },
  ],
  animal: [
    { id: "face", label: "Face and eyes", description: "Clear face, eyes, muzzle, and expression references." },
    { id: "full-body", label: "Full body", description: "Head-to-tail view for anatomy and proportions." },
    { id: "fur-markings", label: "Fur and markings", description: "Fur texture, colors, patterns, and markings." },
    { id: "profile", label: "Profile and ears", description: "Profile, ears, tail, and species-defining shape." },
    { id: "pose", label: "Pose and movement", description: "Natural standing, sitting, or movement references." },
    { id: "accessories", label: "Accessories", description: "Collar, tags, clothing, or identification details." },
  ],
  custom: [
    { id: "main-view", label: "Main view", description: "Primary reference showing the complete subject." },
    { id: "all-sides", label: "All sides", description: "Additional angles for silhouette and structure." },
    { id: "scale", label: "Scale reference", description: "A known object or environment for size comparison." },
    { id: "material", label: "Material and texture", description: "Surface, finish, texture, and material behavior." },
    { id: "components", label: "Components", description: "Parts, attachments, and internal or external details." },
    {
      id: "distinctive-details",
      label: "Distinctive details",
      description: "Any feature that must remain recognizable.",
    },
  ],
};
const TYPE_PROMPTS: Record<IdentityType, string> = {
  human:
    "Create a consistent human character sheet with stable facial features, body proportions, clothing, expressions, and poses across every view.",
  product:
    "Create a product identity sheet with accurate shape, dimensions, materials, colors, branding, and details across every view.",
  object:
    "Create a consistent object identity sheet with clear shape, scale, materials, texture, silhouette, and distinctive details.",
  animal:
    "Create a consistent animal identity sheet with stable species, anatomy, fur, markings, colors, and distinctive features across every view.",
  custom:
    "Create a consistent custom subject identity sheet with stable silhouette, materials, colors, components, and user-defined identity rules.",
};

function TypeIcon({ type }: { type: IdentityType }) {
  const commonProps = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (type === "human")
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="7" r="4" />
        <path d="M4.5 21c.5-5 3-7.5 7.5-7.5s7 2.5 7.5 7.5" />
      </svg>
    );
  if (type === "product")
    return (
      <svg {...commonProps}>
        <path d="m4 7 8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10" />
      </svg>
    );
  if (type === "object")
    return (
      <svg {...commonProps}>
        <path d="M8 21h8M12 17v4M5 5.5 12 2l7 3.5v8L12 17l-7-3.5zM5 5.5l7 4 7-4M12 9.5V17" />
      </svg>
    );
  if (type === "animal")
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="13" r="5" />
        <circle cx="6" cy="6" r="2" />
        <circle cx="11" cy="4" r="2" />
        <circle cx="16" cy="5" r="2" />
        <circle cx="19" cy="9" r="2" />
      </svg>
    );
  return (
    <svg {...commonProps}>
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function AccordionSection({
  sectionKey,
  sectionNumber,
  title,
  description,
  openSections,
  onToggle,
  children,
}: {
  sectionKey: SectionKey;
  sectionNumber: string;
  title: string;
  description: string;
  openSections: Set<SectionKey>;
  onToggle: (key: SectionKey) => void;
  children: ReactNode;
}) {
  const isOpen = openSections.has(sectionKey);
  return (
    <section className={`${styles.accordionSection} ${isOpen ? styles.accordionSectionOpen : ""}`}>
      <button
        type="button"
        className={styles.accordionHeader}
        aria-expanded={isOpen}
        onClick={() => onToggle(sectionKey)}>
        <span className={styles.accordionIndex}>{sectionNumber}</span>
        <span className={styles.accordionCopy}>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <span className={styles.accordionChevron} aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && <div className={styles.accordionBody}>{children}</div>}
    </section>
  );
}

export default function CharacterSheet({
  creators,
  onCreateMedia,
  createMediaLoading,
  modelSelection,
  onModelSelectionChange,
  onOpenModelList,
}: CharacterSheetProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [identityType, setIdentityType] = useState<IdentityType>("human");
  const [characterSheetMode, setCharacterSheetMode] = useState<CharacterSheetMode>("auto");
  const [identityName, setIdentityName] = useState("");
  const [description, setDescription] = useState("");
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(DEFAULT_OPEN_SECTIONS));
  const [promptToUse, setPromptToUse] = useState<{ key: string; text: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const referenceUrlsRef = useRef(new Set<string>());
  const referenceIdRef = useRef(0);
  const draftLoadedRef = useRef(false);

  useEffect(
    () => () => {
      referenceUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      referenceUrlsRef.current.clear();
    },
    [],
  );

  const availableCreators = useMemo(
    () =>
      creators
        .map((item) => ({ ...item, inputModels: getUniqueModels(item.inputModels) }))
        .filter((item) => item.inputModels.length > 0),
    [creators],
  );
  const creator = availableCreators.find((item) => item.key === modelSelection.creatorKey) ?? availableCreators[0];
  const model = creator?.inputModels.find((item) => item.name === modelSelection.modelName) ?? creator?.inputModels[0];
  const referenceInput = model?.inputModelTypes.find((input) => Number(input.inputType) === InputType.ImageArray);
  const maxReferences = referenceInput ? referenceInput.maxArrayLength || 1 : 0;
  const referenceAccept =
    referenceInput?.fileTypes
      ?.map((type) => type.trim())
      .filter(Boolean)
      .map((type) => (type.startsWith(".") ? type : `.${type}`))
      .join(",") || "image/*";
  const isUploading = uploadProgress !== null;
  const canAddReference = !!referenceInput && !!session && !isUploading && references.length < maxReferences;
  const selectedType = IDENTITY_TYPES.find((item) => item.id === identityType) ?? IDENTITY_TYPES[0];
  const referenceSlots = REFERENCE_SLOTS[identityType];

  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(CHARACTER_SHEET_DRAFT_KEY);
      if (!rawDraft) return;
      const draft = JSON.parse(rawDraft) as {
        identityType?: IdentityType;
        characterSheetMode?: CharacterSheetMode;
        identityName?: string;
        description?: string;
        openSections?: SectionKey[];
      };
      if (draft.identityType && IDENTITY_TYPES.some((option) => option.id === draft.identityType)) {
        setIdentityType(draft.identityType);
      }
      if (draft.characterSheetMode === "auto" || draft.characterSheetMode === "advanced") {
        setCharacterSheetMode(draft.characterSheetMode);
      }
      if (typeof draft.identityName === "string") setIdentityName(draft.identityName);
      if (typeof draft.description === "string") setDescription(draft.description);
      if (Array.isArray(draft.openSections)) {
        setOpenSections(new Set(draft.openSections.filter((key) => SECTION_KEYS.includes(key))));
      }
    } catch {
      localStorage.removeItem(CHARACTER_SHEET_DRAFT_KEY);
    } finally {
      draftLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!draftLoadedRef.current) return;
    try {
      localStorage.setItem(
        CHARACTER_SHEET_DRAFT_KEY,
        JSON.stringify({
          identityType,
          characterSheetMode,
          identityName,
          description,
          openSections: Array.from(openSections),
        }),
      );
    } catch {
      // Storage can fail in privacy mode or on quota errors; keep state in memory only.
    }
  }, [characterSheetMode, description, identityName, identityType, openSections]);

  // MediaCreator clears its prompt on model change, so the type template is re-applied per model.
  useEffect(() => {
    if (!creator || !model) return;
    setPromptToUse({ key: `${identityType}-${creator.key}-${model.name}`, text: TYPE_PROMPTS[identityType] });
  }, [creator?.key, identityType, model?.name]);

  const externalMediaValues = useMemo(
    () =>
      referenceInput
        ? {
            [referenceInput.key]: references
              .map((reference) => reference.fileName)
              .filter((fileName): fileName is string => !!fileName)
              .slice(0, maxReferences),
          }
        : undefined,
    [maxReferences, referenceInput, references],
  );
  const requestExtras = useMemo(
    () => ({
      characterType: CHARACTER_TYPE_BY_IDENTITY[identityType],
      characterName: identityName.trim() || null,
      characterDescription: description.trim() || null,
    }),
    [description, identityName, identityType],
  );

  const toggleSection = (sectionKey: SectionKey) =>
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(sectionKey)) next.delete(sectionKey);
      else next.add(sectionKey);
      return next;
    });

  const removeReference = (reference: ReferenceItem) => {
    URL.revokeObjectURL(reference.url);
    referenceUrlsRef.current.delete(reference.url);
    setReferences((current) => current.filter((item) => item.id !== reference.id));
  };

  const handleReferenceFiles = async (
    event: ChangeEvent<HTMLInputElement>,
    slotId = "general",
    slotLabel = "General reference",
  ) => {
    const requestedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    const capacity = Math.max(0, maxReferences - references.length);
    if (requestedFiles.length > capacity) {
      internalNotify(InternalResponseType.ExceedPermittedUploadMedia, NotifType.Warning);
    }
    const selectedFiles = requestedFiles.slice(0, capacity);
    if (!session || !selectedFiles.length) return;
    const pending = selectedFiles.map((file) => {
      const url = URL.createObjectURL(file);
      referenceUrlsRef.current.add(url);
      referenceIdRef.current += 1;
      const reference: ReferenceItem = {
        id: `reference-${referenceIdRef.current}`,
        name: file.name,
        url,
        slotId,
        slotLabel,
        fileName: null,
      };
      return { file, reference };
    });
    setReferences((current) => [...current, ...pending.map((item) => item.reference)]);
    for (const { file, reference } of pending) {
      setUploadProgress(0);
      let fileName = "";
      try {
        fileName = (await UploadFile(session, file, setUploadProgress)).fileName;
      } catch {
        fileName = "";
      }
      if (fileName) {
        setReferences((current) => current.map((item) => (item.id === reference.id ? { ...item, fileName } : item)));
      } else {
        removeReference(reference);
      }
    }
    setUploadProgress(null);
  };

  const resetAllDraft = () => {
    referenceUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    referenceUrlsRef.current.clear();
    setReferences([]);
    setIdentityType("human");
    setCharacterSheetMode("auto");
    setIdentityName("");
    setDescription("");
    setOpenSections(new Set(DEFAULT_OPEN_SECTIONS));
    localStorage.removeItem(CHARACTER_SHEET_DRAFT_KEY);
  };

  const renderAddReferenceButton = (label: string, slotId?: string, slotLabel?: string) => (
    <label className={canAddReference ? styles.fileButton : styles.fileButtonDisabled}>
      {label}
      <input
        type="file"
        accept={referenceAccept}
        multiple={maxReferences > 1}
        onChange={(event) => void handleReferenceFiles(event, slotId, slotLabel)}
        disabled={!canAddReference}
      />
    </label>
  );

  const headerContent = (
    <>
      <AccordionSection
        sectionKey="type"
        sectionNumber="01"
        title={t("Choose the subject type")}
        description={t("Select what the character sheet represents.")}
        openSections={openSections}
        onToggle={toggleSection}>
        <div className={styles.typeGrid} role="radiogroup" aria-label={t("Identity type")}>
          {IDENTITY_TYPES.map((option) => (
            <button
              type="button"
              className={`${styles.typeButton} ${identityType === option.id ? styles.typeButtonActive : ""}`}
              key={option.id}
              role="radio"
              aria-checked={identityType === option.id}
              onClick={() => setIdentityType(option.id)}>
              <span className={styles.typeIcon}>
                <TypeIcon type={option.id} />
              </span>
              <span className={styles.typeText}>
                <strong>{t(option.label)}</strong>
                <small>{t(option.description)}</small>
              </span>
              <span className={styles.selectionMark} aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className={styles.selectionHint}>
          {t("Selected type")}: <strong>{t(selectedType.label)}</strong>
        </p>
        <div className={styles.modeControl}>
          <div className={styles.modeCopy}>
            <strong>{t("Reference mode")}</strong>
            <small>{t("Advanced groups reference images into type-specific slots.")}</small>
          </div>
          <div className={styles.modeSwitch}>
            <span>{t("Auto")}</span>
            <SwitchButton
              name="character-sheet-mode"
              checked={characterSheetMode === "advanced"}
              handleToggle={(event) => setCharacterSheetMode(event.target.checked ? "advanced" : "auto")}
              role="switch"
              aria-label={t("Reference mode")}
            />
            <span>{t("Advanced")}</span>
          </div>
        </div>
        <button
          type="button"
          className={styles.dangerButton}
          onClick={() => {
            if (window.confirm(t("Reset all local draft data?"))) resetAllDraft();
          }}>
          {t("Reset all local draft")}
        </button>
      </AccordionSection>
      <AccordionSection
        sectionKey="references"
        sectionNumber="02"
        title={t("Add reference images")}
        description={t("The number of reference images comes from the selected model.")}
        openSections={openSections}
        onToggle={toggleSection}>
        {!referenceInput ? (
          <div className={styles.emptyReferences}>{t("The selected model does not accept reference images.")}</div>
        ) : (
          <>
            {characterSheetMode === "advanced" && (
              <div className={styles.referenceSlotGrid}>
                {referenceSlots.map((slot) => (
                  <article className={styles.referenceSlot} key={slot.id}>
                    <div className={styles.referenceSlotHeader}>
                      <div>
                        <strong>{t(slot.label)}</strong>
                        <small>{t(slot.description)}</small>
                      </div>
                      <span>{references.filter((reference) => reference.slotId === slot.id).length}</span>
                    </div>
                    {renderAddReferenceButton(t("Add reference"), slot.id, slot.label)}
                  </article>
                ))}
              </div>
            )}
            <div className={styles.referenceToolbar}>
              <span>
                ({references.length} / {maxReferences}){isUploading ? ` ${uploadProgress}%` : ""}
              </span>
              {renderAddReferenceButton(t(characterSheetMode === "advanced" ? "Add other references" : "Add images"))}
            </div>
            {references.length > maxReferences && (
              <p className={styles.selectionHint}>
                {t("Only the first references are sent")}: {maxReferences}
              </p>
            )}
            <div className={styles.referenceGrid}>
              {references.map((reference) => (
                <article className={styles.referenceCard} key={reference.id}>
                  <div className={`${styles.referencePreview} ${reference.fileName ? "" : "fadeDiv"}`}>
                    <img src={reference.url} alt={reference.name} />
                    <button
                      type="button"
                      className={styles.removeReference}
                      onClick={() => removeReference(reference)}
                      disabled={!reference.fileName}
                      aria-label={t("Remove reference")}>
                      ×
                    </button>
                  </div>
                  <span title={`${reference.slotLabel}: ${reference.name}`}>
                    <strong>{t(reference.slotLabel)}</strong>
                    {reference.name}
                  </span>
                </article>
              ))}
              {!references.length && (
                <div className={styles.emptyReferences}>{t("No reference images selected yet.")}</div>
              )}
            </div>
          </>
        )}
      </AccordionSection>
    </>
  );

  const renderPromptSection = (content: ReactNode) => (
    <AccordionSection
      sectionKey="prompt"
      sectionNumber="03"
      title={t("Write the prompt")}
      description={t("Start with the prepared prompt and edit it for this identity.")}
      openSections={openSections}
      onToggle={toggleSection}>
      <label className={styles.labeledControl}>
        <span>{t("Identity name")}</span>
        <InputBox
          value={identityName}
          handleInputChange={(event) => setIdentityName(event.target.value)}
          placeholder={t("Example: Alex or Brancy Phone")}
          clearable={false}
          ariaLabel={t("Identity name")}
        />
      </label>
      <label className={styles.labeledControl}>
        <span>{t("Identity description")}</span>
        <TextArea
          className="textArea"
          minRows={2}
          maxRows={5}
          autoResize
          value={description}
          placeholder={t("Describe the subject and the traits that must remain recognizable.")}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      {content}
    </AccordionSection>
  );

  const renderSettingsSection = (content: ReactNode) => (
    <AccordionSection
      sectionKey="settings"
      sectionNumber="04"
      title={t("Configure the output")}
      description={t("Settings come from the selected model.")}
      openSections={openSections}
      onToggle={toggleSection}>
      {content}
    </AccordionSection>
  );

  return (
    <MediaCreator
      creators={creators}
      onCreateMedia={onCreateMedia}
      createMediaLoading={createMediaLoading}
      setActiveTab={() => undefined}
      activeTab="createimage"
      modelSelection={modelSelection}
      onModelSelectionChange={onModelSelectionChange}
      onOpenModelList={onOpenModelList}
      promptToUse={promptToUse}
      hideMediaTabs
      headerContent={headerContent}
      externalMediaValues={externalMediaValues}
      requestExtras={requestExtras}
      renderPromptSection={renderPromptSection}
      renderSettingsSection={renderSettingsSection}
    />
  );
}
