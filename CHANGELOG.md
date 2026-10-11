# Changelog

## v0.1.0

First release. Strips EXIF, GPS, and other embedded metadata from JPEG, PNG, and WebP images by decoding each one to a browser canvas and re-encoding it, so the metadata is never copied. Cleaned files download with `-clean` added to the name, and you can grab them one at a time or as a batch. Everything runs in the browser, and the included Node.js preview server has no upload route, so nothing you process leaves your machine.