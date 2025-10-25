# DNS Setup (Vercel + Render)

## Admin (Vercel)
- Domain: `admin.saklin.app`
- Add CNAME record:
  - **Host:** `admin`
  - **Target:** `cname.vercel-dns.com.`
- In Vercel project (apps/admin): add custom domain `admin.saklin.app` and verify.

## API (Render)
- Domain: `api.saklin.app`
- In Render service → Custom Domains → add `api.saklin.app`, they provide a target.
- Add **CNAME**:
  - **Host:** `api`
  - **Target:** `<your-service>.onrender.com.`
- After propagation, set in API env:
  - `CORS_ORIGIN=https://admin.saklin.app`
  - `COOKIE_DOMAIN=.saklin.app`

## Tips
- Enable HTTPS (automatic via providers).
- Keep `COOKIE_SECURE=true` in production.
