export default function rgbaToHex(data: {
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  a: number;
}): string {
  // Check if the input is in the correct format
  const rbvaStr = `rgba(${data.rgb.r},${data.rgb.g},${data.rgb.b},${data.a})`;
  const rgbaRegex = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([01]?\.?\d*?)\)/;
  const match = rbvaStr.match(rgbaRegex);

  if (!match) {
    throw new Error("Invalid RGBA format");
  }

  // Extract the RGB values and alpha channel
  const red = parseInt(match[1]);
  const green = parseInt(match[2]);
  const blue = parseInt(match[3]);
  const alpha = parseFloat(match[4]);

  // Convert RGB to HEX
  const redHex = red.toString(16).padStart(2, "0");
  const greenHex = green.toString(16).padStart(2, "0");
  const blueHex = blue.toString(16).padStart(2, "0");

  // Convert alpha to HEX
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");

  // Combine the HEX values
  const hexColor = `#${redHex}${greenHex}${blueHex}${alphaHex}`;

  return hexColor;
}
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, "");

  // Parse the r, g, b values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

export function rgbToHex(data: {
  rgb: { b: number; g: number; r: number };
}): string {
  // Convert RGB values to HEX
  const redHex = data.rgb.r.toString(16).padStart(2, "0");
  const greenHex = data.rgb.g.toString(16).padStart(2, "0");
  const blueHex = data.rgb.b.toString(16).padStart(2, "0");

  // Combine the HEX values
  const hexColor = `#${redHex}${greenHex}${blueHex}`;

  return hexColor;
}
