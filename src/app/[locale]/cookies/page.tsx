import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionsPage } from "@/components/ui/SectionsPage";
import { LOCALES, isLocale, localeHref } from "@/domain/locale";
import { getDictionary } from "@/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cookies">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${getDictionary(locale).cookies.title} — Klacki`,
    alternates: { canonical: localeHref(locale, "/cookies") },
  };
}

export default async function CookiesPage({
  params,
}: PageProps<"/[locale]/cookies">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { title, sections } = getDictionary(locale).cookies;
  return (
    <SectionsPage
      locale={locale}
      path="/cookies"
      title={title}
      sections={sections}
    />
  );
}
