# Korea Guide preview

Restored from the supplied v7 archive on 2026-11-02. The previous environment's uncommitted WordPress migration was not present in the new environment. This checkout currently provides a static preview, not a running WordPress installation.

## Run locally

`python3 -m http.server 8080 --bind 127.0.0.1 --directory preview`

Open the local server in your browser. Homepage, airport planner and three editorial draft pages are included. The draft guides are not publication-ready. Transport prices and recommendations are withheld until independently verified; imported route and stop candidates remain unverified.

## Browser checks

With the server running and Python Playwright plus Chromium available, run `python3 tests/preview.py`. Tests exercise guide search, destination selection, terminal changes, result cards, reset, JavaScript errors and desktop/mobile overflow across all five pages.

Screenshots: preview/home.png and preview/calculator.png. No external analytics, paid API, or advertising was added. Public hosting and WordPress integration remain outstanding.

## Preview expansion

All pages now share primary/footer navigation and keyboard focus styling. About, contact-channel status, privacy, affiliate disclosure and editorial policy drafts were added, alongside three expandable homepage FAQs. Operator identity/contact and production privacy details remain pending. There is no contact submission form or tracking integration.

The ten-page desktop/mobile browser checks passed after this expansion. This repository is not connected to the separately supplied sites-project link; no public preview was published by these edits.

## Reviewed planner workflow (2026-11-04, Korea time)

`preview/assets/planner.js` renders transport options without legacy prices. Destination candidates are in `assets/places.js`; review records live in `data/transport.json`, mirrored in `assets/transport-data.js` for direct static loading. Edit JSON and regenerate its JS mirror together. All review records currently remain not_verified; attempted access dates do not establish verification.

Share links preserve only destination ID and terminal in the fragment; incoming area/terminal query links are also supported. No party size or luggage quantity is included in shared links. Myeongdong, Hongdae and Gangnam editorial drafts link to area-specific results. All preview pages are noindex until source review and publication checks finish.

Run `python3 tests/journey.py` for a self-contained local HTTP/browser check (requires Playwright and Chromium). It checks 13 pages at mobile and desktop widths, links, search, keyboard selection, history/reload, malformed selections, 30 places × two terminals and unverified data handling. See `docs/PROGRESS.md` for the public-site/source-access blockers. Deployment and verified current transport data are not included in this checkpoint.
