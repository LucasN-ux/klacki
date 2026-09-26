import { MOUSE_BUTTONS, type Platform } from "./schema";

// The one keyboard the site draws: a US QWERTY, the layout every
// publisher's documentation assumes. Never an AZERTY: whether an application
// follows the letter or the key position differs from one app to the next.

export type MouseButton = (typeof MOUSE_BUTTONS)[number];

// One place on a row: a key, or a gap (id null). Width in key units.
export type Slot = { id: string | null; width: number };
export type Block = Slot[][];

const key = (id: string, width = 1): Slot => ({ id, width });
const gap = (width: number): Slot => ({ id: null, width });
const keys = (row: string) => [...row].map((char) => key(char));

// Main block: 15 units wide on every row.
const MAIN_TOP: Block = [
  [
    key("Esc"),
    gap(1),
    ...["F1", "F2", "F3", "F4"].map((id) => key(id)),
    gap(0.5),
    ...["F5", "F6", "F7", "F8"].map((id) => key(id)),
    gap(0.5),
    ...["F9", "F10", "F11", "F12"].map((id) => key(id)),
  ],
  [
    key("Backquote"),
    ...keys("1234567890"),
    key("Minus"),
    key("Equal"),
    key("Backspace", 2),
  ],
  [
    key("Tab", 1.5),
    ...keys("QWERTYUIOP"),
    key("BracketLeft"),
    key("BracketRight"),
    key("Backslash", 1.5),
  ],
  [
    key("Caps", 1.75),
    ...keys("ASDFGHJKL"),
    key("Semicolon"),
    key("Quote"),
    key("Return", 2.25),
  ],
  [
    key("ShiftLeft", 2.25),
    ...keys("ZXCVBNM"),
    key("Comma"),
    key("Period"),
    key("Slash"),
    key("ShiftRight", 2.75),
  ],
];

const BOTTOM: Record<Platform, Slot[]> = {
  win: [
    key("CtrlLeft", 1.25),
    key("MetaLeft", 1.25),
    key("AltLeft", 1.25),
    key("Space", 6.25),
    key("AltRight", 1.25),
    key("MetaRight", 1.25),
    key("Menu", 1.25),
    key("CtrlRight", 1.25),
  ],
  mac: [
    key("CtrlLeft", 1.25),
    key("AltLeft", 1.25),
    key("MetaLeft", 1.5),
    key("Space", 6.25),
    key("MetaRight", 1.5),
    key("AltRight", 1.25),
    key("CtrlRight", 2),
  ],
};

// Navigation cluster and arrows: 3 units wide.
const NAV: Block = [
  [gap(3)],
  [key("Insert"), key("Home"), key("PageUp")],
  [key("Delete"), key("End"), key("PageDown")],
  [gap(3)],
  [gap(1), key("Up"), gap(1)],
  [key("Left"), key("Down"), key("Right")],
];

// Numeric pad: 4 units wide, drawn only when a shortcut uses it.
const NUMPAD: Block = [
  [gap(4)],
  [key("NumLock"), key("NumpadSlash"), key("NumpadStar"), key("NumpadMinus")],
  [key("Numpad7"), key("Numpad8"), key("Numpad9"), key("NumpadPlus")],
  [key("Numpad4"), key("Numpad5"), key("Numpad6"), gap(1)],
  [key("Numpad1"), key("Numpad2"), key("Numpad3"), key("NumpadEnter")],
  [key("Numpad0", 2), key("NumpadPeriod"), gap(1)],
];

export function keyboardBlocks(platform: Platform, numpad: boolean): Block[] {
  const main = [...MAIN_TOP, BOTTOM[platform]];
  return numpad ? [main, NAV, NUMPAD] : [main, NAV];
}

export type Lit = {
  ids: Set<string>;
  numpad: boolean;
  mouse: Set<MouseButton>;
  // Tokens with no place on the keyboard: must stay empty (tested).
  unknown: string[];
};

// Drawing width in key units: blocks, the half-unit gaps between them, and
// the mouse when one is drawn.
export function keyboardUnits(lit: Lit): number {
  return (
    15 + 0.5 + 3 + (lit.numpad ? 0.5 + 4 : 0) + (lit.mouse.size > 0 ? 2.5 : 0)
  );
}

const LABELS: Record<string, string> = {
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Caps: "Caps",
  Return: "↵",
  Backspace: "⌫",
  ShiftLeft: "⇧",
  ShiftRight: "⇧",
  Space: "",
  Insert: "Ins",
  PageUp: "PgUp",
  Delete: "Del",
  PageDown: "PgDn",
  Up: "↑",
  Down: "↓",
  Left: "←",
  Right: "→",
  NumLock: "Num",
  NumpadSlash: "/",
  NumpadStar: "*",
  NumpadMinus: "-",
  NumpadPlus: "+",
  NumpadEnter: "↵",
  NumpadPeriod: ".",
  Menu: "☰",
};

const PLATFORM_LABELS: Record<Platform, Record<string, string>> = {
  win: {
    CtrlLeft: "Ctrl",
    CtrlRight: "Ctrl",
    AltLeft: "Alt",
    AltRight: "Alt",
    MetaLeft: "Win",
    MetaRight: "Win",
  },
  mac: {
    CtrlLeft: "⌃",
    CtrlRight: "⌃",
    AltLeft: "⌥",
    AltRight: "⌥",
    MetaLeft: "⌘",
    MetaRight: "⌘",
    Insert: "fn",
    Delete: "⌦",
  },
};

export function keyCapLabel(id: string, platform: Platform): string {
  return (
    PLATFORM_LABELS[platform][id] ?? LABELS[id] ?? id.replace(/^Numpad/, "")
  );
}

// Site tokens to key ids. A modifier lights both of its keys (either works);
// a shifted symbol lights its physical key.
const TOKEN_KEYS: Record<string, string[]> = {
  "`": ["Backquote"],
  "-": ["Minus"],
  "=": ["Equal"],
  "+": ["Equal"],
  "[": ["BracketLeft"],
  "]": ["BracketRight"],
  "\\": ["Backslash"],
  ";": ["Semicolon"],
  "'": ["Quote"],
  ",": ["Comma"],
  "<": ["Comma"],
  ".": ["Period"],
  ">": ["Period"],
  "/": ["Slash"],
  ")": ["0"],
  Esc: ["Esc"],
  Tab: ["Tab"],
  Return: ["Return"],
  Space: ["Space"],
  Backspace: ["Backspace"],
  Home: ["Home"],
  End: ["End"],
  "Page Up": ["PageUp"],
  "Page Down": ["PageDown"],
  Insert: ["Insert"],
  Left: ["Left"],
  Right: ["Right"],
  Up: ["Up"],
  Down: ["Down"],
  "Forward Delete": ["Delete"],
  Shift: ["ShiftLeft", "ShiftRight"],
  Ctrl: ["CtrlLeft", "CtrlRight"],
  Alt: ["AltLeft", "AltRight"],
  Option: ["AltLeft", "AltRight"],
  Cmd: ["MetaLeft", "MetaRight"],
  "Numpad +": ["NumpadPlus"],
  "Numpad -": ["NumpadMinus"],
  "Numpad .": ["NumpadPeriod"],
};

const MOUSE = new Set<string>(MOUSE_BUTTONS);
const PLAIN = /^([A-Z0-9]|F([1-9]|1[0-2]))$/;

export function keysToLight(
  combos: readonly (readonly string[])[],
  platform: Platform,
): Lit {
  const lit: Lit = {
    ids: new Set(),
    numpad: false,
    mouse: new Set(),
    unknown: [],
  };
  for (const combo of combos) {
    for (const token of combo) {
      if (MOUSE.has(token)) {
        lit.mouse.add(token as MouseButton);
        continue;
      }
      // A Mac's Delete is the key above Return, which a PC calls Backspace.
      if (token === "Delete") {
        lit.ids.add(platform === "mac" ? "Backspace" : "Delete");
        continue;
      }
      const mapped = TOKEN_KEYS[token] ?? (PLAIN.test(token) ? [token] : null);
      if (!mapped) {
        lit.unknown.push(token);
        continue;
      }
      for (const id of mapped) lit.ids.add(id);
      if (token.startsWith("Numpad")) lit.numpad = true;
    }
  }
  return lit;
}
