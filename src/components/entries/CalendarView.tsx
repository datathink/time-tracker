"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addWeeks,
    subWeeks,
    isSameDay,
    isToday,
} from "date-fns";
import { formatDecimalHours, fromUTCDate } from "@/lib/utils";
import { Prisma } from "@/generated/prisma/client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TimeEntry = Prisma.TimeEntryGetPayload<{
    include: {
        project: {
            select: {
                id: true;
                name: true;
                color: true;
            };
        };
    };
}>;

interface WeekViewProps {
    entries: TimeEntry[];
    currentWeek: Date;
    onWeekChange: (date: Date) => void;
    onAddEntry: (date: Date) => void;
    onEditEntry: (entry: TimeEntry) => void;
    onDeleteEntry: (entryId: string) => Promise<any>;
}

export function CalendarView({
    entries,
    currentWeek,
    onWeekChange,
    onAddEntry,
    onEditEntry,
    onDeleteEntry,
}: WeekViewProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const getEntriesForDay = (day: Date) => {
        return entries.filter((entry) => {
            const entryDate = fromUTCDate(entry.date);
            return isSameDay(entryDate, day);
        });
    };

    const getTotalHoursForDay = (day: Date) => {
        return getEntriesForDay(day).reduce((sum, e) => sum + e.duration, 0);
    };

    const getTotalHoursForWeek = () => {
        return entries.reduce((sum, entry) => sum + entry.duration, 0);
    };

    const goToPreviousWeek = () => onWeekChange(subWeeks(currentWeek, 1));
    const goToNextWeek = () => onWeekChange(addWeeks(currentWeek, 1));
    const goToCurrentWeek = () => onWeekChange(new Date());

    const handleDeleteClick = (entry: TimeEntry) => {
        setEntryToDelete(entry);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!entryToDelete) return;
        await onDeleteEntry(entryToDelete.id);
        setDeleteDialogOpen(false);
        setEntryToDelete(null);
    };

    return (
        <>
            <div className="space-y-4">
                {/* Week Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousWeek}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium min-w-[200px] text-center">
                            {format(weekStart, "MMM d")} -{" "}
                            {format(weekEnd, "MMM d, yyyy")}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextWeek}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToCurrentWeek}
                        >
                            Today
                        </Button>
                    </div>
                    <div className="text-sm font-semibold">
                        Week Total: {formatDecimalHours(getTotalHoursForWeek())}
                        h
                    </div>
                </div>

                {/* Week Grid */}
                <div className="grid grid-cols-7 gap-3">
                    {daysOfWeek.map((day) => {
                        const dayEntries = getEntriesForDay(day);
                        const totalMinutes = getTotalHoursForDay(day);
                        const today = isToday(day);

                        return (
                            <Card
                                key={day.toISOString()}
                                className={`p-3 min-h-40 ${today ? "ring-2 ring-blue-500" : ""}`}
                            >
                                <div className="space-y-2">
                                    {/* Day Header */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider">
                                                {format(day, "EEE")}
                                            </div>
                                            <div
                                                className={`text-lg font-semibold ${today ? "text-blue-600" : ""}`}
                                            >
                                                {format(day, "d")}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 rounded-full hover:bg-gray-100"
                                            onClick={() => onAddEntry(day)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Daily Total */}
                                    {totalMinutes > 0 && (
                                        <div className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                            {formatDecimalHours(totalMinutes)}h
                                        </div>
                                    )}

                                    {/* Entries */}
                                    <div className="space-y-2">
                                        {dayEntries.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-6">
                                                No entries
                                            </p>
                                        ) : (
                                            dayEntries.map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="group relative rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 p-2 cursor-pointer transition-all"
                                                    onClick={() =>
                                                        onEditEntry(entry)
                                                    }
                                                >
                                                    {/* Project & Description */}
                                                    <div className="pr-7">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            {entry.project ? (
                                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                                    <div
                                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                        style={{
                                                                            backgroundColor:
                                                                                entry
                                                                                    .project
                                                                                    .color,
                                                                        }}
                                                                    />
                                                                    <span className="text-xs font-medium truncate">
                                                                        {
                                                                            entry
                                                                                .project
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div />
                                                            )}
                                                            <span className="text-xs font-medium shrink-0 pl-2">
                                                                {formatDecimalHours(
                                                                    entry.duration
                                                                )}
                                                                h
                                                            </span>
                                                        </div>
                                                        {entry.description && (
                                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                                {
                                                                    entry.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="absolute top-1.5 right-1.5 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(
                                                                entry
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete time entry</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this time entry for
                            {entryToDelete?.project && (
                                <span className="font-bold">
                                    {" "}
                                    {entryToDelete.project.name}
                                </span>
                            )}
                            {entryToDelete?.duration && (
                                <span className="font-bold">
                                    {" "}
                                    (
                                    {formatDecimalHours(entryToDelete.duration)}
                                    h)
                                </span>
                            )}
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
