export default function convertFirstLetterToLowerCase(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.charAt(0).toLowerCase() + key.slice(1),
      value,
    ])
  );
}
