"use client";

import { useEffect, useState } from "react";
import type { Resource } from "@/data/resource";

type Settled<T> =
  | { key: string; attempt: number; ok: true; data: T }
  | { key: string; attempt: number; ok: false };

export type LoadStatus = "loading" | "ready" | "error";

// Loads `key` and says where it stands. State is only set once the promise
// settles, never during the effect itself. An answer for an older key is
// ignored: the newest selection always wins. `latest` keeps the last data
// that arrived, whatever its key, so a page can keep showing it while the
// next one loads.
export function useLoaded<T>(key: string, resource: Resource<T>) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [latest, setLatest] = useState<T | undefined>(undefined);

  useEffect(() => {
    let live = true;
    resource.load(key).then(
      (data) => {
        if (!live) return;
        setSettled({ key, attempt, ok: true, data });
        setLatest(data);
      },
      () => {
        if (live) setSettled({ key, attempt, ok: false });
      },
    );
    return () => {
      live = false;
    };
  }, [key, attempt, resource]);

  const current =
    settled && settled.key === key && settled.attempt === attempt
      ? settled
      : null;
  const status: LoadStatus =
    current === null ? "loading" : current.ok ? "ready" : "error";

  return {
    status,
    data: current?.ok ? current.data : undefined,
    latest,
    retry: () => setAttempt((count) => count + 1),
  };
}
