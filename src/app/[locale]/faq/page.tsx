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
}: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${getDictionary(locale).faq.title} — Klacki`,
    alternates: { canonical: localeHref(locale, "/faq") },
  };
}

export default async function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { title, sections } = getDictionary(locale).faq;
  return (
    <SectionsPage
      locale={locale}
      path="/faq"
      title={title}
      sections={sections}
    />
  );
}
