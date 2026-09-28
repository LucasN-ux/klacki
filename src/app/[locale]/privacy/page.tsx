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
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${getDictionary(locale).privacy.title} — Klacki`,
    alternates: { canonical: localeHref(locale, "/privacy") },
  };
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { privacy } = getDictionary(locale);

  return (
    <>
      <SiteHeader locale={locale} path="/privacy" />
      <main id="content" className={shell.page}>
        <h1 className={styles.title}>{privacy.title}</h1>
        <div className={styles.prose}>
          <h2>{privacy.shortTitle}</h2>
          <p>{privacy.short}</p>

          <h2>{privacy.controllerTitle}</h2>
          <p>{privacy.controller}</p>

          <h2>{privacy.storageTitle}</h2>
          <p>{privacy.storage}</p>

          <h2>{privacy.cookiesTitle}</h2>
          <p>{privacy.cookies}</p>

          <h2>{privacy.logsTitle}</h2>
          <p>{privacy.logs}</p>

          <h2>{privacy.rightsTitle}</h2>
          <p>{privacy.rights}</p>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
