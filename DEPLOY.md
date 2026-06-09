# Prevail — Deploy Reference

Landing page for **Prevail** — *One question. Four engines. One verdict.*

---

## Live URLs

| Surface | URL | Status |
|---|---|---|
| **Primary (custom domain)** | https://prevail.sh | DNS pending at GoDaddy |
| **Alias** | https://prevail.fru.dev | ✅ live |
| **Netlify default** | https://prevail-site.netlify.app | ✅ live |
| **Repo** | https://github.com/fru-dev3/prevail-web | |
| **Netlify admin** | https://app.netlify.com/projects/prevail-site | |
| **Site ID** | `68129d3b-87a5-4c7f-bc51-78078bd286e2` | |

---

## Point `prevail.sh` at Netlify (GoDaddy — 2 records to add)

The domain is registered at **GoDaddy**. The site is already configured on Netlify
with `prevail.sh` as the primary domain. You just need to add **two DNS records**
at GoDaddy and SSL will provision automatically within minutes.

### 1. Sign in to GoDaddy → Domains → prevail.sh → DNS

### 2. Add these two records

```
Type   Name   Value                          TTL
─────  ─────  ─────────────────────────────  ─────
A      @      75.2.60.5                      1 hour
CNAME  www    prevail-site.netlify.app       1 hour
```

GoDaddy creates a default `Parked` A record automatically — **delete it** before adding the A record above, otherwise both will conflict.

### 3. Wait 5-30 minutes for DNS propagation

Verify with:

```bash
dig prevail.sh +short        # should return 75.2.60.5
dig www.prevail.sh +short    # should return prevail-site.netlify.app + CNAME chain
```

### 4. SSL provisions automatically

Once both records resolve, Netlify's automated Let's Encrypt flow issues the cert.
Check status:

```bash
netlify api showSiteTLSCertificate \
  --data='{"site_id":"68129d3b-87a5-4c7f-bc51-78078bd286e2"}'
```

If SSL doesn't auto-issue within an hour, force it:

- Netlify admin → **Domain management** → **HTTPS** → **Verify DNS configuration** → **Provision certificate**

### Alternative — fully delegate DNS to Netlify (skip GoDaddy DNS entirely)

If you prefer Netlify to manage the entire `prevail.sh` zone (same pattern as `fru.dev`), update the **nameservers** at GoDaddy instead of adding the records above:

```
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net
```

(GoDaddy → Domains → prevail.sh → Nameservers → "I'll use my own nameservers".)

Then on the Netlify side, the DNS zone needs creating manually (`netlify api createDnsZone` was 500-ing during initial setup — use the Netlify dashboard's "Set up Netlify DNS" flow instead). Once nameservers propagate, the A/CNAME records are auto-created and SSL provisions.

For most users, **just add the 2 records at GoDaddy** above and move on.

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
gh secret set NETLIFY_AUTH_TOKEN --repo fru-dev3/prevail-web
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
