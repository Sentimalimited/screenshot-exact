import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSiteContent } from "./content.functions";

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
  staleTime: 60_000,
});

export function useSiteContent() {
  return useSuspenseQuery(siteContentQuery).data;
}
