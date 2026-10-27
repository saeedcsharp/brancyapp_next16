const guidList: string[] = [];
export function checkGuid(guid: string): boolean {
  if (guidList.find((v) => v === guid)) {
    return true;
  } else {
    guidList.push(guid);
    return false;
  }
}
