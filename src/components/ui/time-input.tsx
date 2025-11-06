"use client";

import * as React from "react";
import { Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type TimeInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
};

function parseTime(input: string): string | null {
  const cleaned = input.replace(/\s/g, "");

  const m1 = cleaned.match(/^(\d{1,2}):?(\d{2})$/);
  if (m1) {
    const h = parseInt(m1[1], 10);
    const m = parseInt(m1[2], 10);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  const m2 = cleaned.match(/^(\d{3,4})$/);
  if (m2) {
    const s = m2[1].padStart(4, "0");
    const h = parseInt(s.slice(0, 2), 10);
    const m = parseInt(s.slice(2, 4), 10);
    if (h < 24 && m < 60) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  return null;
}

function generateOptions(): string[] {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      opts.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
    }
  }
  return opts;
}
const TIME_OPTIONS = generateOptions();

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  (
    {
      value = "",
      onChange,
      placeholder = "09:00",
      disabled = false,
      id,
      className,
    },
    forwardedRef
  ) => {
    const [inputVal, setInputVal] = React.useState(value);
    const [isOpen, setIsOpen] = React.useState(false);
    const [focusedIdx, setFocusedIdx] = React.useState(-1);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => setInputVal(value), [value]);

    const commit = (raw: string) => {
      const parsed = parseTime(raw);
      if (parsed) {
        setInputVal(parsed);
        onChange?.(parsed);
      } else {
        setInputVal(value);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        commit(inputVal);
        inputRef.current?.blur();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
        const cur = TIME_OPTIONS.indexOf(value);
        setFocusedIdx(cur >= 0 ? cur : 0);
      }
    };

    const handleDropdownKey = (e: React.KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIdx((i) => (i < TIME_OPTIONS.length - 1 ? i + 1 : i));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIdx((i) => (i > 0 ? i - 1 : 0));
      } else if (e.key === "Enter" && focusedIdx >= 0) {
        e.preventDefault();
        const t = TIME_OPTIONS[focusedIdx];
        setInputVal(t);
        onChange?.(t);
        setIsOpen(false);
        setFocusedIdx(-1);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setFocusedIdx(-1);
        inputRef.current?.focus();
      }
    };

    React.useEffect(() => {
      if (isOpen && focusedIdx >= 0 && dropdownRef.current) {
        const el = dropdownRef.current.children[focusedIdx] as HTMLElement;
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }, [focusedIdx, isOpen]);

    React.useEffect(() => {
      const listener = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.parentElement?.contains(e.target as Node)
        ) {
          setIsOpen(false);
          setFocusedIdx(-1);
        }
      };
      document.addEventListener("mousedown", listener);
      return () => document.removeEventListener("mousedown", listener);
    }, []);

    return (
      <div className="relative">
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Clock className="h-4 w-4" />
          </div>

          <input
            id={id}
            ref={(node) => {
              inputRef.current = node;
              if (typeof forwardedRef === "function") forwardedRef(node);
              else if (forwardedRef)
                (
                  forwardedRef as React.RefObject<HTMLInputElement | null>
                ).current = node;
            }}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={() => commit(inputVal)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          />

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onKeyDown={handleDropdownKey}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {isOpen && (
          <div
            className="absolute z-20 mt-1 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md max-h-60"
            ref={dropdownRef}
            role="listbox"
          >
            {TIME_OPTIONS.map((t, idx) => (
              <button
                key={t}
                type="button"
                role="option"
                aria-selected={t === value}
                onClick={() => {
                  setInputVal(t);
                  onChange?.(t);
                  setIsOpen(false);
                  setFocusedIdx(-1);
                }}
                onMouseEnter={() => setFocusedIdx(idx)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors",
                  t === value
                    ? "bg-accent text-accent-foreground font-bold"
                    : "hover:bg-accent/50",
                  focusedIdx === idx && "bg-accent/50"
                )}
              >
                <span>{t}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

TimeInput.displayName = "TimeInput";
