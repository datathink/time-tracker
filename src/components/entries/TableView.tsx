"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { TimeEntryForm } from "./TimeEntryForm";
import { getActiveProjects } from "@/lib/actions/projects";

// Utility function to convert minutes to HH:MM format
const formatDurationHHMM = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
};

// Helper function for consistent date parsing
const parseEntryDate = (date: Date) => {
  return new Date(date);
};

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

interface ActiveProject {
  id: string;
  name: string;
  color: string;
}

interface TimeSheetTableProps {
  entries: TimeEntry[];
  onDeleteEntry: (entryId: string) => Promise<any>;
  onSuccess: () => void;
}

export function TimeSheetTable({
  entries,
  onDeleteEntry,
  onSuccess,
}: TimeSheetTableProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [rows, setRows] = useState<Array<{ projectId: string | null }>>([
    { projectId: null },
  ]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [projects, setProjects] = useState<ActiveProject[]>([]);

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDeleteIndex, setRowToDeleteIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load active projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      const projectsResult = await getActiveProjects();
      if (projectsResult.success) setProjects(projectsResult.data);
    };
    loadProjects();
  }, []);

  // Auto-populate rows based on existing entries
  useEffect(() => {
    const weekEntries = getEntriesForCurrentWeek();
    const uniqueProjectIds = Array.from(
      new Set(weekEntries.map((entry) => entry.projectId))
    );
    if (uniqueProjectIds.length > 0) {
      setRows(uniqueProjectIds.map((projectId) => ({ projectId })));
    }
  }, [entries]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter entries for the current week
  const getEntriesForCurrentWeek = () => {
    return entries.filter((entry) => {
      const entryDate = parseEntryDate(entry.date);
      return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
    });
  };

  // Get entries for specific project and day
  const getEntriesForProjectAndDay = (projectId: string | null, day: Date) => {
    if (!projectId) return [];
    const weekEntries = getEntriesForCurrentWeek();
    return weekEntries.filter((entry) => {
      const entryDate = parseEntryDate(entry.date);
      return entry.projectId === projectId && isSameDay(entryDate, day);
    });
  };
  // Get total for a specific day in current week
  const getTotalForDay = (day: Date) => {
    const weekEntries = getEntriesForCurrentWeek();
    return weekEntries
      .filter((entry) => {
        const entryDate = parseEntryDate(entry.date);
        return isSameDay(entryDate, day);
      })
      .reduce((sum, entry) => sum + entry.duration, 0);
  };

  //Get total for a project in current week
  const getTotalForProject = (projectId: string | null) => {
    if (!projectId) return 0;
    const weekEntries = getEntriesForCurrentWeek();
    return weekEntries
      .filter((entry) => entry.projectId === projectId)
      .reduce((sum, entry) => sum + entry.duration, 0);
  };

  const getGrandTotal = () => {
    const weekEntries = getEntriesForCurrentWeek();
    return weekEntries.reduce((sum, entry) => sum + entry.duration, 0);
  };

  const addRow = () => {
    setRows([...rows, { projectId: null }]);
  };

  // Logic to initiate delete
  const handleDeleteRowClick = (index: number) => {
    const projectId = rows[index].projectId;
    const totalDuration = getTotalForProject(projectId);

    // If row has no duration (empty), delete immediately without confirmation
    if (totalDuration === 0) {
      setRows(rows.filter((_, i) => i !== index));
      return;
    }

    // Otherwise, open confirmation dialog
    setRowToDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  // Logic to confirm delete
  const handleConfirmDelete = async () => {
    if (rowToDeleteIndex === null) return;

    setIsDeleting(true);
    const projectId = rows[rowToDeleteIndex].projectId;

    // Find all entries for this project currently in view
    const weekEntries = getEntriesForCurrentWeek();
    const entriesToDelete = weekEntries.filter(
      (entry) => entry.projectId === projectId
    );

    try {
      // Execute all deletes
      await Promise.all(
        entriesToDelete.map((entry) => onDeleteEntry(entry.id))
      );

      // Update UI
      setRows(rows.filter((_, i) => i !== rowToDeleteIndex));
      setDeleteDialogOpen(false);
      setRowToDeleteIndex(null);
    } catch (error) {
      console.error("Failed to delete entries", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const updateRowProject = (index: number, projectId: string) => {
    const newRows = [...rows];
    newRows[index] = { projectId };
    setRows(newRows);
  };

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToCurrentWeek = () => setCurrentWeek(new Date());

  // Helper to get project details for the dialog
  const getProjectToDelete = () => {
    if (rowToDeleteIndex === null) return null;
    const projectId = rows[rowToDeleteIndex].projectId;
    return projects.find((p) => p.id === projectId);
  };

  return (
    <div className="space-y-4">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium min-w-[220px] text-center">
            {format(weekStart, "d MMM")} → {format(weekEnd, "d MMM yyyy")}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
            Today
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-sm min-w-[400px] border-r">
                  PROJECT <span className="text-red-500">*</span>
                </th>
                {daysOfWeek.map((day) => (
                  <th
                    key={day.toISOString()}
                    className="text-center p-3 font-normal text-xs min-w-[80px]"
                  >
                    <div>{format(day, "EEE")}</div>
                    <div className="text-xs font-bold">
                      {format(day, "d MMM")}
                    </div>
                  </th>
                ))}
                <th className="text-center p-3 font-medium text-sm min-w-[90px]">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => {
                const totalForRow = getTotalForProject(row.projectId);

                return (
                  <tr key={rowIndex} className="border-b hover:bg-gray-50">
                    <td className="p-2 border-r">
                      <div className="flex items-center gap-1">
                        <Select
                          value={row.projectId || undefined}
                          onValueChange={(value) =>
                            updateRowProject(rowIndex, value)
                          }
                        >
                          <SelectTrigger className="h-10 flex-1">
                            <SelectValue placeholder="Select a project..." />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: project.color }}
                                  />
                                  {project.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {rows.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteRowClick(rowIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                    {daysOfWeek.map((day) => {
                      const dayEntries = getEntriesForProjectAndDay(
                        row.projectId,
                        day
                      );
                      return (
                        <td key={day.toISOString()} className="p-2">
                          <div className="flex flex-col gap-1">
                            {dayEntries.length > 0 ? (
                              dayEntries.map((entry) => (
                                <div
                                  key={entry.id}
                                  onClick={() => {
                                    setEditingEntry(entry);
                                    setSelectedDate(day);
                                    setSelectedProjectId(row.projectId);
                                    setIsFormOpen(true);
                                  }}
                                  className="bg-gray-100 border border-gray-200 rounded-md h-10 flex items-center justify-center hover:border-gray-300 hover:bg-gray-200 cursor-pointer transition"
                                  title={entry.description}
                                >
                                  <span className="text-sm text-gray-700 font-medium">
                                    {formatDurationHHMM(entry.duration)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingEntry(null);
                                  setSelectedDate(day);
                                  setSelectedProjectId(row.projectId);
                                  setIsFormOpen(true);
                                }}
                                className="bg-gray-50 border border-dashed border-gray-300 rounded-md h-10 flex items-center justify-center hover:border-gray-400 hover:bg-gray-100 cursor-pointer transition"
                              >
                                <span className="text-sm text-gray-400">
                                  hh:mm
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="text-center p-2 font-medium text-sm">
                      {totalForRow > 0
                        ? formatDurationHHMM(totalForRow)
                        : "0:00"}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                <td className="p-3 border-r">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addRow}
                    className="flex items-center gap-0 text-sm font-medium text-black hover:text-gray-600 rounded-md px-3 py-2 -ml-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add timesheet row
                  </Button>
                </td>
                {daysOfWeek.map((day) => (
                  <td
                    key={day.toISOString()}
                    className="text-center p-3 text-sm"
                  >
                    {formatDurationHHMM(getTotalForDay(day))}
                  </td>
                ))}
                <td className="text-center p-3 text-sm font-bold text-gray-800">
                  {formatDurationHHMM(getGrandTotal())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <TimeEntryForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingEntry(null);
            setSelectedDate(null);
            setSelectedProjectId(null);
          }
        }}
        entry={editingEntry}
        defaultDate={selectedDate}
        existingEntries={entries}
        onSuccess={() => {
          setEditingEntry(null);
          setSelectedDate(null);
          setSelectedProjectId(null);
          onSuccess();
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete timesheet row?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the row and all associated time
              entries for
              {getProjectToDelete() && (
                <span className="font-bold">
                  {" "}
                  {getProjectToDelete()?.name}{" "}
                </span>
              )}
              in this week.
              <br />
              <br />
              Total time to be deleted:{" "}
              <span className="font-bold">
                {rowToDeleteIndex !== null &&
                  formatDurationHHMM(
                    getTotalForProject(rows[rowToDeleteIndex].projectId)
                  )}
              </span>
              .
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Row"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
