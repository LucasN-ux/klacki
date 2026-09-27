import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BoardView } from "@/components/features/BoardView";
import shell from "@/components/ui/PageShell.module.css";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import { softwareSummaries } from "@/data";
import { DEFAULT_LOCALE, LOCALES, isLocale, localeHref } from "@/domain/locale";
import { getDictionary } from "@/i18n";
import styles from "./page.module.css";

const PATH = "/board";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/board">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { board } = getDictionary(locale);

  return {
    title: `${board.title} — Klacki`,
    description: board.lede,
    alternates: {
      canonical: localeHref(locale, PATH),
      languages: {
        ...Object.fromEntries(
          LOCALES.map((item) => [item, localeHref(item, PATH)]),
        ),
        "x-default": localeHref(DEFAULT_LOCALE, PATH),
      },
    },
  };
}

export default async function BoardPage({
  params,
}: PageProps<"/[locale]/board">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { board } = getDictionary(locale);

  return (
    <>
      <SiteHeader locale={locale} path={PATH} />
      <main id="content" className={shell.page}>
        <header>
          <h1 className={styles.title}>{board.title}</h1>
          <p className={styles.lede}>{board.lede}</p>
        </header>
        {/* The selection and a shared link only exist in the browser. */}
        <Suspense>
          <BoardView locale={locale} summaries={softwareSummaries()} />
        </Suspense>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
