/**
 * Gets the value of a saved property from localStorage.
 * @param key The item to get.
 * @returns The value of the item in localStorage.
 */
export function getStorage<T extends keyof StorageItems>(
  key: T
): StorageItems[T] | null {
  return localStorage.getItem(key) as StorageItems[T] | null;
}

/**
 * Sets the value of a property in localStorage.
 * @param key The item to set.
 * @param value The value to set the item to.
 */
export function setStorage<T extends keyof StorageItems>(
  key: T,
  value: StorageItems[T]
) {
  let eventWasNotCanceled = window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      oldValue: getStorage(key),
      newValue: value || null,
    })
  );

  if (eventWasNotCanceled) {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  }
}

/**
 * Listens for changes to a property in localStorage.
 * @param key The item to listen for.
 * @param callback The function to call when the item changes.
 * @warning When using `setStorage` in the same frame, the callback will be called BEFORE localStorage is updated.
 * To avoid problems with this, use the value passed to the callback as the new value.
 */
export function onStorageChange<T extends keyof StorageItems>(
  key: T,
  callback: (val: StorageItems[T] | null, cancel: () => void) => void
) {
  window.addEventListener("storage", (event) => {
    if (event.key === key)
      callback(event.newValue as StorageItems[T] | null, () =>
        event.preventDefault()
      );
  });
}

/**
 * Gets the location hash.
 * @returns The current hash (without a prefixed #) of the URL.
 */
export function getLocationHash() {
  return decodeURI(location.hash.slice(1));
}

/**
 * Sets the location hash.
 * @param hash The hash to set.
 */
export function setLocationHash(hash: string) {
  let newURL = new URL(location.href);
  newURL.hash = encodeURI(hash);

  let eventWasNotCanceled = window.dispatchEvent(
    new HashChangeEvent("hashchange", {
      oldURL: location.href,
      newURL: newURL.toString(),
    })
  );

  if (eventWasNotCanceled) location.hash = encodeURI(hash);
}

/**
 * Listens for changes to the location hash.
 * @param callback The function to call when the hash changes.
 */
export function onLocationHashChange(
  callback: (hash: string, cancel: () => void) => void
) {
  window.addEventListener("hashchange", (event) => {
    callback(decodeURI(new URL(event.newURL).hash.slice(1)), () =>
      event.preventDefault()
    );
  });
}

/**
 * Decodes a base64 string.
 * @param base64 The base64 string to decode.
 * @returns The decoded string.
 */
export function encodeBase64(plaintext: string): string {
  try {
    return btoa(plaintext.replace(/[^\x00-\xff]+/g, ""));
  } catch {
    return "";
  }
}

/**
 * Decodes a base64 string.
 * @param base64 The base64 string to decode.
 * @returns The decoded string.
 */
export function decodeBase64(base64: string): string | null {
  try {
    return atob(base64) || null;
  } catch {
    return null;
  }
}

/**
 * Shuffles an array.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
export function shuffle<T>(array: T[]): T[] {
  let m = array.length;
  let t, i;

  while (m) {
    i = Math.floor(Math.random() * m--);
    [array[m], array[i]] = [array[i], array[m]];
  }

  return array;
}

/**
 * Picks a random integer in a specified range.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns A random integer in the inclusive range [`min`, `max`].
 */
export function randint(): 0 | 1;
export function randint(min: number, max: number): number;
export function randint(min = 0, max = 1) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

declare global {
  /** A list of items that can be put into localStorage. */
  interface StorageItems {}
}
