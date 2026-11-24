import posthog from 'posthog-js';
import type { UserDto } from '@et-trader/shared';

/** No-ops unless a project token was configured, so these are always safe to call. */
const ready = () => Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) && posthog.__loaded;

/**
 * Links activity to the signed-in account. Uses the stable account id, never the email —
 * the email travels as a property so it stays searchable without becoming the identity.
 */
export function identifyUser(user: Pick<UserDto, 'id' | 'email' | 'name'>) {
  if (!ready() || !user.id) return;
  posthog.identify(user.id, { email: user.email, name: user.name });
}

/** Clears the identity on sign-out so the next visitor isn't attributed to this account. */
export function resetAnalytics() {
  if (!ready()) return;
  posthog.reset();
}

/** Records a product event (e.g. a trade logged, a course opened). */
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!ready()) return;
  posthog.capture(event, properties);
}
