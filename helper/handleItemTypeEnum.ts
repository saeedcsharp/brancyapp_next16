// export function getTargetItemType(value: number): string {
//   for (const key in ItemType) {
//     if (ItemType[key as keyof typeof ItemType] === value) {
//       return JsonItemType[key as keyof typeof JsonItemType];
//     }
//   }
//   return "";
// }
// export function getItemType(value: string): number {
//   for (const key in JsonItemType) {
//     if (JsonItemType[key as keyof typeof JsonItemType] === value) {
//       return ItemType[key as keyof typeof ItemType];
//     }
//   }
//   return 0;
// }

// export function getTargetResponseType(value: number): string {
//   for (const key in ResponseType) {
//     if (ResponseType[key as keyof typeof ResponseType] === value) {
//       return ResponseText[key as keyof typeof ResponseText];
//     }
//   }
//   return "";
// }

export function getEnumValue<T, U>(enumFrom: T, enumTo: U, value: T[keyof T]): U[keyof U] | undefined {
  for (const key in enumFrom) {
    if (enumFrom[key as keyof typeof enumFrom] === value) {
      return enumTo[key as unknown as keyof typeof enumTo];
    }
  }
  return enumFrom ? enumTo[enumFrom as keyof U] : undefined;
}
