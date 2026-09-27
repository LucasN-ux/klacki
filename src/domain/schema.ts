import { z } from "zod";
import type { Locale } from "./locale";

// Special key tokens. Any other non-empty string is a regular key ("E", "F9", "Tab"…).
export const MODIFIERS = ["Ctrl", "Shift", "Alt", "Cmd", "Option"] as const;
export const MOUSE_BUTTONS = [
  "MouseLeft",
  "MouseMiddle",
  "MouseRight",
  "MouseWheel",
] as const;

// Modifiers that only exist on one platform: a Windows shortcut never uses
// Cmd/Option, a Mac shortcut uses Option instead of Alt.
const MAC_ONLY = new Set<string>(["Cmd", "Option"]);
const WINDOWS_ONLY = new Set<string>(["Alt"]);

// Kebab-case identifier: "frame-selection", "3d-sculpt".
const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "must be kebab-case (e.g. frame-selection)",
  );

// A text written in every language of the site. A missing translation fails the build.
export const LocalizedText = z.object({
  en: z.string().trim().min(1),
  fr: z.string().trim().min(1),
});

// One combination, keys pressed together: ["Ctrl", "Shift", "B"].
const Combo = z.array(z.string().trim().min(1)).min(1);

// Every way to trigger the action on one platform. Several combos mean "or":
// [["X"], ["Delete"]] reads "X or Delete".
const Combos = z.array(Combo).min(1);

// A software that does not run on a platform has no keys for it: Gaea is
// Windows only, so its shortcuts carry no Mac column at all.
export const Keys = z
  .object({ win: Combos.optional(), mac: Combos.optional() })
  .superRefine((keys, ctx) => {
    const check = (platform: "win" | "mac", forbidden: Set<string>) => {
      for (const combo of keys[platform] ?? []) {
        for (const key of combo) {
          if (forbidden.has(key)) {
            ctx.addIssue({
              code: "custom",
              path: [platform],
              message: `"${key}" cannot be used in a ${platform} shortcut`,
            });
          }
        }
      }
    };
    check("win", MAC_ONLY);
    check("mac", WINDOWS_ONLY);
  });

export const CATEGORIES = [
  "general",
  "navigation",
  "selection",
  "tools",
  "edit",
  "file",
  "view",
] as const;

export const Shortcut = z.object({
  // Shared across software: the same action has the same id everywhere
  // (used by the v2 translator to line up Maya and Blender).
  id: slug,
  category: z.enum(CATEGORIES),
  action: LocalizedText,
  // Optional precision: "Edit mode", "While sculpting".
  context: LocalizedText.optional(),
  keys: Keys,
});

export const FAMILIES = [
  "3d-sculpt",
  "texture",
  "render-sim-terrain",
  "cloth",
  "compositing-video",
  "2d-realtime",
] as const;

export const Software = z
  .object({
    id: slug,
    name: z.string().trim().min(1),
    initials: z
      .string()
      .regex(/^[A-Z0-9]{2}$/, "must be 2 capital letters (e.g. BL)"),
    family: z.enum(FAMILIES),
    // Platforms the software itself runs on. Most run on both; Gaea is
    // Windows only, so the site never shows Mac keys for it.
    platforms: z
      .array(z.enum(["win", "mac"]))
      .min(1)
      .default(["win", "mac"]),
    // Version the shortcuts were checked against, and where.
    version: z.string().trim().min(1),
    docUrl: z.url({ protocol: /^https$/ }),
    verifiedAt: z.iso.date(),
    shortcuts: z.array(Shortcut).min(1),
    // Actions the publisher does not print anywhere public. Naming them lets a
    // page say "we looked, the editor does not publish it" instead of leaving
    // a hole the visitor has to interpret. They carry no keys, so they are
    // never counted, searched, or switched between Windows and Mac.
    undocumented: z.array(slug).default([]),
  })
  .superRefine((software, ctx) => {
    // An action cannot be both documented and undocumented: the page would
    // contradict itself, keys on one line and "not published" on the next.
    const documented = new Set(software.shortcuts.map((one) => one.id));
    const alreadySeen = new Set<string>();
    software.undocumented.forEach((action, index) => {
      if (documented.has(action)) {
        ctx.addIssue({
          code: "custom",
          path: ["undocumented", index],
          message: `"${action}" is listed as undocumented but has keys`,
        });
      }
      if (alreadySeen.has(action)) {
        ctx.addIssue({
          code: "custom",
          path: ["undocumented", index],
          message: `duplicate undocumented action "${action}"`,
        });
      }
      alreadySeen.add(action);
    });

    // An id must be unique inside one software, otherwise the translator
    // could not tell which shortcut to show.
    const seen = new Set<string>();
    software.shortcuts.forEach((shortcut, index) => {
      if (seen.has(shortcut.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["shortcuts", index, "id"],
          message: `duplicate shortcut id "${shortcut.id}"`,
        });
      }
      seen.add(shortcut.id);

      // Every platform the software runs on needs its keys, and a platform it
      // does not run on must not carry any.
      for (const platform of ["win", "mac"] as const) {
        const runsThere = software.platforms.includes(platform);
        const hasKeys = shortcut.keys[platform] !== undefined;
        if (runsThere && !hasKeys) {
          ctx.addIssue({
            code: "custom",
            path: ["shortcuts", index, "keys", platform],
            message: `missing ${platform} keys`,
          });
        }
        if (!runsThere && hasKeys) {
          ctx.addIssue({
            code: "custom",
            path: ["shortcuts", index, "keys", platform],
            message: `${software.name} does not run on ${platform}`,
          });
        }
      }
    });
  });

// TypeScript types derived from the rules above: one definition, no drift.
export type LocalizedText = z.infer<typeof LocalizedText>;
export type Keys = z.infer<typeof Keys>;
export type Category = (typeof CATEGORIES)[number];
export type Family = (typeof FAMILIES)[number];
export type Shortcut = z.infer<typeof Shortcut>;
export type Software = z.infer<typeof Software>;
export type Platform = "win" | "mac";

// A shortcut as a row shows it: its texts in the page's language only.
export type LocaleShortcut = {
  id: string;
  category: Category;
  action: string;
  context?: string;
  keys: Keys;
};

export function inLocale(shortcut: Shortcut, locale: Locale): LocaleShortcut {
  return {
    id: shortcut.id,
    category: shortcut.category,
    action: shortcut.action[locale],
    ...(shortcut.context ? { context: shortcut.context[locale] } : {}),
    keys: shortcut.keys,
  };
}
