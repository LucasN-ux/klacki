import { getSoftware, getSoftwareIds } from "@/data";

// One static file per software, written by `next build`: a page downloads
// only the software it shows. Any other name is a 404.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getSoftwareIds().map((id) => ({ file: `${id}.json` }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/data/software/[file]">,
) {
  const { file } = await params;
  const software = getSoftware(file.replace(/\.json$/, ""));
  if (!software) return new Response(null, { status: 404 });
  return Response.json(software);
}
