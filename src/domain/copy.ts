import { comboLabel, keysFor } from "./keys";
import type { Locale } from "./locale";
import type { LocaleShortcut, Platform } from "./schema";

// The line put on the clipboard: "Blender · Undo — Ctrl + Z". It names the
// software and the action so it still makes sense pasted into notes an hour
// later, and it carries every alternative combo, so it never says less than
// the page. Keys read exactly as the keycaps print them on that platform.
export function shortcutText(
  softwareName: string,
  shortcut: LocaleShortcut,
  platform: Platform,
  locale: Locale,
  orWord: string,
): string {
  const context = shortcut.context ? ` (${shortcut.context})` : "";
  const combos = keysFor(shortcut.keys, platform)
    .map((combo) => comboLabel(combo, platform, locale))
    .join(` ${orWord} `);
  return `${softwareName} · ${shortcut.action}${context} — ${combos}`;
}
