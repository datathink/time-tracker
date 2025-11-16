"use client";

import { useState, useEffect } from "react";
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
import { format } from "date-fns";
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
}

export function TimeEntryForm({
  open,
  onOpenChange,
  entry,
  defaultDate,
  onSuccess,
}: TimeEntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ActiveProject[]>([]);
  const [parsedDuration, setParsedDuration] = useState<number | null>(null);

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
      date: entry?.date
        ? format(new Date(entry.date), "yyyy-MM-dd")
        : defaultDate
          ? format(defaultDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
      projectId: entry?.projectId || "",
      durationInput: entry?.duration ? formatDuration(entry.duration) : "",
      startTime: entry?.startTime || "",
      endTime: entry?.endTime || "",
      description: entry?.description || "",
    },
  });

  const selectedProjectId = watch("projectId");
  const durationInput = watch("durationInput");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  useEffect(() => {
    const loadData = async () => {
      const [projectsResult] = await Promise.all([getActiveProjects()]);
      if (projectsResult.success) setProjects(projectsResult.data);
    };
    if (open) {
      loadData();
      // Update date if defaultDate changes
      if (defaultDate && !entry) {
        setValue("date", format(defaultDate, "yyyy-MM-dd"));
      }
    }
  }, [open, defaultDate, entry, setValue]);

  // Parse duration input
  useEffect(() => {
    if (durationInput) {
      const minutes = parseDuration(durationInput);
      setParsedDuration(minutes);
    } else {
      setParsedDuration(null);
    }
  }, [durationInput]);

  // Auto-calculate end time if start time and duration are provided
  useEffect(() => {
    if (startTime && parsedDuration && !endTime) {
      const calculated = calculateEndTime(startTime, parsedDuration);
      setValue("endTime", calculated);
    }
  }, [startTime, parsedDuration, endTime, setValue]);

  // Auto-calculate duration if both start and end times are provided
  useEffect(() => {
    if (startTime && endTime && !durationInput) {
      const minutes = calculateDuration(startTime, endTime);
      setValue("durationInput", formatDuration(minutes));
    }
  }, [startTime, endTime, durationInput, setValue]);

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

    const result = entry
      ? await updateTimeEntry(entry.id, timeEntryData)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Edit Time Entry" : "New Time Entry"}
          </DialogTitle>
          <DialogDescription>
            {entry
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
                Project <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedProjectId || undefined}
                onValueChange={(value) => setValue("projectId", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: project.color,
                          }}
                        />
                        {project.name}
                        {project.client && (
                          <span className="text-xs text-gray-500">
                            ({project.client.name})
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
                  Date <span className="text-red-500">*</span>
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
                          format(new Date(watch("date")), "EEE, MMMM do, yyyy")}
                      </span>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        watch("date") ? new Date(watch("date")) : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setValue("date", format(date, "yyyy-MM-dd"));
                        }
                      }}
                      captionLayout="dropdown"
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationInput">
                  Duration <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="durationInput"
                  placeholder="2.5h, 2h 30m, 150m"
                  {...register("durationInput")}
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
                    {(parsedDuration / 60).toFixed(2)} hours)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time (optional)</Label>
                <TimeInput
                  id="startTime"
                  placeholder="09:00"
                  {...register("startTime")}
                  value={startTime ?? ""}
                  onChange={(v) => setValue("startTime", v || "")}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">End Time (optional)</Label>
                <TimeInput
                  id="endTime"
                  placeholder="09:00"
                  {...register("endTime")}
                  value={endTime ?? ""}
                  onChange={(v) => setValue("endTime", v || "")}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
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
            <Button type="submit" disabled={loading || parsedDuration === null}>
              {loading ? "Saving..." : entry ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
