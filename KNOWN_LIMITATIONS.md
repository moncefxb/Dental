# Known limitations & NOT delivered in this pass

**dentl2 was not audited or reused.** The sandbox had no network access, so neither https://github.com/engrmaziz/dentl2 nor the live site could be inspected, and its license could not be verified. Nothing was copied from it.

## Requested but not built
- Blog/articles, before-and-after gallery, testimonials, FAQ — public pages **and** admin CMS.
- R2 media storage / secure file uploads (no R2 binding added; nothing in the app uploads files).
- Public dentist profile pages (dentists can be entered in admin and appear in booking, but the Team page is still the existing philosophy page).
- Contact map and opening-hours display (no real clinic address/hours were supplied; none were invented). Hours entered in admin are used for booking only.
- Service pricing display on the public Services page (`price_from` is stored/editable but not rendered).
- GSAP. The 3D tooth hero and its Three.js CDN dependency were **removed** at the owner's request; the hero is now the photo slot.
- French/Arabic text for `manage.html` (English only). Booking widget is fully ar/fr/en.
- Admin analytics are still computed from the latest 200 appointments (unchanged from the previous release); no billing/revenue.
- GDPR: no patient erasure/anonymisation tool or retention job; consent checkbox and minimal data collection only. Email is stored on appointments.
- No Content-Security-Policy (the site loads Google Fonts, jsDelivr and third-party reference images). Security headers otherwise added.
- Notification settings are env-var based (secrets should not live in the DB); no per-event template editor.
- Page-level SEO: single-URL multilingual (JS) so no hreflang; JSON-LD is minimal (name + country) because no address/phone was supplied.

## Behavioural notes
- Bookings start as **pending**; staff confirm. Rescheduling by the patient returns the booking to pending.
- Patients can cancel/reschedule online only up to the configured minimum notice before the slot.
- Slots are stored as clinic-local naive times (`Africa/Algiers` default). DST zones are handled for "now" but not for the hour that does not exist/repeats.
- Legacy bookings without a dentist conflict only with other dentist-less bookings.
- All site images are local files in `images/` and are **illustrations I generated** (not photographs of the clinic). Replace them with the clinic's own licensed photos using the same file names; see `images/README.md`. Google Fonts are still loaded from Google.
