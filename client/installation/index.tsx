import $, { jsx } from "../assets/js/jsx.js";

function bytesToWord(bytes: number) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${Math.round(bytes / 1024 ** 2)} MB`;
  if (bytes < 1024 ** 4) return `${Math.round(bytes / 1024 ** 3)} GB`;
}

async function clearCache(dir: string) {
  let cache = await caches.open("v1");
  let keys = (await cache.keys())
    .map((e) => new URL(e.url).pathname)
    .filter((e) => e.startsWith(dir));

  await Promise.all(keys.map((e) => cache.delete(e)));
  reload();
}

function reload() {
  let storageInfo = $("#storage-info");
  try {
    if (!isSecureContext)
      storageInfo.text(
        "zSnout isn't running on a secure context, so we can't estimate your storage usage."
      );
    else if (!navigator.storage)
      storageInfo.text(
        "Your browser won't give us storage info, so we can't estimate your storage usage."
      );
    else
      navigator.storage.estimate().then((estimate) => {
        if (!estimate.usage || !estimate.quota)
          return storageInfo.text(
            "Your browser won't give us storage info, so we can't estimate your storage usage."
          );

        storageInfo.text(
          `zSnout is using ${bytesToWord(
            estimate.usage
          )} of storage space on your device. Your browser allows for a maximum of ${bytesToWord(
            estimate.quota
          )}.`
        );
      });
  } catch {
    storageInfo.text("We encountered a problem estimating your storage quota.");
  }

  let installation = $("#installation");
  try {
    if (navigator.serviceWorker?.controller)
      installation.text("zSnout is installed and ready to use offline!");
    else installation.text("zSnout isn't installed yet.");
  } catch {
    installation.text(
      "We encountered a problem checking zSnout's installation status."
    );
  }

  let cached = $("#cached");
  try {
    caches
      .open("v1")
      .then(async (cache) => {
        let resps = await cache.matchAll();

        let info: [url: string, size: number][] = await Promise.all(
          resps.map(async (res) => [
            new URL(res.url).pathname,
            (await res.blob()).size,
          ])
        );

        info = info.filter(
          ([url]) =>
            !url.startsWith("/assets") &&
            !url.startsWith("/offline") &&
            !url.startsWith("/icons")
        );

        let set = new Set(
          info.map(([url]) => url.slice(0, url.lastIndexOf("/") + 1))
        );
        set.delete("/");

        let dirSizes = Object.fromEntries(
          [...set].map<[string, number]>((dir) => [dir, 0])
        );

        for (let [url, size] of info)
          for (let key in dirSizes)
            if (url.startsWith(key)) dirSizes[key] += size;

        let fullDirSizes = Object.entries(dirSizes).sort(
          ([, a], [, b]) => b - a
        );
        let buttons = fullDirSizes.map(([dir, size]) => (
          <button onClick={clearCache.bind(null, dir)}>
            {dir.slice(1, -1)} - {bytesToWord(size)}
          </button>
        ));

        cached
          .empty()
          .addClass("buttonlist")
          .append("Click a directory to remove it from cache.", ...buttons);
      })
      .catch(() =>
        cached.text("We encountered a problem checking zSnout's caches.")
      );
  } catch {
    cached.text("We encountered a problem checking zSnout's caches.");
  }
}

reload();
