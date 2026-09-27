"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchField } from "@/components/ui/SearchField";
import { ShortcutList } from "@/components/ui/ShortcutRow";
import { SOFTWARE_LIST, getSoftware } from "@/data";
import { localeHref, type Locale } from "@/domain/locale";
import { summarizePlatformDifference } from "@/domain/platformDifference";
import { countHits, firstHits, searchShortcuts } from "@/domain/search";
import { shownPlatform } from "@/domain/keys";
import { usePlatform } from "@/hooks/usePlatform";
import { getDictionary } from "@/i18n";
import styles from "./SearchResults.module.css";

const MIN_QUERY_LENGTH = 2;
// Results shown at first, and added by each "Show more".
const PAGE_SIZE = 40;

export function SearchResults({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const list = useRef<HTMLDivElement>(null);
  // Index of the first result added by "Show more", to move focus there.
  const focusFrom = useRef<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const { platform: chosenPlatform } = usePlatform();
  const { search } = getDictionary(locale);
  const trimmed = query.trim();

  // Everything happens in the browser: the data is already in the page,
  // so there is no request and no waiting between two letters.
  const hits = useMemo(
    () => searchShortcuts(SOFTWARE_LIST, query, locale),
    [query, locale],
  );

  const total = countHits(hits);
  const shown = firstHits(hits, limit);

  useEffect(() => {
    input.current?.focus();
  }, []);

  // A new query starts again from the first page.
  function changeQuery(value: string) {
    setQuery(value);
    setLimit(PAGE_SIZE);
  }

  function showMore() {
    focusFrom.current = limit;
    setLimit(limit + PAGE_SIZE);
  }

  // After "Show more", the keyboard carries on at the first new result
  // instead of falling back to the top of the page.
  useEffect(() => {
    if (focusFrom.current === null) return;
    const row = list.current?.querySelectorAll("li")[focusFrom.current];
    focusFrom.current = null;
    row?.querySelector<HTMLElement>("a, button")?.focus();
  }, [limit]);

  // Keep the address in step with the field, so a result can be shared or
  // reloaded, without adding one history entry per typed letter.
  useEffect(() => {
    const base = localeHref(locale, "/search");
    const value = query.trim();
    window.history.replaceState(
      null,
      "",
      value ? `${base}?q=${encodeURIComponent(value)}` : base,
    );
  }, [query, locale]);

  return (
    <>
      <SearchField
        locale={locale}
        value={query}
        onChange={changeQuery}
        inputRef={input}
      />

      <p className={styles.count} aria-live="polite">
        {trimmed.length >= MIN_QUERY_LENGTH
          ? `${total} ${search.results}`
          : search.hint}
      </p>

      {trimmed.length >= MIN_QUERY_LENGTH && hits.length === 0 && (
        <p className={styles.empty}>{search.empty}</p>
      )}

      <div ref={list}>
        {shown.map((hit) => {
          const software = getSoftware(hit.software);
          if (!software) return null;
          return (
            <section key={hit.software} className={styles.group}>
              <Link
                href={localeHref(locale, `/${software.id}`)}
                className={styles.groupHead}
              >
                <span className={styles.badge} aria-hidden="true">
                  {software.initials}
                </span>
                {software.name}
                <span className={styles.groupCount}>
                  {/* The whole group, even when the page cuts it. */}
                  {
                    hits.find((all) => all.software === hit.software)?.shortcuts
                      .length
                  }
                </span>
              </Link>
              <ShortcutList
                shortcuts={hit.shortcuts}
                softwareId={software.id}
                softwareName={software.name}
                platform={shownPlatform(software.platforms, chosenPlatform)}
                locale={locale}
                // Decided from the whole software, not from the few results shown.
                flag={summarizePlatformDifference(software.shortcuts).flag}
              />
            </section>
          );
        })}
      </div>

      {total > limit && (
        <button type="button" className={styles.more} onClick={showMore}>
          {`${search.more} (${total - limit} ${total - limit === 1 ? search.remainingOne : search.remaining})`}
        </button>
      )}
    </>
  );
}
