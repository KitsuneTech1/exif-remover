export const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

export function isSupportedImageType(type) {
  return supportedImageTypes.has(type);
}

export function outputTypeForBlob(requestedType, blobType) {
  return isSupportedImageType(blobType) ? blobType : requestedType;
}

export function extensionForType(type) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function cleanFileName(fileName, type) {
  const leafName = String(fileName ?? "").replace(/\\/g, "/").split("/").pop() || "";
  const base = leafName
    .replace(/\.[^.]*$/, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/[. ]+$/g, "")
    .trim() || "image";
  return `${base}-clean.${extensionForType(type)}`;
}
