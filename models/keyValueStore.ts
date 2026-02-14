export class KeyValueStore<T> {
  private store: { [key: string]: T } = {};

  setValue(key: string, value: T): void {
    this.store[key] = value;
  }

  getValue(key: string): T | undefined {
    return this.store[key];
  }
  getAllKeys(): string[] {
    return Object.keys(this.store);
  }

  getAllValues(): T[] {
    return Object.values(this.store);
  }

  removeKey(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}
