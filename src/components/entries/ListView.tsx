"use client";

import { useState } from "react";
import { formatDuration, formatDecimalHours, fromUTCDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Pencil, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import { Prisma } from "@prisma/client";
import { toast } from "sonner";

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

interface TimeEntryListProps {
    entries: TimeEntry[];
    onDeleteEntry: (entryId: string) => Promise<any>;
    onEditEntry: (entry: TimeEntry) => void;
    loadEntries: () => void;
}

export function TimeEntryList({
    entries,
    onDeleteEntry,
    onEditEntry,
    loadEntries,
}: TimeEntryListProps) {
    const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleEdit = (entry: TimeEntry) => {
        onEditEntry(entry);
    };

    const handleDeleteClick = (entry: TimeEntry) => {
        setEntryToDelete(entry);
    };

    const handleDeleteConfirm = async () => {
        if (!entryToDelete) return;

        setDeletingId(entryToDelete.id);
        const result = await onDeleteEntry(entryToDelete.id);
        setEntryToDelete(null);

        if (result.success) {
            loadEntries();
            toast.success("Time entry deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete time entry");
        }

        setDeletingId(null);
    };

    // Group entries by date
    const groupedEntries = entries.reduce(
        (acc, entry) => {
            const dateKey = format(fromUTCDate(entry.date), "yyyy-MM-dd");
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(entry);
            return acc;
        },
        {} as Record<string, TimeEntry[]>
    );

    // Calculate total duration for a date
    const getTotalForDate = (entries: TimeEntry[]) => {
        return entries.reduce((sum, entry) => sum + entry.duration, 0);
    };

    if (entries.length === 0) {
        return (
            <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No time entries yet.</p>
                <p className="text-sm text-gray-400">
                    Create your first time entry to get started.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {Object.entries(groupedEntries).map(
                    ([dateKey, dateEntries]) => {
                        const totalMinutes = getTotalForDate(dateEntries);
                        return (
                            <div key={dateKey} className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="font-semibold text-lg">
                                        {format(
                                            new Date(dateKey),
                                            "EEEE, MMMM d, yyyy"
                                        )}
                                    </h3>
                                    <div className="text-sm text-gray-600">
                                        Total: {formatDuration(totalMinutes)} (
                                        {formatDecimalHours(totalMinutes)}h)
                                    </div>
                                </div>
                                <div className="rounded-md border overflow-hidden">
                                    <Table className="table-fixed">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[180px] font-bold">
                                                    Project
                                                </TableHead>
                                                <TableHead className="w-[170px] font-bold">
                                                    Time
                                                </TableHead>
                                                <TableHead className="w-[120px] font-bold">
                                                    Duration
                                                </TableHead>
                                                <TableHead className="min-w-[220px] font-bold">
                                                    Description
                                                </TableHead>
                                                <TableHead className="w-[100px] font-bold text-center">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dateEntries.map((entry) => (
                                                <TableRow
                                                    key={entry.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <TableCell className="w-[180px] py-3">
                                                        {entry.project ? (
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-3 h-3 rounded-full shrink-0"
                                                                    style={{
                                                                        backgroundColor:
                                                                            entry
                                                                                .project
                                                                                .color,
                                                                    }}
                                                                />
                                                                <span className="font-medium truncate">
                                                                    {
                                                                        entry
                                                                            .project
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="w-[170px] py-3 text-sm">
                                                        {entry.startTime &&
                                                        entry.endTime
                                                            ? `${entry.startTime} - ${entry.endTime}`
                                                            : entry.startTime
                                                              ? `From ${entry.startTime}`
                                                              : "-"}
                                                    </TableCell>
                                                    <TableCell className="w-[120px] py-3">
                                                        <div className="space-y-0.5">
                                                            <div className="font-medium">
                                                                {formatDuration(
                                                                    entry.duration
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3 pr-20 min-w-[220px]">
                                                        <div className="line-clamp-2 wrap-break-words pr-4">
                                                            {entry.description || (
                                                                <span className="text-gray-400 italic">
                                                                    No
                                                                    description
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="w-[100px] py-3">
                                                        <div className="flex justify-center">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                entry
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleDeleteClick(
                                                                                entry
                                                                            )
                                                                        }
                                                                        className="text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>

            <AlertDialog
                open={!!entryToDelete}
                onOpenChange={() => setEntryToDelete(null)}
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
                                    ({formatDuration(entryToDelete.duration)})
                                </span>
                            )}
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setEntryToDelete(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            disabled={deletingId === entryToDelete?.id}
                        >
                            {deletingId === entryToDelete?.id
                                ? "Deleting..."
                                : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
