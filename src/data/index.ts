import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Software } from "@/domain/schema";
import { FAMILY_ORDER, summarize } from "@/domain/summary";

// Every file in src/data/software is a software: adding one is dropping its
// JSON there, nothing to register. Read and checked at build time on the
// server; a client component importing this module breaks the build.
const FOLDER = path.join(process.cwd(), "src/data/software");

const RAW_SOFTWARE: unknown[] = readdirSync(FOLDER)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => JSON.parse(readFileSync(path.join(FOLDER, name), "utf8")));

// Parsed at build time: an invalid file stops the build instead of shipping a
// wrong shortcut. Zod also strips anything the schema does not describe.
export const SOFTWARE_LIST = RAW_SOFTWARE.map((raw) => Software.parse(raw));

const BY_ID = new Map(SOFTWARE_LIST.map((software) => [software.id, software]));

export function getSoftware(id: string) {
  return BY_ID.get(id);
}

export function getSoftwareIds(): string[] {
  return SOFTWARE_LIST.map((software) => software.id);
}

// Each family, in the home page order, with its software.
export function softwareByFamily() {
  return FAMILY_ORDER.map((family) => ({
    family,
    software: SOFTWARE_LIST.filter((item) => item.family === family),
  })).filter((group) => group.software.length > 0);
}

export { FAMILY_ORDER };

// One summary per software, for the pages that list software without
// showing their shortcuts.
export function softwareSummaries() {
  return SOFTWARE_LIST.map(summarize);
}
