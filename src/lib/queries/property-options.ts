import { fetchPaginated } from "@/lib/fetch-paginated";
import type { Property } from "@/types/resources";

export const propertyOptionsQueryKey = ["properties", "options"] as const;

export async function fetchPropertyOptions(): Promise<Property[]> {
  const p = await fetchPaginated<Property>("/properties", {
    per_page: 100,
    page: 1,
  });
  return p.items;
}
