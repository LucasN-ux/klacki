import type { Metadata } from "next";
import { notFound } from "next/navigation";
import shell from "@/components/ui/PageShell.module.css";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import styles from "@/components/ui/TextPage.module.css";
import { LOCALES, isLocale, localeHref } from "@/domain/locale";
import { REPO_URL } from "@/domain/site";
import { getDictionary } from "@/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/legal">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${getDictionary(locale).legal.title} — Klacki`,
    alternates: { canonical: localeHref(locale, "/legal") },
  };
}

export default async function LegalPage({
  params,
}: PageProps<"/[locale]/legal">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { legal } = getDictionary(locale);

  return (
    <>
      <SiteHeader locale={locale} path="/legal" />
      <main id="content" className={shell.page}>
        <h1 className={styles.title}>{legal.title}</h1>
        <div className={styles.prose}>
          <h2>{legal.publisherTitle}</h2>
          <p>{legal.publisher}</p>

          <h2>{legal.codeTitle}</h2>
          <p>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              {legal.code}
            </a>
          </p>

          <h2>{legal.hostTitle}</h2>
          <p>{legal.host}</p>

          <h2>{legal.trademarksTitle}</h2>
          <p>{legal.trademarks}</p>

          <h2>{legal.contentTitle}</h2>
          <p>{legal.content}</p>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
