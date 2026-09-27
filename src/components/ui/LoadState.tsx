import type { Locale } from "@/domain/locale";
import type { LoadStatus } from "@/hooks/useLoaded";
import { getDictionary } from "@/i18n";
import styles from "./LoadState.module.css";

// The one line the data pages show while their data is on its way, or when
// it could not come.
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
  if (status === "ready") return null;
  if (status === "loading") {
    return (
      <p className={styles.line} role="status">
        {data.loading}
      </p>
    );
  }
  return (
    <p className={styles.line} role="alert">
      {data.failed}{" "}
      <button type="button" className={styles.retry} onClick={onRetry}>
        {data.retry}
      </button>
    </p>
  );
}
