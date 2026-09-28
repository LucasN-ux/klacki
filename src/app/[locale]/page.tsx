import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ghost from "@/../public/ghost.png";
import { HeaderSearch } from "@/components/features/HeaderSearch";
import { LandingTour } from "@/components/features/LandingTour";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import { SOFTWARE_LIST, softwareByFamily } from "@/data";
import { isLocale, localeHref } from "@/domain/locale";
import { getDictionary } from "@/i18n";
import styles from "./page.module.css";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = getDictionary(locale);
  const { home } = dictionary;
  // Real numbers, counted from the data files: the sentence can never fall
  // out of step with the catalogue.
  const shortcutCount = SOFTWARE_LIST.reduce(
    (total, software) => total + software.shortcuts.length,
    0,
  );
  return (
    <>
      <SiteHeader locale={locale} showSearch={false} />
      <main id="content">
        <div className={styles.wrap}>
          <section className={styles.hero}>
            {/* The mascot appears once on the whole site, here. */}
            <Image src={ghost} alt="" className={styles.ghost} priority />
            <div>
              <h1 className={styles.title}>
                {home.titleTop}
                <br />
                <span className={styles.mark}>{home.titleMark}</span>
              </h1>
              <p className={styles.lede}>{home.lede}</p>
              {/* The only thing to do here: type. */}
              <div className={styles.search}>
                <HeaderSearch locale={locale} hero />
              </div>
              <p className={styles.tries}>
                <span>{home.tryLabel}</span>
                {home.tries.map((query) => (
                  <Link
                    key={query}
                    className={styles.try}
                    href={`${localeHref(locale, "/search")}?q=${encodeURIComponent(query)}`}
                  >
                    {query}
                  </Link>
                ))}
              </p>
              <p className={styles.counts}>
                {SOFTWARE_LIST.length} {dictionary.site.softwareCount} ·{" "}
                {shortcutCount} {dictionary.site.shortcutCount} ·{" "}
                {home.noAccount}
              </p>
            </div>
          </section>
        </div>

        {/* The catalogue, one way in per family: the band keeps its size
            however many software join, and each family leads to its section. */}
        <nav className={styles.band} aria-label={dictionary.nav.catalogue}>
          {softwareByFamily().map((group) => (
            <Link
              key={group.family}
              className={styles.family}
              href={`${localeHref(locale, "/software")}#${group.family}`}
            >
              {dictionary.families[group.family]}{" "}
              <b className={styles.familyCount}>{group.software.length}</b>
            </Link>
          ))}
          <Link
            className={styles.bandAll}
            href={localeHref(locale, "/software")}
          >
            {home.bandCta} ({SOFTWARE_LIST.length}) →
          </Link>
        </nav>

        <LandingTour locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
