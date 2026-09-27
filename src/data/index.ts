import { Software } from "@/domain/schema";
import { FAMILY_ORDER, summarize } from "@/domain/summary";
import blender from "./software/blender.json";
import embergen from "./software/embergen.json";
import gaea from "./software/gaea.json";
import houdini from "./software/houdini.json";
import mari from "./software/mari.json";
import marmosetToolbag from "./software/marmoset-toolbag.json";
import marvelousDesigner from "./software/marvelous-designer.json";
import maya from "./software/maya.json";
import nuke from "./software/nuke.json";
import premierePro from "./software/premiere-pro.json";
import substanceDesigner from "./software/substance-designer.json";
import substancePainter from "./software/substance-painter.json";
import touchdesigner from "./software/touchdesigner.json";
import zbrush from "./software/zbrush.json";

// Every software file, listed once. Adding a software = adding its JSON file
// and one line here; no other code changes.
const RAW_SOFTWARE: unknown[] = [
  blender,
  embergen,
  gaea,
  houdini,
  mari,
  marmosetToolbag,
  marvelousDesigner,
  maya,
  nuke,
  premierePro,
  substanceDesigner,
  substancePainter,
  touchdesigner,
  zbrush,
];

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
