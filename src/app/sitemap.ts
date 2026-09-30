import type { MetadataRoute } from "next";
import { SOFTWARE_LIST } from "@/data";
import { LOCALES, localeHref } from "@/domain/locale";
import { SITE_URL } from "@/domain/site";

// The list of pages given to search engines. Search and favorites are left
// out: they only show what one visitor typed or kept. The board is in: its
// title and explanation are in the built page; the picker is drawn in the
// browser, where the selection and a shared link live.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/software",
    "/windows-mac",
    "/board",
    "/sources",
    "/about",
    "/legal",
    "/privacy",
    "/terms",
    "/cookies",
    "/faq",
    ...SOFTWARE_LIST.map((software) => `/${software.id}`),
  ];

  return LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE_URL}${localeHref(locale, path)}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((other) => [
            other,
            `${SITE_URL}${localeHref(other, path)}`,
          ]),
        ),
      },
    })),
  );
}
