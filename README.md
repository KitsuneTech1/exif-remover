# EXIF Remover

A small local privacy tool that strips image metadata in the browser.

## What It Does

- Accepts JPEG, PNG, and WebP images.
- Re-encodes images through a browser canvas.
- Exports cleaned copies with `-clean` added to the filename.
- Runs fully client-side; images are not uploaded to a server.

## Run Locally

```powershell
node server.js
```

Then open:

```text
http://127.0.0.1:5173
```

## Note

Animated images are exported as still images because the cleaner redraws the decoded image pixels to canvas.
