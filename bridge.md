# Bridge — FoodTruck Express Backend

> **Purpose of this file:** Hand-off doc so a fresh Claude Code session (or developer) opening this directory can fully understand what this codebase is, how it connects to the Flutter mobile app, the live database, and the live server — without re-discovering everything.

---

## 1. What this is

**Project name:** `foodtruck_backend` (registered in `package.json` as `"acepick"`).

**What it does:** The Node.js/TypeScript backend powering the FoodTruck.Express platform:

- **JSON API** consumed by the **Flutter mobile app** (vendor + customer flows).
- **JSON API** consumed by a standalone **HTML admin console** (`admin-console.html`, lives outside this dir).
- **Server-rendered EJS admin** ("FTE Admin / Ctrl") at the root of `app.foodtruck.express` — vendor / tag / event / promo-code / Hunger Beacon management for staff.

**Tech stack:** Node.js (v18 in prod) · TypeScript · Express · Sequelize-TypeScript · MariaDB (declared as MySQL) · EJS · Firebase Admin SDK (FCM push) · Stripe · Cloudinary · Resend · Better Stack (logging).

**Relationship to the Flutter app:**

```
/Users/nyse/Desktop/FoodTruck-Express-BIN/
├── FTE25/
│   ├── food-express-CURRENT-00/    ← Flutter mobile app (separate git repo, tnyse/food-express-CURRENT-00)
│   ├── foodtruck_backend/          ← Read-only snapshot of the LIVE server (rsynced from prod, includes httpdocs, logs, etc.)
│   └── foodtruck_backend_src/      ← THIS DIRECTORY: TypeScript source for the backend, restored from a git bundle backup
└── admin-console.html              ← Standalone HTML admin (the early prototype that the EJS admin evolved from)
```

The Flutter app's `lib/core/helper/Api.dart` issues HTTPS requests to `https://app.foodtruck.express/foodtruck/<route>` with a `Bearer <JWT>` header. The same JWT secret (`JWTSECRET`) signs tokens on both ends, so a token issued by `/foodtruck/email-login` is verified by the auth middleware here.

---

## 2. Quick start — run locally against the live DB

```bash
# 1. Install deps (already done if node_modules/ is present)
npm install

# 2. The .env in this dir is gitignored. Required env vars listed below.
#    A working local .env points at LIVE DB (read-only intent), STRIPE_SK in test mode.
#    See section 5 (env vars) for the full list.

# 3. Compile + run
npx tsc                                              # tsc output goes to ./build/
node build/app.js                                    # listens on PORT (default 3030 locally)

# 4. Hit endpoints
curl http://localhost:3030/admin/vendors             # JSON
open  http://localhost:3030/admin-vendors            # EJS admin page (browser)
open  http://localhost:3030/                         # Password-gated dashboard
```

**Useful preview helper:** `local-preview.js` (a thin Express wrapper that serves the same views with stub data — no DB required). Run with `node local-preview.js`.

**Sequelize sync behaviour:** `controllers/db.ts` calls `sync({ alter: true })` on every startup. That used to silently fail (see §10 "Recent fixes"); it now runs end-to-end and aligns the live MariaDB schema to the model definitions on each restart.

---

## 3. Top-level layout

```
foodtruck_backend_src/
├── app.ts                          # Entry: mounts middleware, routes, sessions, EJS
├── config/configSetup.ts           # Loads .env, exposes typed `config` + PUBLIC_ROUTES allowlist
├── controllers/
│   ├── admin.ts                    # JSON admin API (/admin/* JSON endpoints)
│   ├── auth.ts                     # /foodtruck/<auth flows>
│   ├── beacon.ts                   # Hunger Beacon mobile API
│   ├── db.ts                       # Sequelize bootstrap (models registry + initDB)
│   ├── favourite.ts                # Orders, favourites, search, dashboard-stats
│   ├── index.ts                    # Everything else mobile (subscriptions, menu, etc.)
│   └── views.ts                    # EJS page renderers (the "Ctrl" admin)
├── models/                         # 22 Sequelize-TypeScript models (see §4)
├── routes/
│   ├── admin.ts                    # JSON admin routes (mounted at /admin)
│   ├── auth.ts                     # Mounted at /foodtruck
│   ├── index.ts                    # Mounted at /foodtruck (main API)
│   └── views.ts                    # Mounted at / (EJS pages)
├── middlewares/
│   ├── authorise.ts                # JWT verify; consults config.PUBLIC_ROUTES for bypass
│   └── passwordProtection.ts       # Dashboard /  password gate (FRONTEND_PASSWORD env var)
├── helpers/utility.ts              # handleResponse, success/error, distance math
├── helpers/upload.ts               # Cloudinary multer
├── services/
│   ├── notification.ts             # sendToken(...) — Firebase Admin FCM
│   ├── sms.ts                      # KudiSMS HTTP API (Nigeria SMS gateway)
│   ├── geocoding.ts                # Google Maps geocoding
│   ├── upload.ts                   # Cloudinary
│   └── logger.ts                   # Winston + Better Stack
├── views/                          # EJS templates (40+ files; admin-* are the active ones)
├── public/                         # Static assets (CSS/JS/images) served by Express
├── keys/key.json                   # Firebase service account RSA key (sensitive; in git on TechExpand remote)
├── package.json                    # name: "acepick", scripts: serve/build/start
├── tsconfig.json                   # outDir: ./build
├── local-preview.js                # Dev helper — stub-data EJS preview server
└── bridge.md                       # ← you are here
```

---

## 4. Database — MariaDB at `app.foodtruck.express:3306/admin1`

Sequelize declares this as `mysql` dialect; on disk it's MariaDB (`JSON` columns show as `LONGTEXT` with `JSON_VALID` constraint). All `tableName:` decorators are lowercase. **22 models** total, registered in `controllers/db.ts`.

### Core identity & profile

| Model file | Table | Purpose | Key columns |
|---|---|---|---|
| `Users.ts` | `users` | The single user account record (both customers and vendors) | `email`, `username`, `password` (bcrypt), `token_id` (FCM token), `type` enum `USER`/`VENDOR`, `subscription_id`, `verified`, etc. |
| `Verify.ts` | `verify` | OTP / verification codes (signup, password reset, etc.) | `serviceId`, `code`, `secret_key`, `client`, `used`, `otpType`, `type`, `username` |
| `Profile.ts` | `profile` | The vendor "food truck" profile (1-to-1 with Users where `type=VENDOR`) | `business_name`, `tag` (TEXT — JSON-stringified array OR bracketed CSV legacy data), `days` (JSON array), `closeTime`, `openingTime`, `unique_detail`, `detail`, `phone`, `pro_pic`, `rate`, `meanRate`, `totalRate`, `views`, `subcription_id` (sic), FK `userId`, FK `lanlogId`, FK `specializedTagId` |
| `LanLog.ts` | `lanlog` | Current geographic position + online status of a vendor (or user) | `Lan` (lat), `Log` (lng), `address`, `online` (bool), `type` enum `USER`/`VENDOR`, FK `userId` |
| `ProfileViews.ts` | `profile_view` | Track who viewed which profile | FK `profileId` |
| `Favourite.ts` | `favourite` | A user favouriting a vendor | FK `profileId`, FK `userId` |
| `Popular.ts` | `popular` | Curated "popular vendors" list (admin-controlled) | FK `profileId` |
| `Rate.ts` | `rate` | Star ratings + comments | `rate`, `comment`, FK `profileId`, FK `userId`, FK `truckId` (Users) |

### Menu / orders / cart

| Model file | Table | Purpose | Key columns |
|---|---|---|---|
| `Menus.ts` | `menu` | Vendor menu item | `menu_title`, `menu_adon` (JSON), `menu_description`, `menu_price`, `menu_picture`, `extras` (JSON, nullable — one bad row was historically `""` and broke sync; cleaned), FK `lanlogId`, FK `userId` |
| `Extras.ts` | `extra` | Per-menu-item extras (separate from `menu.extras` JSON) | `title`, `name`, `price`, FK `menuId` |
| `CartProduct.ts` | `cart_product` | Line item in a user's cart / order | `extras` (JSON), `quantity`, `note`, FK `menuId`, FK `orderId` (→ OrderV2) |
| `Order.ts` | `order` | **Legacy** order model — being phased out | `extras` JSON, `state` (PENDING enum), FK `profileId`, `userId`, `menuId` |
| `OrderV2.ts` | `order_v2` | **Active** order model — the one the Flutter app uses now | `state` enum (PENDING/CONFIRMED/PROCESSING/CONFIRM_COMPLETION/COMPLETED/CANCELED/EXPIRED), `total_amount`, `address`, `notes`, `archived` (bool), `cancelReason`, `canceledAt`, FK `profileId`, FK `userId` |

### Events & tags

| Model file | Table | Purpose | Key columns |
|---|---|---|---|
| `Event.ts` | `event` | Promoted/dated food-truck event | `event_title`, `event_description`, `event_address`, `event_date`, `event_start_time`, `event_close_time`, `menu_picture`, `Lan`, `Log` |
| `FeaturedEventTrucks.ts` | `featured_event_trucks` | Many-to-many: vendors featured at an event | FK `eventId`, FK `profileId` |
| `Tag.ts` | `tag` | All tags (general) | `title`, `icon` |
| `Alltags.ts` | `alltag` | "Homepage" tags (subset/curated). NB: model class is `AllTag`. | `title`, `icon` |
| `SpecialTag.ts` | `special_tag` | Vendor → primary tag pivot (`profile.specializedTagId` references this) | FK to AllTag |

### Subscriptions & promos

| Model file | Table | Purpose | Key columns |
|---|---|---|---|
| `PromoCode.ts` | `promo_codes` | Trial-day promo codes (admin-managed) | `code` (unique), `max_uses`, `used_count`, `trial_days` (default 30), `expires_at` |
| `PromoCode.ts` (also) | `promo_code_redemptions` | One-per-vendor redemption record | FK `promo_code_id`, FK `profile_id`, `redeemed_at`, `subscription_expires_at` |
| n/a | (no model) | Stripe subscriptions — vendor `Users.subscription_id` holds either a Stripe sub ID or `'PROMO_<id>'` |

### Hunger Beacons (added 2026-03-14)

| Model file | Table | Purpose | Key columns |
|---|---|---|---|
| `Beacon.ts` | `beacon` | Customer-created "I'm hungry here" beacon | `lan`, `log`, `locationName`, `threshold` (default 25), `currentCount`, `status` enum (PENDING/ACTIVE/CLAIMED/EXPIRED), `claimedByUserId` (no association), `vendorBusinessName`, `expiresAt`, FK `creatorId` (→ Users) |
| `BeaconParticipant.ts` | `beacon_participant` | Users who have joined a beacon (unique `[beaconId, userId]`) | FK `beaconId`, FK `userId` |

### Misc

| Model file | Table | Purpose |
|---|---|---|
| `Notification.ts` | `notification` | In-app notification feed (separate from FCM push). Enum `type`: ORDER/NORMAL |

### Live DB connection details

Set in `.env` (NOT committed):

```
DBDIALECT=mysql                          # actually MariaDB on host
DBHOST=app.foodtruck.express             # public DB endpoint (yes, MariaDB is exposed)
DBPORT=3306
DBNAME=admin1
DBUSERNAME=admin1
DBPASSWORD=<see live .env on server or the shared backend-access doc>
```

The same DB powers prod. **Local development reads & writes to live data.** Treat any non-trivial write as a production change.

---

## 5. Required `.env` variables

`config/configSetup.ts` consumes these. Validation is currently disabled (commented out) — missing vars don't throw at boot, they just become `undefined`.

| Var | Required | Notes |
|---|---|---|
| `NODE_ENV` | yes | `production` on live; `development` locally. Affects session cookie `secure` flag (`app.ts:30`). |
| `PORT` | yes | `8000` on live (Passenger reverse-proxies); `3030` recommended locally. |
| `SSL` | yes | Boolean string. |
| `JWTSECRET` | yes | Same value on local + prod so tokens are cross-compatible during dev. |
| `JWT_EXPIRY_TIME` | yes | e.g. `24h`. |
| `DBNAME`, `DBUSERNAME`, `DBPASSWORD`, `DBHOST`, `DBPORT`, `DBDIALECT` | yes | See §4. |
| `STRIPE_SK` | yes | `sk_live_…` on prod; **use `sk_test_…` locally** to avoid accidental real charges. |
| `PRICE_ID` | yes | Stripe Price ID for vendor subscription. Differs live vs test. |
| `RESEND` | yes | Resend API key (transactional email). |
| `MAIL_FROM`, `MAIL_FROM_NAME`, `SUPPORT_MAIL`, `SUPPORT_PHONE` | yes | Email metadata. |
| `WEBSITE`, `LOGO`, `BASE_API_URL` | yes | Used in email templates. |
| `REDIS_INSTANCE_URL` | yes | Redis with password in URL (Sessions / cache). |
| `BETTER_STACK_ENDPOINT`, `BETTER_STACK_APIKEY` | recommended | Production logging — see §7. |
| `CLIENT_ID` | yes | Google OAuth client ID (Google sign-in). |
| `FRONTEND_PASSWORD` | yes | The single password gating `/` dashboard. Currently `foodtruck2024`. |
| `SESSION_SECRET` | **CRITICAL on prod** | Without it, `app.ts:26` falls back to the hardcoded `'foodtruck-session-secret-key'` — anyone with repo read access can forge sessions. |

`.env.example` is not present; copy from a working environment or from the live server's `/var/www/vhosts/foodtruck.express/app.foodtruck.express/build/build/.env`.

---

## 6. Routes — full inventory

`app.ts` mounts:

```ts
app.use("/",          views);             // EJS pages
app.use("/admin",     admin);             // JSON admin API
app.use("/foodtruck", isAuthorized, auth);   // mobile auth API
app.use("/foodtruck", isAuthorized, index);  // mobile main API
```

### Mobile API — `/foodtruck/*` (consumed by Flutter)

Some are in `PUBLIC_ROUTES` (no JWT required), the rest demand a `Bearer` token. Full route inventory:

- `routes/auth.ts` (30 lines) — login/register/OTP/Google flows under `/foodtruck/email-*`, `/foodtruck/google/*`, `/foodtruck/send-otp`, `/foodtruck/verify-otp`, `/foodtruck/change-password`, `/foodtruck/token/login/*`.
- `routes/index.ts` (143 lines) — everything else mobile-app uses:
  - Subscriptions: `POST /createsubscription`, `POST /redeem-promo`, `GET /cancelsubscription`, `GET /activesubscription`, `GET /resumesubcription` (sic).
  - Vendor discovery: `GET /currentvendorslanlog`, `GET /currentuserlanlog`, `GET /vendor-by-tags`, `GET /locationprofile`, `GET /locationmenu`, `GET /locationevent`.
  - Profile: `GET /profile`, `GET /profileV2`, `GET /get-vendor-profile`, `GET /vendor-profile`, `PUT /profile`.
  - Menu/event: `GET/POST/PUT/DELETE /menu`, `GET /menu`, `POST/PUT /event`, `GET /get-events`, `GET /get-vendor-event`.
  - Orders: `POST /add-order`, `POST /add-order-v2`, `GET /get-order`, `GET /get-order-v2`, `POST /confirm-orderV2`, `POST /cancel-orderV2`, `POST /archive-old-orders`, `GET /get-vendor-orders/:id`, `GET /notify-order`, `POST /notify-orderV2`.
  - Favourites + rating: `POST /add-favourite`, `POST /delete-favourite`, `GET /get-favourite`, `POST /rating`, `GET /rating`, `GET /get-reviews`.
  - Lanlog: `GET /lanlog`, `PUT /lanlog`.
  - Tags: `GET /alltags`, `GET /get-tags`, `GET /all-categories`, `GET /get-popular`, `GET /get-home-details`.
  - Search: `GET /search`, `GET /getp`.
  - Notifications: `GET /notifications`, `GET /token` (refresh FCM token).
  - Dashboard: `GET /dashboard-stats`.
  - **Hunger Beacon (added 5ae1bb1):** `POST /beacon`, `POST /beacon/join`, `GET /beacon`, `POST /beacon/claim`, `GET /beacon/vendor`, `GET /beacon/:id`.

### Admin JSON API — `/admin/*`

`routes/admin.ts` (42 lines). All public on prod (auth disabled — flagged as known issue).

- `GET /admin/vendors` · `GET /admin/vendors/search` · `GET /admin/vendors/:id` · `PUT /admin/vendors/:id` · `GET /admin/vendors/:id/edit` (renders EJS).
- `GET /admin/tags` · `GET /admin/tags/search` · `POST /admin/tags` · `PUT /admin/tags/:id` · `DELETE /admin/tags/:id`.
- `POST /admin/vendors/assign-tag` · `DELETE /admin/vendors/:vendorId/tag` · `POST /admin/vendors/bulk-assign-tags`.
- `GET /admin/events` · `GET /admin/events/:id` · `POST /admin/events/add-vendor` · `DELETE /admin/events/:eventId/vendors/:profileId`.
- `GET /admin/special-tags`.
- `GET /admin/promo-codes` · `POST /admin/promo-codes` · `DELETE /admin/promo-codes/:id`.
- **`GET /admin/beacons` (added this session).**

### EJS admin pages — root `/`

`routes/views.ts` (73 lines). All non-`/` are unauthenticated (the password gate only protects `/`):

- `/` — password-gated dashboard with stat cards + recent vendors/users (`views/index.ejs`).
- `/admin-vendors`, `/admin-tags` (also `/tags`), `/admin-events`, `/admin-promo-codes`, `/admin-beacons`.
- `/users`, `/vendors` (this one's a duplicate of /admin-vendors with a different theme template), `/profile`.
- `/calendar`, `/calendar/event/:id`, `/calendar/events` (JSON for FullCalendar).
- `/add-event`.
- `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/logout`.
- `/error/404`, `/error/500`.
- Theme-template pass-throughs (mostly unused): `/components/:component?`, `/forms/:form?`, `/tables/:table?`, `/charts/:chart?`, `/maps/:map?`, `/widgets/:widget?`, `/ecommerce/products`, `/ecommerce/orders`.

---

## 7. Authentication

### JWT (mobile API)

- `middlewares/authorise.ts` reads `Authorization: Bearer <token>`, verifies with `jsonwebtoken.verify(token, JWTSECRET)`.
- Routes in `config.PUBLIC_ROUTES` skip the check. The list (in `config/configSetup.ts`) includes signup/login, public discovery endpoints (`/foodtruck/currentvendorslanlog`, `/foodtruck/get-events`, etc.), and OTP exchange.
- **Hardened this session:** malformed JWTs used to crash the request → Passenger returned 502. The verify now sits inside `try/catch` and answers `401` cleanly.

### Dashboard password gate

- `middlewares/passwordProtection.ts` (the `requirePassword` import in `routes/views.ts`) gates only `GET /` and `POST /`.
- Reads `FRONTEND_PASSWORD` from `.env`. On a successful `POST /` with the right password, sets an Express session cookie; subsequent GETs render the dashboard.

### Admin route auth — **OFF**

`/admin/*` is mounted at app root without `isAuthorized`. Anyone with the URL can read all vendors/users/promo codes and create/delete promo codes. Tracked as a follow-up; not blocking.

### Sensitive material in this repo

- `keys/key.json` — Firebase Admin SDK service-account RSA private key. Currently committed to `TechExpand/foodtruck_backend`. **Rotate** if repo visibility ever changed or remote was leaked.
- `package.json` `db:prod` script — historically had a DigitalOcean DB password in the literal command. Confirm in this clone (may still be present).
- The `.env` file is gitignored, but lots of services here read live keys from it (Resend, Redis, Stripe live, FCM via key.json).

---

## 8. Live server / deployment

**Host:** Plesk-managed Node.js application on `server1.wingudigital.com` (Wingu Digital, Nigeria).

| Detail | Value |
|---|---|
| SSH endpoint | `nizzaroni_oits7dfy5ik@198.202.142.164` |
| SSH port | **22222** (not 22) |
| Plesk panel | `https://198.202.142.164:8443` |
| App dir | `/var/www/vhosts/foodtruck.express/app.foodtruck.express/build/build/` |
| App entry | `app.js` inside that dir |
| Restart | Plesk panel → Websites & Domains → app.foodtruck.express → Node.js → **Restart App** |

**Deploy pattern observed:** compile `tsc` locally → rsync `build/*.js` + `views/*.ejs` to the server target dir → Plesk restart. There's no CI; deploys are manual rsync.

**Important quirk:** the deploy directory is double-nested as `build/build/`. The outer `app.foodtruck.express/build/` has stale `.ts` source from Nov 2024; the inner `build/build/` is what actually runs. When pushing changes, target the inner one.

**Backups left on the server during this session's work** (rsync `--backup --backup-dir`):

```
/var/www/vhosts/foodtruck.express/.fte-deploy-backups/20260520-083315/         (Phase 1 + 2 admin + beacon)
/var/www/vhosts/foodtruck.express/.fte-deploy-backups/20260520-100126-hotfix/  (Profile.tag + authorise.js)
```

---

## 9. Frontend / admin surfaces

### Flutter mobile app

- Repo: `tnyse/food-express-CURRENT-00` (sibling dir `food-express-CURRENT-00/`).
- Currently shipped: **iOS `2.0.829+1` via Shorebird**, **Android `2.0.828+94`**. App ID (Shorebird): `892b7769-e962-4ba1-b21f-c158fee1381d`.
- Talks to `/foodtruck/*` with a Bearer JWT.

### Standalone HTML admin

- File: `/Users/nyse/Desktop/FoodTruck-Express-BIN/FTE25/admin-console.html` (sibling, NOT in this repo).
- Open directly in a browser — it calls `https://app.foodtruck.express/admin/*` JSON endpoints.
- This is the EARLIER prototype. The EJS admin (below) is the active surface.

### EJS admin ("FTE Admin / Ctrl")

- Lives in `views/*.ejs`. Two visual variants used to coexist; **unified this session** to the dashboard-style with `ctrl` branding.
- Canonical sidebar (after this session) is 7 items: Dashboard · Vendors · Users · Tags · Calendar · Promo Codes · Hunger Beacons.
- All admin EJS pages share the same `<aside class="sidebar-wrapper">` markup and `<main class="main-wrapper">` content wrapper for consistent spacing.

---

## 10. Recent fixes & changes (May 2026 session — uncommitted)

All landed on the **live server via rsync + Plesk restart**; **not yet pushed to TechExpand origin**. Sitting on local branch `promo-codes-plus`.

### Backend changes

1. **Hunger Beacons admin** — new `AdminController.getBeacons` returning the latest 200 beacons with creator + claimer + participant count. New route `GET /admin/beacons`. New EJS page `views/admin-beacons.ejs` rendered by `ViewsController.adminBeacons` at `/admin-beacons`.
2. **Auth middleware hardening** — `middlewares/authorise.ts` now wraps `verify()` in try/catch and returns `401` on bad signature / malformed / expired tokens (was crashing under Passenger as a 502).
3. **`profile.tag` column type** — changed model from `DataType.JSON` → `DataType.TEXT` to match the live `LONGTEXT` column. This unblocked startup `sync({ alter: true })`, which had been silently failing on every restart since the JSON migration couldn't validate 19 legacy rows.
4. **`menu.extras` row id=2** — was `""` (empty string, fails `JSON_VALID`). Set to `NULL` via a one-off UPDATE. Sync now completes end-to-end.

### EJS admin changes

- New page: `views/admin-promo-codes.ejs` (the EJS view that the existing `/admin/promo-codes` JSON API was supposed to back — was never deployed before).
- New page: `views/admin-beacons.ejs`.
- Existing pages updated to use the canonical 7-item sidebar + `main-wrapper` layout: `index.ejs`, `users.ejs`, `vendors.ejs`, `app-fullcalender.ejs`, `user-profile.ejs`, `admin-vendors.ejs`, `admin-tags.ejs`, `admin-events.ejs`, `admin-vendor-edit.ejs`, `add-event.ejs`.

### Local-development additions

- `local-preview.js` — Express server with stub data for view-only iteration without a DB.
- `.env` (gitignored) — points at live DB, Stripe in test mode.

---

## 11. Known issues / pre-existing bugs

- **`vendors.ejs` references `vendor.rating.toFixed(1)`** but live data only has `meanRate`. Causes a 500 on `/vendors` when stub data lacks a `rating` field. Pre-existing.
- **`/admin/*` has no auth.** Mounted without `isAuthorized` in `app.ts`. Anyone with the URL can hit it.
- **Sequelize `sync({ alter: true })` runs at every restart against live prod DB.** Now succeeds, but every Node restart still triggers ALTER TABLE statements. Long-term: switch to migrations (e.g., `sequelize-cli`).
- **`SESSION_SECRET` on prod was unset until 2026-05-20**; the app fell back to a hardcoded string baked into the source. Set it explicitly in the live `.env`.
- **`NODE_ENV=development` on prod** (per the live `.env`) means session cookies aren't `secure`-flagged and Express returns verbose error pages. Change to `production` for the next deploy window.
- **2 Cloudinary `api_key` literals + 1 Google Maps `AIza…` key + 1 KudiSMS API key + commented password + Firebase service-account JSON** are all committed to this repo. Rotate keys + clean if remote visibility ever broadens.

---

## 12. Git state

```
local repo:        /Users/nyse/Desktop/FoodTruck-Express-BIN/FTE25/foodtruck_backend_src
remote (origin):   git@github.com:TechExpand/foodtruck_backend.git   (third-party org)
current branch:    promo-codes-plus
HEAD:              5ae1bb1 feat: Hunger Beacon feature + promo code admin
```

This clone was restored from a **git bundle backup** kept at `/Users/nyse/Desktop/foodtruck_backend-pre-overwrite-20260520-013559.bundle` (79 MB) together with a working-tree diff patch at `…-uncommitted-20260520-013559.patch`. The bundle contains all branches that were on the original clone, including:

- `promo-codes-plus` (current HEAD)
- `feat/promo-codes`
- `feat/hunger-beacon`
- `feat/order-soft-archive`
- `feat/updated-version2`
- `backend-admin`
- `refactor-backend`
- `main`
- `refs/remotes/origin/tony`
- `refs/stash`

**Uncommitted changes (the session's work):** ~30 files under `controllers/`, `routes/`, `middlewares/`, `models/`, `views/`, plus the corresponding compiled `build/` artefacts. Run `git status` to see the current set. Nothing here has been pushed to TechExpand.

### Recommended first move in a fresh session

```bash
# Create a clean working branch off the current HEAD so the session's existing
# uncommitted state can be committed without polluting promo-codes-plus.
git checkout -b session/<your-topic>

# Inspect the uncommitted work; decide what to commit.
git status
git diff --stat

# Stage in logical groups (admin/beacon backend; sidebar unification; etc.)
# and commit. The TechExpand remote is read-write — confirm before pushing.
```

---

## 13. Useful pointers for a fresh chat

- **Recent session log:** `~/Desktop/FoodTruck-Express-BIN/FTE25/food-express-CURRENT-00/docs/session-report-2026-05-19.md` (covers the iOS 2.0.829+1 release work; backend-side context starts there).
- **Live data snapshot:** `/Users/nyse/Desktop/FoodTruck-Express-BIN/FTE25/foodtruck_backend/` (read-only point-in-time copy of the live server, ≈ 749 MB, includes `httpdocs/`, `stage.foodtruck.express/`, `logs/`, the `keys/key.json`, `.bash_history`, etc.). Useful for diffing source vs deployed.
- **Auto-memory location** for a session opened from this dir: `~/.claude/projects/-Users-nyse-Desktop-FoodTruck-Express-BIN-FTE25-foodtruck_backend_src/memory/`. Initialize with a project memory file describing this repo's role + connection to the Flutter sibling repo (see existing memory at `…-food-express-CURRENT-00/memory/MEMORY.md` for the format).
- **Plesk web terminal** is available at port 8443 if SSH on 22222 is unreachable (firewall whitelist may be required for specific IPs).

### IPs / hostnames quick reference

| Service | Value |
|---|---|
| Production app | `https://app.foodtruck.express` (Plesk vhost on `server1.wingudigital.com` / `198.202.142.164`) |
| MariaDB | `app.foodtruck.express:3306/admin1` (publicly exposed) |
| SSH | `nizzaroni_oits7dfy5ik@198.202.142.164:22222` |
| Plesk panel | `https://198.202.142.164:8443` |
| Shorebird (Flutter OTA) | `https://console.shorebird.dev`, app_id `892b7769-e962-4ba1-b21f-c158fee1381d` |
| Logging | Better Stack — endpoint in `.env` (`BETTER_STACK_ENDPOINT`) |
