export function convertArrayToLarray<T>(array: T[], maxLength: number): T[][] {
  const larray: T[][] = [];
  let subArray: T[] = [];
  if (array) {
    for (let i = 0; i < array.length; i++) {
      subArray.push(array[i]);

      if (subArray.length === maxLength || i === array.length - 1) {
        larray.push(subArray);
        subArray = [];
      }
    }
  }
  return larray;
}

export function ConvertLArrayToArray<T>(larray: T[][]) {
  let array: T[] = [];
  for (let i = 0; i < larray.length; i++) {
    for (let j = 0; j < larray[i].length; j++) {
      array.push(larray[i][j]);
    }
  }
  return array;
}
