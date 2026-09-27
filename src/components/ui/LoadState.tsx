"use client";

import { useRef } from "react";
import type { Locale } from "@/domain/locale";
import type { LoadStatus } from "@/hooks/useLoaded";
import { getDictionary } from "@/i18n";
import styles from "./LoadState.module.css";

// The one line the data pages show while their data is on its way, or when
// it could not come. It stays in the page, empty once the data is here: a
// live region that exists before its text is announced reliably, and "Try
// again" hands the keyboard focus to the line instead of dropping it on the
// page when the button goes away.
export function LoadState({
  status,
  locale,
  onRetry,
}: {
  status: LoadStatus;
  locale: Locale;
  onRetry: () => void;
}) {
  const { data } = getDictionary(locale);
  const line = useRef<HTMLParagraphElement>(null);

  function retry() {
    line.current?.focus();
    onRetry();
  }

  return (
    <p ref={line} className={styles.line} aria-live="polite" tabIndex={-1}>
      {status === "loading" && data.loading}
      {status === "error" && (
        <span role="alert">
          {data.failed}{" "}
          <button type="button" className={styles.retry} onClick={retry}>
            {data.retry}
          </button>
        </span>
      )}
    </p>
  );
}
