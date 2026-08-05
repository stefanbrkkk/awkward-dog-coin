# Awkward Dog Coin — $AWDG

A one-page site for **Awkward Dog Coin ($AWDG)**, a fair-launch memecoin on Solana.

> just a good boy in a sweater that's a bit too tight

Static, dependency-free, and self-contained: three files plus assets, no build step,
no framework, no third-party requests at runtime.

## Running it

Any static file server will do:

```bash
python3 -m http.server 8080
# then open http://127.0.0.1:8080
```

Deploy by uploading the repository root to any static host (GitHub Pages, Netlify,
Vercel, Cloudflare Pages). There is nothing to compile.

## Files

```
index.html          markup and metadata
styles.css          design tokens, layout, motion
main.js             scroll reveals and the portrait parallax
vercel.json         cache and security headers (ignored by other hosts)
assets/
  dog-*.webp        the illustration, background removed, 3 widths
  dog-1024.png      fallback for browsers without WebP
  og-image.jpg      1200×630 share card
  favicon-*.png     icons
  fonts/            Jost + Inter, latin subset, variable, self-hosted
```

## Design notes

- **Palette** — warm ivory `#FBF8F3` and sand `#F1E9DC` surfaces, warm charcoal ink,
  and a muted `#9E4840` drawn from the sweater. Nothing saturated.
- **Type** — Jost for display (light, generously tracked), Inter for text. Both are
  self-hosted variable fonts so the page makes no external requests.
- **Layout** — one 1180px measure. On wide screens each section is a rail label plus a
  content column; every content block resolves to the same right-hand edge, and each
  rail label's cap-height is aligned to the first line of its section's content.
- **The portrait** — the artwork is cropped at its own right and bottom edges, so it is
  placed to bleed past both edges of the plate. The crop then reads as framing rather
  than as damage, and the remaining air sits in front of the dog, which faces left.
- **Motion** — fades with a 16px rise, gently staggered; a ~10px parallax on the
  portrait. Everything is disabled under `prefers-reduced-motion`, and all content is
  visible with JavaScript off.

## Editing content

- **Contract address** — `index.html`, the `.ca` block in the *How to buy* section.
  Replace `Coming soon` with the address once it exists.
- **Links** — Telegram and X URLs appear in the hero and in the *Community* section.
- **Share image** — `og:image` and `twitter:image` in the `<head>` are relative paths.
  Telegram and X want absolute ones, so once the site has a real address, change both
  to `https://yourdomain.com/assets/og-image.jpg` or previews may not render.
- **Colours, spacing, motion** — the `:root` custom properties at the top of `styles.css`.

Assets are served with a week-long cache. If you replace an image, give the new file a
new name rather than overwriting, so returning visitors are not served the old one.

## Checks this passes

- No horizontal overflow from 320px to 1728px.
- All 58 text nodes meet WCAG AA contrast on their actual background.
- Every scroll reveal fires at every tested viewport, including the last element on
  the page.
- Renders completely with JavaScript disabled.
- ~220KB total on first load, in 6 requests.
