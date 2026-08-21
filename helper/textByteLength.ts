export function getTextByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function truncateTextToBytes(text: string, maxBytes: number): string {
  let result = "";
  let byteLength = 0;

  for (const character of text) {
    const characterByteLength = getTextByteLength(character);
    if (byteLength + characterByteLength > maxBytes) break;
    result += character;
    byteLength += characterByteLength;
  }

  return result;
}
