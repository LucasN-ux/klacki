"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Keyboard } from "@/components/ui/Keyboard";
import { keyboardUnits, keysToLight } from "@/domain/keyboard";
import { comboLabel } from "@/domain/keys";
import type { Locale } from "@/domain/locale";
import type { Platform } from "@/domain/schema";
import { getDictionary } from "@/i18n";
import styles from "./KeyboardBubble.module.css";

// A short rest before opening, so a pointer crossing a list opens nothing.
const OPEN_DELAY_MS = 250;

// One bubble on the page at a time: opening one closes the one before. The
// bookkeeping lives in module functions, outside the component.
let current: { owner: object; close: () => void } | null = null;

function claim(owner: object, close: () => void) {
  if (current && current.owner !== owner) current.close();
  current = { owner, close };
}

function release(owner: object) {
  if (current?.owner === owner) current = null;
}

// Where the keys are, read at open time. The bubble's own height is measured
// once it is drawn (see keepOnScreen), never estimated.
type Placement = { right: number; top: number; bottom: number };

function placeFor(trigger: HTMLElement): Placement {
  const rect = trigger.getBoundingClientRect();
  return { right: rect.right, top: rect.top, bottom: rect.bottom };
}

// Under the keys, or above them when the drawn bubble would run past the
// bottom of the screen. Sets a CSS variable on the node: no React state.
function keepOnScreen(node: HTMLSpanElement | null, at: Placement) {
  if (!node) return;
  const height = node.getBoundingClientRect().height;
  const below = at.bottom + 10;
  const top =
    below + height > window.innerHeight - 8
      ? Math.max(8, at.top - 10 - height)
      : below;
  node.style.setProperty("--top", `${top}px`);
}

export function KeyboardBubble({
  combos,
  platform,
  locale,
  children,
}: {
  combos: string[][];
  platform: Platform;
  locale: Locale;
  children: ReactNode;
}) {
  const { keyboard } = getDictionary(locale);
  const wrap = useRef<HTMLSpanElement>(null);
  const owner = useRef({});
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pointer = useRef("mouse");
  const [placement, setPlacement] = useState<Placement | null>(null);
  const lit = keysToLight(combos, platform);

  function open() {
    const trigger = wrap.current;
    if (!trigger) return;
    claim(owner.current, () => setPlacement(null));
    setPlacement(placeFor(trigger));
  }

  function close() {
    clearTimeout(timer.current);
    setPlacement(null);
    release(owner.current);
  }

  function onPointerEnter(event: ReactPointerEvent) {
    pointer.current = event.pointerType;
    if (event.pointerType !== "mouse") return;
    clearTimeout(timer.current);
    timer.current = setTimeout(open, OPEN_DELAY_MS);
  }

  function onPointerLeave(event: ReactPointerEvent) {
    if (event.pointerType === "mouse") close();
  }

  // Touch and pen have no hover: a tap on the keys opens or closes.
  function onClick() {
    if (pointer.current === "mouse") return;
    if (placement) close();
    else open();
  }

  // While open, Escape, a press outside, or a scroll closes it: a fixed
  // bubble would otherwise drift away from its keys.
  useEffect(() => {
    if (!placement) return;
    const me = owner.current;
    const shut = () => {
      setPlacement(null);
      release(me);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") shut();
    };
    const onDown = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) shut();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", shut, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", shut);
    };
  }, [placement]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <span
      ref={wrap}
      className={styles.wrap}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={(event) => {
        pointer.current = event.pointerType;
      }}
      onClick={onClick}
    >
      {children}
      {placement && (
        // A picture of what the keys already say as text: hidden from
        // screen readers, no tab stop.
        <span
          className={styles.bubble}
          aria-hidden="true"
          ref={(node) => keepOnScreen(node, placement)}
          style={
            {
              "--units": keyboardUnits(lit),
              "--right": `${placement.right}px`,
            } as CSSProperties
          }
        >
          <Keyboard
            lit={lit}
            platform={platform}
            caption={`${keyboard.caption} · ${platform === "mac" ? keyboard.mac : keyboard.pc}`}
            combo={combos
              .map((combo) => comboLabel(combo, platform, locale))
              .join(" / ")}
          />
        </span>
      )}
    </span>
  );
}
