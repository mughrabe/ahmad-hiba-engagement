# جاهة وخطبة أحمد وهبة · Ahmad & Hiba Engagement

A bilingual (Arabic + English) engagement invitation website for 25 July 2026 at Qasr Khalda Halls, Amman.

## What's inside

```
engagement/
├── index.html        ← Main page
├── style.css         ← All styling
├── script.js         ← Behavior (countdown, RSVP, language, music)
├── README.md         ← This file
├── audio/
│   └── background.mp3
└── images/
    ├── venue-stage.jpg
    ├── venue-hall.jpg
    ├── venue-chandelier.jpg
    └── venue-exterior.jpg
```

## Run it locally

```bash
cd engagement
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Deploy (public link to share)

The simplest option: drag the entire `engagement` folder onto **https://app.netlify.com/drop** — you'll get an instant public URL like `https://yourname.netlify.app`. Other options that all work: Vercel, GitHub Pages, Cloudflare Pages.

**Important:** make sure the `images/` and `audio/` folders are uploaded too, or the photos and music won't appear.

## Configuration

All configurable values live at the top of `script.js`:

```js
const RSVP_ENDPOINT  = 'https://script.google.com/...'; // already set
const WHATSAPP_AHMAD = '962795183834';
const WHATSAPP_HIBA  = '962777632663';
const EVENT_DATE     = new Date('2026-07-25T17:00:00+03:00');
```

## Default behavior

- **Language:** Arabic by default. Tap the `EN` button (top right) to switch to English, then `AR/EN` to show both, then back to Arabic.
- **Music:** ON by default. Modern browsers block autoplay until the user interacts with the page, so the site tries to play immediately; if blocked, a small "Tap anywhere to play music" hint appears, and music starts on the first tap/scroll. Guests can also use the speaker icon in the nav to pause/resume.
- **RSVP:** submissions go to the configured Google Apps Script endpoint and the guest's browser remembers their submission (so they won't accidentally RSVP twice from the same device).

## Editing content

- **Bride / groom names:** search `index.html` for `أحمد` / `هبة` / `Ahmad` / `Hiba`.
- **Family names:** search for `المغربي` and `الشوابكة`.
- **Date & venue:** search the HTML for `25` / `تموز` / `July` / `قصر خلدا`.
- **Program timeline:** in the `<section id="program">` block.
- **Quran verse / invitation prose:** in the `<section id="invite">` block.

## Colors (in `style.css`)

```css
--navy:        #0a1628;    /* main background */
--gold-bright: #f5d98a;    /* highlights */
--gold:        #d4af6a;    /* primary gold */
--ivory:       #f5ebd6;    /* body text */
```

## RSVP backend (Google Sheets)

The endpoint is already wired up. To check it's working:

1. Open your Google Sheet.
2. Submit a test RSVP from the site.
3. A new row should appear with timestamp, name, phone, guests, and attending status.

If submissions aren't reaching the sheet:
- Make sure the Apps Script deployment is set to **"Anyone"** access.
- Each time you change the Apps Script code, redeploy as a **new version**.

The site uses `fetch(..., { mode: 'no-cors' })` for the POST, which is the standard Apps Script integration pattern — the response is opaque but the data still arrives in the sheet.

## Troubleshooting

- **No music plays:** Click anywhere on the page once — browsers require user interaction before audio can play.
- **Images don't show:** the `images/` folder must be deployed alongside `index.html`. Check the network tab in DevTools.
- **RSVP form doesn't submit:** open DevTools → Console and check for errors. Most often the Apps Script needs to be redeployed with "Anyone" access.

---
Made with love · 2026
