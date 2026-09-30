import shell from "@/components/ui/PageShell.module.css";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import styles from "@/components/ui/TextPage.module.css";
import type { Locale } from "@/domain/locale";

// A text page made of titled sections read from the dictionary: terms,
// cookies, FAQ.
export function SectionsPage({
  locale,
  path,
  title,
  sections,
}: {
  locale: Locale;
  path: string;
  title: string;
  sections: { title: string; text: string }[];
}) {
  return (
    <>
      <SiteHeader locale={locale} path={path} />
      <main id="content" className={shell.page}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.prose}>
          {sections.map((section) => (
            <section key={section.title} className={styles.prose}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
