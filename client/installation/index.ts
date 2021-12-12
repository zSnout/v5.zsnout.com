import $ from "../assets/js/jsx.js";

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
      if (!estimate.usage)
        return storageInfo.text(
          "Your browser won't give us storage info, so we can't estimate your storage usage."
        );

      let usage = estimate.usage;

      if (usage < 1024)
        storageInfo.text(
          `zSnout is using ${usage} bytes of storage space on your device.`
        );
      else if (usage < 1024 * 1024)
        return storageInfo.text(
          `zSnout is using ${Math.round(
            usage / 1024
          )} KB of storage space on your device.`
        );
      else if (usage < 1024 * 1024 * 1024)
        return storageInfo.text(
          `zSnout is using ${Math.round(
            usage / 1024 / 1024
          )} MB of storage space on your device.`
        );
      else
        return storageInfo.text(
          `zSnout is using ${Math.round(
            usage / 1024 / 1024 / 1024
          )} GB of storage space on your device.`
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
