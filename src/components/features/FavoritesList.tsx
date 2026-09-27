"use client";

import Link from "next/link";
import { useMemo } from "react";
import { LoadState } from "@/components/ui/LoadState";
import { ShortcutList } from "@/components/ui/ShortcutRow";
import { softwareSet } from "@/data/load";
import { localeHref, type Locale } from "@/domain/locale";
import { inLocale } from "@/domain/schema";
import type { SoftwareSummary } from "@/domain/summary";
import { favoriteKey, useFavorites } from "@/hooks/useFavorites";
import { shownPlatform } from "@/domain/keys";
import { useLoaded } from "@/hooks/useLoaded";
import { usePlatform } from "@/hooks/usePlatform";
import { getDictionary } from "@/i18n";
import styles from "./SearchResults.module.css";

export function FavoritesList({
  locale,
  summaries,
}: {
  locale: Locale;
  /** Every software: the ids a favourite may point to, and their flags. */
  summaries: SoftwareSummary[];
}) {
  const { keys, count } = useFavorites();
  const { platform: chosenPlatform } = usePlatform();
  const { favorites, site } = getDictionary(locale);

  // Only the software holding a kept shortcut are downloaded, in catalogue
  // order; one that has left the catalogue is never asked for.
  const holders = summaries.filter((software) =>
    keys.some((key) => key.startsWith(`${software.id}:`)),
  );
  const loaded = useLoaded(
    holders.map((software) => software.id).join(","),
    softwareSet,
  );
  const flags = useMemo(
    () => new Map(summaries.map((one) => [one.id, one.flag])),
    [summaries],
  );

  // The kept shortcuts, grouped by software and in catalogue order.
  const groups = (loaded.data ?? loaded.latest ?? [])
    .map((software) => ({
      software,
      shortcuts: software.shortcuts.filter((shortcut) =>
        keys.includes(favoriteKey(software.id, shortcut.id)),
      ),
    }))
    .filter((group) => group.shortcuts.length > 0);

  if (count === 0) {
    return (
      <p className={styles.empty}>
        {favorites.empty}
        <br />
        {favorites.hint}
      </p>
    );
  }

  return (
    <>
      <p className={styles.count}>
        {count} {site.shortcutCount} · {favorites.kept}
      </p>
      {/* An error shows even over groups already here: a favourite starred
          in another tab may be the one that failed. */}
      <LoadState
        status={
          groups.length === 0 || loaded.status === "error"
            ? loaded.status
            : "ready"
        }
        locale={locale}
        onRetry={loaded.retry}
      />
      {groups.map((group) => (
        <section key={group.software.id} className={styles.group}>
          <Link
            href={localeHref(locale, `/${group.software.id}`)}
            className={styles.groupHead}
          >
            <span className={styles.badge} aria-hidden="true">
              {group.software.initials}
            </span>
            {group.software.name}
            <span className={styles.groupCount}>{group.shortcuts.length}</span>
          </Link>
          <ShortcutList
            shortcuts={group.shortcuts.map((one) => inLocale(one, locale))}
            softwareId={group.software.id}
            softwareName={group.software.name}
            platform={shownPlatform(group.software.platforms, chosenPlatform)}
            locale={locale}
            flag={flags.get(group.software.id) ?? null}
          />
        </section>
      ))}
    </>
  );
}
