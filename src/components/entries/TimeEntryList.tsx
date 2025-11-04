// "use client";

// import { useState, useMemo } from "react";
// import { TimeEntryForm } from "./TimeEntryForm";
// import { deleteTimeEntry } from "@/lib/actions/entries";
// import { formatDuration, formatDecimalHours } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Plus, Trash2, ArrowUpDown, Clock } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { format, startOfWeek, addDays } from "date-fns";

// interface TimeEntry {
//   id: string;
//   date: Date;
//   projectId: string | null;
//   clientId: string | null;
//   duration: number;
//   startTime: string | null;
//   endTime: string | null;
//   description: string | null;
//   project?: {
//     id: string;
//     name: string;
//     color: string;
//   } | null;
//   client?: {
//     id: string;
//     name: string;
//   } | null;
// }

// interface TimeEntryListProps {
//   entries: TimeEntry[];
// }

// // Helper: Convert minutes to "hh:mm"
// const minutesToHHMM = (minutes: number): string => {
//   const hrs = Math.floor(minutes / 60);
//   const mins = minutes % 60;
//   return `${hrs}:${mins.toString().padStart(2, "0")}`;
// };

// // Helper: Parse "hh:mm" or decimal to minutes
// const parseHHMMToMinutes = (input: string): number => {
//   const trimmed = input.trim();
//   const decimalMatch = trimmed.match(/^\d*\.?\d+$/);
//   if (decimalMatch) {
//     return Math.round(parseFloat(trimmed) * 60);
//   }

//   const match = trimmed.match(/^(\d+):(\d{1,2})$/);
//   if (match) {
//     return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
//   }
//   return 0;
// };

// interface ProjectRow {
//   id: string;
//   project: string;
//   color: string;
//   days: Record<string, string>; // dateKey -> "hh:mm"
//   entryMap: Map<string, TimeEntry>; // `${dateKey}-${entry.id}` -> entry
// }

// export function TimeEntryList({ entries }: TimeEntryListProps) {
//   const router = useRouter();
//   const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [deletingId, setDeletingId] = useState<string | null>(null);

//   // Get current week start (Monday)
//   const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
//   const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

//   // Build projectMap with proper typing
//   const projectMap = useMemo((): ProjectRow[] => {
//     const map = new Map<string, ProjectRow>();

//     entries.forEach((entry) => {
//       const projectId = entry.projectId || "unassigned";
//       const projectName = entry.project?.name || "No Project";
//       const projectColor = entry.project?.color || "#94a3b8";

//       if (!map.has(projectId)) {
//         map.set(projectId, {
//           id: projectId,
//           project: projectName,
//           color: projectColor,
//           days: Object.fromEntries(
//             weekDays.map((d) => [format(d, "yyyy-MM-dd"), ""])
//           ),
//           entryMap: new Map<string, TimeEntry>(),
//         });
//       }

//       const row = map.get(projectId)!;
//       const dateKey = format(new Date(entry.date), "yyyy-MM-dd");

//       const isInCurrentWeek = weekDays.some(
//         (d) => format(d, "yyyy-MM-dd") === dateKey
//       );

//       if (isInCurrentWeek) {
//         const current = row.days[dateKey] || "";
//         const currentMins = parseHHMMToMinutes(current);
//         const newMins = currentMins + entry.duration;
//         row.days[dateKey] = minutesToHHMM(newMins);
//         row.entryMap.set(`${dateKey}-${entry.id}`, entry);
//       }
//     });

//     return Array.from(map.values());
//   }, [entries, weekStart]);

//   const [rows, setRows] = useState<ProjectRow[]>(projectMap);

//   const handleInputChange = (
//     projectId: string,
//     field: keyof ProjectRow,
//     value: string
//   ) => {
//     setRows((prev) =>
//       prev.map((row) =>
//         row.id === projectId ? { ...row, [field]: value } : row
//       )
//     );
//   };

//   const handleDayChange = (projectId: string, day: string, value: string) => {
//     setRows((prev) =>
//       prev.map((row) =>
//         row.id === projectId
//           ? { ...row, days: { ...row.days, [day]: value } }
//           : row
//       )
//     );
//   };

//   const handleAddRow = () => {
//     const newId = `new-${Date.now()}`;
//     setRows((prev) => [
//       ...prev,
//       {
//         id: newId,
//         project: "",
//         color: "#94a3b8",
//         days: Object.fromEntries(
//           weekDays.map((d) => [format(d, "yyyy-MM-dd"), ""])
//         ),
//         entryMap: new Map(),
//       },
//     ]);
//   };

//   const handleDeleteRow = (projectId: string) => {
//     setRows((prev) => prev.filter((row) => row.id !== projectId));
//   };

//   const handleSort = () => {
//     setRows((prev) =>
//       [...prev].sort((a, b) => a.project.localeCompare(b.project))
//     );
//   };

//   const handleEdit = (entry: TimeEntry) => {
//     setEditingEntry(entry);
//     setIsFormOpen(true);
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this time entry?")) return;

//     setDeletingId(id);
//     const result = await deleteTimeEntry(id);

//     if (result.success) {
//       router.refresh();
//     } else {
//       alert(result.error || "Failed to delete time entry");
//     }

//     setDeletingId(null);
//   };

//   const handleSuccess = () => {
//     setEditingEntry(null);
//     router.refresh();
//   };

//   if (entries.length === 0 && rows.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//         <p className="text-gray-500 mb-2">No time entries yet.</p>
//         <p className="text-sm text-gray-400">
//           Create your first time entry to get started.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="space-y-4">
//         <div className="overflow-x-auto">
//           <Table className="min-w-full border rounded-md table-fixed">
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="sticky left-0 bg-background z-10 w-auto min-w-[280px]">
//                   PROJECT *
//                 </TableHead>

//                 {weekDays.map((day, i) => (
//                   <TableHead
//                     key={i}
//                     className="text-center w-[90px] px-1 font-medium whitespace-nowrap"
//                   >
//                     <div>
//                       {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
//                     </div>
//                     <div className="text-xs text-muted-foreground">
//                       {format(day, "dd MMM")}
//                     </div>
//                   </TableHead>
//                 ))}

//                 <TableHead className="w-[80px] text-center font-semibold">
//                   Total
//                 </TableHead>
//                 <TableHead className="w-[60px]" />
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {rows.map((row) => {
//                 const dayValues = Object.values(row.days).map(
//                   parseHHMMToMinutes
//                 );
//                 const totalMinutes = dayValues.reduce((a, b) => a + b, 0);
//                 const totalHours = (totalMinutes / 60).toFixed(2);

//                 return (
//                   <TableRow key={row.id} className="hover:bg-muted/40">
//                     {/* Project column that expands */}
//                     <TableCell className="sticky left-0 bg-background z-10 w-auto min-w-[280px]">
//                       <div className="flex items-center gap-2">
//                         {row.color && (
//                           <div
//                             className="w-3 h-3 rounded-full shrink-0"
//                             style={{ backgroundColor: row.color }}
//                           />
//                         )}
//                         <input
//                           className="flex-1 border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
//                           placeholder="Select a project..."
//                           value={row.project}
//                           onChange={(e) =>
//                             handleInputChange(row.id, "project", e.target.value)
//                           }
//                         />
//                       </div>
//                     </TableCell>

//                     {/* Fixed width day columns */}
//                     {Object.entries(row.days).map(([day, value]) => {
//                       const dayEntries: TimeEntry[] = Array.from(
//                         row.entryMap.entries()
//                       )
//                         .filter(([key]) => key.startsWith(day))
//                         .map(([, entry]) => entry);

//                       return (
//                         <TableCell
//                           key={day}
//                           className="text-center px-1 w-[90px]"
//                         >
//                           <div className="relative">
//                             <input
//                               className="w-[70px] text-center border rounded-md p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
//                               value={value}
//                               onChange={(e) =>
//                                 handleDayChange(row.id, day, e.target.value)
//                               }
//                               placeholder="hh:mm"
//                             />
//                             {dayEntries.length > 0 && (
//                               <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
//                                 {dayEntries.length}
//                               </div>
//                             )}
//                           </div>
//                         </TableCell>
//                       );
//                     })}

//                     <TableCell className="text-center font-semibold w-[80px]">
//                       {totalHours}h
//                     </TableCell>

//                     <TableCell className="text-center w-[60px]">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleDeleteRow(row.id)}
//                         className="text-red-600 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </div>

//         <div className="flex items-center gap-3">
//           <Button variant="outline" onClick={handleAddRow}>
//             <Plus className="h-4 w-4 mr-1" /> Add timesheet row
//           </Button>
//           <Button variant="outline" onClick={handleSort}>
//             <ArrowUpDown className="h-4 w-4 mr-1" /> Sort
//           </Button>
//         </div>
//       </div>

//       <TimeEntryForm
//         open={isFormOpen}
//         onOpenChange={(open) => {
//           setIsFormOpen(open);
//           if (!open) setEditingEntry(null);
//         }}
//         entry={editingEntry || undefined}
//         onSuccess={handleSuccess}
//       />
//     </>
//   );
// }

// <DOCUMENT filename="TimeEntryList.tsx">

"use client";

import { useState, useMemo } from "react";
import { TimeEntryForm } from "./TimeEntryForm";
import { deleteTimeEntry } from "@/lib/actions/entries";
import { formatDuration, formatDecimalHours } from "@/lib/utils";
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
  Plus,
  Trash2,
  ArrowUpDown,
  Clock,
  Edit,
  Edit2,
  Edit3,
  FileEdit,
  FileEditIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format, startOfWeek, addDays } from "date-fns";

interface TimeEntry {
  id: string;
  date: Date;
  projectId: string | null;
  clientId: string | null;
  duration: number;
  startTime: string | null;
  endTime: string | null;
  description: string | null;
  project?: {
    id: string;
    name: string;
    color: string;
  } | null;
  client?: {
    id: string;
    name: string;
  } | null;
}

interface TimeEntryListProps {
  entries: TimeEntry[];
}

/* ──────────────────────── Helpers ──────────────────────── */
const minutesToHHMM = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}:${mins.toString().padStart(2, "0")}`;
};

const parseHHMMToMinutes = (input: string): number => {
  const trimmed = input.trim();
  const decimalMatch = trimmed.match(/^\d*\.?\d+$/);
  if (decimalMatch) return Math.round(parseFloat(trimmed) * 60);

  const match = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (match) return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  return 0;
};

interface ProjectRow {
  id: string;
  project: string;
  color: string;
  days: Record<string, string>; // dateKey -> "hh:mm"
  entryMap: Map<string, TimeEntry>; // `${dateKey}-${entry.id}` -> entry
}

/* ──────────────────────── Component ──────────────────────── */
export function TimeEntryList({ entries }: TimeEntryListProps) {
  const router = useRouter();

  /* ---------- Dialog state ---------- */
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | null>(null); // for new entry

  const openFormForNew = (date: Date) => {
    setEditingEntry(null);
    setDefaultDate(date);
    setFormOpen(true);
  };

  const openFormForEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setDefaultDate(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEntry(null);
    setDefaultDate(null);
  };

  const onSuccess = () => {
    closeForm();
    router.refresh();
  };

  /* ---------- Table data ---------- */
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const projectMap = useMemo((): ProjectRow[] => {
    const map = new Map<string, ProjectRow>();

    entries.forEach((entry) => {
      const projectId = entry.projectId || "unassigned";
      const projectName = entry.project?.name || "No Project";
      const projectColor = entry.project?.color || "#94a3b8";

      if (!map.has(projectId)) {
        map.set(projectId, {
          id: projectId,
          project: projectName,
          color: projectColor,
          days: Object.fromEntries(
            weekDays.map((d) => [format(d, "yyyy-MM-dd"), ""])
          ),
          entryMap: new Map<string, TimeEntry>(),
        });
      }

      const row = map.get(projectId)!;
      const dateKey = format(new Date(entry.date), "yyyy-MM-dd");

      const isInCurrentWeek = weekDays.some(
        (d) => format(d, "yyyy-MM-dd") === dateKey
      );

      if (isInCurrentWeek) {
        const current = row.days[dateKey] || "";
        const currentMins = parseHHMMToMinutes(current);
        const newMins = currentMins + entry.duration;
        row.days[dateKey] = minutesToHHMM(newMins);
        row.entryMap.set(`${dateKey}-${entry.id}`, entry);
      }
    });

    return Array.from(map.values());
  }, [entries, weekStart]);

  const [rows, setRows] = useState<ProjectRow[]>(projectMap);

  const handleInputChange = (
    projectId: string,
    field: keyof ProjectRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === projectId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleDayChange = (projectId: string, day: string, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === projectId
          ? { ...row, days: { ...row.days, [day]: value } }
          : row
      )
    );
  };

  const handleAddRow = () => {
    const newId = `new-${Date.now()}`;
    setRows((prev) => [
      ...prev,
      {
        id: newId,
        project: "",
        color: "#94a3b8",
        days: Object.fromEntries(
          weekDays.map((d) => [format(d, "yyyy-MM-dd"), ""])
        ),
        entryMap: new Map(),
      },
    ]);
  };

  const handleDeleteRow = (projectId: string) => {
    setRows((prev) => prev.filter((row) => row.id !== projectId));
  };

  const handleSort = () => {
    setRows((prev) =>
      [...prev].sort((a, b) => a.project.localeCompare(b.project))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this time entry?")) return;

    const result = await deleteTimeEntry(id);
    if (result.success) router.refresh();
    else alert(result.error || "Failed to delete time entry");
  };

  /* ---------- Empty state ---------- */
  if (entries.length === 0 && rows.length === 0) {
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
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table className="min-w-full border rounded-md table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 w-auto min-w-[280px]">
                  PROJECT *
                </TableHead>

                {weekDays.map((day, i) => (
                  <TableHead
                    key={i}
                    className="text-center w-[90px] px-1 font-medium whitespace-nowrap"
                  >
                    <div>
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(day, "dd MMM")}
                    </div>
                  </TableHead>
                ))}

                <TableHead className="w-[80px] text-center font-semibold">
                  Total
                </TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => {
                const dayValues = Object.values(row.days).map(
                  parseHHMMToMinutes
                );
                const totalMinutes = dayValues.reduce((a, b) => a + b, 0);
                const totalHours = (totalMinutes / 60).toFixed(2);

                return (
                  <TableRow key={row.id} className="hover:bg-muted/40">
                    {/* ── Project column ── */}
                    <TableCell className="sticky left-0 bg-background z-10 w-auto min-w-[280px]">
                      <div className="flex items-center gap-2">
                        {row.color && (
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: row.color }}
                          />
                        )}
                        <input
                          className="flex-1 border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
                          placeholder="Select a project..."
                          value={row.project}
                          onChange={(e) =>
                            handleInputChange(row.id, "project", e.target.value)
                          }
                        />
                      </div>
                    </TableCell>

                    {/* ── Day columns ── */}
                    {Object.entries(row.days).map(([dayKey, value]) => {
                      const dayEntries: TimeEntry[] = Array.from(
                        row.entryMap.entries()
                      )
                        .filter(([key]) => key.startsWith(dayKey))
                        .map(([, entry]) => entry);

                      const dayDate = weekDays.find(
                        (d) => format(d, "yyyy-MM-dd") === dayKey
                      )!;

                      return (
                        <TableCell
                          key={dayKey}
                          className="text-center px-1 w-[90px] relative"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex items-center border rounded-md overflow-hidden">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-6 p-0 rounded-none border-r hover:bg-gray-200"
                                onClick={() => openFormForNew(dayDate)}
                                title="Add entry"
                              >
                                <FileEdit className="h-3 w-3" />
                              </Button>

                              <input
                                className="w-[60px] text-center p-1 text-sm focus:outline-none border-0"
                                value={value}
                                onChange={(e) =>
                                  handleDayChange(
                                    row.id,
                                    dayKey,
                                    e.target.value
                                  )
                                }
                                placeholder="hh:mm"
                              />
                            </div>
                          </div>

                          {/* Entry count badge – click to edit */}
                          {dayEntries.length > 0 && (
                            <button
                              onClick={() => {
                                // Open the *first* entry for quick edit.
                                // (You could also show a dropdown if you want to pick one.)
                                openFormForEdit(dayEntries[0]);
                              }}
                              className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center hover:bg-blue-600 transition-colors"
                              title={`Edit ${dayEntries.length} entr${dayEntries.length === 1 ? "y" : "ies"}`}
                            >
                              {dayEntries.length}
                            </button>
                          )}
                        </TableCell>
                      );
                    })}

                    {/* ── Total column ── */}
                    <TableCell className="text-center font-semibold w-[80px]">
                      {totalHours}h
                    </TableCell>

                    {/* ── Delete row ── */}
                    <TableCell className="text-center w-[60px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleAddRow}>
            <Plus className="h-4 w-4 mr-1" /> Add timesheet row
          </Button>
          <Button variant="outline" onClick={handleSort}>
            <ArrowUpDown className="h-4 w-4 mr-1" /> Sort
          </Button>
        </div>
      </div>

      <TimeEntryForm
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
          else setFormOpen(open);
        }}
        entry={editingEntry ?? undefined}
        defaultDate={defaultDate ?? undefined}
        onSuccess={onSuccess}
      />
    </>
  );
}
