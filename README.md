# AVNEditor

A small, installable web app that turns up to four photos into a square 2x2 collage. Photos stay in the browser; nothing is uploaded.

## Run it locally

Run `npm run serve`, then open `http://localhost:8080` in a browser. On the same Wi-Fi network, open `http://YOUR-LAPTOP-IP:8080` on a phone for a quick responsive-layout test.

For the phone's actual **Install app / Add to Home Screen** behavior, publish this folder to any HTTPS static host (for example GitHub Pages, Netlify, or Azure Static Web Apps). Browsers only enable service workers and installability on HTTPS (or localhost).

## Use it

1. Select **Add photos** and choose up to four images.
2. Tap/click a tile to replace that photo.
3. Select **Save collage** to download a PNG.
