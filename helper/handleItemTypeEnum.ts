export function getEnumValue<T, U>(enumFrom: T, enumTo: U, value: T[keyof T]): U[keyof U] | undefined {
  for (const key in enumFrom) {
    if (enumFrom[key as keyof typeof enumFrom] === value) {
      return enumTo[key as unknown as keyof typeof enumTo];
    }
  }
  return enumFrom ? enumTo[enumFrom as keyof U] : undefined;
}
