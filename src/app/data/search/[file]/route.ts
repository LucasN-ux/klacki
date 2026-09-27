import { SOFTWARE_LIST } from "@/data";
import { LOCALES, isLocale } from "@/domain/locale";
import { buildSearchIndex } from "@/domain/search";

// The search page's data, one static file per language.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ file: `${locale}.json` }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/data/search/[file]">,
) {
  const { file } = await params;
  const locale = file.replace(/\.json$/, "");
  if (!isLocale(locale)) return new Response(null, { status: 404 });
  return Response.json(buildSearchIndex(SOFTWARE_LIST, locale));
}
