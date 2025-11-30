"use client";

import { use, useEffect, useState } from "react";
import { TimeEntryForm } from "./TimeEntryForm";
import { getTimeEntries, deleteTimeEntry } from "@/lib/actions/entries";
import { formatDuration, formatDecimalHours } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  AlertCircleIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { set } from "zod";

interface TimeEntry {
  id: string;
  date: Date;
  projectId: string;
  duration: number;
  startTime: string | null;
  endTime: string | null;
  description: string;
  project?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface TimeEntryListProps {
  entries: TimeEntry[];
}

export function TimeEntryList({ entries }: TimeEntryListProps) {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [allEntries, setAllEntries] = useState<TimeEntry[]>(entries);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteEntry, setConfirmDeleteEntry] =
    useState<TimeEntry | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadTimeEntries = async () => {
    const result = await getTimeEntries();
    if (result.success) {
      setAllEntries(result.data);
    }
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleDelete = (timeEntry: TimeEntry) => {
    setConfirmDeleteEntry(timeEntry);
  };

  const performDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    const result = await deleteTimeEntry(id);
    setConfirmDeleteEntry(null);

    if (result.success) {
      loadTimeEntries();
    } else {
      setDeleteError(result.error || "Failed to delete time entry");
    }

    setDeletingId(null);
  };

  const handleSuccess = () => {
    setEditingEntry(null);
    loadTimeEntries();
  };

  useEffect(() => {
    setAllEntries(entries);
    if (deleteError) {
      const timer = setTimeout(() => {
        setDeleteError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [entries, deleteError]);

  // Group entries by date
  const groupedEntries = allEntries.reduce(
    (acc, entry) => {
      const dateKey = format(new Date(entry.date), "yyyy-MM-dd");
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
        {Object.entries(groupedEntries).map(([dateKey, dateEntries]) => {
          const totalMinutes = getTotalForDate(dateEntries);
          return (
            <div key={dateKey} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-lg">
                  {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                </h3>
                <div className="text-sm text-gray-600">
                  Total: {formatDuration(totalMinutes)} (
                  {formatDecimalHours(totalMinutes)}h)
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dateEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {entry.project ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: entry.project.color,
                                }}
                              />
                              <span className="font-medium">
                                {entry.project.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.startTime && entry.endTime
                            ? `${entry.startTime} - ${entry.endTime}`
                            : entry.startTime
                              ? `From ${entry.startTime}`
                              : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="font-medium">
                              {formatDuration(entry.duration)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDecimalHours(entry.duration)}h
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate">
                            {entry.description || (
                              <span className="text-gray-400 italic">
                                No description
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
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
                                onClick={() => handleEdit(entry)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(entry)}
                                disabled={deletingId === entry.id}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {deletingId === entry.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>

      <TimeEntryForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingEntry(null);
        }}
        entry={editingEntry || undefined}
        onSuccess={handleSuccess}
      />

      <Dialog
        open={!!confirmDeleteEntry}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteEntry(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete time entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time entry? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDeleteEntry(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (confirmDeleteEntry) {
                  await performDelete(confirmDeleteEntry.id);
                  setConfirmDeleteEntry(null);
                }
              }}
              disabled={
                !!confirmDeleteEntry && deletingId === confirmDeleteEntry?.id
              }
            >
              {deletingId === confirmDeleteEntry?.id ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleteError && (
        <div className="fixed top-5 right-120 left-120 m-1 w-auto z-50">
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}
