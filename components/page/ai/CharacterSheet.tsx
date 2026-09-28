import InputBox from "brancy/components/design/inputBox/inputBox";
import SwitchButton from "brancy/components/design/switchButton/switchButton";
import TextArea from "brancy/components/design/textArea/textArea";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import { ChangeEvent, Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CharacterSheet.module.css";

type IdentityType = "human" | "product" | "object" | "animal" | "custom";
type EditorMode = "auto" | "advanced";
type StepKey = "type" | "identity" | "structure" | "details" | "views" | "style" | "consistency" | "review";
type FieldKind = "text" | "select" | "number" | "color";
type ConstraintType = "required" | "forbidden";

interface WizardStep {
  key: StepKey;
  label: string;
  shortLabel: string;
}

interface IdentityTypeOption {
  id: IdentityType;
  label: string;
  description: string;
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

interface ReferenceItem {
  id: string;
  name: string;
  url: string;
  view: string;
  purpose: string;
  priority: number;
}

interface IdentityConstraint {
  id: number;
  type: ConstraintType;
  text: string;
}

const ADVANCED_STEPS: WizardStep[] = [
  { key: "type", label: "What are you creating?", shortLabel: "Type" },
  { key: "identity", label: "Define identity", shortLabel: "Identity" },
  { key: "structure", label: "Appearance and structure", shortLabel: "Structure" },
  { key: "details", label: "Identity details", shortLabel: "Details" },
  { key: "views", label: "Views and poses", shortLabel: "Views" },
  { key: "style", label: "Visual direction", shortLabel: "Style" },
  { key: "consistency", label: "Consistency controls", shortLabel: "Consistency" },
  { key: "review", label: "Review and generate", shortLabel: "Generate" },
];

const AUTO_STEPS = ADVANCED_STEPS.filter((step) =>
  (["type", "identity", "style", "review"] as StepKey[]).includes(step.key),
);

const IDENTITY_TYPES: IdentityTypeOption[] = [
  { id: "human", label: "Human", description: "Face, body, hair, clothing, expressions, and poses" },
  { id: "product", label: "Product", description: "Shape, materials, branding, dimensions, and components" },
  { id: "object", label: "Object", description: "Form, scale, texture, colors, and distinctive details" },
  { id: "animal", label: "Animal", description: "Species, breed, fur, anatomy, accessories, and markings" },
  { id: "custom", label: "Custom", description: "A flexible visual identity for any other subject" },
];

const PRESETS: Record<IdentityType, string[]> = {
  human: ["Basic Character", "Full Character", "Professional Character", "Animation", "Brand Character"],
  product: ["Product Identity", "E-commerce", "Advertising", "Technical Product", "Packaging Sheet"],
  object: ["Object Reference", "Game Asset", "3D Asset", "Illustration Reference"],
  animal: ["Companion Animal", "Wildlife Reference", "Mascot", "Animation Character"],
  custom: ["Flexible Identity", "Visual Reference", "Technical Sheet", "Editorial Sheet"],
};

const REFERENCE_VIEWS = [
  "Front",
  "Back",
  "Left",
  "Right",
  "Three-quarter",
  "Profile",
  "Close-up",
  "Full body",
  "Detail",
  "Environment",
  "Custom",
];

const REFERENCE_PURPOSES = [
  "Identity",
  "Shape",
  "Color",
  "Material",
  "Clothing",
  "Face",
  "Hair",
  "Accessory",
  "Logo",
  "Texture",
  "All",
];

const STRUCTURE_SECTIONS: Record<IdentityType, AttributeSection[]> = {
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
  ],
};

const DETAIL_SECTIONS: Record<IdentityType, AttributeSection[]> = {
  human: [
    {
      title: "Clothing",
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
      ],
    },
    {
      title: "Cultural and styling details",
      fields: [
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

const HUMAN_EXPRESSIONS = [
  "Neutral",
  "Happy",
  "Sad",
  "Angry",
  "Surprised",
  "Confident",
  "Serious",
  "Laughing",
  "Thinking",
  "Worried",
];
const HUMAN_POSES = [
  "Standing",
  "Walking",
  "Sitting",
  "Running",
  "Hands on waist",
  "Crossed arms",
  "Pointing",
  "Holding object",
];
const STANDARD_VIEWS = [
  "Front",
  "Back",
  "Left",
  "Right",
  "3/4 Left",
  "3/4 Right",
  "Profile Left",
  "Profile Right",
  "Top",
  "Bottom",
];
const PRODUCT_VIEWS = [...STANDARD_VIEWS, "Open", "Closed", "Exploded View", "Detail View"];
const VISUAL_STYLES = [
  "Photorealistic",
  "Cinematic",
  "Editorial",
  "Commercial",
  "3D",
  "Anime",
  "Illustration",
  "Comic",
  "Stylized",
  "Minimal",
];
const LIGHTING_OPTIONS = [
  "Neutral Studio",
  "Studio",
  "Softbox",
  "Cinematic",
  "Natural",
  "Hard Light",
  "Soft Light",
  "Rim Light",
  "Product Photography",
];
const BACKGROUND_OPTIONS = ["White", "Gray", "Black", "Transparent", "Gradient", "Studio", "Custom"];
const LAYOUT_OPTIONS = ["Grid", "Presentation", "Technical", "Minimal", "Editorial", "Storyboard", "Custom"];
const DETAIL_LEVELS = ["Standard", "High", "Ultra", "Maximum"];
const OUTPUT_PRESETS = [
  { id: "quick", label: "Quick", count: 6 },
  { id: "standard", label: "Standard", count: 12 },
  { id: "complete", label: "Complete", count: 24 },
  { id: "pro", label: "Pro", count: 36 },
  { id: "custom", label: "Custom", count: 0 },
];
const GLOBAL_LOCKS = [
  "Face",
  "Body",
  "Hair",
  "Clothing",
  "Color",
  "Material",
  "Shape",
  "Proportions",
  "Logo",
  "Branding",
  "Accessories",
  "Pose",
  "Expression",
  "Background",
  "Environment",
];
const REFERENCE_STRATEGIES = ["Identity", "Face", "Shape", "Material", "Style", "Logo"];

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
        <path d="M8 21h8M12 17v4M5 5.5 12 2l7 3.5v8L12 17l-7-3.5z" />
        <path d="m5 5.5 7 4 7-4M12 9.5V17" />
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

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true">
      {locked ? (
        <path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z" />
      ) : (
        <path d="M8 10V7a5 5 0 0 1 9.5-2M5 10h14v11H5z" />
      )}
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true">
      <path d="m12 2 1.5 5.1A5 5 0 0 0 17 10.5L22 12l-5 1.5a5 5 0 0 0-3.5 3.4L12 22l-1.5-5.1A5 5 0 0 0 7 13.5L2 12l5-1.5a5 5 0 0 0 3.5-3.4z" />
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

export default function CharacterSheet() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<EditorMode>("advanced");
  const [currentStep, setCurrentStep] = useState<StepKey>("type");
  const [identityType, setIdentityType] = useState<IdentityType>("human");
  const [selectedPreset, setSelectedPreset] = useState(PRESETS.human[1]);
  const [identityName, setIdentityName] = useState("");
  const [description, setDescription] = useState("");
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [analysisPreview, setAnalysisPreview] = useState(false);
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [lockedAttributes, setLockedAttributes] = useState<Set<string>>(new Set(["Face", "Color"]));
  const [selectedViews, setSelectedViews] = useState<string[]>(["Front", "Back", "Left", "Right", "3/4 Left"]);
  const [selectedExpressions, setSelectedExpressions] = useState<string[]>(["Neutral", "Happy", "Confident"]);
  const [selectedPoses, setSelectedPoses] = useState<string[]>(["Standing", "Walking", "Sitting"]);
  const [poseCount, setPoseCount] = useState("8");
  const [visualStyle, setVisualStyle] = useState("Photorealistic");
  const [lighting, setLighting] = useState("Neutral Studio");
  const [background, setBackground] = useState("White");
  const [sheetLayout, setSheetLayout] = useState("Grid");
  const [backgroundConsistency, setBackgroundConsistency] = useState(true);
  const [customStylePrompt, setCustomStylePrompt] = useState("");
  const [colorPalette, setColorPalette] = useState(["#2977ff", "#44cb8c", "#ffb700", "#ff4e85"]);
  const [identityConsistency, setIdentityConsistency] = useState(95);
  const [creativity, setCreativity] = useState(40);
  const [detailLevel, setDetailLevel] = useState("High");
  const [outputPreset, setOutputPreset] = useState("standard");
  const [customOutputCount, setCustomOutputCount] = useState("12");
  const [aspectRatio, setAspectRatio] = useState("4:5");
  const [resolution, setResolution] = useState("High");
  const [modelStrategy, setModelStrategy] = useState("Automatic provider and model");
  const [referenceStrategies, setReferenceStrategies] = useState<string[]>(["Identity", "Face", "Shape"]);
  const [constraints, setConstraints] = useState<IdentityConstraint[]>([]);
  const [constraintDraft, setConstraintDraft] = useState("");
  const [constraintType, setConstraintType] = useState<ConstraintType>("forbidden");
  const [logoFileName, setLogoFileName] = useState("");
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const referenceUrlsRef = useRef(new Set<string>());
  const referenceIdRef = useRef(0);
  const constraintIdRef = useRef(0);

  const modeOptions = [
    { id: 0, label: t("Auto") },
    { id: 1, label: t("Advanced") },
  ];
  const steps = mode === "auto" ? AUTO_STEPS : ADVANCED_STEPS;
  const currentStepIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === currentStep),
  );
  const currentStepDefinition = steps[currentStepIndex];
  const outputCount =
    outputPreset === "custom"
      ? Math.max(1, Number(customOutputCount) || 1)
      : (OUTPUT_PRESETS.find((preset) => preset.id === outputPreset)?.count ?? 12);
  const automaticConstraints = useMemo(
    () =>
      Array.from(lockedAttributes).map((attribute) => ({
        id: `lock-${attribute}`,
        text: `Do not change ${attribute.toLowerCase()}`,
      })),
    [lockedAttributes],
  );

  useEffect(
    () => () => {
      referenceUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      referenceUrlsRef.current.clear();
    },
    [],
  );

  const setModeAndStep = (nextMode: EditorMode) => {
    setMode(nextMode);
    const nextSteps = nextMode === "auto" ? AUTO_STEPS : ADVANCED_STEPS;
    if (!nextSteps.some((step) => step.key === currentStep)) setCurrentStep("identity");
    setPreviewGenerated(false);
  };
  const selectIdentityType = (nextType: IdentityType) => {
    setIdentityType(nextType);
    setSelectedPreset(PRESETS[nextType][0]);
    setAnalysisPreview(false);
    setPreviewGenerated(false);
  };
  const updateAttribute = (key: string, value: string) => {
    setAttributes((current) => ({ ...current, [key]: value }));
    setPreviewGenerated(false);
  };
  const toggleLock = (key: string) => {
    setLockedAttributes((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setPreviewGenerated(false);
  };
  const toggleArrayValue = (value: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
    setPreviewGenerated(false);
  };
  const handleReferenceFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, Math.max(0, 12 - references.length));
    const addedReferences = files.map((file, index) => {
      const url = URL.createObjectURL(file);
      referenceUrlsRef.current.add(url);
      referenceIdRef.current += 1;
      return {
        id: `reference-${referenceIdRef.current}`,
        name: file.name,
        url,
        view: REFERENCE_VIEWS[(references.length + index) % 5],
        purpose: "Identity",
        priority: Math.max(1, 10 - references.length - index),
      };
    });
    if (addedReferences.length) {
      setReferences((current) => [...current, ...addedReferences]);
      setAnalysisPreview(false);
      setPreviewGenerated(false);
    }
    event.target.value = "";
  };
  const updateReference = (id: string, patch: Partial<ReferenceItem>) => {
    setReferences((current) =>
      current.map((reference) => (reference.id === id ? { ...reference, ...patch } : reference)),
    );
    setAnalysisPreview(false);
  };
  const removeReference = (reference: ReferenceItem) => {
    URL.revokeObjectURL(reference.url);
    referenceUrlsRef.current.delete(reference.url);
    setReferences((current) => current.filter((item) => item.id !== reference.id));
    setAnalysisPreview(false);
  };
  const addConstraint = () => {
    const text = constraintDraft.trim();
    if (!text) return;
    constraintIdRef.current += 1;
    setConstraints((current) => [...current, { id: constraintIdRef.current, type: constraintType, text }]);
    setConstraintDraft("");
  };
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) setCurrentStep(steps[currentStepIndex - 1].key);
  };
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) setCurrentStep(steps[currentStepIndex + 1].key);
  };

  const renderField = (field: AttributeField) => {
    const value = attributes[field.key] ?? (field.kind === "color" ? "#2977ff" : "");
    const locked = lockedAttributes.has(field.key);
    return (
      <label className={`${styles.attributeField} ${locked ? styles.attributeFieldLocked : ""}`} key={field.key}>
        <span className={styles.fieldHeader}>
          <span>{t(field.label)}</span>
          <button
            type="button"
            className={`${styles.lockButton} ${locked ? styles.lockButtonActive : ""}`}
            onClick={() => toggleLock(field.key)}
            aria-pressed={locked}
            aria-label={t(locked ? `Unlock ${field.label}` : `Lock ${field.label}`)}
            title={t(locked ? "Unlock attribute" : "Lock attribute")}>
            <LockIcon locked={locked} />
          </button>
        </span>
        {field.kind === "select" ? (
          <select
            className={styles.selectInput}
            value={value || field.options?.[0]}
            onChange={(event) => updateAttribute(field.key, event.target.value)}>
            {field.options?.map((option) => (
              <option value={option} key={option}>
                {t(option)}
              </option>
            ))}
          </select>
        ) : field.kind === "color" ? (
          <span className={styles.colorInputWrap}>
            <input
              className={styles.colorInput}
              type="color"
              value={value}
              onChange={(event) => updateAttribute(field.key, event.target.value)}
              aria-label={t(field.label)}
            />
            <span>{value.toUpperCase()}</span>
          </span>
        ) : (
          <InputBox
            value={value}
            handleInputChange={(event) => updateAttribute(field.key, event.target.value)}
            placeholder={t(field.placeholder ?? "Auto")}
            variant={field.kind === "number" ? "number" : "default"}
            inputMode={field.kind === "number" ? "numeric" : "text"}
            unit={field.unit}
            clearable={false}
            ariaLabel={t(field.label)}
          />
        )}
      </label>
    );
  };
  const renderAttributeSections = (sections: AttributeSection[]) => (
    <div className={styles.sectionList}>
      {sections.map((section) => (
        <section className={styles.attributeSection} key={section.title}>
          <div className={styles.sectionHeading}>
            <h3>{t(section.title)}</h3>
          </div>
          <div className={styles.attributeGrid}>{section.fields.map(renderField)}</div>
        </section>
      ))}
    </div>
  );

  const renderTypeStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <div>
          <span className={styles.eyebrow}>{t("Step 1")}</span>
          <h2>{t("What are you creating?")}</h2>
        </div>
        <span className={styles.statusBadge}>{t("Source of truth")}</span>
      </div>
      <div className={styles.typeGrid} role="radiogroup" aria-label={t("Identity type")}>
        {IDENTITY_TYPES.map((option) => {
          const selected = identityType === option.id;
          return (
            <button
              type="button"
              className={`${styles.typeButton} ${selected ? styles.typeButtonActive : ""}`}
              key={option.id}
              role="radio"
              aria-checked={selected}
              onClick={() => selectIdentityType(option.id)}>
              <span className={styles.typeIcon}>
                <TypeIcon type={option.id} />
              </span>
              <span className={styles.typeText}>
                <strong>{t(option.label)}</strong>
                <small>{t(option.description)}</small>
              </span>
              <span className={styles.selectionMark} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <section className={styles.inlineSection}>
        <div className={styles.sectionHeading}>
          <h3>{t("Starting preset")}</h3>
          <p>{t("Choose a baseline. Every setting remains editable.")}</p>
        </div>
        <ChoiceGroup
          options={PRESETS[identityType]}
          selected={selectedPreset}
          onChange={(preset) => setSelectedPreset(preset)}
          ariaLabel={t("Identity preset")}
        />
      </section>
    </div>
  );

  const analysisLabels: Record<IdentityType, string[]> = {
    human: ["Face", "Hair", "Skin", "Body", "Clothing", "Accessories", "Colors", "Proportions"],
    product: ["Shape", "Dimensions", "Material", "Surface", "Colors", "Components", "Logo", "Typography"],
    object: ["Shape", "Size", "Material", "Texture", "Components", "Scale", "Distinctive features"],
    animal: ["Species", "Breed", "Fur", "Eyes", "Face", "Body", "Markings", "Accessories"],
    custom: ["Silhouette", "Materials", "Colors", "Components", "Scale", "Style", "Distinctive features"],
  };
  const renderIdentityStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <div>
          <span className={styles.eyebrow}>{t("Identity definition")}</span>
          <h2>{t("Name and reference images")}</h2>
        </div>
        <span className={styles.typePill}>
          <TypeIcon type={identityType} />{" "}
          {t(IDENTITY_TYPES.find((option) => option.id === identityType)?.label ?? "Custom")}
        </span>
      </div>
      <div className={styles.identityBasics}>
        <label className={styles.labeledControl}>
          <span>{t("Identity name")}</span>
          <InputBox
            value={identityName}
            handleInputChange={(event) => setIdentityName(event.target.value)}
            placeholder={t(identityType === "product" ? "Example: Brancy Phone" : "Example: Alex")}
            clearable
            required
            dangerOnEmpty
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
            placeholder={t("Describe the subject and the visual traits that must remain recognizable.")}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
      </div>
      <section className={styles.referenceSection}>
        <div className={styles.sectionHeadingRow}>
          <div className={styles.sectionHeading}>
            <h3>{t("Reference images")}</h3>
            <p>{t("Add up to 12 angles or detail references and assign a role to each one.")}</p>
          </div>
          <span className={styles.referenceCount}>{references.length} / 12</span>
        </div>
        <div className={styles.referenceGrid}>
          <label className={styles.referenceUpload}>
            <span className={styles.uploadSymbol} aria-hidden="true">
              +
            </span>
            <strong>{t("Add references")}</strong>
            <small>{t("JPG, PNG, WEBP")}</small>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleReferenceFiles}
              disabled={references.length >= 12}
            />
          </label>
          {references.map((reference) => (
            <article className={styles.referenceCard} key={reference.id}>
              <div className={styles.referencePreview}>
                <img src={reference.url} alt={reference.name} />
                <button
                  type="button"
                  className={styles.removeReference}
                  onClick={() => removeReference(reference)}
                  aria-label={t("Remove reference")}
                  title={t("Remove reference")}>
                  x
                </button>
                <span className={styles.priorityBadge}>P{reference.priority}</span>
              </div>
              <div className={styles.referenceMeta}>
                <select
                  value={reference.view}
                  onChange={(event) => updateReference(reference.id, { view: event.target.value })}
                  aria-label={t("Reference view")}>
                  {REFERENCE_VIEWS.map((view) => (
                    <option value={view} key={view}>
                      {t(view)}
                    </option>
                  ))}
                </select>
                <select
                  value={reference.purpose}
                  onChange={(event) => updateReference(reference.id, { purpose: event.target.value })}
                  aria-label={t("Reference purpose")}>
                  {REFERENCE_PURPOSES.map((purpose) => (
                    <option value={purpose} key={purpose}>
                      {t(purpose)}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.autoDefineSection}>
        <div className={styles.autoDefineCopy}>
          <span className={styles.sparkIcon}>
            <SparkIcon />
          </span>
          <div>
            <h3>{t("AI Auto-Define")}</h3>
            <p>{t("Stage the attributes that Visual Identity will extract from the selected references.")}</p>
          </div>
        </div>
        <button
          type="button"
          className={references.length ? styles.autoDefineButton : styles.autoDefineButtonDisabled}
          disabled={!references.length}
          onClick={() => setAnalysisPreview((current) => !current)}>
          <SparkIcon /> {t(analysisPreview ? "Hide attribute preview" : "Preview auto-defined fields")}
        </button>
        {analysisPreview && (
          <div className={styles.analysisPreview}>
            {analysisLabels[identityType].map((label) => (
              <span key={label}>
                <span aria-hidden="true" />
                {t(label)}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderStructureStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <div>
          <span className={styles.eyebrow}>
            {t(IDENTITY_TYPES.find((option) => option.id === identityType)?.label ?? "Custom")}
          </span>
          <h2>{t("Appearance and structure")}</h2>
        </div>
        <span className={styles.lockSummary}>
          <LockIcon locked /> {lockedAttributes.size} {t("locked")}
        </span>
      </div>
      {renderAttributeSections(STRUCTURE_SECTIONS[identityType])}
    </div>
  );

  const renderDetailsStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <div>
          <span className={styles.eyebrow}>{t("Fine control")}</span>
          <h2>{t("Colors, materials, clothing, and components")}</h2>
        </div>
      </div>
      {identityType === "product" && (
        <section className={styles.brandAssetRow}>
          <div>
            <h3>{t("Logo asset")}</h3>
            <p>{logoFileName || t("No logo selected")}</p>
          </div>
          <label className={styles.fileButton}>
            {t("Choose logo")}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                setLogoFileName(event.target.files?.[0]?.name ?? "");
                event.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className={`${styles.lockButtonLarge} ${lockedAttributes.has("Branding") ? styles.lockButtonActive : ""}`}
            aria-pressed={lockedAttributes.has("Branding")}
            onClick={() => toggleLock("Branding")}>
            <LockIcon locked={lockedAttributes.has("Branding")} /> {t("Brand Lock")}
          </button>
        </section>
      )}
      {renderAttributeSections(DETAIL_SECTIONS[identityType])}
    </div>
  );

  const viewOptions = identityType === "product" ? PRODUCT_VIEWS : STANDARD_VIEWS;
  const renderViewsStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <div>
          <span className={styles.eyebrow}>{t("Sheet coverage")}</span>
          <h2>{t("Views, poses, and expressions")}</h2>
        </div>
        <span className={styles.selectionCount}>
          {selectedViews.length} {t("views")}
        </span>
      </div>
      <section className={styles.inlineSection}>
        <div className={styles.sectionHeading}>
          <h3>{t(identityType === "product" ? "Product views" : "Camera and view angles")}</h3>
          <p>{t("Front, back, side, and three-quarter views form the standard identity set.")}</p>
        </div>
        <ChoiceGroup
          options={viewOptions}
          selected={selectedViews}
          multiple
          onChange={(value) => toggleArrayValue(value, setSelectedViews)}
          ariaLabel={t("Selected views")}
        />
      </section>
      {(identityType === "human" || identityType === "animal") && (
        <>
          <section className={styles.inlineSection}>
            <div className={styles.sectionHeadingRow}>
              <div className={styles.sectionHeading}>
                <h3>{t("Expression sheet")}</h3>
                <p>{t("Keep identity stable while the facial expression changes.")}</p>
              </div>
              <span className={styles.selectionCount}>{selectedExpressions.length}</span>
            </div>
            <ChoiceGroup
              options={HUMAN_EXPRESSIONS}
              selected={selectedExpressions}
              multiple
              onChange={(value) => toggleArrayValue(value, setSelectedExpressions)}
              ariaLabel={t("Expressions")}
            />
          </section>
          <section className={styles.inlineSection}>
            <div className={styles.sectionHeadingRow}>
              <div className={styles.sectionHeading}>
                <h3>{t("Pose sheet")}</h3>
                <p>{t("Select pose families and the preferred sheet size.")}</p>
              </div>
              <select
                className={styles.compactSelect}
                value={poseCount}
                onChange={(event) => setPoseCount(event.target.value)}
                aria-label={t("Pose count")}>
                {["4", "6", "8", "12", "16", "Custom"].map((count) => (
                  <option value={count} key={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>
            <ChoiceGroup
              options={HUMAN_POSES}
              selected={selectedPoses}
              multiple
              onChange={(value) => toggleArrayValue(value, setSelectedPoses)}
              ariaLabel={t("Poses")}
            />
          </section>
        </>
      )}
      {(identityType === "product" || identityType === "object") && (
        <section className={styles.inlineSection}>
          <div className={styles.sectionHeading}>
            <h3>{t("Scale reference")}</h3>
            <p>{t("Keep the subject proportionate to familiar people, objects, or environments.")}</p>
          </div>
          <ChoiceGroup
            options={["Human", "Hand", "Table", "Room", "Vehicle", "Custom"]}
            selected={attributes.scaleReference ?? "Hand"}
            onChange={(value) => updateAttribute("scaleReference", value)}
            ariaLabel={t("Scale reference")}
          />
        </section>
      )}
    </div>
  );

  const renderStyleStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <div>
          <span className={styles.eyebrow}>{t("Visual direction")}</span>
          <h2>{t("Style, lighting, background, and layout")}</h2>
        </div>
      </div>
      <div className={styles.styleSections}>
        <section className={styles.inlineSection}>
          <div className={styles.sectionHeading}>
            <h3>{t("Visual style")}</h3>
          </div>
          <ChoiceGroup
            options={VISUAL_STYLES}
            selected={visualStyle}
            onChange={setVisualStyle}
            ariaLabel={t("Visual style")}
          />
        </section>
        <section className={styles.inlineSection}>
          <div className={styles.sectionHeading}>
            <h3>{t("Lighting")}</h3>
            <p>{t("Neutral Studio is recommended for accurate identity definition.")}</p>
          </div>
          <ChoiceGroup
            options={LIGHTING_OPTIONS}
            selected={lighting}
            onChange={setLighting}
            ariaLabel={t("Lighting")}
          />
        </section>
        <section className={styles.inlineSection}>
          <div className={styles.sectionHeadingRow}>
            <div className={styles.sectionHeading}>
              <h3>{t("Background")}</h3>
            </div>
            <label className={styles.switchControl}>
              <span>{t("Background consistency")}</span>
              <SwitchButton
                checked={backgroundConsistency}
                name="background-consistency"
                role="switch"
                handleToggle={(event) => setBackgroundConsistency(event.target.checked)}
                aria-label={t("Background consistency")}
              />
            </label>
          </div>
          <ChoiceGroup
            options={BACKGROUND_OPTIONS}
            selected={background}
            onChange={setBackground}
            ariaLabel={t("Background")}
          />
        </section>
        <section className={styles.inlineSection}>
          <div className={styles.sectionHeading}>
            <h3>{t("Sheet layout")}</h3>
          </div>
          <ChoiceGroup
            options={LAYOUT_OPTIONS}
            selected={sheetLayout}
            onChange={setSheetLayout}
            ariaLabel={t("Sheet layout")}
          />
        </section>
        <section className={styles.paletteSection}>
          <div className={styles.sectionHeading}>
            <h3>{t("Identity color palette")}</h3>
            <p>{t("These colors remain available to consistency rules.")}</p>
          </div>
          <div className={styles.paletteList}>
            {colorPalette.map((color, index) => (
              <label className={styles.paletteSwatch} key={`${index}-${color}`} title={color.toUpperCase()}>
                <input
                  type="color"
                  value={color}
                  onChange={(event) =>
                    setColorPalette((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                    )
                  }
                  aria-label={`${t("Palette color")} ${index + 1}`}
                />
                <span style={{ backgroundColor: color }} />
              </label>
            ))}
          </div>
        </section>
        <label className={styles.labeledControl}>
          <span>{t("Custom style direction")}</span>
          <TextArea
            className="textArea"
            minRows={3}
            maxRows={7}
            autoResize
            value={customStylePrompt}
            placeholder={t("Optional visual direction. Prompt engineering is not required.")}
            onChange={(event) => setCustomStylePrompt(event.target.value)}
          />
        </label>
      </div>
    </div>
  );

  const renderConsistencyStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <div>
          <span className={styles.eyebrow}>{t("Generation policy")}</span>
          <h2>{t("Consistency, creativity, and constraints")}</h2>
        </div>
      </div>
      <div className={styles.sliderGrid}>
        <label className={styles.sliderControl}>
          <span className={styles.sliderHeader}>
            <strong>{t("Identity Consistency")}</strong>
            <output>{identityConsistency}%</output>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={identityConsistency}
            onChange={(event) => setIdentityConsistency(event.currentTarget.valueAsNumber)}
          />
          <span className={styles.rangeLabels}>
            <small>{t("Low")}</small>
            <small>{t("Maximum")}</small>
          </span>
        </label>
        <label className={styles.sliderControl}>
          <span className={styles.sliderHeader}>
            <strong>{t("Creativity")}</strong>
            <output>{creativity}%</output>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={creativity}
            onChange={(event) => setCreativity(event.currentTarget.valueAsNumber)}
          />
          <span className={styles.rangeLabels}>
            <small>{t("Conservative")}</small>
            <small>{t("Creative")}</small>
          </span>
        </label>
      </div>
      <section className={styles.inlineSection}>
        <div className={styles.sectionHeading}>
          <h3>{t("Detail level")}</h3>
        </div>
        <ChoiceGroup
          options={DETAIL_LEVELS}
          selected={detailLevel}
          onChange={setDetailLevel}
          ariaLabel={t("Detail level")}
        />
      </section>
      <section className={styles.inlineSection}>
        <div className={styles.sectionHeading}>
          <h3>{t("Number of outputs")}</h3>
        </div>
        <div className={styles.outputPresetGrid}>
          {OUTPUT_PRESETS.map((preset) => (
            <button
              type="button"
              className={`${styles.outputPreset} ${outputPreset === preset.id ? styles.outputPresetActive : ""}`}
              key={preset.id}
              aria-pressed={outputPreset === preset.id}
              onClick={() => setOutputPreset(preset.id)}>
              <strong>{t(preset.label)}</strong>
              <span>{preset.count ? `${preset.count} ${t("images")}` : t("Choose count")}</span>
            </button>
          ))}
        </div>
        {outputPreset === "custom" && (
          <div className={styles.customCount}>
            <InputBox
              value={customOutputCount}
              handleInputChange={(event) => setCustomOutputCount(event.target.value)}
              variant="number"
              inputMode="numeric"
              unit={t("images")}
              clearable={false}
              ariaLabel={t("Custom output count")}
            />
          </div>
        )}
      </section>
      <section className={styles.inlineSection}>
        <div className={styles.sectionHeadingRow}>
          <div className={styles.sectionHeading}>
            <h3>{t("Lock system")}</h3>
            <p>{t("Locked attributes become immutable identity constraints.")}</p>
          </div>
          <span className={styles.lockSummary}>
            <LockIcon locked /> {lockedAttributes.size}
          </span>
        </div>
        <div className={styles.lockGrid}>
          {GLOBAL_LOCKS.map((lock) => {
            const locked = lockedAttributes.has(lock);
            return (
              <button
                type="button"
                className={`${styles.globalLock} ${locked ? styles.globalLockActive : ""}`}
                key={lock}
                aria-pressed={locked}
                onClick={() => toggleLock(lock)}>
                <LockIcon locked={locked} />
                <span>{t(lock)}</span>
              </button>
            );
          })}
        </div>
      </section>
      <section className={styles.inlineSection}>
        <div className={styles.sectionHeading}>
          <h3>{t("Reference strategy")}</h3>
          <p>{t("Define reference roles without coupling the identity to a provider or model.")}</p>
        </div>
        <ChoiceGroup
          options={REFERENCE_STRATEGIES}
          selected={referenceStrategies}
          multiple
          onChange={(value) => toggleArrayValue(value, setReferenceStrategies)}
          ariaLabel={t("Reference strategy")}
        />
      </section>
      <section className={styles.configurationGrid}>
        <label className={styles.labeledControl}>
          <span>{t("Model strategy")}</span>
          <select
            className={styles.selectInput}
            value={modelStrategy}
            onChange={(event) => setModelStrategy(event.target.value)}>
            {["Automatic provider and model", "Prefer image quality", "Prefer speed", "Prefer cost efficiency"].map(
              (option) => (
                <option value={option} key={option}>
                  {t(option)}
                </option>
              ),
            )}
          </select>
        </label>
        <label className={styles.labeledControl}>
          <span>{t("Aspect ratio")}</span>
          <select
            className={styles.selectInput}
            value={aspectRatio}
            onChange={(event) => setAspectRatio(event.target.value)}>
            {["1:1", "4:5", "3:4", "16:9", "9:16"].map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.labeledControl}>
          <span>{t("Resolution")}</span>
          <select
            className={styles.selectInput}
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}>
            {["Standard", "High", "Ultra"].map((option) => (
              <option value={option} key={option}>
                {t(option)}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section className={styles.constraintSection}>
        <div className={styles.sectionHeading}>
          <h3>{t("Constraints")}</h3>
          <p>{t("Locks compile into negative constraints. Add custom required or forbidden features here.")}</p>
        </div>
        <div className={styles.constraintComposer}>
          <select
            value={constraintType}
            onChange={(event) => setConstraintType(event.target.value as ConstraintType)}
            aria-label={t("Constraint type")}>
            <option value="required">{t("Required feature")}</option>
            <option value="forbidden">{t("Forbidden feature")}</option>
          </select>
          <InputBox
            value={constraintDraft}
            handleInputChange={(event) => setConstraintDraft(event.target.value)}
            placeholder={t("Example: Do not add text")}
            clearable={false}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addConstraint();
              }
            }}
            ariaLabel={t("Custom constraint")}
          />
          <button
            type="button"
            className={styles.addConstraintButton}
            onClick={addConstraint}
            disabled={!constraintDraft.trim()}>
            +
          </button>
        </div>
        <div className={styles.constraintList}>
          {automaticConstraints.map((constraint) => (
            <span className={styles.generatedConstraint} key={constraint.id}>
              <LockIcon locked />
              {t(constraint.text)}
            </span>
          ))}
          {constraints.map((constraint) => (
            <span
              className={constraint.type === "required" ? styles.requiredConstraint : styles.forbiddenConstraint}
              key={constraint.id}>
              {t(constraint.text)}
              <button
                type="button"
                onClick={() => setConstraints((current) => current.filter((item) => item.id !== constraint.id))}
                aria-label={t("Remove constraint")}>
                x
              </button>
            </span>
          ))}
        </div>
      </section>
    </div>
  );

  const previewViews = selectedViews.length ? selectedViews : ["Front", "Back", "Left", "Right"];
  const consistencyMetrics = [
    { label: identityType === "human" ? "Face" : "Shape", value: 96 },
    { label: identityType === "product" ? "Material" : identityType === "human" ? "Body" : "Proportions", value: 93 },
    { label: "Color", value: 98 },
    { label: identityType === "product" ? "Logo" : "Reference adherence", value: 95 },
  ];
  const renderReviewStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <div>
          <span className={styles.eyebrow}>{t("Identity profile")}</span>
          <h2>{identityName.trim() || t("Untitled Visual Identity")}</h2>
        </div>
        <span className={`${styles.lifecycleBadge} ${previewGenerated ? styles.lifecycleReady : ""}`}>
          {t(previewGenerated ? "Ready" : "Draft")} - v1
        </span>
      </div>
      <div className={styles.reviewLayout}>
        <section className={styles.sheetPreview}>
          <div className={styles.sheetHeader}>
            <div>
              <strong>{identityName.trim() || t("Visual Identity")}</strong>
              <span>
                {t(selectedPreset)} - {t(sheetLayout)}
              </span>
            </div>
            <span>
              {outputCount} {t("outputs")}
            </span>
          </div>
          <div className={styles.sheetGrid}>
            {Array.from({ length: Math.min(6, Math.max(4, previewViews.length)) }, (_, index) => {
              const reference = references[index % Math.max(1, references.length)];
              const view = previewViews[index % previewViews.length];
              return (
                <figure key={`${view}-${index}`}>
                  {reference ? (
                    <img src={reference.url} alt={reference.name} />
                  ) : (
                    <span>
                      <TypeIcon type={identityType} />
                    </span>
                  )}
                  <figcaption>{t(view)}</figcaption>
                </figure>
              );
            })}
          </div>
          <div className={styles.paletteStrip}>
            {colorPalette.map((color) => (
              <span key={color} style={{ backgroundColor: color }} />
            ))}
          </div>
          {!previewGenerated && (
            <div className={styles.previewOverlay}>
              <SparkIcon />
              <span>{t("Generate the local sheet preview")}</span>
            </div>
          )}
        </section>
        <aside className={styles.identitySummary}>
          <dl className={styles.summaryGrid}>
            <div>
              <dt>{t("Type")}</dt>
              <dd>{t(IDENTITY_TYPES.find((option) => option.id === identityType)?.label ?? "Custom")}</dd>
            </div>
            <div>
              <dt>{t("Preset")}</dt>
              <dd>{t(selectedPreset)}</dd>
            </div>
            <div>
              <dt>{t("References")}</dt>
              <dd>{references.length}</dd>
            </div>
            <div>
              <dt>{t("Locked attributes")}</dt>
              <dd>{lockedAttributes.size}</dd>
            </div>
            <div>
              <dt>{t("Consistency")}</dt>
              <dd>{identityConsistency}%</dd>
            </div>
            <div>
              <dt>{t("Creativity")}</dt>
              <dd>{creativity}%</dd>
            </div>
            <div>
              <dt>{t("Detail")}</dt>
              <dd>{t(detailLevel)}</dd>
            </div>
            <div>
              <dt>{t("Output")}</dt>
              <dd>
                {outputCount} - {aspectRatio}
              </dd>
            </div>
          </dl>
          <section className={styles.snapshotPanel}>
            <div className={styles.sectionHeading}>
              <h3>{t("Immutable generation context")}</h3>
              <p>{t("Version 1 keeps its attributes, locks, constraints, style, and generation settings together.")}</p>
            </div>
            <div className={styles.snapshotTags}>
              <span>{t("Attributes")}</span>
              <span>{t("Locks")}</span>
              <span>{t("References")}</span>
              <span>{t("Style")}</span>
              <span>{t("Constraints")}</span>
            </div>
          </section>
        </aside>
      </div>
      {previewGenerated && (
        <section className={styles.qualityPanel}>
          <div className={styles.sectionHeadingRow}>
            <div className={styles.sectionHeading}>
              <h3>{t("Consistency test preview")}</h3>
              <p>{t("The score breakdown flags low-consistency outputs.")}</p>
            </div>
            <strong className={styles.overallScore}>96%</strong>
          </div>
          <div className={styles.metricGrid}>
            {consistencyMetrics.map((metric) => (
              <div className={styles.metric} key={metric.label}>
                <span>
                  <strong>{t(metric.label)}</strong>
                  <output>{metric.value}%</output>
                </span>
                <div>
                  <i style={{ width: `${metric.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.qualityActions}>
            <button type="button" className="cancelButton">
              {t("Regenerate low-consistency images")}
            </button>
            <button type="button" className={styles.publishButton}>
              {t("Publish identity")}
            </button>
          </div>
        </section>
      )}
    </div>
  );

  const stepContent: Record<StepKey, ReactNode> = {
    type: renderTypeStep(),
    identity: renderIdentityStep(),
    structure: renderStructureStep(),
    details: renderDetailsStep(),
    views: renderViewsStep(),
    style: renderStyleStep(),
    consistency: renderConsistencyStep(),
    review: renderReviewStep(),
  };
  const identityNameMissing = !identityName.trim();
  const actionNeedsName = identityNameMissing && (currentStep === "identity" || currentStep === "review");

  return (
    <form
      className={`${styles.right} ${styles.characterSheet}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (actionNeedsName) return;
        if (currentStepIndex < steps.length - 1) {
          goToNextStep();
          return;
        }
        setPreviewGenerated(true);
      }}>
      <div className={`${styles.mediaCreatorContainer} ${styles.identityContainer}`}>
        <header className={styles.identityHeader}>
          <div className={styles.identityTitle}>
            <span className={styles.identityMark}>
              <TypeIcon type={identityType} />
            </span>
            <div>
              <h1>{t("Visual Identity")}</h1>
              <p>{t("Create consistent visual references for characters, products, and objects.")}</p>
            </div>
          </div>
          <div className={styles.modeControl}>
            <span>{t("Editor mode")}</span>
            <ToggleButton
              options={modeOptions}
              selectedValue={mode === "auto" ? 0 : 1}
              onChange={(value) => setModeAndStep(value === 0 ? "auto" : "advanced")}
              ariaLabel={t("Editor mode")}
            />
          </div>
        </header>
        <nav
          className={styles.stepNavigation}
          aria-label={t("Visual Identity steps")}
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(88px, 1fr))` }}>
          {steps.map((step, index) => {
            const active = step.key === currentStepDefinition.key;
            const complete = index < currentStepIndex;
            return (
              <button
                type="button"
                className={`${styles.stepButton} ${active ? styles.stepButtonActive : ""} ${complete ? styles.stepButtonComplete : ""}`}
                key={step.key}
                aria-current={active ? "step" : undefined}
                onClick={() => setCurrentStep(step.key)}>
                <span>{complete ? "OK" : index + 1}</span>
                <small>{t(step.shortLabel)}</small>
              </button>
            );
          })}
        </nav>
        <div className={styles.stepViewport} key={currentStepDefinition.key}>
          {stepContent[currentStepDefinition.key]}
        </div>
      </div>
      <footer className={`${styles.actionBar} ${styles.identityActionBar}`}>
        <div className={styles.actionProgress}>
          <span>
            {t("Step")} {currentStepIndex + 1} / {steps.length}
          </span>
          <strong>{t(currentStepDefinition.label)}</strong>
        </div>
        <div className={styles.actionButtons}>
          <button type="button" className="cancelButton" onClick={goToPreviousStep} disabled={currentStepIndex === 0}>
            {t("Previous")}
          </button>
          <button type="submit" className={actionNeedsName ? "disableButton" : "saveButton"} disabled={actionNeedsName}>
            {currentStepIndex === steps.length - 1
              ? t(previewGenerated ? "Refresh preview" : "Generate sheet")
              : t("Continue")}
          </button>
        </div>
      </footer>
    </form>
  );
}
