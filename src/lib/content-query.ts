import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSiteContent } from "./content.functions";
import { getBrowserSiteContent, isStaticPublicSite } from "./public-content-browser";

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => isStaticPublicSite && typeof window !== "undefined" ? getBrowserSiteContent() : getSiteContent(),
  staleTime: 60_000,
});

export function useSiteContent() {
  return useSuspenseQuery(siteContentQuery).data;
}
