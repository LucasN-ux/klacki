import Image from "next/image";
import Link from "next/link";
import ghostKeys from "@/../public/ghost-keys.png";
import ghostPoint from "@/../public/ghost-point.png";
import ghostStar from "@/../public/ghost-star.png";
import { PlatformShowcase } from "@/components/features/PlatformShowcase";
import { Reveal } from "@/components/features/Reveal";
import { KeyCombos } from "@/components/ui/Keycap";
import { Keyboard } from "@/components/ui/Keyboard";
import { SoftwareBadge } from "@/components/ui/SoftwareBadge";
import { FAMILY_ORDER, SOFTWARE_LIST } from "@/data";
import { keysToLight } from "@/domain/keyboard";
import { comboLabel } from "@/domain/keys";
import { localeHref, type Locale } from "@/domain/locale";
import { platformShowcase } from "@/domain/showcase";
import { getDictionary } from "@/i18n";
import styles from "./LandingTour.module.css";

// The landing's guided tour: one full-width step per feature of the site,
// each with a real demo read from the data, and each ghost once.
export function LandingTour({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const { home } = dictionary;
  const demoRows = platformShowcase(SOFTWARE_LIST, 4);
  const { tour } = home;
  // The keyboard of the tour: a real drawing, with the keys of Redo lit.
  const redo = [["Shift", "Ctrl", "Z"]];
  // Real rows for the tour, read from the data: one action answered by
  // software of different families, and a few sources with their dates.
  const spread = (list: typeof SOFTWARE_LIST, count: number) => {
    const families = new Set<string>();
    // In the order of the families, so 3D comes before audio.
    return [...list]
      .sort(
        (a, b) =>
          FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family),
      )
      .filter((software) => {
        if (families.has(software.family)) return false;
        families.add(software.family);
        return true;
      })
      .slice(0, count);
  };
  const searchQuery = "frame-selection";
  const searchRows = spread(
    SOFTWARE_LIST.filter(
      (software) =>
        software.platforms.includes("win") &&
        software.shortcuts.some((shortcut) => shortcut.id === searchQuery),
    ),
    3,
  ).map((software) => ({
    software,
    shortcut: software.shortcuts.find(
      (shortcut) => shortcut.id === searchQuery,
    )!,
  }));
  const sourceRows = spread(SOFTWARE_LIST, 3);
  const dateOf = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      new Date(iso),
    );

  return (
    <>
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
          <section className={`${styles.feature} ${styles.wide}`}>
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
            <div
              className={`${styles.sample} ${styles.demo}`}
              aria-hidden="true"
            >
              <p className={styles.sampleQuery}>
                {searchRows[0]?.shortcut.action[locale]}
              </p>
              {searchRows.map(({ software, shortcut }) => (
                <p key={software.id} className={styles.sampleRow}>
                  <SoftwareBadge software={software} size="sm" />
                  <span className={styles.sampleName}>{software.name}</span>
                  <KeyCombos
                    keys={shortcut.keys}
                    platform="win"
                    locale={locale}
                  />
                </p>
              ))}
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
          <section className={`${styles.feature} ${styles.wide}`}>
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
            <div className={`${styles.sample} ${styles.demo}`}>
              {sourceRows.map((software) => (
                <p key={software.id} className={styles.sampleRow}>
                  <SoftwareBadge software={software} size="sm" />
                  <span className={styles.sampleName}>
                    {software.name} {software.version}
                  </span>
                  <span className={styles.sampleDate}>
                    ✓ {dateOf(software.verifiedAt)}
                  </span>
                </p>
              ))}
            </div>
          </section>
        </div>
      </Reveal>
    </>
  );
}
