import { z } from "zod";
import { keysFor } from "./keys";
import type { Locale } from "./locale";
import {
  CATEGORIES,
  Keys,
  inLocale,
  type LocaleShortcut,
  type Software,
} from "./schema";

// The shortcuts of one software that match, in the page's language.
export type SearchHit = { software: string; shortcuts: LocaleShortcut[] };

// What the search page downloads: every shortcut, in one language, grouped
// by software in catalogue order. Checked on arrival like any stored data.
export type SearchIndex = SearchHit[];

export const SearchIndexSchema = z.array(
  z.object({
    software: z.string(),
    shortcuts: z.array(
      z.object({
        id: z.string(),
        category: z.enum(CATEGORIES),
        action: z.string(),
        context: z.string().optional(),
        keys: Keys,
      }),
    ),
  }),
);

// "Cadrer la sélection" and "cadrer la selection" must find each other:
// lower case, accents removed, extra spaces dropped.
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

// A query is treated as plain text, never as code or as a regular expression:
// a visitor cannot slow the site down with a crafted search.
function matchesAction(shortcut: LocaleShortcut, query: string): boolean {
  const haystack = normalize(`${shortcut.action} ${shortcut.context ?? ""}`);
  return query.split(" ").every((word) => haystack.includes(word));
}

// Search by key: "F8", "ctrl+z", "⌘ z". The query is cut into keys, and every
// one of them must be in the same combination.
function matchesKeys(shortcut: LocaleShortcut, query: string): boolean {
  const asked = query.split(/[\s+]+/).filter(Boolean);
  if (asked.length === 0) return false;

  // Both platforms are searched, and a software that skips one simply has
  // nothing to match there.
  return (["win", "mac"] as const).some((platform) =>
    keysFor(shortcut.keys, platform).some((combo) => {
      const keys = combo.map((key) => normalize(key));
      return asked.every((key) => keys.includes(key));
    }),
  );
}

export function buildSearchIndex(
  softwareList: Software[],
  locale: Locale,
): SearchIndex {
  return softwareList.map((software) => ({
    software: software.id,
    shortcuts: software.shortcuts.map((shortcut) => inLocale(shortcut, locale)),
  }));
}

export function searchIndex(index: SearchIndex, rawQuery: string): SearchHit[] {
  const query = normalize(rawQuery);
  if (query.length < 2) return [];

  return index
    .map((group) => ({
      software: group.software,
      shortcuts: group.shortcuts.filter(
        (shortcut) =>
          matchesAction(shortcut, query) || matchesKeys(shortcut, query),
      ),
    }))
    .filter((hit) => hit.shortcuts.length > 0);
}

export function countHits(hits: SearchHit[]): number {
  return hits.reduce((total, hit) => total + hit.shortcuts.length, 0);
}

// The first `limit` results, groups kept in order. A group past the limit is
// dropped, the one it falls in is cut: no empty software heading.
export function firstHits(hits: SearchHit[], limit: number): SearchHit[] {
  const shown: SearchHit[] = [];
  let left = limit;
  for (const hit of hits) {
    if (left <= 0) break;
    shown.push(
      hit.shortcuts.length <= left
        ? hit
        : { ...hit, shortcuts: hit.shortcuts.slice(0, left) },
    );
    left -= hit.shortcuts.length;
  }
  return shown;
}
