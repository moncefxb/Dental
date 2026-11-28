# Test report

**Environment:** Node 22 `node:sqlite` emulating D1 (migrations 0001–0005 applied in order) + headless Chromium (Puppeteer) driving the real Worker code over a local HTTP server. **This is NOT Cloudflare.** No wrangler/miniflare was available (sandbox had no network), no deployment was performed, no real email was sent.

Current verification (November 28, 2026): `npm test` passes 41 checks (20 booking, 19 admin/security, 1 SEO, 1 mobile UI). The repository also includes `npm run test:e2e` (11 browser checks; set `CHROME_PATH` to a Chromium binary). That suite could not be rerun in this pass because Puppeteer is not installed in the environment; the E2E results below are the earlier recorded baseline.

## Passed
**Booking (19):** booking hidden until clinic is configured; slot generation from hours/time-off/existing bookings/minimum notice; past and closed-day rejection; pending booking saved, manage token stored hashed; "any dentist" falls through to a second dentist; third booking of same slot → 409; DB trigger blocks raw overlapping insert; 4 simultaneous requests for one slot → exactly one 201; per-IP rate limit → 429; validation (phone/consent/email/time/service); cross-origin POST → 403; honeypot; wrong token cannot cancel; reschedule and cancel (cancel frees the slot).

**Admin/security (19):** all admin routes 401 without session; PBKDF2 hash stored (100k iterations), cookie HttpOnly/Secure/SameSite=Strict, only SHA-256 of token stored; CSRF (missing/foreign Origin → 403); CRUD validation for services/dentists/hours/settings; SQL-injection string stored inertly; overlapping/invalid hours rejected without wiping existing data; staff vs admin authorization; audit log written and free of patient name/phone; brute-force lockout; password change revokes other sessions; logout revokes server-side; disabling a user kills live sessions; forged cookies rejected.

**SEO (1):** robots.txt and sitemap.xml generated from request origin; admin/manage excluded.

**Browser E2E (11):** setup through the real admin UI (add dentist, save hours) → public widget appears → book a slot in English → manage-link cancel → Arabic/RTL switch → no live element from an XSS payload → audited confirm → no horizontal overflow at 375px → no uncaught JS errors. Static audit: the admin/booking/manage JS contains no `innerHTML`/`eval` sinks.

## Latest mobile regression verification (November 28, 2026)
- Chromium mobile emulation at 393px tested the shared admin toolbar on Overview, Appointments, Reports and Settings, in Arabic, French and English (12 route/language combinations). The title/description-to-actions gap measured 9px in all combinations, with no horizontal overflow.
- Treatment-card pointer lifecycle was tested with touch pointer events while forcing `:hover` and `prefers-reduced-motion: reduce`: the card translated up 4px while pressed and returned to `none` on `pointerup`. `contextmenu` and `selectstart` were prevented; `user-select:none` and vertical scroll/pinch zoom remained enabled.
- Booking success styling computed to green (`rgb(24, 122, 69)`); validation/failure styling computed to red (`rgb(180, 35, 24)`).
- Cache-busting versions were incremented for updated CSS, booking/site JS and admin layout JS so mobile browsers request the new assets rather than reuse stale cached files.
- These checks use a headless Chromium mobile emulation. They are not a test on the user's physical handset and no live deployment was performed.

## Not tested / caveats
- Real D1 write ordering under true parallel isolates (the trigger is the backstop; emulated here).
- Real email delivery (code path exists; only the "not configured → skipped" branch was exercised).
- Live Cloudflare headers/caching, Core Web Vitals, Lighthouse, screen-reader testing, real phones, Safari/Firefox.
- Appointment-status UI buttons were verified through the endpoint, not by clicking each button.
- `0001` baseline is a reconstruction — verify against the live schema.
