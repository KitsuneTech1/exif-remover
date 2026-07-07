# EXIF Remover

Strip EXIF and metadata from images entirely in your browser. Nothing gets uploaded.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**[Try it live](https://kitsunetech1.github.io/exif-remover/)**

![EXIF Remover screenshot](docs/screenshot.png)

## Features

- Accepts JPEG, PNG, and WebP images.
- Re-encodes every image through a browser canvas, which drops all embedded metadata.
- Exports cleaned copies with `-clean` added to the filename.
- Runs fully client-side. No upload route exists, nothing leaves the browser.

## Run locally

```powershell
node server.js
```

Then open `http://127.0.0.1:5173`.

`server.js` is just a static file server, there is no backend processing.

## How it works

The browser decodes the selected image into a canvas and redraws the pixels. The re-encoded output has no EXIF, GPS, or other metadata blocks because none of that data is part of the canvas pixel buffer.

## Limitations

Re-encoding means recompression. JPEG and WebP outputs are re-encoded at quality 0.92, so repeated cleaning cycles will lose some quality. Animated images are exported as still frames since the canvas only holds one decoded frame at a time.

## License

MIT, see [LICENSE](LICENSE).

---

Built by [Kitsune Technologies](https://kitsunetechnologies.org). See more of our work at [kitsunetechnologies.org/work](https://kitsunetechnologies.org/work). Issues and PRs welcome.
