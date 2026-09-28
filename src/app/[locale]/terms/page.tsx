import type { Metadata } from "next";
import { notFound } from "next/navigation";
import shell from "@/components/ui/PageShell.module.css";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import styles from "@/components/ui/TextPage.module.css";
import { LOCALES, isLocale, localeHref } from "@/domain/locale";
import { getDictionary } from "@/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${getDictionary(locale).terms.title} — Klacki`,
    alternates: { canonical: localeHref(locale, "/terms") },
  };
}

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { terms } = getDictionary(locale);

  return (
    <>
      <SiteHeader locale={locale} path="/terms" />
      <main id="content" className={shell.page}>
        <h1 className={styles.title}>{terms.title}</h1>
        <div className={styles.prose}>
          {terms.sections.map((section) => (
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
