import { Software } from "@/domain/schema";
import { SearchIndexSchema, type SearchIndex } from "@/domain/search";
import { createResource } from "./resource";

// Everything the browser downloads is checked with the same schemas as the
// build: a file from another deploy fails loudly instead of half-working.
async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
}

const oneSoftware = createResource(async (id) =>
  Software.parse(await getJson(`/data/software/${id}.json`)),
);

// Key: ids joined by ",", already in catalogue order.
export const softwareSet = createResource<Software[]>((key) =>
  Promise.all(
    key === "" ? [] : key.split(",").map((id) => oneSoftware.load(id)),
  ),
);

export const searchIndexOf = createResource<SearchIndex>(async (locale) =>
  SearchIndexSchema.parse(await getJson(`/data/search/${locale}.json`)),
);
