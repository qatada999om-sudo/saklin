# Saklin – Auto wiring (CI/CD) v0.3

## Secrets to add in GitHub → Settings → Secrets → Actions
- `SUPABASE_DB_URL` (format: postgres://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres)
- `RENDER_DEPLOY_HOOK` (from Render service → Deploy Hooks)
- (optional for Vercel CLI) `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

## Workflows
- `Supabase – Run Migrations`: runs psql on your Supabase DB
- `API – Deploy (Render deploy hook)`: triggers API redeploy
- `Web – Deploy via Vercel CLI (optional)`: deploys web if you prefer CLI; otherwise connect repo in Vercel UI

## Typical order
1) Add `SUPABASE_DB_URL` → run **Supabase – Run Migrations**
2) Import repo in Vercel (auto builds web). Or add Vercel secrets and run **Web – Deploy via Vercel CLI**
3) Create Render service, add deploy hook → add `RENDER_DEPLOY_HOOK` → run **API – Deploy (Render deploy hook)**
4) Update Vercel env `NEXT_PUBLIC_API_URL` to your API URL + `/v1`

Done ✅

## Auth added (v0.5)
- API endpoints:
  - POST /auth/login  (env: ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET, TOKEN_TTL_HOURS)
  - GET /auth/me
- Admin app at apps/admin with /login, stores JWT in localStorage and calls API.

## v0.6 – DB-backed Users Auth
- New migration: `migrations/004_users_auth.sql` (pgcrypto + admin seed).
- API auth now verifies users from DB using `password_hash` and `crypt()`.
- ENV: set `DATABASE_URL` + `JWT_SECRET`. Change seed admin password/email after first login.
- GitHub Action `Supabase – Run Migrations` now includes 004.

## v0.7 – RBAC + Users CRUD
- New migration: `migrations/005_users_rbac.sql` (soft-delete + active index).
- API: role-based guard (admin/support). Endpoints:
  - GET /v1/users?q=&role=
  - POST /v1/users
  - GET /v1/users/:id
  - PATCH /v1/users/:id
  - DELETE /v1/users/:id  (soft delete)
  - POST /v1/users/:id/reset_password
- Admin UI: `apps/admin/app/users/page.tsx` – بحث، إنشاء، تعديل، حذف، إعادة تعيين كلمة مرور.
- ملاحظة: تأكد أن `NEXT_PUBLIC_API_URL` في admin يتضمن `/v1` (مثال: https://api.example.com/v1).

## v0.8 – Secure Cookies Auth + Audit Log
- **Auth عبر Cookies httpOnly**: السيرفر يضع توكن JWT في كوكي `saklin_admin` (قابلة للتهيئة).
- **CORS مع Credentials**: يجب ضبط `CORS_ORIGIN` لعنوان لوحة الإدارة (بدلاً من `*`).
- **نقاط جديدة**: `POST /v1/auth/logout` لمسح الكوكي.
- **Audit Log**: جدول `audit_log` يسجل عمليات الدخول/الخروج وCRUD للمستخدمين.
- **Admin UI**: الطلبات ترسل `credentials: 'include'` ولا تحفظ أي توكن في المتصفح.

## v0.9 – Audit UI + Password Reset + DNS docs
- New migration: `007_password_reset.sql`.
- API: `/v1/audit` listing with filters; `/v1/auth/forgot` + `/v1/auth/reset` via SMTP (nodemailer).
- Admin UI: pages `/audit`, `/forgot`, `/reset`.
- Docs: `docs/DNS_SETUP.md` for Vercel (admin) & Render (api) custom domains.
