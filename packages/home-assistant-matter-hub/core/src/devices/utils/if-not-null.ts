export function ifNotNull<T, R = T>(value: T | undefined | null, cb: (value: T) => R): R | undefined {
  if (value != undefined) {
    return cb(value);
  }
  return undefined;
}
