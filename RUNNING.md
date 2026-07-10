# Running the site locally

This site is built with [Vite](https://vite.dev). The dev server watches your
files and **live-reloads the browser** whenever you add or change something —
content, images, or downloadable files.

## First time only

Install dependencies:

```bash
npm install
```

## Start the dev server

```bash
npm run dev
```

Vite prints a local URL (usually <http://localhost:5173>). Open it in your
browser. Leave this command running while you work — every save updates the
page automatically. Press `Ctrl+C` in the terminal to stop it.

## Adding or changing download files

Downloadable files (CV/resume PDF, papers, etc.) live in:

```
public/files/
```

Anything you drop in `public/files/` is served at the site root. For example:

```
public/files/cv.pdf   →   http://localhost:5173/files/cv.pdf
```

Steps to update a download:

1. Copy or replace the file in `public/files/` (keep the same filename to
   avoid updating links, e.g. overwrite `cv.pdf`).
2. Save. The dev server picks it up — **reload the browser tab** to see the new
   file (static files in `public/` refresh on reload, not instantly like code).
3. If you used a new filename, update the link in the matching
   `content/*.yaml` file (e.g. `content/cv.yaml`) so the page points to it.

Images work the same way: put them in `public/images/` and reference them by
`/images/<name>`.

## Build for production (optional)

To generate the final static site in `dist/` and preview it exactly as it will
be deployed:

```bash
npm run build
npm run preview
```
