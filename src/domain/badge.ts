// The look of a software's badge. The colour comes from its family (styles);
// the shape and the type style come from its id, so two software of the same
// family still look different, and a new software gets its own look without
// anyone choosing it. Same id, same look, on every page.
export const BADGE_SHAPES = ["square", "round", "leaf", "tilt"] as const;
export const BADGE_TYPES = ["display", "mono", "black", "wide"] as const;

export type BadgeLook = {
  shape: (typeof BADGE_SHAPES)[number];
  type: (typeof BADGE_TYPES)[number];
};

// A small, stable string hash (FNV-1a): no randomness, no dependency.
function hash(text: string): number {
  let value = 2166136261;
  for (const char of text) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619) >>> 0;
  }
  return value;
}

export function badgeLook(id: string): BadgeLook {
  const value = hash(id);
  return {
    shape: BADGE_SHAPES[value % BADGE_SHAPES.length],
    type: BADGE_TYPES[
      Math.floor(value / BADGE_SHAPES.length) % BADGE_TYPES.length
    ],
  };
}
