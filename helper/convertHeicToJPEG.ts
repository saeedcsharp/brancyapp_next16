export const convertHeicToJpeg = async (file: File): Promise<File> => {
  if (!file) throw new Error("No file provided");

  // Import `heic2any` dynamically (only on client)
  const heic2any = (await import("heic2any")).default;

  const isHeic = await checkHeicFile(file);
  if (!isHeic) return file; // Return the original file if not HEIC

  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });

    return new File([convertedBlob as Blob], file.name.replace(/\.heic$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Conversion failed:", error);
    throw new Error("HEIC conversion error");
  }
};

/**
 * Checks if a file is a HEIC file by analyzing its magic number.
 */
const checkHeicFile = async (file: File): Promise<boolean> => {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  const header = new TextDecoder().decode(uint8Array);
  return /ftyp(heic|heix|mif1|msf1)/.test(header);
};
