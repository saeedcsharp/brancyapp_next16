const guidList: string[] = [];
export function checkGuid(guid: string): boolean {
  if (guidList.find((v) => v === guid)) {
    console.log("guiddddddddddddddddd ", guidList);
    return true;
  } else {
    console.log("guiddddddddddddddddd ", guidList);
    guidList.push(guid);
    return false;
  }
}
