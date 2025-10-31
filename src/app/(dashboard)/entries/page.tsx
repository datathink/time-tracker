"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, List } from "lucide-react";
import { WeekView } from "@/components/entries/WeekView";
import { TimeEntryList } from "@/components/entries/TimeEntryList";
import { TimeEntryForm } from "@/components/entries/TimeEntryForm";
import { getWeekTimeEntries } from "@/lib/actions/entries";
import { startOfWeek, endOfWeek } from "date-fns";
import { Prisma } from "@prisma/client";

type TimeEntryWithRelations = Prisma.TimeEntryGetPayload<{
    include: {
        project: {
            select: {
                id: true;
                name: true;
                color: true;
            };
        };
        client: {
            select: {
                id: true;
                name: true;
            };
        };
    };
}>;

export default function EntriesPage() {
    const [entries, setEntries] = useState<TimeEntryWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [editingEntry, setEditingEntry] =
        useState<TimeEntryWithRelations | null>(null);
    const [viewMode, setViewMode] = useState<"week" | "list">("week");

    const loadEntries = async (weekDate: Date) => {
        setLoading(true);
        const weekStart = startOfWeek(weekDate, { weekStartsOn: 0 }); // Sunday
        const weekEnd = endOfWeek(weekDate, { weekStartsOn: 0 });

        const result = await getWeekTimeEntries(
            weekStart.toISOString(),
            weekEnd.toISOString()
        );
        if (result.success) {
            setEntries(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadEntries(currentWeek);
    }, [currentWeek]);

    const handleWeekChange = (newWeek: Date) => {
        setCurrentWeek(newWeek);
    };

    const handleAddEntry = (date: Date) => {
        setSelectedDate(date);
        setEditingEntry(null);
        setIsFormOpen(true);
    };

    const handleEditEntry = (entry: TimeEntryWithRelations) => {
        setEditingEntry(entry);
        setSelectedDate(new Date(entry.date));
        setIsFormOpen(true);
    };

    const handleSuccess = () => {
        loadEntries(currentWeek);
        setEditingEntry(null);
        setSelectedDate(null);
    };

    const handleFormClose = (open: boolean) => {
        setIsFormOpen(open);
        if (!open) {
            setEditingEntry(null);
            setSelectedDate(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Time Entries</h1>
                    <p className="text-gray-600">Track your time by week</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === "week" ? "default" : "outline"}
                        onClick={() => setViewMode("week")}
                        size="sm"
                    >
                        Week View
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        onClick={() => setViewMode("list")}
                        size="sm"
                    >
                        <List className="mr-2 h-4 w-4" />
                        List View
                    </Button>
                    <Button onClick={() => handleAddEntry(new Date())}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Entry
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading entries...</p>
                </div>
            ) : viewMode === "week" ? (
                <WeekView
                    entries={entries}
                    currentWeek={currentWeek}
                    onWeekChange={handleWeekChange}
                    onAddEntry={handleAddEntry}
                    onEditEntry={handleEditEntry}
                />
            ) : (
                <TimeEntryList entries={entries} />
            )}

            <TimeEntryForm
                open={isFormOpen}
                onOpenChange={handleFormClose}
                onSuccess={handleSuccess}
                entry={editingEntry}
                defaultDate={selectedDate}
            />
        </div>
    );
}
