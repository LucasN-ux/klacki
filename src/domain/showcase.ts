import { isSameOnBothPlatforms } from "./keys";
import type { Keys, LocalizedText, Software } from "./schema";

// One line of the Windows / Mac demonstration: a real shortcut, taken from a
// real software, with the version it was checked against.
export type ShowcaseRow = {
  softwareId: string;
  softwareName: string;
  version: string;
  shortcutId: string;
  action: LocalizedText;
  keys: Keys;
  /** True when Windows and Mac press the same keys. */
  same: boolean;
};

function toRow(software: Software, shortcut: Software["shortcuts"][number]) {
  return {
    softwareId: software.id,
    softwareName: software.name,
    version: software.version,
    shortcutId: shortcut.id,
    action: shortcut.action,
    keys: shortcut.keys,
    same: isSameOnBothPlatforms(shortcut.keys),
  };
}

// Actions everybody knows come first: a visitor recognises "Undo" at once,
// whatever software they use. Anything else follows, in file order.
const EVERYDAY = ["undo", "save-file", "redo", "open-file", "copy", "paste"];

function everydayRank(id: string): number {
  const rank = EVERYDAY.indexOf(id);
  return rank === -1 ? EVERYDAY.length : rank;
}

// The rows a software can offer: every everyday action it has, plus its
// first other shortcut as a fallback. Everyday ones first; ties keep the
// file order.
function candidates(
  shortcuts: Software["shortcuts"],
  keep: (shortcut: Software["shortcuts"][number]) => boolean,
) {
  const kept = shortcuts.filter(keep);
  const everyday = kept.filter((shortcut) => EVERYDAY.includes(shortcut.id));
  const other = kept.find((shortcut) => !EVERYDAY.includes(shortcut.id));
  return [...everyday, ...(other ? [other] : [])];
}

// The rows shown on the home page and the Windows / Mac page. They alternate
// between a shortcut that changes and one that does not, never twice the same
// software, and, while it can, each from a different family and with a
// different action, so the page proves its point across the whole catalogue
// instead of claiming it. Software that runs on one platform only is left
// out: there is nothing to compare.
export function platformShowcase(list: Software[], limit = 4): ShowcaseRow[] {
  const differing: ShowcaseRow[] = [];
  const same: ShowcaseRow[] = [];
  const familyOf = new Map(
    list.map((software) => [software.id, software.family]),
  );

  for (const software of list) {
    if (!software.platforms.includes("win")) continue;
    if (!software.platforms.includes("mac")) continue;

    for (const shortcut of candidates(
      software.shortcuts,
      (one) => !isSameOnBothPlatforms(one.keys),
    )) {
      differing.push(toRow(software, shortcut));
    }
    for (const shortcut of candidates(software.shortcuts, (one) =>
      isSameOnBothPlatforms(one.keys),
    )) {
      same.push(toRow(software, shortcut));
    }
  }

  // Everyday actions first within each queue; ties keep the file order.
  for (const queue of [differing, same]) {
    queue.sort(
      (a, b) => everydayRank(a.shortcutId) - everydayRank(b.shortcutId),
    );
  }

  const rows: ShowcaseRow[] = [];
  const usedSoftware = new Set<string>();
  const usedFamilies = new Set<string | undefined>();
  const usedActions = new Set<string>();
  const queues = [differing, same];
  const newFamily = (row: ShowcaseRow) =>
    !usedFamilies.has(familyOf.get(row.softwareId));
  const newAction = (row: ShowcaseRow) => !usedActions.has(row.shortcutId);

  // Take from one queue then the other. When a queue runs dry, the other one
  // finishes the list. A row that repeats neither a family nor an action wins,
  // then one with a new action, then one with a new family, then any.
  for (let turn = 0; rows.length < limit; turn += 1) {
    const ordered = (turn % 2 === 0 ? queues : [queues[1], queues[0]]).flat();
    const fresh = ordered.filter((row) => !usedSoftware.has(row.softwareId));
    const next =
      fresh.find((row) => newFamily(row) && newAction(row)) ??
      fresh.find(newAction) ??
      fresh.find(newFamily) ??
      fresh[0];
    if (!next) break;
    usedSoftware.add(next.softwareId);
    usedFamilies.add(familyOf.get(next.softwareId));
    usedActions.add(next.shortcutId);
    rows.push(next);
  }

  return rows;
}
