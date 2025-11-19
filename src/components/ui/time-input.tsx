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

// Convert 24h time to 12h AM/PM format
function to12Hour(time24: string): string {
  if (!time24) return "";

  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Convert 12h AM/PM format to 24h time
function to24Hour(time12: string): string | null {
  const cleaned = time12.replace(/\s/g, "").toUpperCase();

  // Match formats like: 9:30AM, 9:30 AM, 930AM, 0930AM, 9AM, 09AM
  const match = cleaned.match(/^(\d{1,2}):?(\d{2})?\s*([AP]M)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3] || "AM";

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  // Convert to 24-hour format
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function parseTime(input: string): string | null {
  const cleaned = input.replace(/\s/g, "").toUpperCase();

  // Try parsing as 12-hour format first
  const time24 = to24Hour(input);
  if (time24) return time24;

  // Fallback to original 24-hour parsing for backward compatibility
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

const TIME_OPTIONS = (() => {
  const options = Array.from({ length: 96 }, (_, i) => {
    const totalMinutes = i * 15;
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const period = hours24 >= 12 ? "PM" : "AM";

    const time24 = `${hours24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    const time12 = `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;

    return { time24, time12 };
  });

  const eightAMIndex = options.findIndex((t) => t.time24 === "08:00");
  return [...options.slice(eightAMIndex), ...options.slice(0, eightAMIndex)];
})();

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  (
    {
      value = "",
      onChange,
      placeholder = "09:00 AM",
      disabled = false,
      id,
      className,
    },
    forwardedRef
  ) => {
    const [inputVal, setInputVal] = React.useState(to12Hour(value));
    const [isOpen, setIsOpen] = React.useState(false);
    const [focusedIdx, setFocusedIdx] = React.useState(-1);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
      setInputVal(to12Hour(value));
    }, [value]);

    const commit = (raw: string) => {
      const parsed = parseTime(raw);
      if (parsed) {
        setInputVal(to12Hour(parsed));
        onChange?.(parsed);
        setError(null);
      } else {
        setError(
          "Invalid time format. Use formats like: 9:30 AM, 2:45 PM, 16:00"
        );
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        commit(inputVal);
        inputRef.current?.blur();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
        const currentTime24 = parseTime(inputVal) || value;
        const cur = TIME_OPTIONS.findIndex(
          (opt) => opt.time24 === currentTime24
        );
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
        setInputVal(t.time12);
        onChange?.(t.time24);
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
            onChange={(e) => {
              setInputVal(e.target.value);
              setError(null);
            }}
            onBlur={() => commit(inputVal)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsOpen(true);
              setError(null);
            }}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background pl-10 pr-10 py-2 text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-red-500 focus-visible:ring-red-200"
                : "border-input",
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
                "h-4 w-4 transition-transform cursor-pointer",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

        {isOpen && (
          <div
            className="absolute z-20 mt-1 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md max-h-60"
            ref={dropdownRef}
            role="listbox"
          >
            {TIME_OPTIONS.map((t, idx) => (
              <button
                key={t.time24}
                type="button"
                role="option"
                aria-selected={t.time24 === value}
                onClick={() => {
                  setInputVal(t.time12);
                  onChange?.(t.time24);
                  setIsOpen(false);
                  setFocusedIdx(-1);
                  setError(null);
                }}
                onMouseEnter={() => setFocusedIdx(idx)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors",
                  t.time24 === value
                    ? "bg-accent text-accent-foreground font-bold"
                    : "hover:bg-accent/50",
                  focusedIdx === idx && "bg-accent/50"
                )}
              >
                <span>{t.time12}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

TimeInput.displayName = "TimeInput";
