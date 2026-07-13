# Deploying to Vercel + Cloudflare DNS

This site is a static Vite SPA. It's already deploy-ready:

- `vercel.json` has the SPA rewrite `/(.*) → /index.html`. On Vercel, real files
  (like `/assets/*.js`) are served first, so this only catches unmatched client
  routes — deep links such as `/hobbies/camping` work and survive a refresh.
- Vercel auto-detects Vite: build `npm run build`, output `dist/`.
- The build passes and all references resolve.

No code changes are needed. The steps below touch your Vercel account and your
Cloudflare DNS, so you run them yourself.

## 1. Deploy to Vercel

One-time setup (already done — the CLI is installed, logged in, and the
project is linked as `new-website`). From the project directory:

```bash
npm i -g vercel
vercel login
vercel --prod
```

On the first `vercel --prod`, accept the defaults — it detects Vite (build
`npm run build`, output `dist`). You'll get a live `*.vercel.app` URL.

**Test that URL** (open Hobbies → a trip, then refresh to confirm deep routes
work) before touching DNS.

> Alternative — auto-deploy on push: push this repo to GitHub and use
> "Import Project" in the Vercel dashboard instead of the CLI. Every push then
> triggers a deploy.

## 2. Add your domain in Vercel

Once the `.vercel.app` deploy looks good:

```bash
vercel domains add yourdomain.com
```

(or Dashboard → your project → **Settings → Domains → Add**). Vercel shows the
exact DNS target, normally:

- **apex** (`yourdomain.com`) → `A` record to `76.76.21.21`
- **www** → `CNAME` to `cname.vercel-dns.com`

## 3. Repoint Cloudflare DNS (away from GitHub Pages)

Cloudflare dashboard → your domain → **DNS → Records**:

1. **Delete the old GitHub Pages records** — the four apex `A` records
   (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`)
   and any `CNAME` to `<user>.github.io`.
2. **Add the Vercel records** from step 2.
3. **Set Proxy status to "DNS only" (grey cloud)** on those records. Leaving
   Cloudflare's orange-cloud proxy on double-proxies in front of Vercel and
   commonly breaks SSL cert issuance and causes redirect loops. DNS-only lets
   Vercel handle HTTPS end-to-end.

## 4. Wait for SSL + verify

Vercel auto-provisions a Let's Encrypt cert once DNS resolves (usually minutes,
up to ~an hour). In Vercel's Domains screen the domain flips to
"Valid Configuration." Then load `https://yourdomain.com` and re-check a deep
route.

---

## Redeploying after changes

There's no git remote wired to Vercel, so deploys upload whatever is on your
local disk. After editing content or code:

```bash
npm test            # optional sanity check
git add -A && git commit -m "update text"
vercel --prod
```

- **Commit first.** `vercel --prod` deploys the files on disk, committed or
  not — committing just keeps your git history in sync with what's live.
- Want to preview before going live? Run `vercel` (no flag) to get an isolated
  preview URL, click around, then `vercel --prod` when it looks right.
- The deploy takes a few seconds (Vercel caches the build). The output ends
  with the production URL once it's aliased.
- If something looks wrong after a deploy, roll back from the Vercel dashboard
  (project → Deployments → previous deployment → "Promote to Production"), or
  `git revert` the commit and run `vercel --prod` again.

> If you later push this repo to GitHub and import it in the Vercel dashboard,
> every `git push` deploys automatically and this manual step goes away.

## Notes

- Replace `yourdomain.com` with your actual domain. Decide whether the apex,
  `www`, or both is primary; Vercel can redirect one to the other.
- Cloudflare supports CNAME flattening at the apex, so you *can* use a `CNAME`
  to `cname.vercel-dns.com` at the root instead of the `A` record if you prefer.
- The old temporary GitHub Pages site can stay in its own repo; removing the DNS
  records above is what moves the domain over to Vercel.
