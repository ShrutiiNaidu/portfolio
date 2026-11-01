# Shruti Naidu — Panda & Flowers Portfolio

A responsive, single-page portfolio for Shruti Naidu with a soft panda, flowers and bamboo garden theme. The design is intentionally warm and editorial rather than neon or overly futuristic.

## Run locally

### Option 1 — open directly
Double-click `index.html`.

### Option 2 — local server (recommended)

```bash
python -m http.server 5500
```

Open `http://localhost:5500`.

## Mobile support

The portfolio is optimized for phone screens, including:
- responsive typography and spacing
- touch-friendly navigation and buttons
- mobile hamburger menu
- stacked experience, certification and education cards
- no horizontal page overflow
- reduced-motion support
- safe layouts for narrow screens (including 360–380px widths)

## Publish it publicly

### Netlify — easiest
1. Go to Netlify and choose **Add new site → Deploy manually**.
2. Drag the entire `ShrutiPortfolio` folder into the upload area.
3. Netlify will immediately provide a public `*.netlify.app` URL.
4. Optional: change the site name in **Site configuration → Domain management**.

The included `netlify.toml` is ready for deployment.

### Vercel
1. Import this folder/repository into Vercel.
2. Framework preset: **Other** (static site).
3. Build command: leave empty.
4. Output directory: `.`

The included `vercel.json` is ready for deployment.

## Customize

- `index.html` — content, sections and links
- `style.css` — colors, layout and responsive design
- `script.js` — navigation, typing effect and scroll animations
