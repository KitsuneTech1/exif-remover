import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function parsePort(value) {
  if (value === undefined || value === null || String(value).trim() === "") return 5173;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 65535 ? parsed : 5173;
}

const port = parsePort(process.env.PORT);
const host = "localhost";

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"]
]);

function isWithinRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

export function safePath(urlPath, root = __dirname) {
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  let decoded;

  try {
    decoded = decodeURIComponent(requested);
  } catch {
    return null;
  }

  if (decoded.includes("\0")) return null;

  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, `.${decoded}`);
  if (!isWithinRoot(resolvedRoot, resolved)) {
    return null;
  }

  try {
    const realRoot = fs.realpathSync(resolvedRoot);
    const realPath = fs.realpathSync(resolved);
    return isWithinRoot(realRoot, realPath) ? realPath : null;
  } catch {
    return null;
  }
}

export function handleRequest(req, res, { root = __dirname } = {}) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, {
      Allow: "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end("Method not allowed");
    return;
  }

  let url;
  try {
    url = new URL(req.url || "/", "http://localhost");
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  const filePath = safePath(url.pathname, root);
  const contentType = filePath && types.get(path.extname(filePath).toLowerCase());
  let isFile = false;
  try {
    isFile = Boolean(filePath && fs.statSync(filePath).isFile());
  } catch {
    isFile = false;
  }

  if (!filePath || !contentType || !isFile) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff"
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    } else {
      res.destroy();
    }
  });
  stream.pipe(res);
}

export function createPreviewServer(options = {}) {
  return http.createServer((req, res) => handleRequest(req, res, options));
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  createPreviewServer().listen(port, host, () => {
    console.log(`EXIF remover preview: http://${host}:${port}`);
  });
}
