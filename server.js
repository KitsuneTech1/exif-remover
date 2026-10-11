import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 5173);
const host = "127.0.0.1";

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"]
]);

export function safePath(urlPath, root = __dirname) {
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  let decoded;

  try {
    decoded = decodeURIComponent(requested);
  } catch {
    return null;
  }

  const resolved = path.resolve(root, `.${decoded}`);
  const relative = path.relative(root, resolved);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    return null;
  }
  return resolved;
}

export function createPreviewServer({ root = __dirname } = {}) {
  return http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const filePath = safePath(url.pathname, root);

    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types.get(path.extname(filePath)) || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  createPreviewServer().listen(port, host, () => {
    console.log(`EXIF remover preview: http://${host}:${port}`);
  });
}
