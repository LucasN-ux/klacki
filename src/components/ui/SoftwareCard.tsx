import type { Locale } from "@/domain/locale";
import type { Software } from "@/domain/schema";
import { getDictionary } from "@/i18n";
import styles from "./SoftwareCard.module.css";
import { SoftwareBadge } from "@/components/ui/SoftwareBadge";

export function SoftwareCard({
  software,
  locale,
}: {
  software: Software;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  // A software that runs on one platform only says so here, before the
  // visitor opens its page and looks for a Mac column.
  const onlyOn =
    software.platforms.length === 1
      ? software.platforms[0] === "win"
        ? dictionary.software.windowsOnly
        : dictionary.software.macOnly
      : null;

  return (
    <article className={styles.card}>
      <SoftwareBadge software={software} />
      <span>
        <span className={styles.name}>{software.name}</span>
        {onlyOn && <span className={styles.only}>{onlyOn}</span>}
        <br />
        {/* Real count and real version, read from the data file: never a
            number typed by hand. */}
        <span className={styles.count}>
          {software.shortcuts.length} {dictionary.site.shortcutCount} ·{" "}
          {software.version}
        </span>
      </span>
    </article>
  );
}
