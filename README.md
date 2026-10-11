<p align="center"><a href="https://kitsunetechnologies.org/work"><img src="https://raw.githubusercontent.com/KitsuneTech1/.github/main/assets/kitsune-banner.svg" alt="Built by Kitsune Technologies" width="760"></a></p>

# EXIF Remover

Strip EXIF and location metadata from photos in your browser. Nothing is uploaded.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**[Try it live](https://kitsunetech1.github.io/exif-remover/)**

![EXIF Remover screenshot](docs/screenshot.png)

## What it does

- Lets you select or drop JPEG, PNG, and WebP images in the browser.
- Decodes each image and redraws it to a canvas, so EXIF, GPS, and other embedded metadata are not copied.
- Exports cleaned images with `-clean` added to the filename.
- Lets you download each cleaned image, plus all cleaned images from the current batch.
- Serves the same static app locally with a small Node.js server that has no upload route.

## What you need

You only need this to run your own copy. To just use the tool, open the [live demo](https://kitsunetech1.github.io/exif-remover/) and drop an image in. Nothing leaves your browser either way.

- Node.js 18 or newer. It only serves the files, it does no processing. Check your version with `node --version` in a terminal. If that prints an error instead of a version, get Node from https://nodejs.org (click the LTS button).
- Any modern browser (Chrome, Firefox, Edge, or Safari).

## Install

1. Get the files. If you have git:

   ```powershell
   git clone https://github.com/KitsuneTech1/exif-remover.git
   cd exif-remover
   ```

   If you do not have git, click the green **Code** button on the GitHub page, choose **Download ZIP**, then right-click the zip and choose **Extract All**.

2. There is nothing to install. The project has no dependencies, so there is no `npm install` step.

   Expected output: none. You are ready to run it.

## Use it

1. Open a terminal in the `exif-remover` folder. In File Explorer, click the address bar, type `powershell`, and press Enter. That opens a terminal already in the folder.
2. Start the server:

   ```powershell
   node server.js
   ```

   You should see:

   ```
   EXIF remover preview: http://127.0.0.1:5173
   ```

3. Open your browser and go to `http://127.0.0.1:5173`.

To stop the server, go back to the terminal and press `Ctrl+C`.

## It worked if

The page loads and shows the EXIF Remover drop area, and dropping an image in produces a cleaned download with `-clean` in the filename.

## Troubleshooting

- `node` is not recognized as the name of a cmdlet: Node.js is not installed, or you need to close and reopen your terminal after installing it so it finds the new command.
- `Not found` in the browser: make sure the terminal is in the `exif-remover` folder itself (the one with `index.html` in it), not a folder above or below it.
- `EADDRINUSE: address already in use 127.0.0.1:5173`: something else is already using port 5173. Run `$env:PORT=5174; node server.js` instead, then open `http://127.0.0.1:5174`.
- `SyntaxError: Unexpected token` or similar on startup: your Node.js is older than version 18. Run `node --version` and upgrade from https://nodejs.org if it is below `v18`.

## How it works

The browser decodes the selected image into a canvas and redraws the pixels. The re-encoded output has no EXIF, GPS, or other metadata blocks, because none of that is part of the canvas pixel buffer.

Re-encoding means recompression. JPEG and WebP outputs are re-encoded at quality 0.92, so repeated cleaning cycles lose some quality. Animated images are exported as still frames, since the canvas holds one decoded frame at a time.

## License

MIT. Copyright (c) 2026 Kitsune Technologies LLC. Do what you like with it, commercially or otherwise, just keep the copyright notice. Full text in [LICENSE](LICENSE).