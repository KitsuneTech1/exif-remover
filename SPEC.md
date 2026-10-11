# SPEC

## Inventory

- Existing tool: static browser app for removing image metadata.
- Language: plain HTML, CSS, and browser JavaScript. Local preview server uses Node.js ES modules.
- Build system: none. `package.json` only declares `"type": "module"` and `"license": "MIT"`.
- Runtime: modern browser for the app, Node.js 18 or newer for local preview.
- Entry points: `index.html`, `script.js`, `styles.css`, and `server.js`.
- Tests: no automated tests exist yet.
- README: present, with live demo link, local run steps, feature list, limitations, and screenshot.
- License: `LICENSE` is standard MIT text with `Copyright (c) 2026 Kitsune Technologies LLC`.
- Authors: `AUTHORS.md` is present.
- Assets: `docs/screenshot.png` is present.
- Git state before this spec: `.gitignore` exists in the working tree but is untracked.

## Smallest Honest Release

Feature list:

1. Let you select or drop JPEG, PNG, and WebP images in the browser.
2. Decode each image and redraw it to a canvas so EXIF, GPS, and embedded metadata are not copied.
3. Export cleaned images with `-clean` added to the filename.
4. Let you download each cleaned image, plus all cleaned images from the current batch.
5. Serve the same static app locally with a Node.js standard library server and no upload endpoint.

Language and runtime:

- Browser JavaScript, HTML, and CSS.
- Node.js 18 or newer for the local preview server only.

Install command:

- No install command is required. The project has no dependencies.

Demo command:

```powershell
node server.js
```

Then open `http://127.0.0.1:5173`.

Testing plan:

- Add a Node test command using the built-in `node:test` runner.
- Test filename conversion for JPEG, PNG, WebP, and extensionless names.
- Test that the preview server returns `index.html`, static assets, 404 for missing files, and blocks path traversal.
- Manually smoke test the browser flow with a sample JPEG and confirm the cleaned download opens and uses the `-clean` suffix.

## Release Blockers

- `.gitignore` is untracked and only ignores `.oss31/`. It must also ignore `.env`, `node_modules`, `.venv`, `target`, and build artifacts.
- There is no automated test command.
- `package.json` has no `scripts`, so `npm test` and `npm start` do not work.
- Need a final secrets and path scan before release.
- Need to confirm the existing GitHub Pages demo is enabled after publish.
