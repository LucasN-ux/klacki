"use client";

import Link from "next/link";
import { ShortcutList } from "@/components/ui/ShortcutRow";
import { SOFTWARE_LIST } from "@/data";
import { localeHref, type Locale } from "@/domain/locale";
import { summarizePlatformDifference } from "@/domain/platformDifference";
import { inLocale } from "@/domain/schema";
import { favoriteKey, useFavorites } from "@/hooks/useFavorites";
import { shownPlatform } from "@/domain/keys";
import { usePlatform } from "@/hooks/usePlatform";
import { getDictionary } from "@/i18n";
import styles from "./SearchResults.module.css";

export function FavoritesList({ locale }: { locale: Locale }) {
  const { keys, count } = useFavorites();
  const { platform: chosenPlatform } = usePlatform();
  const { favorites, site } = getDictionary(locale);

  // The kept shortcuts, grouped by software and in the order of the data files.
  const groups = SOFTWARE_LIST.map((software) => ({
    software,
    shortcuts: software.shortcuts.filter((shortcut) =>
      keys.includes(favoriteKey(software.id, shortcut.id)),
    ),
  })).filter((group) => group.shortcuts.length > 0);

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
            flag={summarizePlatformDifference(group.software.shortcuts).flag}
          />
        </section>
      ))}
    </>
  );
}
