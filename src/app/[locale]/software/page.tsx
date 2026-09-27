import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import shell from "@/components/ui/PageShell.module.css";
import { Ribbon } from "@/components/ui/Ribbon";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import { SoftwareCard } from "@/components/ui/SoftwareCard";
import { softwareByFamily } from "@/data";
import { DEFAULT_LOCALE, LOCALES, isLocale, localeHref } from "@/domain/locale";
import { getDictionary } from "@/i18n";
import { SUGGEST_URL } from "@/domain/site";
import styles from "./page.module.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/software">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { catalogue } = getDictionary(locale);

  return {
    title: `${catalogue.title} — Klacki`,
    description: catalogue.lede,
    alternates: {
      canonical: localeHref(locale, "/software"),
      languages: {
        ...Object.fromEntries(
          LOCALES.map((item) => [item, localeHref(item, "/software")]),
        ),
        "x-default": localeHref(DEFAULT_LOCALE, "/software"),
      },
    },
  };
}

export default async function CataloguePage({
  params,
}: PageProps<"/[locale]/software">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = getDictionary(locale);
  const { catalogue } = dictionary;
  // Families, their software and their counts all come from the data files.
  const groups = softwareByFamily().map((group) => ({
    ...group,
    shortcuts: group.software.reduce(
      (total, software) => total + software.shortcuts.length,
      0,
    ),
  }));

  return (
    <>
      <SiteHeader locale={locale} path="/software" />
      <main id="content" className={shell.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>{catalogue.title}</h1>
          <p className={styles.lede}>{catalogue.lede}</p>
          {/* Anchors, not filters: no waiting, and they work without JavaScript. */}
          <nav className={styles.jump} aria-label={catalogue.jumpLabel}>
            {groups.map((group) => (
              <a
                key={group.family}
                href={`#${group.family}`}
                className={styles.jumpLink}
              >
                {dictionary.families[group.family]}
              </a>
            ))}
          </nav>
        </header>

        {groups.map((group) => (
          <section
            key={group.family}
            id={group.family}
            className={styles.family}
          >
            <div className={styles.familyHead}>
              <h2>
                <Ribbon>{dictionary.families[group.family]}</Ribbon>
              </h2>
              <p className={styles.familyMeta}>
                {group.software.length}{" "}
                {group.software.length === 1
                  ? dictionary.site.softwareCountOne
                  : dictionary.site.softwareCount}{" "}
                · {group.shortcuts} {dictionary.site.shortcutCount}
              </p>
            </div>
            <div className={styles.grid}>
              {group.software.map((software) => (
                <Link
                  key={software.id}
                  href={localeHref(locale, `/${software.id}`)}
                >
                  <SoftwareCard software={software} locale={locale} />
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className={styles.missing}>
          <div>
            <h2 className={styles.missingTitle}>{catalogue.missingTitle}</h2>
            <p className={styles.missingText}>{catalogue.missingText}</p>
          </div>
          <a
            className={styles.missingButton}
            href={SUGGEST_URL}
            target="_blank"
            rel="noreferrer"
          >
            {catalogue.missingCta}
          </a>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
