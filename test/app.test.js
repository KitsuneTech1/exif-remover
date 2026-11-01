import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cleanFileName, isSupportedImageType, outputTypeForBlob } from "../filename.js";
import { handleRequest, parsePort, safePath } from "../server.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function request(pathname, method = "GET", options = {}) {
  return new Promise((resolve, reject) => {
    const res = new PassThrough();
    const headers = {};
    res.writeHead = (statusCode, responseHeaders = {}) => {
      res.statusCode = statusCode;
      Object.assign(headers, responseHeaders);
      res.headersSent = true;
      return res;
    };
    const chunks = [];
    res.on("data", (chunk) => chunks.push(chunk));
    res.on("end", () => {
      resolve({
        body: Buffer.concat(chunks).toString("utf8"),
        headers: Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])),
        statusCode: res.statusCode
      });
    });
    res.on("error", reject);
    handleRequest({ method, url: pathname, headers: {} }, res, options);
  });
}

test("adds the clean suffix with the expected image extension", () => {
  assert.equal(cleanFileName("photo.jpg", "image/jpeg"), "photo-clean.jpg");
  assert.equal(cleanFileName("photo.jpeg", "image/jpeg"), "photo-clean.jpg");
  assert.equal(cleanFileName("diagram.png", "image/png"), "diagram-clean.png");
  assert.equal(cleanFileName("capture.webp", "image/webp"), "capture-clean.webp");
  assert.equal(cleanFileName("untitled", "image/jpeg"), "untitled-clean.jpg");
});

test("sanitizes path-like and unsafe file names", () => {
  assert.equal(cleanFileName("..\\private\\photo.jpg", "image/jpeg"), "photo-clean.jpg");
  assert.equal(cleanFileName("report<2026>|final?.png", "image/png"), "report_2026__final_-clean.png");
  assert.equal(cleanFileName("...", "image/jpeg"), "image-clean.jpg");
});

test("accepts only image types the browser flow can clean", () => {
  assert.equal(isSupportedImageType("image/jpeg"), true);
  assert.equal(isSupportedImageType("image/png"), true);
  assert.equal(isSupportedImageType("image/webp"), true);
  assert.equal(isSupportedImageType("image/gif"), false);
  assert.equal(isSupportedImageType("application/octet-stream"), false);
});

test("uses the actual canvas output type when a browser falls back", () => {
  assert.equal(outputTypeForBlob("image/webp", "image/png"), "image/png");
  assert.equal(outputTypeForBlob("image/jpeg", "image/jpeg"), "image/jpeg");
  assert.equal(outputTypeForBlob("image/webp", ""), "image/webp");
});

test("falls back safely for invalid preview ports", () => {
  assert.equal(parsePort(undefined), 5173);
  assert.equal(parsePort("5174"), 5174);
  assert.equal(parsePort("0"), 0);
  assert.equal(parsePort("not-a-port"), 5173);
  assert.equal(parsePort("70000"), 5173);
});

test("serves the static app and returns 404 for missing files", async () => {
  const index = await request("/");
  assert.equal(index.statusCode, 200);
  assert.match(index.headers["content-type"], /^text\/html/);
  assert.match(index.body, /<title>EXIF Remover<\/title>/);

  const script = await request("/script.js");
  assert.equal(script.statusCode, 200);
  assert.match(script.headers["content-type"], /^text\/javascript/);

  const head = await request("/index.html", "HEAD");
  assert.equal(head.statusCode, 200);
  assert.equal(head.body, "");

  const page = await request("/index.html");
  assert.match(page.body, /accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(page.body, /src="\.\/script\.js" type="module"/);

  const missing = await request("/missing.txt");
  assert.equal(missing.statusCode, 404);
  assert.equal(missing.body, "Not found");
});

test("does not accept upload methods", async () => {
  const response = await request("/", "POST");
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.allow, "GET, HEAD");
  assert.equal(response.body, "Method not allowed");
});

test("blocks path traversal before reading from disk", () => {
  assert.equal(safePath("/../package.json", root), null);
  assert.equal(safePath("/%2e%2e/package.json", root), null);
  assert.equal(safePath("/%zz", root), null);
  assert.equal(safePath("/%00", root), null);
});

test("does not follow a symlink outside the static root", () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "exif-remover-test-"));
  const staticRoot = path.join(base, "public");
  const outsideFile = path.join(base, "outside.html");

  try {
    fs.mkdirSync(staticRoot);
    fs.writeFileSync(outsideFile, "not public");
    fs.symlinkSync(outsideFile, path.join(staticRoot, "linked.html"));
    assert.equal(safePath("/linked.html", staticRoot), null);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test("does not expose unrecognized files from the static root", async () => {
  const response = await request("/package.json");
  assert.equal(response.statusCode, 404);
  assert.equal(response.body, "Not found");
});

test("does not stream directories with public-looking extensions", async () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "exif-remover-test-"));
  const staticRoot = path.join(base, "public");

  try {
    fs.mkdirSync(path.join(staticRoot, "folder.js"), { recursive: true });
    const response = await request("/folder.js", "GET", { root: staticRoot });
    assert.equal(response.statusCode, 404);
    assert.equal(response.body, "Not found");
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test("returns a client error for a malformed request URL", async () => {
  const response = await request("http://[", "GET");
  assert.equal(response.statusCode, 400);
  assert.equal(response.body, "Bad request");
});
