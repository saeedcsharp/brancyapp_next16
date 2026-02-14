export interface ThumbnailOptions {
  backgroundOpacity?: 100 | 60;
  characterCount?: 1 | 2;
  textColorMode?: "white" | "background-dark" | "background-darker";
}
export interface ThumbnailStyle {
  backgroundColor: string;
  color: string;
  text: string;
}
const latinColors: { [key: string]: { start: string; end: string } } = {
  a: { start: "#FFCDD2", end: "#EF9A9A" }, // Light Red to Soft Red
  b: { start: "#F8BBD0", end: "#F48FB1" }, // Light Pink to Soft Pink
  c: { start: "#E1BEE7", end: "#CE93D8" }, // Light Purple to Soft Purple
  d: { start: "#D1C4E9", end: "#B39DDB" }, // Light Deep Purple to Soft Deep Purple
  e: { start: "#C5CAE9", end: "#9FA8DA" }, // Light Indigo to Soft Indigo
  f: { start: "#BBDEFB", end: "#90CAF9" }, // Light Blue to Soft Blue
  g: { start: "#B3E5FC", end: "#81D4FA" }, // Light Blue to Soft Light Blue
  h: { start: "#B2EBF2", end: "#80DEEA" }, // Light Cyan to Soft Cyan
  i: { start: "#B2DFDB", end: "#80CBC4" }, // Light Teal to Soft Teal
  j: { start: "#C8E6C9", end: "#A5D6A7" }, // Light Green to Soft Green
  k: { start: "#DCEDC8", end: "#C5E1A5" }, // Light Light Green to Soft Light Green
  l: { start: "#F0F4C3", end: "#E6EE9C" }, // Light Lime to Soft Lime
  m: { start: "#FFF9C4", end: "#FFF59D" }, // Light Yellow to Soft Yellow
  n: { start: "#FFECB3", end: "#FFE082" }, // Light Amber to Soft Amber
  o: { start: "#FFE0B2", end: "#FFCC80" }, // Light Orange to Soft Orange
  p: { start: "#FFCCBC", end: "#FFAB91" }, // Light Deep Orange to Soft Deep Orange
  q: { start: "#D7CCC8", end: "#BCAAA4" }, // Light Brown to Soft Brown
  r: { start: "#FFCDD2", end: "#EF9A9A" }, // Light Red (repeat)
  s: { start: "#F8BBD0", end: "#F48FB1" }, // Light Pink (repeat)
  t: { start: "#E1BEE7", end: "#CE93D8" }, // Light Purple (repeat)
  u: { start: "#D1C4E9", end: "#B39DDB" }, // Light Deep Purple (repeat)
  v: { start: "#C5CAE9", end: "#9FA8DA" }, // Light Indigo (repeat)
  w: { start: "#BBDEFB", end: "#90CAF9" }, // Light Blue (repeat)
  x: { start: "#B3E5FC", end: "#81D4FA" }, // Light Light Blue (repeat)
  y: { start: "#B2EBF2", end: "#80DEEA" }, // Light Cyan (repeat)
  z: { start: "#B2DFDB", end: "#80CBC4" }, // Light Teal (repeat)
};
const persianColors: { [key: string]: { start: string; end: string } } = {
  ا: { start: "#FFCDD2", end: "#EF9A9A" }, // Light Red
  آ: { start: "#F8BBD0", end: "#F48FB1" }, // Light Pink
  ب: { start: "#E1BEE7", end: "#CE93D8" }, // Light Purple
  پ: { start: "#D1C4E9", end: "#B39DDB" }, // Light Deep Purple
  ت: { start: "#C5CAE9", end: "#9FA8DA" }, // Light Indigo
  ث: { start: "#BBDEFB", end: "#90CAF9" }, // Light Blue
  ج: { start: "#B3E5FC", end: "#81D4FA" }, // Light Light Blue
  چ: { start: "#B2EBF2", end: "#80DEEA" }, // Light Cyan
  ح: { start: "#B2DFDB", end: "#80CBC4" }, // Light Teal
  خ: { start: "#C8E6C9", end: "#A5D6A7" }, // Light Green
  د: { start: "#DCEDC8", end: "#C5E1A5" }, // Light Light Green
  ذ: { start: "#F0F4C3", end: "#E6EE9C" }, // Light Lime
  ر: { start: "#FFF9C4", end: "#FFF59D" }, // Light Yellow
  ز: { start: "#FFECB3", end: "#FFE082" }, // Light Amber
  ژ: { start: "#FFE0B2", end: "#FFCC80" }, // Light Orange
  س: { start: "#FFCCBC", end: "#FFAB91" }, // Light Deep Orange
  ش: { start: "#D7CCC8", end: "#BCAAA4" }, // Light Brown
  ص: { start: "#FFCDD2", end: "#EF9A9A" }, // Light Red
  ض: { start: "#F8BBD0", end: "#F48FB1" }, // Light Pink
  ط: { start: "#E1BEE7", end: "#CE93D8" }, // Light Purple
  ظ: { start: "#D1C4E9", end: "#B39DDB" }, // Light Deep Purple
  ع: { start: "#C5CAE9", end: "#9FA8DA" }, // Light Indigo
  غ: { start: "#BBDEFB", end: "#90CAF9" }, // Light Blue
  ف: { start: "#B3E5FC", end: "#81D4FA" }, // Light Light Blue
  ق: { start: "#B2EBF2", end: "#80DEEA" }, // Light Cyan
  ک: { start: "#B2DFDB", end: "#80CBC4" }, // Light Teal
  گ: { start: "#C8E6C9", end: "#A5D6A7" }, // Light Green
  ل: { start: "#DCEDC8", end: "#C5E1A5" }, // Light Light Green
  م: { start: "#F0F4C3", end: "#E6EE9C" }, // Light Lime
  ن: { start: "#FFF9C4", end: "#FFF59D" }, // Light Yellow
  و: { start: "#FFECB3", end: "#FFE082" }, // Light Amber
  ه: { start: "#FFE0B2", end: "#FFCC80" }, // Light Orange
  ی: { start: "#FFCCBC", end: "#FFAB91" }, // Light Deep Orange
};
const numberColors: { [key: string]: { start: string; end: string } } = {
  "0": { start: "#CFD8DC", end: "#B0BEC5" }, // Light Blue Gray
  "1": { start: "#FFCDD2", end: "#EF9A9A" }, // Light Red
  "2": { start: "#E1BEE7", end: "#CE93D8" }, // Light Purple
  "3": { start: "#BBDEFB", end: "#90CAF9" }, // Light Blue
  "4": { start: "#B2DFDB", end: "#80CBC4" }, // Light Teal
  "5": { start: "#DCEDC8", end: "#C5E1A5" }, // Light Light Green
  "6": { start: "#FFF9C4", end: "#FFF59D" }, // Light Yellow
  "7": { start: "#FFE0B2", end: "#FFCC80" }, // Light Orange
  "8": { start: "#D7CCC8", end: "#BCAAA4" }, // Light Brown
  "9": { start: "#CFD8DC", end: "#B0BEC5" }, // Light Blue Gray
};
const persianToEnglish: { [key: string]: string } = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};
interface ColorGradient {
  start: string;
  end: string;
}
const getBaseColorForChar = (char: string): ColorGradient => {
  const lowerChar = char.toLowerCase();
  const defaultGradient: ColorGradient = { start: "#E0E0E0", end: "#BDBDBD" };
  if (/[0-9۰-۹]/.test(lowerChar)) {
    const englishNum = persianToEnglish[lowerChar] || lowerChar;
    return numberColors[englishNum] || defaultGradient;
  }
  if (/[\u0600-\u06FF]/.test(lowerChar)) {
    return persianColors[lowerChar] || defaultGradient;
  }
  if (/[a-z]/.test(lowerChar)) {
    return latinColors[lowerChar] || defaultGradient;
  }

  return defaultGradient;
};
const createGradient = (gradient: ColorGradient, opacity: number = 1): string => {
  if (opacity === 1) {
    return `linear-gradient(135deg, ${gradient.start}, ${gradient.end})`;
  } else {
    const startWithOpacity = hexToRgba(gradient.start, opacity);
    const endWithOpacity = hexToRgba(gradient.end, opacity);
    return `linear-gradient(135deg, ${startWithOpacity}, ${endWithOpacity})`;
  }
};
const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const darkenColor = (hex: string, amount: number): string => {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) * (1 - amount));
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) * (1 - amount));
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) * (1 - amount));
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
export const getThumbnailColor = (text: string): string => {
  if (!text || text.length === 0) return "#E0E0E0";
  const gradient = getBaseColorForChar(text.charAt(0));
  return createGradient(gradient, 1);
};
export const getFirstChar = (text: string): string => {
  if (!text || text.length === 0) return "";
  return text.charAt(0).toUpperCase();
};
export const getThumbnailStyle = (text: string, options: ThumbnailOptions = {}): ThumbnailStyle => {
  const { backgroundOpacity = 100, characterCount = 1, textColorMode = "white" } = options;
  if (!text || text.length === 0) {
    return {
      backgroundColor: "linear-gradient(135deg, #E0E0E0, #BDBDBD)",
      color: "#FFFFFF",
      text: "",
    };
  }
  const displayText = text.substring(0, characterCount).toUpperCase();
  const baseColorGradient = getBaseColorForChar(text.charAt(0));
  const backgroundColor = createGradient(baseColorGradient, backgroundOpacity / 100);
  let textColor: string;
  switch (textColorMode) {
    case "white":
      textColor = "#FFFFFF";
      break;
    case "background-dark":
      // Use the darker end color for better contrast
      textColor = baseColorGradient.end;
      break;
    case "background-darker":
      // Create an even darker version for maximum contrast
      textColor = darkenColor(baseColorGradient.end, 1);
      break;
    default:
      textColor = "#FFFFFF";
  }
  return {
    backgroundColor,
    color: textColor,
    text: displayText,
  };
};
