/**
 * Gets the value of a saved property from localStorage.
 * @param key The item to get.
 * @returns The value of the item in localStorage.
 */
export function getStorage<T extends keyof StorageItems>(
  key: T
): StorageItems[T] | null {
  return localStorage.getItem(key) as T | null;
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
      newValue: value,
    })
  );

  if (eventWasNotCanceled) localStorage.setItem(key, value);
}

/**
 * Listens for changes to a property in localStorage.
 * @param key The item to listen for.
 * @param callback The function to call when the item changes.
 */
export function onStorageChange<T extends keyof StorageItems>(
  key: T,
  callback: (val: T | null, cancel: () => void) => void
) {
  window.addEventListener("storage", (event) => {
    if (event.key === key)
      callback(event.newValue as T | null, () => event.preventDefault());
  });
}

/**
 * Gets the location hash.
 * @returns The current hash (without a prefixed #) of the URL.
 */
export function getLocationHash() {
  return window.location.hash.slice(1);
}

/**
 * Sets the location hash.
 * @param hash The hash to set.
 */
export function setLocationHash(hash: string) {
  let oldHref = window.location.href;
  let eventWasNotCanceled = window.dispatchEvent(
    new HashChangeEvent("hashchange", {
      oldURL: oldHref,
      newURL: window.location.href,
    })
  );

  if (eventWasNotCanceled) window.location.hash = hash;
}

/**
 * Listens for changes to the location hash.
 * @param callback The function to call when the hash changes.
 */
export function onLocationHashChange(
  callback: (hash: string, cancel: () => void) => void
) {
  window.addEventListener("hashchange", (event) => {
    callback(new URL(event.newURL).hash.slice(1), () => event.preventDefault());
  });
}

declare global {
  /** A list of items that can be put into localStorage. */
  interface StorageItems {}
}
