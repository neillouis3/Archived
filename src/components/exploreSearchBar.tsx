"use client";

import type { FormEvent } from "react";
import { Label, SearchField } from "@heroui/react";

export type ExploreSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  /** Called when the field is cleared (clear button or emptied). */
  onReset?: () => void;
  showReset?: boolean;
  inputId?: string;
  placeholder?: string;
  variant?: "full" | "sidebar";
};

export function ExploreSearchBar({
  value,
  onChange,
  onSubmit,
  onReset,
  showReset = false,
  inputId = "explore-search",
  placeholder = "Posts, tags, usernames, or people…",
}: ExploreSearchBarProps) {
  function handleChange(next: string) {
    onChange(next);
    if (!next.trim() && showReset && onReset) onReset();
  }

  function handleSubmit() {
    onSubmit({ preventDefault() {} } as FormEvent);
  }

  return (
    <SearchField
      value={value}
      onChange={handleChange}
      onSubmit={handleSubmit}
      fullWidth
      variant="secondary"
      aria-label="Search"
    >
      <Label className="sr-only" htmlFor={inputId}>
        Search
      </Label>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input id={inputId} placeholder={placeholder} />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
