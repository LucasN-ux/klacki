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
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${getDictionary(locale).about.title} — Klacki`,
    alternates: { canonical: localeHref(locale, "/about") },
  };
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const { about } = dictionary;

  return (
    <>
      <SiteHeader locale={locale} path="/about" />
      <main id="content" className={shell.page}>
        <h1 className={styles.title}>{about.title}</h1>
        <div className={styles.prose}>
          <h2>{about.whatTitle}</h2>
          <p>{about.what}</p>

          <h2>{about.howTitle}</h2>
          <p>{about.how}</p>

          <h2>{about.whoTitle}</h2>
          <p>{about.who}</p>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
