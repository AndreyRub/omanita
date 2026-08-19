# Omanita — אומניתה site

Redesign of https://omanita.vp4.me/omanita for Jasmine Chochma (יסמין חוכמה) — an art studio
in Kfar Saba + Ra'anana teaching drawing to kids, teens and adults. Built by Andrey (AndreyRub)
to help a friend. Live preview: https://andreyrub.github.io/omanita/

## Hard rules for any Claude session editing this repo

- **Content edits only** unless the user explicitly asks for design work. Never change the
  design system (colors, fonts, layout) as a side effect of a content change.
- **Tone**: warm, simple, authentic — an artist's studio. Never sci-fi/techy/corporate.
- **Light theme only** — dark mode was deliberately removed. Do not reintroduce it.
- **No em dashes** in the Hebrew content (user preference). Use commas / colons / semicolons.
- **RTL Hebrew** — keep `dir="rtl"` and Hebrew punctuation (׳ ״) conventions.
- Times format `HH:MM-HH:MM`, days as `יום א׳`…`יום ו׳`, cities exactly `כפר סבא` / `רעננה`.
- After edits: rebuild (see below), commit, push. GitHub Pages deploys `main` automatically
  (~1 min). Always reply with what changed + the live URL.
- Do not remove the `noindex` meta tags or the "תצוגה מקדימה" ribbon — they are removed
  ONLY at domain cutover (see plan below).

## Build

Pages are generated from `src/`:

    python src/build.py     # regenerates index.html and sadnaot.html in repo root

- `src/omanita_v1_template.html` — main page, with `{{key}}` image placeholders
- `src/sadnaot_body.html` — workshops page body (shares the template's <style>)
- `src/imgs.json` — data-URI images, keyed. Originals in `src/assets-src/`
- `check.html`, `loader.js` — Google Sheets pilot (see below), edited directly
- `snippets.html` — paste-into-smoove blocks, edited directly

## Architecture / status (2026-08-19)

- **Design**: "studio pinboard" — white ground, mint (#3E8A7D/#DDEBE7) + rose (#C9557B)
  from her logo, Amatic SC display + Assistant body, student artwork pinned with tape.
  Variation 1 of a planned 3 (v2 "gallery white", v3 "color splash" not built yet).
- **Artifact preview** (for the user only): https://claude.ai/code/artifact/8b106162-6939-4f7d-98fd-0241521e6b6e
- **Sheets pilot** (may be retired): schedule + prices load client-side from two Google Sheets
  (IDs inside `loader.js`), baked-in HTML is the fallback. `check.html` = validation view.
  A consolidated single-spreadsheet + Apps Script design was drafted but NOT deployed;
  the leading alternative is Jasmine editing via her own Claude Pro + this repo.
- **Old-site content bugs fixed**: duplicated class/price rows, typos (מקצועים→מקצועיים,
  בבביט→בביט), July-vs-Sept registration contradiction, Hebrew image filenames → Latin.
- **Flagged for Jasmine**: workshop dates (2.8/4.8/9.8) passed; conflicting workshop times
  (16:30-18:30/4 pairs vs 10:30-12:30/3 pairs — site shows the latter); old site's keyword
  block mentions services not on new site (קומיקס, עיסת נייר, סריגה, פסיפס, ימי הולדת,
  טיפול באומנות) — ask which still exist.

## Migration plan (domain-first)

1. Register `omanita.co.il` (checked 2026-08-18: unregistered). Canonical = `www.` (CNAME).
2. Point `www` CNAME → smoove custom-domain flow; bare domain redirects to www.
3. Repoint Google Business Profile, ads, Facebook, article links → the domain. Search Console + sitemap.
4. Later: flip CNAME → `andreyrub.github.io`, set custom domain in repo settings.
   **Same commit**: remove noindex + ribbon, add SEO kit (meta description, JSON-LD
   LocalBusiness, sitemap.xml, canonical, OG tags).
5. smoove exit: export contacts incl. unsubscribes (Excel export in their UI), sweep media
   library, document automations, keep 1-2 months parallel, then cancel (monthly, no contract).
   Mailing-list successor only if she actually newsletters (check with her).

## Contact / facts

- Jasmine: WhatsApp/phone 052-461-7163, jasminh2000@yahoo.com, facebook.com/omanitaj
- Studios: גולדשטיין 2 כפר סבא · דרור 12ג׳ דירה 4 קריית שרת רעננה
- Her other pages (out of scope): coaching.vp4.me/jcoaching, omanitasadna.vp4.me/sadnaot (replaced by sadnaot.html)
