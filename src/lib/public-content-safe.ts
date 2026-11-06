import type { SiteContent } from "./site";

export function emptySiteContent(): SiteContent {
  return { settings: null, services: [], pricing: [], portfolio: [], testimonials: [], faqs: [], articles: [] };
}

/** Public pages remain reachable even when a content request fails. */
export async function withPublicFallback<T>(load: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await load();
  } catch {
    console.error("Public content unavailable; rendering safe fallback.");
    return fallback();
  }
}