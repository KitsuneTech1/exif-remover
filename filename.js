export function extensionForType(type) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function cleanFileName(fileName, type) {
  const base = fileName.replace(/\.[^.]+$/, "").trim() || "image";
  return `${base}-clean.${extensionForType(type)}`;
}
