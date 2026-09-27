import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FavoritesList } from "@/components/features/FavoritesList";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import { softwareSummaries } from "@/data";
import shell from "@/components/ui/PageShell.module.css";
import { LOCALES, isLocale } from "@/domain/locale";
import { getDictionary } from "@/i18n";
import styles from "./page.module.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/favorites">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${getDictionary(locale).favorites.title} — Klacki`,
    // This page shows what one visitor kept: nothing to offer a search engine.
    robots: { index: false, follow: true },
  };
}

export default async function FavoritesPage({
  params,
}: PageProps<"/[locale]/favorites">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <SiteHeader locale={locale} path="/favorites" />
      <main id="content" className={shell.page}>
        <h1 className={styles.title}>
          {getDictionary(locale).favorites.title}
        </h1>
        {/* The list lives in the browser, so it is drawn there. */}
        <FavoritesList locale={locale} summaries={softwareSummaries()} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
