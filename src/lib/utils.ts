import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Parse duration string into minutes
 * Supports formats: "2.5h", "2h 30m", "150m", "1:30", "150"
 */
export function parseDuration(input: string): number | null {
    if (!input || typeof input !== "string") return null;

    const trimmed = input.trim().toLowerCase();

    // Format: "2.5" or "2.5h" (decimal hours)
    const decimalHours = trimmed.match(/^(\d+\.?\d*)\s*h?$/);
    if (decimalHours) {
        return Math.round(parseFloat(decimalHours[1]) * 60);
    }

    // Format: "2h 30m" or "2h30m"
    const hoursMinutes = trimmed.match(/^(\d+)\s*h\s*(\d+)\s*m?$/);
    if (hoursMinutes) {
        return parseInt(hoursMinutes[1]) * 60 + parseInt(hoursMinutes[2]);
    }

    // Format: "2h" (hours only)
    const hoursOnly = trimmed.match(/^(\d+)\s*h$/);
    if (hoursOnly) {
        return parseInt(hoursOnly[1]) * 60;
    }

    // Format: "90m" or "90 min" (minutes only)
    const minutesOnly = trimmed.match(/^(\d+)\s*(m|min|minutes?)$/);
    if (minutesOnly) {
        return parseInt(minutesOnly[1]);
    }

    // Format: "1:30" (hours:minutes)
    const timeFormat = trimmed.match(/^(\d+):(\d+)$/);
    if (timeFormat) {
        return parseInt(timeFormat[1]) * 60 + parseInt(timeFormat[2]);
    }

    // Format: "150" (plain number, assume minutes)
    const plainNumber = trimmed.match(/^(\d+)$/);
    if (plainNumber) {
        return parseInt(plainNumber[1]);
    }

    return null;
}

/**
 * Format minutes into readable duration string
 */
export function formatDuration(minutes: number): string {
    if (minutes === 0) return "0h";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins}m`;
    }

    if (mins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
}

/**
 * Format minutes into decimal hours
 */
export function formatDecimalHours(minutes: number): string {
    return (minutes / 60).toFixed(2);
}

/**
 * Calculate start time from end time and duration
 * @param endTime - Time in 24-hour "HH:MM" format (e.g., "14:30", "09:00")
 * @param durationMinutes - duration in minutes
 * @returns start time in "HH:MM" format
 * @throws Error if endTime is not in valid HH:MM format
 */
export function calculateStartTime(
    endTime: string,
    durationMinutes: number
): string {
    // Validate input format
    if (!endTime || typeof endTime !== "string") {
        throw new Error("End time must be a non-empty string");
    }

    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = endTime.match(timeRegex);

    if (!match) {
        throw new Error(
            `Invalid end time format: "${endTime}". Expected HH:MM format (e.g., "14:30")`
        );
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error(
            `Invalid time values: hours must be 0-23, minutes must be 0-59. Got ${hours}:${minutes}`
        );
    }

    let totalMinutes = hours * 60 + minutes - durationMinutes;

    // Handle negative minutes (going back to previous day)
    if (totalMinutes < 0) {
        totalMinutes = 24 * 60 + totalMinutes;
    }

    const startHours = Math.floor(totalMinutes / 60) % 24;
    const startMinutes = totalMinutes % 60;

    return `${startHours.toString().padStart(2, "0")}:${startMinutes.toString().padStart(2, "0")}`;
}

/**
 * Calculate end time from start time and duration
 * @param startTime - Time in 24-hour "HH:MM" format (e.g., "14:30", "09:00")
 * @param durationMinutes - duration in minutes
 * @returns end time in "HH:MM" format
 * @throws Error if startTime is not in valid HH:MM format
 */
export function calculateEndTime(
    startTime: string,
    durationMinutes: number
): string {
    // Validate input format
    if (!startTime || typeof startTime !== "string") {
        throw new Error("Start time must be a non-empty string");
    }

    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = startTime.match(timeRegex);

    if (!match) {
        throw new Error(
            `Invalid start time format: "${startTime}". Expected HH:MM format (e.g., "14:30")`
        );
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error(
            `Invalid time values: hours must be 0-23, minutes must be 0-59. Got ${hours}:${minutes}`
        );
    }

    const totalMinutes = hours * 60 + minutes + durationMinutes;

    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
}

/**
 * Calculate duration from start and end times
 * @param startTime - Time in 24-hour "HH:MM" format (e.g., "09:00", "14:30")
 * @param endTime - Time in 24-hour "HH:MM" format (e.g., "17:00", "18:45")
 * @returns duration in minutes
 * @throws Error if either time is not in valid HH:MM format
 */
export function calculateDuration(startTime: string, endTime: string): number {
    // Validate start time
    if (!startTime || typeof startTime !== "string") {
        throw new Error("Start time must be a non-empty string");
    }

    if (!endTime || typeof endTime !== "string") {
        throw new Error("End time must be a non-empty string");
    }

    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const startMatch = startTime.match(timeRegex);
    const endMatch = endTime.match(timeRegex);

    if (!startMatch) {
        throw new Error(
            `Invalid start time format: "${startTime}". Expected HH:MM format (e.g., "09:00")`
        );
    }

    if (!endMatch) {
        throw new Error(
            `Invalid end time format: "${endTime}". Expected HH:MM format (e.g., "17:00")`
        );
    }

    const startHours = parseInt(startMatch[1], 10);
    const startMinutes = parseInt(startMatch[2], 10);
    const endHours = parseInt(endMatch[1], 10);
    const endMinutes = parseInt(endMatch[2], 10);

    if (
        startHours < 0 ||
        startHours > 23 ||
        startMinutes < 0 ||
        startMinutes > 59
    ) {
        throw new Error(
            `Invalid start time values: hours must be 0-23, minutes must be 0-59. Got ${startHours}:${startMinutes}`
        );
    }

    if (endHours < 0 || endHours > 23 || endMinutes < 0 || endMinutes > 59) {
        throw new Error(
            `Invalid end time values: hours must be 0-23, minutes must be 0-59. Got ${endHours}:${endMinutes}`
        );
    }

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    // Handle overnight times
    if (endTotalMinutes < startTotalMinutes) {
        return 24 * 60 - startTotalMinutes + endTotalMinutes;
    }

    return endTotalMinutes - startTotalMinutes;
}
