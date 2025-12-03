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
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
} from "date-fns";
import { TimeEntryForm } from "./TimeEntryForm";
import { useRouter } from "next/navigation";
import { getActiveProjects } from "@/lib/actions/projects"; // Added import

// Utility function to convert minutes to HH:MM format
const formatDurationHHMM = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
};

// Helper function for consistent date parsing (matches CalendarView logic)
const parseEntryDate = (date: Date) => {
  return new Date(date);
};

// Interfaces should be defined outside the component or be self-contained
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
}

export function TimeSheetTable({ entries }: TimeSheetTableProps) {
  const router = useRouter();
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

  // Load active projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      const projectsResult = await getActiveProjects();
      if (projectsResult.success) setProjects(projectsResult.data);
    };
    loadProjects();
  }, []);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getEntriesForProjectAndDay = (projectId: string | null, day: Date) => {
    if (!projectId) return [];
    return entries.filter((entry) => {
      const entryDate = parseEntryDate(entry.date);
      return entry.projectId === projectId && isSameDay(entryDate, day);
    });
  };

  const getTotalForProjectAndDay = (projectId: string | null, day: Date) => {
    const dayEntries = getEntriesForProjectAndDay(projectId, day);
    return dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
  };

  const getTotalForDay = (day: Date) => {
    return entries
      .filter((entry) => {
        const entryDate = parseEntryDate(entry.date);
        return isSameDay(entryDate, day);
      })
      .reduce((sum, entry) => sum + entry.duration, 0);
  };

  const getTotalForProject = (projectId: string | null) => {
    if (!projectId) return 0;
    return entries
      .filter((entry) => entry.projectId === projectId)
      .reduce((sum, entry) => sum + entry.duration, 0);
  };

  const getGrandTotal = () => {
    return entries.reduce((sum, entry) => sum + entry.duration, 0);
  };

  const addRow = () => {
    setRows([...rows, { projectId: null }]);
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRowProject = (index: number, projectId: string) => {
    const newRows = [...rows];
    newRows[index] = { projectId };
    setRows(newRows);
  };

  const handleCellClick = (projectId: string | null, day: Date) => {
    setSelectedDate(day);
    setSelectedProjectId(projectId);

    // Get the entries for the selected project and day
    const cellEntries = projectId
      ? getEntriesForProjectAndDay(projectId, day)
      : entries.filter((entry) => {
          const entryDate = parseEntryDate(entry.date);
          return isSameDay(entryDate, day);
        });

    // If exactly one existing entry found, open editor for that entry
    if (cellEntries.length === 1) {
      setEditingEntry(cellEntries[0]);
    } else {
      setEditingEntry(null);
    }
    setIsFormOpen(true);
  };

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToCurrentWeek = () => setCurrentWeek(new Date());

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

      {/* Timesheet Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header Row */}
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
                  Week Total
                </th>
              </tr>
            </thead>

            {/* Body Rows */}
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
                            i{" "}
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
                            onClick={() => deleteRow(rowIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>

                    {daysOfWeek.map((day) => {
                      const totalMinutes = getTotalForProjectAndDay(
                        row.projectId,
                        day
                      );
                      return (
                        <td key={day.toISOString()} className="p-2">
                          <div
                            onClick={() => handleCellClick(row.projectId, day)}
                            className="bg-gray-100 border border-gray-200 rounded-md h-10 flex items-center justify-center hover:border-gray-300 cursor-pointer transition"
                          >
                            <span className="text-sm text-gray-700">
                              {totalMinutes > 0
                                ? formatDurationHHMM(totalMinutes)
                                : "0:00"}
                            </span>
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

              {/* Footer Total Row - Fixed Structure */}
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

                {/* Day total cells - align with day columns above */}
                {daysOfWeek.map((day) => (
                  <td
                    key={day.toISOString()}
                    className="text-center p-3 text-sm"
                  >
                    {formatDurationHHMM(getTotalForDay(day))}
                  </td>
                ))}

                {/* Grand total cell - align with week total column */}
                <td className="text-center p-3 text-sm font-bold text-gray-800">
                  {formatDurationHHMM(getGrandTotal())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Entry Form */}
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
        onSuccess={() => {
          setEditingEntry(null);
          setSelectedDate(null);
          setSelectedProjectId(null);
          router.refresh();
        }}
      />
    </div>
  );
}
