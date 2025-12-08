"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTimeEntry, updateTimeEntry } from "@/lib/actions/entries";
import { type TimeEntryFormData } from "@/lib/schemas/time-entry";
import { getActiveProjects } from "@/lib/actions/projects";
import {
    parseDuration,
    calculateEndTime,
    calculateDuration,
    formatDuration,
    calculateStartTime,
    formatDecimalHours,
    fromUTCDate,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { format, isSameDay } from "date-fns";
import { Prisma } from "@prisma/client";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { TimeInput } from "../ui/time-input";

type ActiveProject = Prisma.ProjectGetPayload<{
    select: {
        id: true;
        name: true;
        color: true;
        client: {
            select: {
                name: true;
            };
        };
    };
}>;

// Minimal type needed for collision detection
type ExistingEntry = {
    id: string;
    projectId: string;
    date: Date;
    duration: number;
    startTime: string | null;
    endTime: string | null;
    description: string;
};

const timeEntryFormSchema = z.object({
    date: z.string().min(1, "Date is required"),
    projectId: z.string().min(1, "Project is required"),
    durationInput: z.string().min(1, "Duration is required"),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    description: z.string().min(10, "Description is required"),
});

type FormData = z.infer<typeof timeEntryFormSchema>;

interface TimeEntryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entry?: {
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
    } | null;
    defaultDate?: Date | null;
    onSuccess?: () => void;
    existingEntries?: ExistingEntry[];
}

export function TimeEntryForm({
    open,
    onOpenChange,
    entry,
    defaultDate,
    onSuccess,
    existingEntries = [],
}: TimeEntryFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<ActiveProject[]>([]);
    const [parsedDuration, setParsedDuration] = useState<number | null>(null);
    const [internalEntryId, setInternalEntryId] = useState<string | null>(null);
    const lastModifiedRef = useRef<"duration" | "start" | "end" | null>(null);
    const [collisionEntry, setCollisionEntry] = useState<ExistingEntry | null>(
        null
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(timeEntryFormSchema),
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"),
            projectId: "",
            durationInput: "",
            startTime: "",
            endTime: "",
            description: "",
        },
    });

    const selectedProjectId = watch("projectId");
    const selectedDateStr = watch("date");
    const durationInput = watch("durationInput");
    const startTime = watch("startTime");
    const endTime = watch("endTime");

    // Initialize Form
    useEffect(() => {
        if (open) {
            if (entry) {
                // Edit Mode (Initial)
                setInternalEntryId(entry.id);
                reset({
                    date: format(fromUTCDate(entry.date), "yyyy-MM-dd"),
                    projectId: entry.projectId || "",
                    durationInput: entry.duration
                        ? formatDuration(entry.duration)
                        : "",
                    startTime: entry.startTime || "",
                    endTime: entry.endTime || "",
                    description: entry.description || "",
                });
            } else {
                // Create Mode (Initial)
                setInternalEntryId(null);
                reset({
                    date: defaultDate
                        ? format(defaultDate, "yyyy-MM-dd")
                        : format(new Date(), "yyyy-MM-dd"),
                    projectId: "",
                    durationInput: "",
                    startTime: "",
                    endTime: "",
                    description: "",
                });
            }
            setCollisionEntry(null);
        }
    }, [open, entry, defaultDate, reset]);

    // Collision Detection Logic
    useEffect(() => {
        if (!open || !selectedProjectId || !selectedDateStr) return;

        const dateObj = new Date(selectedDateStr + "T00:00:00");

        // Find if there is another entry for this Project + Date
        const duplicate = existingEntries.find((e) => {
            const isSameProject = e.projectId === selectedProjectId;
            const isSameDate = isSameDay(fromUTCDate(e.date), dateObj);
            // Crucial: Ignore the entry we are currently editing
            const isNotCurrentEntry = e.id !== internalEntryId;

            return isSameProject && isSameDate && isNotCurrentEntry;
        });

        setCollisionEntry(duplicate || null);
    }, [
        selectedProjectId,
        selectedDateStr,
        existingEntries,
        internalEntryId,
        open,
    ]);

    // Load Projects
    useEffect(() => {
        const loadData = async () => {
            const projectsResult = await getActiveProjects();
            if (projectsResult.success) setProjects(projectsResult.data);
        };
        if (open) loadData();
    }, [open]);

    // Cleanup on close
    useEffect(() => {
        if (!open) {
            setError(null);
            setCollisionEntry(null);
        }
    }, [open]);

    // Parse Duration
    useEffect(() => {
        if (durationInput) {
            setParsedDuration(parseDuration(durationInput));
        } else {
            setParsedDuration(null);
        }
    }, [durationInput]);

    // Auto-calculate times
    useEffect(() => {
        const hasStart = startTime && startTime.trim() !== "";
        const hasEnd = endTime && endTime.trim() !== "";
        const hasDuration = parsedDuration !== null && parsedDuration > 0;

        try {
            setError(null);
            if (
                hasStart &&
                hasEnd &&
                (lastModifiedRef.current === "start" ||
                    lastModifiedRef.current === "end")
            ) {
                const calculatedMinutes = calculateDuration(
                    startTime!,
                    endTime!
                );
                const currentDuration = parseDuration(durationInput || "");
                if (calculatedMinutes !== currentDuration) {
                    setValue(
                        "durationInput",
                        formatDuration(calculatedMinutes)
                    );
                }
            } else if (
                hasDuration &&
                hasStart &&
                (lastModifiedRef.current === "duration" ||
                    lastModifiedRef.current === "start")
            ) {
                const calculated = calculateEndTime(startTime!, parsedDuration);
                if (calculated !== endTime) setValue("endTime", calculated);
            } else if (
                hasDuration &&
                hasEnd &&
                lastModifiedRef.current === "end"
            ) {
                const calculated = calculateStartTime(endTime!, parsedDuration);
                if (calculated !== startTime) setValue("startTime", calculated);
            }
        } catch (err) {
            // suppress error during typing
        }
    }, [startTime, endTime, parsedDuration, durationInput, setValue]);

    const switchToEditExisting = () => {
        if (!collisionEntry) return;

        // Switch the form to "Edit Mode" for the colliding entry
        setInternalEntryId(collisionEntry.id);

        reset({
            date: format(fromUTCDate(collisionEntry.date), "yyyy-MM-dd"),
            projectId: collisionEntry.projectId,
            durationInput: formatDuration(collisionEntry.duration),
            startTime: collisionEntry.startTime || "",
            endTime: collisionEntry.endTime || "",
            description: collisionEntry.description || "",
        });

        // Clear collision warning since we are now editing the "duplicate"
        setCollisionEntry(null);
    };

    // Add this helper function inside TimeEntryForm:
    const handleCancelAndClose = () => {
        setValue("projectId", "");
        setCollisionEntry(null);
        onOpenChange(false);
    };

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);

        const duration = parseDuration(data.durationInput);
        if (!duration) {
            setError("Invalid duration format");
            setLoading(false);
            return;
        }

        const timeEntryData: TimeEntryFormData = {
            date: data.date,
            projectId: data.projectId,
            duration,
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            description: data.description,
        };

        const result = internalEntryId
            ? await updateTimeEntry(internalEntryId, timeEntryData)
            : await createTimeEntry(timeEntryData);

        if (result.success) {
            reset();
            onOpenChange(false);
            onSuccess?.();
        } else {
            setError(result.error || "An error occurred");
        }

        setLoading(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {internalEntryId
                                ? "Edit Time Entry"
                                : "New Time Entry"}
                        </DialogTitle>
                        <DialogDescription>
                            {internalEntryId
                                ? "Update time entry information"
                                : "Log time for work you've completed"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 py-4">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="projectId">
                                    Project{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={selectedProjectId || undefined}
                                    onValueChange={(value) =>
                                        setValue("projectId", value)
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((project) => (
                                            <SelectItem
                                                key={project.id}
                                                value={project.id}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                project.color,
                                                        }}
                                                    />
                                                    {project.name}
                                                    {project.client && (
                                                        <span className="text-xs text-gray-500">
                                                            (
                                                            {
                                                                project.client
                                                                    .name
                                                            }
                                                            )
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">
                                        Date{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between text-left font-normal"
                                                disabled={loading}
                                            >
                                                <span>
                                                    {watch("date") &&
                                                        format(
                                                            new Date(
                                                                watch("date") +
                                                                    "T00:00:00"
                                                            ),
                                                            "EEE, MMMM do, yyyy"
                                                        )}
                                                </span>
                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                defaultMonth={
                                                    watch("date")
                                                        ? new Date(
                                                              watch("date") +
                                                                  "T00:00:00"
                                                          )
                                                        : new Date()
                                                }
                                                selected={
                                                    watch("date")
                                                        ? new Date(
                                                              watch("date") +
                                                                  "T00:00:00"
                                                          )
                                                        : undefined
                                                }
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setValue(
                                                            "date",
                                                            format(
                                                                date,
                                                                "yyyy-MM-dd"
                                                            )
                                                        );
                                                    }
                                                }}
                                                className="rounded-md border "
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.date && (
                                        <p className="text-sm text-red-500">
                                            {errors.date.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="durationInput">
                                        Duration{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="durationInput"
                                        placeholder="2.5h, 2h 30m, 150m"
                                        {...register("durationInput", {
                                            onChange: () => {
                                                lastModifiedRef.current =
                                                    "duration";
                                            },
                                        })}
                                        disabled={loading}
                                    />
                                    {errors.durationInput && (
                                        <p className="text-sm text-red-500">
                                            {errors.durationInput.message}
                                        </p>
                                    )}
                                    {parsedDuration !== null && (
                                        <p className="text-xs text-gray-500">
                                            = {formatDuration(parsedDuration)} (
                                            {(parsedDuration / 60).toFixed(2)}{" "}
                                            hours)
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startTime">
                                        Start Time (optional)
                                    </Label>
                                    <TimeInput
                                        id="startTime"
                                        placeholder="08:00 AM"
                                        value={startTime ?? ""}
                                        onChange={(v) => {
                                            setValue("startTime", v || "", {
                                                shouldValidate: true,
                                            });
                                            lastModifiedRef.current = "start";
                                        }}
                                        disabled={loading}
                                    />
                                    {errors.startTime && (
                                        <p className="text-sm text-red-500">
                                            {errors.startTime.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endTime">
                                        End Time (optional)
                                    </Label>
                                    <TimeInput
                                        id="endTime"
                                        placeholder="04:00 PM"
                                        value={endTime ?? ""}
                                        onChange={(v) => {
                                            setValue("endTime", v || "", {
                                                shouldValidate: true,
                                            });
                                            lastModifiedRef.current = "end";
                                        }}
                                        disabled={loading}
                                    />
                                    {errors.endTime && (
                                        <p className="text-sm text-red-500">
                                            {errors.endTime.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="description">
                                        Description{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="What did you work on?"
                                        rows={3}
                                        {...register("description")}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    loading ||
                                    parsedDuration === null ||
                                    !!error ||
                                    !!collisionEntry
                                }
                            >
                                {loading
                                    ? "Saving..."
                                    : internalEntryId
                                      ? "Update"
                                      : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {collisionEntry && (
                <AlertDialog
                    open={!!collisionEntry}
                    onOpenChange={(open) => {
                        if (!open) setCollisionEntry(null);
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Entry already exists
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                You already have{" "}
                                <strong>
                                    {formatDecimalHours(
                                        collisionEntry.duration
                                    )}
                                    h
                                </strong>{" "}
                                logged for this project on this date.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleCancelAndClose}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={switchToEditExisting}>
                                Edit Existing Entry
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}
