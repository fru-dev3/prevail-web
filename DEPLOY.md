# Prevail — Deploy Reference

Landing page for **Prevail** — *One question. Four engines. One verdict.*

---

## Live URLs

| Surface | URL |
|---|---|
| **Production (Netlify)** | https://prevail-site.netlify.app |
| **Custom domain (pending DNS)** | https://prevail.sh |
| **Repo** | https://github.com/fru-dev3/prevail-site |
| **Netlify admin** | https://app.netlify.com/projects/prevail-site |
| **Site ID** | `68129d3b-87a5-4c7f-bc51-78078bd286e2` |

---

## Point `prevail.sh` at Netlify

Add the following records at your registrar (the apex domain `prevail.sh`).

### Option A — Netlify DNS (recommended)

Delegate the zone to Netlify and let it manage everything (best for cert renewal + edge routing).

```
NS  prevail.sh.  dns1.p01.nsone.net.
NS  prevail.sh.  dns2.p01.nsone.net.
NS  prevail.sh.  dns3.p01.nsone.net.
NS  prevail.sh.  dns4.p01.nsone.net.
```

Then run:

```bash
netlify dns:create prevail.sh
netlify domains:add prevail.sh
```

### Option B — Keep current DNS, point records manually

Paste these into your registrar's DNS panel:

```
# Apex (prevail.sh) — use ALIAS / ANAME / flattened CNAME
ALIAS  @    apex-loadbalancer.netlify.com.

# www subdomain
CNAME  www  prevail-site.netlify.app.
```

> Some registrars don't support `ALIAS`/`ANAME` at the apex. If yours doesn't (e.g. plain GoDaddy), use Netlify's apex A records instead:
>
> ```
> A  @  75.2.60.5
> ```

Then run:

```bash
netlify domains:add prevail.sh
netlify domains:add www.prevail.sh
```

SSL is issued automatically via Let's Encrypt once DNS resolves.

---

## Deploy Updates

### Manual deploy (from any machine with this repo cloned)

```bash
cd /Users/frunde/Documents/fru/fd-apps/fd-apps-prevail-site
git pull
netlify deploy --prod --build
```

### Auto-deploy on `git push`

`.github/workflows/deploy-netlify.yml` runs on every push to `main`:
1. Installs deps (`npm ci`)
2. Builds (`npm run build`)
3. Deploys with `netlify deploy --prod`

Required secrets (already configured in this repo):

| Secret | Value |
|---|---|
| `NETLIFY_AUTH_TOKEN` | Personal token from `~/Library/Preferences/netlify/config.json` |
| `NETLIFY_SITE_ID` | `68129d3b-87a5-4c7f-bc51-78078bd286e2` |

Rotate by running:

```bash
gh secret set NETLIFY_AUTH_TOKEN --repo fru-dev3/prevail-site
```

### Preview deploys

```bash
netlify deploy --build           # draft URL only, no production
```

---

## Local Dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview    # serve dist/ locally
```

---

## Brand

- Name: **Prevail** (capital P, lowercase rest)
- Letters `ai` tinted cyan via the `<Brand />` component in `src/App.tsx`
- Tagline: **One question. Four engines. One verdict.**
- Stack: React 19, Vite 8, Tailwind v4, Framer Motion 12
