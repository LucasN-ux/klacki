import { badgeLook } from "@/domain/badge";
import type { Family } from "@/domain/schema";
import styles from "./SoftwareBadge.module.css";

// A software's badge: its initials, coloured by family, shaped and lettered
// its own way (see badgeLook). A picture of the name, which is always written
// next to it: hidden from screen readers.
export function SoftwareBadge({
  software,
  size = "md",
}: {
  software: { id: string; initials: string; family: Family };
  size?: "sm" | "md" | "lg";
}) {
  const look = badgeLook(software.id);
  return (
    <span
      className={styles.badge}
      data-family={software.family}
      data-shape={look.shape}
      data-type={look.type}
      data-size={size}
      aria-hidden="true"
    >
      {software.initials}
    </span>
  );
}
