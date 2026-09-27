import type { Locale } from "@/domain/locale";
import type { Software } from "@/domain/schema";

// The same action carries the same id in every file, so a page can name an
// action it does not itself document by borrowing the wording from a software
// that does. Nothing is invented: the label already exists in the catalogue.
// When files word it differently, the wording most of them use wins, so the
// label does not change each time a software joins the catalogue.
export function actionLabel(
  list: Software[],
  action: string,
  locale: Locale,
): string | undefined {
  const counts = new Map<string, number>();
  for (const software of list) {
    const match = software.shortcuts.find((shortcut) => shortcut.id === action);
    if (match) {
      const label = match.action[locale];
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  let best: string | undefined;
  for (const [label, count] of counts) {
    if (best === undefined || count > (counts.get(best) ?? 0)) best = label;
  }
  return best;
}
