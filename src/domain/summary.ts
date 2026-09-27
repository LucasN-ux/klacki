import {
  summarizePlatformDifference,
  type FlaggedRows,
} from "./platformDifference";
import type { Family, Platform, Software } from "./schema";

// What a list of software needs, without the shortcuts: small enough to hand
// to every page, whatever the size of the catalogue.
export type SoftwareSummary = {
  id: string;
  name: string;
  initials: string;
  family: Family;
  platforms: Platform[];
  count: number;
  /** Decided on the whole software, as its own page does. */
  flag: FlaggedRows;
};

export function summarize(software: Software): SoftwareSummary {
  return {
    id: software.id,
    name: software.name,
    initials: software.initials,
    family: software.family,
    platforms: software.platforms,
    count: software.shortcuts.length,
    flag: summarizePlatformDifference(software.shortcuts).flag,
  };
}

// Families in the order the home page and the picker show them.
export const FAMILY_ORDER: Family[] = [
  "3d-sculpt",
  "texture",
  "render-sim-terrain",
  "cloth",
  "compositing-video",
  "2d-realtime",
  "photo-image",
  "design-layout",
  "audio",
  "web-docs",
];
