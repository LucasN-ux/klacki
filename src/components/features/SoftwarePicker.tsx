"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { matchesName } from "@/domain/board";
import type { Locale } from "@/domain/locale";
import { FAMILY_ORDER, type SoftwareSummary } from "@/domain/summary";
import { getDictionary } from "@/i18n";
import styles from "./SoftwarePicker.module.css";

// A combobox rather than a wall of chips: it lists only what the visitor
// types, grouped by family, however large the catalogue grows.
export function SoftwarePicker({
  locale,
  summaries,
  picked,
  readOnly,
  onAdd,
  onRemove,
}: {
  locale: Locale;
  /** Every software, in catalogue order. */
  summaries: SoftwareSummary[];
  /** Catalogue order. */
  picked: SoftwareSummary[];
  /** A shared board: chips without ✕ and no field. */
  readOnly: boolean;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { board, families } = getDictionary(locale);
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const pickedIds = new Set(picked.map((software) => software.id));
  const suggestions = summaries.filter(
    (software) =>
      !pickedIds.has(software.id) && matchesName(software.name, query),
  );
  const groups = FAMILY_ORDER.map((family) => ({
    family,
    software: suggestions.filter((software) => software.family === family),
  })).filter((group) => group.software.length > 0);
  // The order the arrow keys walk: the groups, flattened.
  const flat = groups.flatMap((group) => group.software);
  const active =
    flat.length > 0 ? flat[Math.min(highlight, flat.length - 1)] : undefined;

  // The list closes once a software is added: left open, it would cover the
  // board, and a click meant for the board would land on a suggestion.
  function add(software: SoftwareSummary) {
    onAdd(software.id);
    setQuery("");
    setHighlight(0);
    setOpen(false);
  }

  // Moves the highlight and keeps it in view: with a long catalogue the
  // panel scrolls, and the option must follow the keyboard.
  function move(to: number) {
    const next = Math.max(0, Math.min(to, flat.length - 1));
    setHighlight(next);
    const target = flat[next];
    if (target) {
      document
        .getElementById(`${id}-${target.id}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      // A closed list opens on the first suggestion rather than the second.
      if (!open) setOpen(true);
      else move(highlight + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(highlight - 1);
    } else if (event.key === "Enter") {
      // With no match there is nothing to add: Enter does nothing.
      if (open && active) {
        event.preventDefault();
        add(active);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (
      event.key === "Backspace" &&
      // A held key repeats: only the first press removes a software, so
      // clearing a mistyped search cannot wipe the whole board.
      !event.repeat &&
      query === "" &&
      picked.length > 0
    ) {
      onRemove(picked[picked.length - 1].id);
    }
  }

  return (
    <div className={styles.picker}>
      {readOnly ? (
        <p className={styles.label}>{board.pick}</p>
      ) : (
        <label htmlFor={`${id}-field`} className={styles.label}>
          {board.pick}
        </label>
      )}
      <div className={styles.box}>
        <ul className={styles.chips} aria-label={board.pickedLabel}>
          {picked.map((software) => (
            <li key={software.id} className={styles.chip}>
              <span className={styles.initials} aria-hidden="true">
                {software.initials}
              </span>
              {software.name}
              {!readOnly && (
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`${board.remove} ${software.name}`}
                  onClick={() => onRemove(software.id)}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
        {!readOnly && (
          <input
            id={`${id}-field`}
            className={styles.field}
            role="combobox"
            aria-expanded={open}
            // Points at the list only while it exists.
            aria-controls={open && flat.length > 0 ? `${id}-list` : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              open && active ? `${id}-${active.id}` : undefined
            }
            autoComplete="off"
            placeholder={board.searchPlaceholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlight(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            // The field keeps the focus after a pick, so a click must reopen
            // the list on its own.
            onClick={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
          />
        )}
      </div>

      {open &&
        !readOnly &&
        (flat.length === 0 ? (
          // Announced to screen readers, which would otherwise hear nothing.
          <p role="status" className={`${styles.panel} ${styles.noMatch}`}>
            {board.noMatch}
          </p>
        ) : (
          <div
            id={`${id}-list`}
            role="listbox"
            aria-label={board.pick}
            className={styles.panel}
            // A press anywhere in the list (a family heading, the scrollbar)
            // must not take the focus from the field and close it.
            onMouseDown={(event) => event.preventDefault()}
          >
            {groups.map((group) => (
              <div
                key={group.family}
                role="group"
                aria-label={families[group.family]}
              >
                <p className={styles.family} aria-hidden="true">
                  {families[group.family]}
                </p>
                {group.software.map((software) => (
                  <div
                    key={software.id}
                    id={`${id}-${software.id}`}
                    role="option"
                    aria-selected={software.id === active?.id}
                    className={styles.option}
                    // mousedown, not click: the field keeps the focus.
                    onMouseDown={(event) => {
                      event.preventDefault();
                      add(software);
                    }}
                    // One highlight for mouse and keyboard alike.
                    onMouseEnter={() => setHighlight(flat.indexOf(software))}
                  >
                    <span className={styles.initials} aria-hidden="true">
                      {software.initials}
                    </span>
                    {software.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
