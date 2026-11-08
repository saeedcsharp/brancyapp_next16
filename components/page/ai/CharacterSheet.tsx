import InputBox from "brancy/components/design/inputBox/inputBox";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import SwitchButton from "brancy/components/design/switchButton/switchButton";
import TextArea from "brancy/components/design/textArea/textArea";
import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CharacterSheet.module.css";

type IdentityType = "human" | "product" | "object" | "animal" | "custom";
type CharacterSheetMode = "auto" | "advanced";
type SectionKey = "type" | "references" | "attributes" | "prompt" | "settings";
type FieldKind = "text" | "select" | "number" | "color";
type PromptPreviewMode = "readable" | "json";

interface ReferenceItem {
  id: string;
  name: string;
  url: string;
  slotId: string;
  slotLabel: string;
}

interface ReferenceSlot {
  id: string;
  label: string;
  description: string;
}

interface CharacterSettings {
  identityName: string;
  visualStyle: string;
  lighting: string;
  background: string;
  views: string[];
  detailLevel: string;
  consistency: number;
  creativity: number;
  outputCount: number;
  aspectRatio: string;
  resolution: string;
}

interface AttributeField {
  key: string;
  label: string;
  kind?: FieldKind;
  options?: string[];
  placeholder?: string;
  unit?: string;
}

interface AttributeSection {
  title: string;
  fields: AttributeField[];
}

interface EditorSnapshot {
  identityType: IdentityType;
  characterSheetMode: CharacterSheetMode;
  prompt: string;
  negativePrompt: string;
  description: string;
  identityRules: string;
  consistencyRules: string;
  attributes: Record<string, string>;
  lockedAttributes: Record<string, boolean>;
  settings: CharacterSettings;
}

const MAX_REFERENCES = 14;
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
    { id: "material", label: "Material and surface", description: "Texture, finish, reflectivity, and material response." },
    { id: "scale", label: "Scale and dimensions", description: "Product scale beside a hand, person, or known object." },
    { id: "details", label: "Product details", description: "Buttons, ports, seams, caps, and distinctive components." },
  ],
  object: [
    { id: "main-view", label: "Main view", description: "Primary view showing the complete object silhouette." },
    { id: "all-sides", label: "All sides", description: "Side, back, top, or underside views." },
    { id: "scale", label: "Scale reference", description: "Object beside a hand, person, table, or known object." },
    { id: "material", label: "Material and texture", description: "Surface, texture, finish, and material details." },
    { id: "components", label: "Components", description: "Separate parts, attachments, and construction details." },
    { id: "distinctive-details", label: "Distinctive details", description: "Marks, damage, patterns, or unique features." },
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
    { id: "distinctive-details", label: "Distinctive details", description: "Any feature that must remain recognizable." },
  ],
};
const VISUAL_STYLES = [
  "Photorealistic",
  "Cinematic",
  "Editorial",
  "Commercial",
  "3D",
  "Anime",
  "Illustration",
  "Stylized",
];
const LIGHTING_OPTIONS = ["Neutral Studio", "Studio", "Softbox", "Cinematic", "Natural", "Hard Light", "Soft Light"];
const BACKGROUND_OPTIONS = ["White", "Gray", "Black", "Transparent", "Gradient", "Studio"];
const VIEW_OPTIONS = ["Front", "Back", "Left", "Right", "3/4 Left", "3/4 Right", "Profile", "Top", "Detail"];
const DETAIL_LEVELS = ["Standard", "High", "Ultra", "Maximum"];
const DEFAULT_PROMPT =
  "Create a consistent character sheet for the selected subject. Preserve the subject's identity across every view, pose, expression, material, color, and detail. Use the reference images as the visual source of truth and keep the result clear, coherent, and production-ready.";
const DEFAULT_ATTRIBUTE_COLOR = "#2977ff";
const CHARACTER_SHEET_DRAFT_KEY = "character-sheet-local-draft-v1";
const DEFAULT_OPEN_SECTIONS: SectionKey[] = ["type", "references", "prompt", "settings"];

const TYPE_PROMPT_CONFIG: Record<
  IdentityType,
  {
    prompt: string;
    negativePrompt: string;
    identityRules: string;
    consistencyRules: string;
  }
> = {
  human: {
    prompt:
      "Create a consistent human character sheet with stable facial features, body proportions, clothing, expressions, and poses across every view.",
    negativePrompt: "No distorted anatomy, extra limbs, duplicate accessories, inconsistent face, or heavy blur.",
    identityRules:
      "Preserve facial proportions, hairline, skin details, signature clothing, and recognizable accessories.",
    consistencyRules: "Keep identity and outfit stable while allowing controlled pose and expression changes.",
  },
  product: {
    prompt:
      "Create a product identity sheet with accurate shape, dimensions, materials, colors, branding, and details across every view.",
    negativePrompt: "No floating logos, no fake text, no warped geometry, no dramatic shadows.",
    identityRules: "Preserve the exact silhouette, material response, color accents, dimensions, and logo placement.",
    consistencyRules: "Keep geometry, branding, materials, and proportions stable between all selected views.",
  },
  object: {
    prompt:
      "Create a consistent object identity sheet with clear shape, scale, materials, texture, silhouette, and distinctive details.",
    negativePrompt: "No altered proportions, missing components, random accessories, clutter, or unclear textures.",
    identityRules:
      "Preserve the object's silhouette, scale reference, materials, surface texture, and distinctive features.",
    consistencyRules: "Keep shape, proportions, components, and surface details stable across every view.",
  },
  animal: {
    prompt:
      "Create a consistent animal identity sheet with stable species, anatomy, fur, markings, colors, and distinctive features across every view.",
    negativePrompt: "No incorrect anatomy, extra legs, changed markings, unnatural fur, or distorted face.",
    identityRules: "Preserve species traits, face shape, eyes, fur pattern, markings, and identification accessories.",
    consistencyRules: "Keep anatomy, markings, colors, and recognizable features stable while allowing natural poses.",
  },
  custom: {
    prompt:
      "Create a consistent custom subject identity sheet with stable silhouette, materials, colors, components, and user-defined identity rules.",
    negativePrompt:
      "No unintended components, inconsistent silhouette, random materials, clutter, or unexplained details.",
    identityRules: "Preserve the described silhouette, materials, colors, components, and distinctive custom features.",
    consistencyRules: "Keep all user-defined identity rules stable across every selected view and variation.",
  },
};

function createDefaultSettings(): CharacterSettings {
  return {
    identityName: "",
    visualStyle: "Photorealistic",
    lighting: "Neutral Studio",
    background: "White",
    views: ["Front", "Back", "Left", "Right"],
    detailLevel: "High",
    consistency: 95,
    creativity: 40,
    outputCount: 12,
    aspectRatio: "4:5",
    resolution: "High",
  };
}

function AttributeLockIcon({ locked }: { locked: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d={locked ? "M8 10V7a4 4 0 0 1 8 0v3" : "M8 10V7a4 4 0 0 1 7-3"} />
    </svg>
  );
}

function isMeaningfulAttributeValue(field: AttributeField, value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim();
  if (!normalized) return false;
  if (field.kind === "select" && normalized.toLowerCase() === "auto") return false;
  if (field.kind === "color" && normalized.toLowerCase() === DEFAULT_ATTRIBUTE_COLOR) return false;
  return true;
}

function toSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "untitled-identity";
}

const ATTRIBUTE_SECTIONS: Record<IdentityType, AttributeSection[]> = {
  human: [
    {
      title: "Basic appearance",
      fields: [
        { key: "gender", label: "Gender", kind: "select", options: ["Auto", "Female", "Male", "Non-binary", "Custom"] },
        {
          key: "age",
          label: "Age range",
          kind: "select",
          options: ["Auto", "Child", "Teen", "Young Adult", "Adult", "Middle-aged", "Senior", "Custom"],
        },
        { key: "ethnicity", label: "Ethnicity / appearance", placeholder: "Auto" },
        { key: "skinTone", label: "Skin tone", placeholder: "Auto" },
        { key: "overallAppearance", label: "Overall appearance", placeholder: "Auto" },
      ],
    },
    {
      title: "Face",
      fields: [
        { key: "faceShape", label: "Face shape", placeholder: "Auto" },
        { key: "forehead", label: "Forehead", placeholder: "Auto" },
        { key: "eyebrows", label: "Eyebrows", placeholder: "Auto" },
        { key: "eyes", label: "Eyes", placeholder: "Auto" },
        { key: "nose", label: "Nose", placeholder: "Auto" },
        { key: "lips", label: "Lips", placeholder: "Auto" },
        { key: "jawline", label: "Jawline", placeholder: "Auto" },
        { key: "cheeks", label: "Cheeks", placeholder: "Auto" },
        { key: "chin", label: "Chin", placeholder: "Auto" },
        { key: "ears", label: "Ears", placeholder: "Auto" },
        { key: "beard", label: "Beard", placeholder: "Auto" },
        { key: "mustache", label: "Mustache", placeholder: "Auto" },
        { key: "facialDetails", label: "Freckles, moles, scars", placeholder: "Auto" },
        { key: "skinTexture", label: "Skin texture / makeup", placeholder: "Auto" },
      ],
    },
    {
      title: "Hair",
      fields: [
        { key: "hairStyle", label: "Hair style", placeholder: "Auto" },
        { key: "hairLength", label: "Hair length", placeholder: "Auto" },
        { key: "hairTexture", label: "Hair texture", placeholder: "Auto" },
        { key: "hairColor", label: "Hair color", placeholder: "Auto" },
        { key: "hairDensity", label: "Hair density", placeholder: "Auto" },
        { key: "hairline", label: "Hairline", placeholder: "Auto" },
      ],
    },
    {
      title: "Body",
      fields: [
        { key: "height", label: "Height", kind: "number", placeholder: "Auto", unit: "cm" },
        { key: "bodyType", label: "Body type", placeholder: "Auto" },
        { key: "bodyShape", label: "Body shape", placeholder: "Auto" },
        { key: "build", label: "Build", placeholder: "Auto" },
        { key: "shoulderWidth", label: "Shoulder width", placeholder: "Auto" },
        { key: "waist", label: "Waist", placeholder: "Auto" },
        { key: "legProportion", label: "Leg proportion", placeholder: "Auto" },
        { key: "armProportion", label: "Arm proportion", placeholder: "Auto" },
      ],
    },
    {
      title: "Clothing and styling",
      fields: [
        { key: "top", label: "Top", placeholder: "Auto" },
        { key: "bottom", label: "Bottom", placeholder: "Auto" },
        { key: "shoes", label: "Shoes", placeholder: "Auto" },
        { key: "outerwear", label: "Outerwear", placeholder: "Auto" },
        { key: "headwear", label: "Headwear", placeholder: "Auto" },
        { key: "glasses", label: "Glasses", placeholder: "Auto" },
        { key: "jewelry", label: "Jewelry", placeholder: "Auto" },
        { key: "bag", label: "Bag", placeholder: "Auto" },
        { key: "watch", label: "Watch", placeholder: "Auto" },
        {
          key: "clothingConsistency",
          label: "Clothing consistency",
          kind: "select",
          options: ["Always Preserve", "Preserve Style", "Allow Variation"],
        },
        {
          key: "culturalClothing",
          label: "Clothing direction",
          kind: "select",
          options: [
            "Auto",
            "Hijab",
            "Chador",
            "Headscarf",
            "Modest Clothing",
            "Formal",
            "Casual",
            "Traditional",
            "Uniform",
            "Custom",
          ],
        },
        { key: "accessories", label: "Accessories", placeholder: "Auto" },
        { key: "distinguishingHumanFeatures", label: "Distinctive features", placeholder: "Auto" },
      ],
    },
  ],
  product: [
    {
      title: "Product definition",
      fields: [
        {
          key: "productType",
          label: "Product type",
          kind: "select",
          options: [
            "Auto",
            "Electronics",
            "Cosmetics",
            "Food",
            "Clothing",
            "Furniture",
            "Vehicle",
            "Packaging",
            "Tool",
            "Device",
            "Accessory",
            "Custom",
          ],
        },
        { key: "productCategory", label: "Category", placeholder: "Auto" },
        { key: "overallShape", label: "Overall shape", placeholder: "Auto" },
        { key: "proportions", label: "Proportions", placeholder: "Auto" },
        { key: "edges", label: "Edges", placeholder: "Auto" },
        { key: "corners", label: "Corners", placeholder: "Auto" },
        { key: "symmetry", label: "Symmetry", placeholder: "Auto" },
      ],
    },
    {
      title: "Dimensions",
      fields: [
        { key: "width", label: "Width", kind: "number", unit: "cm" },
        { key: "productHeight", label: "Height", kind: "number", unit: "cm" },
        { key: "depth", label: "Depth", kind: "number", unit: "cm" },
        { key: "weight", label: "Weight", kind: "number", unit: "kg" },
        { key: "dimensionRatio", label: "Aspect ratio", placeholder: "Auto" },
      ],
    },
    {
      title: "Material and surface",
      fields: [
        {
          key: "material",
          label: "Primary material",
          kind: "select",
          options: [
            "Auto",
            "Plastic",
            "Metal",
            "Glass",
            "Wood",
            "Leather",
            "Fabric",
            "Ceramic",
            "Carbon Fiber",
            "Rubber",
            "Paper",
            "Mixed",
            "Custom",
          ],
        },
        {
          key: "surface",
          label: "Surface",
          kind: "select",
          options: [
            "Auto",
            "Glossy",
            "Matte",
            "Satin",
            "Metallic",
            "Transparent",
            "Reflective",
            "Textured",
            "Rough",
            "Smooth",
            "Custom",
          ],
        },
        { key: "roughness", label: "Roughness", placeholder: "Auto" },
        { key: "reflectivity", label: "Reflectivity", placeholder: "Auto" },
        { key: "transparency", label: "Transparency", placeholder: "Auto" },
        {
          key: "materialAccuracy",
          label: "Material accuracy",
          kind: "select",
          options: ["Low", "Medium", "High", "Maximum"],
        },
      ],
    },
    {
      title: "Colors and branding",
      fields: [
        { key: "primaryColor", label: "Primary color", kind: "color" },
        { key: "secondaryColor", label: "Secondary color", kind: "color" },
        { key: "accentColor", label: "Accent color", kind: "color" },
        { key: "materialColor", label: "Material color", kind: "color" },
        { key: "logoColor", label: "Logo color", kind: "color" },
        { key: "logoPosition", label: "Logo position", placeholder: "Auto" },
        { key: "logoSize", label: "Logo size", placeholder: "Auto" },
        { key: "brandMark", label: "Brand mark", placeholder: "Auto" },
        { key: "typography", label: "Typography", placeholder: "Auto" },
        { key: "packagingText", label: "Label / packaging text", placeholder: "Auto" },
        { key: "serialNumber", label: "Serial number", placeholder: "Optional" },
      ],
    },
    {
      title: "Product details",
      fields: [
        { key: "buttons", label: "Buttons", placeholder: "Auto" },
        { key: "ports", label: "Ports", placeholder: "Auto" },
        { key: "handle", label: "Handle", placeholder: "Auto" },
        { key: "cap", label: "Cap", placeholder: "Auto" },
        { key: "packaging", label: "Packaging", placeholder: "Auto" },
        { key: "productAccessories", label: "Accessories", placeholder: "Auto" },
      ],
    },
  ],
  object: [
    {
      title: "Object structure",
      fields: [
        { key: "objectCategory", label: "Category", placeholder: "Auto" },
        { key: "objectShape", label: "Shape", placeholder: "Auto" },
        { key: "objectSize", label: "Size", placeholder: "Auto" },
        { key: "objectProportions", label: "Proportions", placeholder: "Auto" },
        { key: "objectMaterial", label: "Material", placeholder: "Auto" },
        { key: "objectTexture", label: "Texture", placeholder: "Auto" },
        { key: "objectStyle", label: "Style", placeholder: "Auto" },
      ],
    },
    {
      title: "Dimensions and scale",
      fields: [
        { key: "objectWidth", label: "Width", kind: "number", unit: "cm" },
        { key: "objectHeight", label: "Height", kind: "number", unit: "cm" },
        { key: "objectDepth", label: "Depth", kind: "number", unit: "cm" },
        {
          key: "objectScale",
          label: "Scale reference",
          kind: "select",
          options: ["Auto", "Human", "Hand", "Table", "Room", "Vehicle", "Custom"],
        },
      ],
    },
    {
      title: "Object details",
      fields: [
        { key: "objectPrimaryColor", label: "Primary color", kind: "color" },
        { key: "objectSecondaryColor", label: "Secondary color", kind: "color" },
        { key: "objectComponents", label: "Components", placeholder: "Auto" },
        { key: "objectDetails", label: "Details", placeholder: "Auto" },
        { key: "objectDistinctiveFeatures", label: "Distinctive features", placeholder: "Auto" },
      ],
    },
  ],
  animal: [
    {
      title: "Animal definition",
      fields: [
        { key: "species", label: "Species", placeholder: "Auto" },
        { key: "breed", label: "Breed", placeholder: "Auto" },
        { key: "animalAge", label: "Age", placeholder: "Auto" },
        { key: "animalSize", label: "Size", placeholder: "Auto" },
        { key: "animalFace", label: "Face", placeholder: "Auto" },
        { key: "animalBody", label: "Body", placeholder: "Auto" },
        { key: "animalEyes", label: "Eyes", placeholder: "Auto" },
      ],
    },
    {
      title: "Fur and markings",
      fields: [
        { key: "furColor", label: "Fur color", placeholder: "Auto" },
        { key: "furPattern", label: "Fur pattern", placeholder: "Auto" },
        { key: "furLength", label: "Fur length", placeholder: "Auto" },
        { key: "furTexture", label: "Fur texture", placeholder: "Auto" },
        { key: "markings", label: "Distinctive markings", placeholder: "Auto" },
      ],
    },
    {
      title: "Animal details",
      fields: [
        { key: "animalAccessories", label: "Accessories", placeholder: "Auto" },
        { key: "animalDistinctiveFeatures", label: "Distinctive features", placeholder: "Auto" },
        { key: "collar", label: "Collar / identification", placeholder: "Auto" },
        { key: "animalColorPalette", label: "Color notes", placeholder: "Auto" },
      ],
    },
  ],
  custom: [
    {
      title: "Custom subject",
      fields: [
        { key: "customCategory", label: "Subject category", placeholder: "Describe the subject" },
        { key: "customShape", label: "Shape and silhouette", placeholder: "Auto" },
        { key: "customScale", label: "Scale", placeholder: "Auto" },
        { key: "customMaterial", label: "Material", placeholder: "Auto" },
        { key: "customTexture", label: "Texture", placeholder: "Auto" },
        { key: "customFeatures", label: "Distinctive features", placeholder: "Auto" },
      ],
    },
    {
      title: "Custom details",
      fields: [
        { key: "customPrimaryColor", label: "Primary color", kind: "color" },
        { key: "customSecondaryColor", label: "Secondary color", kind: "color" },
        { key: "customComponents", label: "Components", placeholder: "Auto" },
        { key: "customDetails", label: "Details", placeholder: "Auto" },
        { key: "customRules", label: "Identity rules", placeholder: "Auto" },
      ],
    },
  ],
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

function ChoiceGroup({
  options,
  selected,
  onChange,
  multiple = false,
  ariaLabel,
}: {
  options: string[];
  selected: string | string[];
  onChange: (value: string) => void;
  multiple?: boolean;
  ariaLabel: string;
}) {
  const isSelected = (option: string) => (Array.isArray(selected) ? selected.includes(option) : selected === option);
  return (
    <div className={styles.choiceGroup} role={multiple ? "group" : "radiogroup"} aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          className={`${styles.choiceButton} ${isSelected(option) ? styles.choiceButtonActive : ""}`}
          role={multiple ? undefined : "radio"}
          aria-checked={multiple ? undefined : isSelected(option)}
          aria-pressed={multiple ? isSelected(option) : undefined}
          onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
    </div>
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

export default function CharacterSheet() {
  const { t, i18n } = useTranslation();
  const [identityType, setIdentityType] = useState<IdentityType>("human");
  const [characterSheetMode, setCharacterSheetMode] = useState<CharacterSheetMode>("auto");
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [description, setDescription] = useState("");
  const [identityRules, setIdentityRules] = useState("");
  const [consistencyRules, setConsistencyRules] = useState("");
  const [previewMode, setPreviewMode] = useState<PromptPreviewMode>("readable");
  const [copied, setCopied] = useState<"idle" | "ok" | "error">("idle");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [lockedAttributes, setLockedAttributes] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(DEFAULT_OPEN_SECTIONS));
  const [settings, setSettings] = useState<CharacterSettings>(createDefaultSettings);
  const referenceUrlsRef = useRef(new Set<string>());
  const referenceIdRef = useRef(0);
  const draftLoadedRef = useRef(false);
  const historyRef = useRef<EditorSnapshot[]>([]);
  const historyIndexRef = useRef(-1);
  const restoringHistoryRef = useRef(false);
  const [, refreshHistory] = useState(0);

  useEffect(
    () => () => {
      referenceUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      referenceUrlsRef.current.clear();
    },
    [],
  );

  const selectedType = IDENTITY_TYPES.find((item) => item.id === identityType) ?? IDENTITY_TYPES[0];
  const isRtl = i18n.dir() === "rtl";
  const visibleSectionKeys = useMemo<SectionKey[]>(
    () =>
      characterSheetMode === "advanced"
        ? ["type", "references", "attributes", "prompt", "settings"]
        : DEFAULT_OPEN_SECTIONS,
    [characterSheetMode],
  );
  const sectionNumberMap = useMemo(
    () => new Map(visibleSectionKeys.map((key, index) => [key, String(index + 1).padStart(2, "0")])),
    [visibleSectionKeys],
  );
  const selectedAttributeSections = ATTRIBUTE_SECTIONS[identityType];
  const referenceSlots = REFERENCE_SLOTS[identityType];

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawDraft = localStorage.getItem(CHARACTER_SHEET_DRAFT_KEY);
      if (!rawDraft) {
        draftLoadedRef.current = true;
        return;
      }
      const draft = JSON.parse(rawDraft) as {
        identityType?: IdentityType;
        characterSheetMode?: CharacterSheetMode;
        prompt?: string;
        negativePrompt?: string;
        description?: string;
        identityRules?: string;
        consistencyRules?: string;
        attributes?: Record<string, string>;
        lockedAttributes?: Record<string, boolean>;
        settings?: Partial<CharacterSettings>;
        openSections?: SectionKey[];
        previewMode?: PromptPreviewMode;
      };
      if (draft.identityType && IDENTITY_TYPES.some((option) => option.id === draft.identityType)) {
        setIdentityType(draft.identityType);
      }
      if (draft.characterSheetMode === "auto" || draft.characterSheetMode === "advanced") {
        setCharacterSheetMode(draft.characterSheetMode);
      }
      if (typeof draft.prompt === "string") setPrompt(draft.prompt);
      if (typeof draft.negativePrompt === "string") setNegativePrompt(draft.negativePrompt);
      if (typeof draft.description === "string") setDescription(draft.description);
      if (typeof draft.identityRules === "string") setIdentityRules(draft.identityRules);
      if (typeof draft.consistencyRules === "string") setConsistencyRules(draft.consistencyRules);
      if (draft.attributes && typeof draft.attributes === "object") setAttributes(draft.attributes);
      if (draft.lockedAttributes && typeof draft.lockedAttributes === "object")
        setLockedAttributes(draft.lockedAttributes);
      if (draft.settings && typeof draft.settings === "object") {
        setSettings({
          ...createDefaultSettings(),
          ...draft.settings,
          views: Array.isArray(draft.settings.views)
            ? draft.settings.views.filter((view): view is string => typeof view === "string")
            : createDefaultSettings().views,
        });
      }
      if (Array.isArray(draft.openSections)) {
        const safeKeys = draft.openSections.filter(
          (key): key is SectionKey =>
            key === "type" || key === "references" || key === "attributes" || key === "prompt" || key === "settings",
        );
        setOpenSections(new Set(safeKeys));
      }
      if (draft.previewMode === "json" || draft.previewMode === "readable") setPreviewMode(draft.previewMode);
    } catch {
      localStorage.removeItem(CHARACTER_SHEET_DRAFT_KEY);
    } finally {
      draftLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !draftLoadedRef.current) return;
    const draftToPersist = {
      identityType,
      characterSheetMode,
      prompt,
      negativePrompt,
      description,
      identityRules,
      consistencyRules,
      attributes,
      lockedAttributes,
      settings,
      openSections: Array.from(openSections),
      previewMode,
    };
    try {
      localStorage.setItem(CHARACTER_SHEET_DRAFT_KEY, JSON.stringify(draftToPersist));
    } catch {
      // Storage can fail in privacy mode or quota errors. Keep local state only.
    }
  }, [
    attributes,
    characterSheetMode,
    description,
    identityRules,
    identityType,
    lockedAttributes,
    negativePrompt,
    openSections,
    previewMode,
    prompt,
    settings,
    consistencyRules,
  ]);

  useEffect(() => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (characterSheetMode !== "advanced") next.delete("attributes");
      return next;
    });
  }, [characterSheetMode]);

  const createSnapshot = (): EditorSnapshot => ({
    identityType,
    characterSheetMode,
    prompt,
    negativePrompt,
    description,
    identityRules,
    consistencyRules,
    attributes,
    lockedAttributes,
    settings,
  });

  useEffect(() => {
    if (restoringHistoryRef.current) {
      restoringHistoryRef.current = false;
      return;
    }
    const snapshot = createSnapshot();
    const currentSnapshot = historyRef.current[historyIndexRef.current];
    if (currentSnapshot && JSON.stringify(currentSnapshot) === JSON.stringify(snapshot)) return;
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(snapshot);
    historyRef.current = nextHistory.slice(-30);
    historyIndexRef.current = historyRef.current.length - 1;
    refreshHistory((value) => value + 1);
  }, [
    attributes,
    characterSheetMode,
    consistencyRules,
    description,
    identityRules,
    identityType,
    negativePrompt,
    prompt,
    settings,
  ]);

  const restoreSnapshot = (snapshot: EditorSnapshot) => {
    restoringHistoryRef.current = true;
    setIdentityType(snapshot.identityType);
    setCharacterSheetMode(snapshot.characterSheetMode);
    setPrompt(snapshot.prompt);
    setNegativePrompt(snapshot.negativePrompt);
    setDescription(snapshot.description);
    setIdentityRules(snapshot.identityRules);
    setConsistencyRules(snapshot.consistencyRules);
    setAttributes(snapshot.attributes);
    setLockedAttributes(snapshot.lockedAttributes);
    setSettings(snapshot.settings);
  };

  const undo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    restoreSnapshot(historyRef.current[historyIndexRef.current]);
    refreshHistory((value) => value + 1);
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    restoreSnapshot(historyRef.current[historyIndexRef.current]);
    refreshHistory((value) => value + 1);
  };

  const updateSettings = (patch: Partial<CharacterSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const updateAttribute = (key: string, value: string) => setAttributes((current) => ({ ...current, [key]: value }));
  const toggleAttributeLock = (key: string) => setLockedAttributes((current) => ({ ...current, [key]: !current[key] }));
  const toggleSection = (sectionKey: SectionKey) =>
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(sectionKey)) next.delete(sectionKey);
      else next.add(sectionKey);
      return next;
    });
  const toggleView = (view: string) =>
    updateSettings({
      views: settings.views.includes(view) ? settings.views.filter((item) => item !== view) : [...settings.views, view],
    });
  const handleReferenceFiles = (
    event: ChangeEvent<HTMLInputElement>,
    slotId = "general",
    slotLabel = "General reference",
  ) => {
    const files = Array.from(event.target.files ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, MAX_REFERENCES - references.length);
    const addedReferences = files.map((file) => {
      const url = URL.createObjectURL(file);
      referenceUrlsRef.current.add(url);
      referenceIdRef.current += 1;
      return { id: `reference-${referenceIdRef.current}`, name: file.name, url, slotId, slotLabel };
    });
    if (addedReferences.length) setReferences((current) => [...current, ...addedReferences]);
    event.target.value = "";
  };
  const removeReference = (reference: ReferenceItem) => {
    URL.revokeObjectURL(reference.url);
    referenceUrlsRef.current.delete(reference.url);
    setReferences((current) => current.filter((item) => item.id !== reference.id));
  };

  const applyTypePrompt = (type: IdentityType) => {
    const typePrompt = TYPE_PROMPT_CONFIG[type];
    setPrompt(typePrompt.prompt);
    setNegativePrompt(typePrompt.negativePrompt);
    setIdentityRules(typePrompt.identityRules);
    setConsistencyRules(typePrompt.consistencyRules);
  };

  const resetAttributes = () => {
    setAttributes({});
    setLockedAttributes({});
  };

  const resetAllDraft = () => {
    referenceUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    referenceUrlsRef.current.clear();
    setReferences([]);
    setIdentityType("human");
    setCharacterSheetMode("auto");
    setPrompt(DEFAULT_PROMPT);
    setNegativePrompt("");
    setDescription("");
    setIdentityRules("");
    setConsistencyRules("");
    setAttributes({});
    setLockedAttributes({});
    setPreviewMode("readable");
    setOpenSections(new Set(DEFAULT_OPEN_SECTIONS));
    setSettings(createDefaultSettings());
    if (typeof window !== "undefined") {
      localStorage.removeItem(CHARACTER_SHEET_DRAFT_KEY);
    }
  };

  const attributeCompletion = useMemo(() => {
    let total = 0;
    let completed = 0;
    selectedAttributeSections.forEach((section) => {
      section.fields.forEach((field) => {
        total += 1;
        if (isMeaningfulAttributeValue(field, attributes[field.key])) completed += 1;
      });
    });
    return { total, completed };
  }, [attributes, selectedAttributeSections]);

  const renderAttributeField = (field: AttributeField) => {
    const value = attributes[field.key] ?? (field.kind === "color" ? DEFAULT_ATTRIBUTE_COLOR : "");
    const isLocked = Boolean(lockedAttributes[field.key]);
    return (
      <div className={styles.attributeField} key={field.key}>
        <div className={styles.attributeFieldHeader}>
          <span>{t(field.label)}</span>
          <button
            type="button"
            className={styles.attributeLockButton}
            aria-label={t(isLocked ? "Unlock attribute" : "Lock attribute")}
            aria-pressed={isLocked}
            title={t(isLocked ? "Unlock attribute" : "Lock attribute")}
            onClick={() => toggleAttributeLock(field.key)}>
            <AttributeLockIcon locked={isLocked} />
          </button>
        </div>
        <div className={isLocked ? "fadeDiv" : ""}>
          {field.kind === "select" ? (
            <DragDrop
              data={(field.options ?? []).map((option) => (
                <div id={option} key={option}>
                  {t(option)}
                </div>
              ))}
              item={Math.max(0, (field.options ?? []).findIndex((option) => option === value))}
              handleOptionSelect={(id) => updateAttribute(field.key, String(id))}
              disabled={isLocked}
            />
          ) : field.kind === "color" ? (
            <span className={styles.colorInputWrap}>
              <input
                type="color"
                value={value}
                disabled={isLocked}
                onChange={(event) => updateAttribute(field.key, event.target.value)}
                aria-label={t(field.label)}
              />
              <code>{value.toUpperCase()}</code>
            </span>
          ) : (
            <InputBox
              value={value}
              handleInputChange={(event) => updateAttribute(field.key, event.target.value)}
              placeholder={t(field.placeholder ?? "Auto")}
              variant={field.kind === "number" ? "number" : "default"}
              inputMode={field.kind === "number" ? "numeric" : "text"}
              unit={field.unit}
              disabled={isLocked}
              clearable={false}
              ariaLabel={t(field.label)}
            />
          )}
        </div>
      </div>
    );
  };
  const renderAttributeSections = () => (
    <div className={styles.attributeSections}>
      {selectedAttributeSections.map((section) => (
        <section className={styles.attributeSection} key={section.title}>
          <h3>{t(section.title)}</h3>
          <div className={styles.attributeGrid}>{section.fields.map(renderAttributeField)}</div>
        </section>
      ))}
    </div>
  );
  const promptPayload = useMemo(
    () => ({
      identity: {
        type: identityType,
        name: settings.identityName || "Untitled identity",
        description,
        rules: identityRules,
      },
      mode: characterSheetMode,
      prompt: {
        base: prompt.trim() || DEFAULT_PROMPT,
        negative: negativePrompt,
        consistencyRules,
      },
      attributes,
      lockedAttributes: Object.fromEntries(
        Object.entries(lockedAttributes)
          .filter(([, isLocked]) => isLocked)
          .map(([key]) => [
            key,
            {
              value: attributes[key] || "Auto",
              instruction:
                "Preserve this attribute exactly without any change. Use the reference images as the source of truth.",
            },
          ]),
      ),
      references: references.map(({ name, slotId, slotLabel }) => ({ name, slotId, slotLabel })),
      settings,
    }),
    [
      attributes,
      characterSheetMode,
      consistencyRules,
      description,
      identityRules,
      identityType,
      lockedAttributes,
      negativePrompt,
      prompt,
      references,
      settings,
    ],
  );
  const promptJson = useMemo(() => JSON.stringify(promptPayload, null, 2), [promptPayload]);
  const readablePrompt = useMemo(() => {
    const lines = [
      `Identity type: ${selectedType.label}`,
      `Identity name: ${settings.identityName || "Untitled identity"}`,
      `Mode: ${characterSheetMode}`,
      "",
      "Main prompt:",
      prompt.trim() || DEFAULT_PROMPT,
      "",
      "Negative prompt:",
      negativePrompt || "-",
      "",
      "Identity rules:",
      identityRules || "-",
      "",
      "Consistency rules:",
      consistencyRules || "-",
      "",
      "Locked attributes:",
      Object.entries(promptPayload.lockedAttributes).length
        ? Object.entries(promptPayload.lockedAttributes)
            .map(([key, item]) => `${key}: ${item.value} (preserve exactly; use reference images as source of truth)`)
            .join("\n")
        : "-",
      "",
      `References: ${references.length ? references.map((item) => item.name).join(", ") : "none"}`,
      `Attributes completed: ${attributeCompletion.completed}/${attributeCompletion.total}`,
    ];
    return lines.join("\n");
  }, [
    attributeCompletion.completed,
    attributeCompletion.total,
    characterSheetMode,
    consistencyRules,
    identityRules,
    promptPayload.lockedAttributes,
    negativePrompt,
    prompt,
    references,
    selectedType.label,
    settings.identityName,
  ]);
  const previewText = previewMode === "json" ? promptJson : readablePrompt;

  const copyPreview = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setCopied("error");
      return;
    }
    try {
      await navigator.clipboard.writeText(previewText);
      setCopied("ok");
    } catch {
      setCopied("error");
    }
  };

  const downloadPreview = () => {
    if (typeof window === "undefined") return;
    const extension = previewMode === "json" ? "json" : "txt";
    const fileName = `${toSlug(settings.identityName || `${identityType}-character-sheet`)}.${extension}`;
    const contentType = previewMode === "json" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8";
    const blob = new Blob([previewText], { type: contentType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  useEffect(() => {
    if (copied === "idle") return;
    const timer = window.setTimeout(() => setCopied("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <form
      className={`${styles.right} ${styles.characterSheet}`}
      dir={isRtl ? "rtl" : "ltr"}
      onSubmit={(event) => event.preventDefault()}>
      <div className={`${styles.mediaCreatorContainer} ${styles.identityContainer}`}>
        <header className={styles.identityHeader}>
          <div className={styles.identityTitle}>
            <span className={styles.identityMark}>
              <TypeIcon type={identityType} />
            </span>
            <div>
              <h1>{t("Character Sheet")}</h1>
              <p>{t("Build one consistent visual identity from references, a prompt, and editable settings.")}</p>
            </div>
          </div>
          <span className={styles.statusBadge}>{t("Local draft")}</span>
        </header>
        <div className={styles.topActions}>
          <div className={styles.expandCollapseActions} role="group" aria-label={t("History controls")}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={undo}
              disabled={historyIndexRef.current <= 0}>
              {t("Undo")}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={redo}
              disabled={historyIndexRef.current >= historyRef.current.length - 1}>
              {t("Redo")}
            </button>
          </div>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => {
              if (typeof window === "undefined") return;
              if (window.confirm(t("Reset all local draft data?"))) resetAllDraft();
            }}>
            {t("Reset all local draft")}
          </button>
        </div>
        <div className={styles.accordionList}>
          <AccordionSection
            sectionKey="type"
            sectionNumber={sectionNumberMap.get("type") ?? "01"}
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
                  onClick={() => {
                    setIdentityType(option.id);
                    applyTypePrompt(option.id);
                  }}>
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
                <strong>{t("Attribute mode")}</strong>
                <small>{t("Auto uses the selected subject type without manual attributes.")}</small>
              </div>
              <div className={styles.modeSwitch}>
                <span>{t("Auto")}</span>
                <SwitchButton
                  name="character-sheet-mode"
                  checked={characterSheetMode === "advanced"}
                  handleToggle={(event) => setCharacterSheetMode(event.target.checked ? "advanced" : "auto")}
                  role="switch"
                  aria-label={t("Attribute mode")}
                />
                <span>{t("Advanced")}</span>
              </div>
            </div>
          </AccordionSection>
          <AccordionSection
            sectionKey="references"
            sectionNumber={sectionNumberMap.get("references") ?? "02"}
            title={t("Add reference images")}
            description={t("Add up to 14 images. They stay in this browser only.")}
            openSections={openSections}
            onToggle={toggleSection}>
            {characterSheetMode === "advanced" && (
              <div className={styles.referenceSlotGrid}>
                {referenceSlots.map((slot) => {
                  const slotReferences = references.filter((reference) => reference.slotId === slot.id);
                  return (
                    <article className={styles.referenceSlot} key={slot.id}>
                      <div className={styles.referenceSlotHeader}>
                        <div>
                          <strong>{t(slot.label)}</strong>
                          <small>{t(slot.description)}</small>
                        </div>
                        <span>{slotReferences.length}</span>
                      </div>
                      <label
                        className={references.length >= MAX_REFERENCES ? styles.fileButtonDisabled : styles.fileButton}>
                        {t("Add reference")}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(event) => handleReferenceFiles(event, slot.id, slot.label)}
                          disabled={references.length >= MAX_REFERENCES}
                        />
                      </label>
                    </article>
                  );
                })}
              </div>
            )}
            <div className={styles.referenceToolbar}>
              <span>
                {references.length} / {MAX_REFERENCES} {t("references")}
              </span>
              <label className={references.length >= MAX_REFERENCES ? styles.fileButtonDisabled : styles.fileButton}>
                {t(characterSheetMode === "advanced" ? "Add other references" : "Add images")}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => handleReferenceFiles(event)}
                  disabled={references.length >= MAX_REFERENCES}
                />
              </label>
            </div>
            <div className={styles.referenceGrid}>
              {references.map((reference) => (
                <article className={styles.referenceCard} key={reference.id}>
                  <div className={styles.referencePreview}>
                    <img src={reference.url} alt={reference.name} />
                    <button
                      type="button"
                      className={styles.removeReference}
                      onClick={() => removeReference(reference)}
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
          </AccordionSection>
          {characterSheetMode === "advanced" && (
            <AccordionSection
              sectionKey="attributes"
              sectionNumber={sectionNumberMap.get("attributes") ?? "03"}
              title={t("Define identity attributes")}
              description={t("All options from the selected Human, Product, Object, Animal, or Custom model.")}
              openSections={openSections}
              onToggle={toggleSection}>
              <div className={styles.referenceToolbar}>
                <span>
                  {t("Completed")}: {attributeCompletion.completed} / {attributeCompletion.total}
                </span>
                <button type="button" className={styles.secondaryButton} onClick={resetAttributes}>
                  {t("Reset attributes")}
                </button>
              </div>
              {renderAttributeSections()}
            </AccordionSection>
          )}
          <AccordionSection
            sectionKey="prompt"
            sectionNumber={sectionNumberMap.get("prompt") ?? "04"}
            title={t("Write the prompt")}
            description={t("Start with the prepared prompt and edit it for this identity.")}
            openSections={openSections}
            onToggle={toggleSection}>
            <label className={styles.labeledControl}>
              <span>{t("Identity name")}</span>
              <InputBox
                value={settings.identityName}
                handleInputChange={(event) => updateSettings({ identityName: event.target.value })}
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
            <label className={styles.labeledControl}>
              <span>{t("Prompt")}</span>
              <TextArea
                className="textArea"
                minRows={7}
                maxRows={16}
                autoResize
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </label>
            <label className={styles.labeledControl}>
              <span>{t("Negative prompt")}</span>
              <TextArea
                className="textArea"
                minRows={2}
                maxRows={6}
                autoResize
                value={negativePrompt}
                placeholder={t("Describe what must be avoided in outputs.")}
                onChange={(event) => setNegativePrompt(event.target.value)}
              />
            </label>
            <label className={styles.labeledControl}>
              <span>{t("Identity rules")}</span>
              <TextArea
                className="textArea"
                minRows={2}
                maxRows={6}
                autoResize
                value={identityRules}
                placeholder={t("Always-preserve identity constraints.")}
                onChange={(event) => setIdentityRules(event.target.value)}
              />
            </label>
            <label className={styles.labeledControl}>
              <span>{t("Consistency rules")}</span>
              <TextArea
                className="textArea"
                minRows={2}
                maxRows={6}
                autoResize
                value={consistencyRules}
                placeholder={t("Rules for keeping consistency across all views.")}
                onChange={(event) => setConsistencyRules(event.target.value)}
              />
            </label>
          </AccordionSection>
          <AccordionSection
            sectionKey="settings"
            sectionNumber={sectionNumberMap.get("settings") ?? "05"}
            title={t("Configure the output")}
            description={t("Every change is included in the JSON prompt below.")}
            openSections={openSections}
            onToggle={toggleSection}>
            <div className={styles.settingsGrid}>
              <div className={styles.settingBlock}>
                <strong>{t("Visual style")}</strong>
                <ChoiceGroup
                  options={VISUAL_STYLES}
                  selected={settings.visualStyle}
                  onChange={(visualStyle) => updateSettings({ visualStyle })}
                  ariaLabel={t("Visual style")}
                />
              </div>
              <div className={styles.settingBlock}>
                <strong>{t("Lighting")}</strong>
                <ChoiceGroup
                  options={LIGHTING_OPTIONS}
                  selected={settings.lighting}
                  onChange={(lighting) => updateSettings({ lighting })}
                  ariaLabel={t("Lighting")}
                />
              </div>
              <div className={styles.settingBlock}>
                <strong>{t("Background")}</strong>
                <ChoiceGroup
                  options={BACKGROUND_OPTIONS}
                  selected={settings.background}
                  onChange={(background) => updateSettings({ background })}
                  ariaLabel={t("Background")}
                />
              </div>
              <div className={styles.settingBlock}>
                <strong>{t("Detail level")}</strong>
                <ChoiceGroup
                  options={DETAIL_LEVELS}
                  selected={settings.detailLevel}
                  onChange={(detailLevel) => updateSettings({ detailLevel })}
                  ariaLabel={t("Detail level")}
                />
              </div>
              <div className={`${styles.settingBlock} ${styles.settingBlockWide}`}>
                <strong>{t("Views")}</strong>
                <ChoiceGroup
                  options={VIEW_OPTIONS}
                  selected={settings.views}
                  multiple
                  onChange={toggleView}
                  ariaLabel={t("Views")}
                />
              </div>
              <label className={styles.rangeControl}>
                <span>
                  <strong>{t("Identity consistency")}</strong>
                  <output>{settings.consistency}%</output>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.consistency}
                  onChange={(event) => updateSettings({ consistency: event.currentTarget.valueAsNumber })}
                />
              </label>
              <label className={styles.rangeControl}>
                <span>
                  <strong>{t("Creativity")}</strong>
                  <output>{settings.creativity}%</output>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.creativity}
                  onChange={(event) => updateSettings({ creativity: event.currentTarget.valueAsNumber })}
                />
              </label>
              <div className={styles.compactSettings}>
                <label>
                  <span>{t("Output count")}</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.outputCount}
                    onChange={(event) => updateSettings({ outputCount: Math.max(1, Number(event.target.value) || 1) })}
                  />
                </label>
                <label>
                  <span>{t("Aspect ratio")}</span>
                  <select
                    value={settings.aspectRatio}
                    onChange={(event) => updateSettings({ aspectRatio: event.target.value })}>
                    {["1:1", "4:5", "3:4", "16:9", "9:16"].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{t("Resolution")}</span>
                  <select
                    value={settings.resolution}
                    onChange={(event) => updateSettings({ resolution: event.target.value })}>
                    {["Standard", "High", "Ultra"].map((value) => (
                      <option key={value}>{t(value)}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className={styles.jsonPrompt}>
              <div className={styles.jsonPromptHeader}>
                <strong>{t("Prompt preview")}</strong>
                <small>{t("This is the local request preview. No request is sent.")}</small>
              </div>
              <div className={styles.previewControls}>
                <ChoiceGroup
                  options={["Readable", "JSON"]}
                  selected={previewMode === "json" ? "JSON" : "Readable"}
                  onChange={(value) => setPreviewMode(value === "JSON" ? "json" : "readable")}
                  ariaLabel={t("Prompt preview mode")}
                />
                <div className={styles.expandCollapseActions}>
                  <button type="button" className={styles.secondaryButton} onClick={copyPreview}>
                    {t("Copy")}
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={downloadPreview}>
                    {t("Download")}
                  </button>
                </div>
              </div>
              <span className={styles.copyStatus} aria-live="polite">
                {copied === "ok" ? t("Copied") : copied === "error" ? t("Copy failed") : ""}
              </span>
              <textarea className={styles.jsonTextarea} value={previewText} readOnly aria-label={t("Prompt preview")} />
            </div>
          </AccordionSection>
        </div>
      </div>
    </form>
  );
}
