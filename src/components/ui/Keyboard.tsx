import type { CSSProperties } from "react";
import {
  keyboardBlocks,
  keyboardUnits,
  keyCapLabel,
  type Lit,
} from "@/domain/keyboard";
import type { Platform } from "@/domain/schema";
import styles from "./Keyboard.module.css";

// A drawing of the keyboard with some keys lit. Spans only, so it can sit
// inside the span that wraps a shortcut's keys.
export function Keyboard({
  lit,
  platform,
  caption,
  combo,
}: {
  lit: Lit;
  platform: Platform;
  caption: string;
  combo: string;
}) {
  return (
    <span
      className={styles.keyboard}
      style={{ "--units": keyboardUnits(lit) } as CSSProperties}
    >
      <span className={styles.drawing}>
        {keyboardBlocks(platform, lit.numpad).map((block, b) => (
          <span key={b} className={styles.block}>
            {block.map((row, r) => (
              <span key={r} className={styles.row}>
                {row.map((slot, s) => (
                  <span
                    key={s}
                    className={
                      slot.id === null
                        ? styles.gap
                        : lit.ids.has(slot.id)
                          ? `${styles.key} ${styles.lit}`
                          : styles.key
                    }
                    style={{ "--w": slot.width } as CSSProperties}
                  >
                    {slot.id === null ? null : keyCapLabel(slot.id, platform)}
                  </span>
                ))}
              </span>
            ))}
          </span>
        ))}
        {lit.mouse.size > 0 && (
          <span className={styles.mouse}>
            <span
              className={`${styles.button} ${styles.left} ${lit.mouse.has("MouseLeft") ? styles.lit : ""}`}
            />
            <span
              className={`${styles.button} ${styles.right} ${lit.mouse.has("MouseRight") ? styles.lit : ""}`}
            />
            <span
              className={`${styles.wheel} ${lit.mouse.has("MouseMiddle") || lit.mouse.has("MouseWheel") ? styles.lit : ""}`}
            />
          </span>
        )}
      </span>
      <span className={styles.caption}>
        <span>{caption}</span>
        <span>{combo}</span>
      </span>
    </span>
  );
}
