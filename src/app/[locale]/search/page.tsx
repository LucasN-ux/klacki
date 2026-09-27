import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SearchResults } from "@/components/features/SearchResults";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import { softwareSummaries } from "@/data";
import { LOCALES, isLocale } from "@/domain/locale";
import { getDictionary } from "@/i18n";
import shell from "@/components/ui/PageShell.module.css";
import styles from "./page.module.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/search">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${getDictionary(locale).search.title} — Klacki`,
    // A result page has nothing to offer a search engine: it is the visitor's own query.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  params,
}: PageProps<"/[locale]/search">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <SiteHeader locale={locale} path="/search" />
      <main id="content" className={shell.page}>
        <h1 className={styles.title}>{getDictionary(locale).search.title}</h1>
        {/* The query is read from the address, which only exists in the browser. */}
        <Suspense>
          <SearchResults locale={locale} summaries={softwareSummaries()} />
        </Suspense>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
