import posthog from 'posthog-js';

/**
 * PostHog browser SDK. Next.js loads this file on the client automatically.
 *
 * Analytics is entirely optional: with no project token configured the SDK is never
 * initialised and the app behaves exactly as before, so local dev and previews stay clean.
 *
 * `defaults` pins a dated behaviour snapshot. It turns on SPA pageview capture
 * (`capture_pageview: 'history_change'`), so route changes are tracked without any
 * manual pathname effect — adding one as well would double-count every pageview.
 */
const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) {
  posthog.init(token, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST ?? 'https://eu.posthog.com',
    defaults: '2026-08-30',
  });
}
