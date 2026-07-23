// Centralized outbound destinations. Change these here and every CTA follows.

/** Hexgate Cloud — the hosted SaaS app. Same-tab navigation (moving into the product). */
export const APP_URL = "https://app.hexgate.ai";

/**
 * "Book a demo" target. A mailto for now — when we wire a real scheduler
 * (Cal.com / Calendly), point this at that URL and every demo CTA updates.
 */
export const demoHref = (subject = "Hexgate demo request") =>
  `mailto:hello@hexamind.ai?subject=${encodeURIComponent(subject)}`;

export const DEMO_HREF = demoHref();
