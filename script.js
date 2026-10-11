import { cleanFileName } from "./filename.js";

const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const results = document.querySelector("#results");
const downloadAll = document.querySelector("#downloadAll");
const rowTemplate = document.querySelector("#rowTemplate");

let cleanItems = [];

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function canvasToBlob(canvas, type) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export the cleaned image."));
      },
      type,
      type === "image/jpeg" || type === "image/webp" ? 0.92 : undefined
    );
  });
}

function revokePreviousUrls() {
  for (const item of cleanItems) {
    URL.revokeObjectURL(item.url);
  }
  cleanItems = [];
}

async function stripMetadata(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const outputType = ["image/jpeg", "image/png", "image/webp"].includes(file.type)
      ? file.type
      : "image/jpeg";
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { alpha: outputType !== "image/jpeg" });
    context.drawImage(bitmap, 0, 0);
    const blob = await canvasToBlob(canvas, outputType);
    return {
      blob,
      outputType,
      width: bitmap.width,
      height: bitmap.height
    };
  } finally {
    bitmap.close();
  }
}

function addRow({ file, status, message, url, outputName, cleanSize, width, height }) {
  const fragment = rowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".result-row");
  const preview = fragment.querySelector(".preview");
  const title = fragment.querySelector(".result-copy strong");
  const meta = fragment.querySelector(".result-copy span");
  const link = fragment.querySelector(".download");

  title.textContent = file.name;

  if (status === "ready") {
    const image = document.createElement("img");
    image.alt = "";
    image.src = url;
    preview.append(image);
    meta.textContent = `${formatBytes(file.size)} to ${formatBytes(cleanSize)} | ${width}x${height}`;
    link.href = url;
    link.download = outputName;
  } else {
    row.classList.add("error");
    meta.textContent = message;
    link.remove();
  }

  results.append(fragment);
}

async function processFiles(fileList) {
  const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;

  revokePreviousUrls();
  results.replaceChildren();
  downloadAll.disabled = true;
  fileInput.disabled = true;
  dropZone.querySelector("strong").textContent = "Cleaning metadata...";

  for (const file of files) {
    try {
      const clean = await stripMetadata(file);
      const url = URL.createObjectURL(clean.blob);
      const outputName = cleanFileName(file.name, clean.outputType);
      cleanItems.push({ url, outputName });
      addRow({
        file,
        status: "ready",
        url,
        outputName,
        cleanSize: clean.blob.size,
        width: clean.width,
        height: clean.height
      });
    } catch (error) {
      addRow({
        file,
        status: "error",
        message: error.message || "Could not clean this image."
      });
    }
  }

  downloadAll.disabled = cleanItems.length === 0;
  fileInput.disabled = false;
  fileInput.value = "";
  dropZone.querySelector("strong").textContent = "Select images to clean";
}

fileInput.addEventListener("change", (event) => {
  processFiles(event.currentTarget.files);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragging");
  processFiles(event.dataTransfer.files);
});

downloadAll.addEventListener("click", () => {
  for (const item of cleanItems) {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.outputName;
    link.click();
  }
});
