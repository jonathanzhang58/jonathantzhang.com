# Editing your website content

All the words and images on the site live in this folder — you never need to
touch the code. Each page has its own file:

| File | What it controls |
|---|---|
| `site.yaml` | Your name, initials, affiliation, splash text, face photo (hero + sidebar + nav + tab titles) |
| `home.yaml` | The greeting and the "currently" status box |
| `bio.yaml` | Portrait photo and bio paragraphs |
| `research.yaml` | Research statement and publication list |
| `projects.yaml` | Project cards (and optional per-card detail pages) |
| `cv.yaml` | CV timeline rows and the PDF download |
| `hobbies.yaml` | Hobby cards (and optional per-card detail pages) |
| `contact.yaml` | Sign-off line and contact links |

## How to edit

1. Open a `.yaml` file in any text editor and change the text. The `#` lines
   are comments explaining each field.
2. Preview: run `npm run dev` and open http://localhost:5173 — the page
   updates live every time you save a file.
3. Publish: run `npm run build` (then deploy however you deploy).

## YAML in 30 seconds

- `field: some text` — plain text, no quotes needed most of the time.
- Wrap the value in quotes if it contains a colon: `title: 'Results: a study'`
- `>-` starts a multi-line paragraph; keep the lines indented:

  ```yaml
  splash: >-
    This is one paragraph
    written across two lines.
  ```

- Lists repeat a `- ` block per item:

  ```yaml
  publications:
    - title: My First Paper
      authors: Me, A Colleague
      venue: NeurIPS 2026
      link: https://arxiv.org/abs/xxxx.xxxxx
  ```

## Adding photos and files

1. Drop the file into the `public/images/` folder (or `public/files/` for
   PDFs like your CV).
2. Reference it in the yaml **without** the `public/` prefix:

   ```yaml
   portrait: images/portrait.jpg
   pdf: files/cv.pdf
   ```

Empty string (`''`) on any image/link field means "use the placeholder /
no link" — so you can fill things in gradually.

## Giving a project or hobby its own page

Add a `page:` list to any card in `projects.yaml` or `hobbies.yaml` and the
card becomes clickable, opening a blog-style page with a back button:

```yaml
- title: Home Server
  blurb: One-line card description.
  image: ''
  link: ''            # optional — shows as a "Visit" button on the page
  page:
    - >-
      A plain string is a paragraph.
    - heading: A section heading
    - image: images/server.jpg
      caption: An image with an optional caption.
    - >-
      Another paragraph. Mix and repeat blocks in any order.
```

Delete the whole `page:` block to remove the extra page. The page's URL
comes from the title (`/projects/home-server`); add `slug: custom-url`
next to `title:` if you want a different one.
