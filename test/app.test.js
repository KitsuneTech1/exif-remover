import assert from "node:assert/strict";
import http from "node:http";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cleanFileName } from "../filename.js";
import { createPreviewServer, safePath } from "../server.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve(server.address().port);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function request(port, pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: "127.0.0.1", port, path: pathname }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({ body, headers: res.headers, statusCode: res.statusCode });
      });
    });
    req.on("error", reject);
  });
}

test("adds the clean suffix with the expected image extension", () => {
  assert.equal(cleanFileName("photo.jpg", "image/jpeg"), "photo-clean.jpg");
  assert.equal(cleanFileName("photo.jpeg", "image/jpeg"), "photo-clean.jpg");
  assert.equal(cleanFileName("diagram.png", "image/png"), "diagram-clean.png");
  assert.equal(cleanFileName("capture.webp", "image/webp"), "capture-clean.webp");
  assert.equal(cleanFileName("untitled", "image/jpeg"), "untitled-clean.jpg");
});

test("serves the static app and returns 404 for missing files", async () => {
  const server = createPreviewServer({ root });
  const port = await listen(server);

  try {
    const index = await request(port, "/");
    assert.equal(index.statusCode, 200);
    assert.match(index.headers["content-type"], /^text\/html/);
    assert.match(index.body, /<title>EXIF Remover<\/title>/);

    const script = await request(port, "/script.js");
    assert.equal(script.statusCode, 200);
    assert.match(script.headers["content-type"], /^text\/javascript/);

    const missing = await request(port, "/missing.txt");
    assert.equal(missing.statusCode, 404);
    assert.equal(missing.body, "Not found");
  } finally {
    await close(server);
  }
});

test("blocks path traversal before reading from disk", () => {
  assert.equal(safePath("/../package.json", root), null);
  assert.equal(safePath("/%2e%2e/package.json", root), null);
  assert.equal(safePath("/%zz", root), null);
});
