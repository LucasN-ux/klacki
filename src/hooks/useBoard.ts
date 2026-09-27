"use client";

import { useCallback, useSyncExternalStore } from "react";
import { z } from "zod";

const STORAGE_KEY = "klacki.board";
const CHANGE_EVENT = "klacki:board-change";

// The software a visitor ticked: ["blender", "maya"].
const StoredBoard = z.array(z.string().regex(/^[a-z0-9-]+$/));

// Kept as a string so React can compare two snapshots cheaply.
let snapshot = "[]";
let chosenInThisVisit: string | null = null;

function readRaw(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return chosenInThisVisit ?? "[]";
    const parsed = StoredBoard.safeParse(JSON.parse(stored));
    // Invalid data is dropped rather than crashing the page. A software
    // that has left the catalogue is dropped by the board, which knows it.
    return parsed.success ? JSON.stringify(parsed.data) : "[]";
  } catch {
    return chosenInThisVisit ?? "[]";
  }
}

function getSnapshot(): string {
  const next = readRaw();
  if (next !== snapshot) snapshot = next;
  return snapshot;
}

// The server knows nothing about this browser: it renders an empty board.
function getServerSnapshot(): string {
  return "[]";
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function save(ids: string[]) {
  const value = JSON.stringify(ids);
  chosenInThisVisit = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private mode: the board lasts for this visit only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useBoard() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ids: string[] = JSON.parse(raw);

  const toggle = useCallback((id: string) => {
    const current: string[] = JSON.parse(readRaw());
    save(
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  const replace = useCallback((next: string[]) => save(next), []);

  return { ids, toggle, replace };
}
