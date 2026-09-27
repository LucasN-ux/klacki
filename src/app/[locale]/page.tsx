import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ghost from "@/../public/ghost.png";
import ghostKeys from "@/../public/ghost-keys.png";
import ghostPoint from "@/../public/ghost-point.png";
import ghostStar from "@/../public/ghost-star.png";
import { HeaderSearch } from "@/components/features/HeaderSearch";
import { PlatformShowcase } from "@/components/features/PlatformShowcase";
import { Reveal } from "@/components/features/Reveal";
import { Keyboard } from "@/components/ui/Keyboard";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import { SOFTWARE_LIST, softwareByFamily } from "@/data";
import { isLocale, localeHref } from "@/domain/locale";
import { keysToLight } from "@/domain/keyboard";
import { comboLabel } from "@/domain/keys";
import { platformShowcase } from "@/domain/showcase";
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
  const demoRows = platformShowcase(SOFTWARE_LIST, 4);
  const { tour } = home;
  // The keyboard of the tour: a real drawing, with the keys of Redo lit.
  const redo = [["Shift", "Ctrl", "Z"]];

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

        {/* A guided tour of the site, one block per feature. Each ghost
            appears once, where its pose says what the block is about. */}
        <div className={styles.wrap}>
          <header className={styles.tourHead}>
            <h2 className={styles.tourTitle}>{tour.title}</h2>
            <p>{tour.lede}</p>
          </header>
        </div>

        <Reveal className={styles.step}>
          <div className={styles.wrap}>
            <section className={styles.feature}>
              <div className={styles.featureText}>
                <span className={styles.num}>01</span>
                <h3>{tour.search.title}</h3>
                <p>{tour.search.text}</p>
                <Link
                  className={styles.featureLink}
                  href={localeHref(locale, "/search")}
                >
                  {tour.search.cta} →
                </Link>
              </div>
            </section>
          </div>
        </Reveal>

        <Reveal className={styles.step}>
          <div className={styles.wrap}>
            <section className={`${styles.feature} ${styles.wide}`}>
              <div className={styles.featureText}>
                <span className={styles.num}>02</span>
                <h3>{tour.platform.title}</h3>
                <p>{tour.platform.text}</p>
                <Link
                  className={styles.featureLink}
                  href={localeHref(locale, "/windows-mac")}
                >
                  {tour.platform.cta} →
                </Link>
              </div>
              <div className={styles.demo}>
                <PlatformShowcase rows={demoRows} locale={locale} />
              </div>
            </section>
          </div>
        </Reveal>

        <Reveal className={styles.step}>
          <div className={styles.wrap}>
            <section className={`${styles.feature} ${styles.withGhost}`}>
              <Image src={ghostKeys} alt="" className={styles.featureGhost} />
              <div className={styles.featureText}>
                <span className={styles.num}>03</span>
                <h3>{tour.keyboard.title}</h3>
                <p>{tour.keyboard.text}</p>
              </div>
              <div
                className={`${styles.keyboard} ${styles.demo}`}
                aria-hidden="true"
              >
                <Keyboard
                  lit={keysToLight(redo, "win")}
                  platform="win"
                  caption={`${dictionary.keyboard.caption} · ${dictionary.keyboard.pc}`}
                  combo={comboLabel(redo[0], "win", locale)}
                />
              </div>
            </section>
          </div>
        </Reveal>

        <Reveal className={styles.step}>
          <div className={styles.wrap}>
            <section
              className={`${styles.feature} ${styles.withGhost} ${styles.reverse}`}
            >
              <Image src={ghostPoint} alt="" className={styles.featureGhost} />
              <div className={styles.featureText}>
                <span className={styles.num}>04</span>
                <h3>{tour.board.title}</h3>
                <p>{tour.board.text}</p>
                <Link
                  className={styles.featureCta}
                  href={localeHref(locale, "/board")}
                >
                  {tour.board.cta} →
                </Link>
              </div>
            </section>
          </div>
        </Reveal>

        <Reveal className={styles.step}>
          <div className={styles.wrap}>
            <section className={`${styles.feature} ${styles.withGhost}`}>
              <Image src={ghostStar} alt="" className={styles.featureGhost} />
              <div className={styles.featureText}>
                <span className={styles.num}>05</span>
                <h3>{tour.keep.title}</h3>
                <p>{tour.keep.text}</p>
                <Link
                  className={styles.featureLink}
                  href={localeHref(locale, "/favorites")}
                >
                  {tour.keep.cta} →
                </Link>
              </div>
            </section>
          </div>
        </Reveal>

        <Reveal className={styles.step}>
          <div className={styles.wrap}>
            <section className={styles.feature}>
              <div className={styles.featureText}>
                <span className={styles.num}>06</span>
                <h3>{tour.trust.title}</h3>
                <p>{tour.trust.text}</p>
                <Link
                  className={styles.featureLink}
                  href={localeHref(locale, "/sources")}
                >
                  {tour.trust.cta} →
                </Link>
              </div>
            </section>
          </div>
        </Reveal>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
