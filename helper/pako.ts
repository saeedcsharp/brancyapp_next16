import pako from "pako";

export const handleCompress = (input: string) => {
  try {
    // Compress input data to Gzip format
    const gzipped = pako.deflateRaw(input);

    // Convert the compressed Uint8Array to Base64 for safe handling
    const base64Compressed = btoa(String.fromCharCode(...gzipped));
    return base64Compressed;
  } catch (error) {
    console.error("Compression error:", error);
  }
};

export const handleDecompress = (base64Data: string) => {
  "1VPLjpswFP0Xr1nwnpAdEzMpC8MkcTqdVFXlgtNAHIzAUSCj2fZXKvWL2r/pJUxoIyWLLisLwX2dew4cXlB8KHi1rHlVsB1H42IvhNYnwxSNkXE3sg04pu6OXMPRPaShOU/KvujZnmu7uuU4tq0bJtTopuIsvT76+Ur/ghfqvj3tQ+M1EzXX0AQgFE9p1hEy7izTgxnDtkaehnBW8USFiu/Q+AV1d9qW0KbfGrNGrqmhTuAtyh3IDcLsKV2v/KmxZh/m4guVTbwV7+jT+2NiPhQrfymCOA+sGM+aCAc6yX0zxs9NRH0nzolOcGiTnJhR/lUnNGkIJgdCQz3CoRHTmRXlMHMkBtQOMfahVx4J3ZrRMWwIfYYrNGMaOITO2ogGdkyXsGMLvcSJ6LIl/gqvMCiYVqzcDDL+E9KUNwrY/vwO58evbydflaJdKFm1Zx8SnmZssWEVr9H446e3xNvzRGRgnoks1Ampn/D3aSbPQVgvi3pflrLiYIzBX51/g53MszlnicpkcWH7q5VH1grZ+7pPXPPtlEOUJZTvSgFOHFo7RQT6/8J7yMRQ72Rn4Ft5/oJn8piLC97/9m+9dsiXKiAe4B9lre5Zsv2zLpIq2JUKXr6q9vz1Nw==";

  try {
    // Step 1: Decode Base64 into binary (Uint8Array)
    const binaryString = atob(base64Data);
    const compressedData = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));

    // Step 2: Decompress using pako
    const decompressedData = pako.inflateRaw(compressedData, { to: "string" });
    return decompressedData;
    // Step 3: Display the decompressed result
  } catch (error) {
    console.error("Decompression error:", error);
  }
};
