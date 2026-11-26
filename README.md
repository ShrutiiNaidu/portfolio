# Shruti Naidu — Panda Garden Portfolio

A responsive portfolio for Shruti Naidu with a white-and-pink panda garden, inspired by the immersive layout of the reference portfolio. The root folder contains the deployable Shruti site.

## Run locally

### Option 1 — open directly
Double-click `index.html`.

### Option 2 — local server (recommended)

```bash
python -m http.server 5500
```

Open `http://localhost:5500`.

## Features

- Responsive navigation and section layouts
- One shared, fixed 3D garden behind every section, with a path, grass, flowers, bamboo, rocks, and pandas
- A procedural panda walk-up, greeting, and kiss sequence, plus falling petals and scroll reveals
- Clicking any garden panda or panda icon makes a panda turn toward you, wave, and say "hi!"
- Reduced-motion support and keyboard-accessible navigation
- Static files with no build step; Three.js loads from a CDN with an emoji fallback

The garden camera eases along the same 3D path as the page scrolls. Rendering targets 60 fps on larger screens and 45 fps with lighter graphics on compact/touch devices; reduced-motion preferences remain respected. Panda models and fur textures are generated procedurally; no external rigged panda model or animation asset is bundled, so the scene is stylized rather than photorealistic.

## Publish it

Deploy the repository root as a static site. The included `CNAME` configures the custom domain for GitHub Pages.

## Customize

- `index.html` — content, sections and links
- `style.css` — colors, layout and responsive design
- `script.js` — navigation, typing effect and scroll animations
