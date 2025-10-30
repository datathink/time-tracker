"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, List, Clock, TrendingUp, FolderOpen } from "lucide-react";
import { WeekView } from "@/components/entries/WeekView";
import { TimeEntryList } from "@/components/entries/TimeEntryList";
import { TimeEntryForm } from "@/components/entries/TimeEntryForm";
import { getWeekTimeEntries, getTimeEntryStats } from "@/lib/actions/entries";
import { startOfWeek, endOfWeek } from "date-fns";
import { Prisma } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDecimalHours } from "@/lib/utils";

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

  const [stats, setStats] = useState({
    todayMinutes: 0,
    weekMinutes: 0,
    activeProjects: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const loadEntries = async (weekDate: Date) => {
    setLoading(true);
    const weekStart = startOfWeek(weekDate, { weekStartsOn: 0 });
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

  const loadStats = async () => {
    const result = await getTimeEntryStats();
    if (result.success) {
      setStats(result.data);
    }
    setStatsLoading(false);
  };

  // EFFECT 1: Load/Reload entries when the week changes
  useEffect(() => {
    loadEntries(currentWeek);
  }, [currentWeek]);

  // EFFECT 2: Load global stats only once on mount
  useEffect(() => {
    loadStats();
  }, []);

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

  // Reload both entries for the current week AND the global stats
  const handleSuccess = () => {
    loadEntries(currentWeek);
    loadStats();
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
          <p className="text-gray-600">Track and manage your time entries</p>
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

      {statsLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading stats...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-15">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Today&apos;s Hours</CardDescription>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl">
                {formatDecimalHours(stats.todayMinutes)}h
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {stats.todayMinutes === 0
                  ? "No entries today"
                  : `${stats.todayMinutes} minutes`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>This Week</CardDescription>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl">
                {formatDecimalHours(stats.weekMinutes)}h
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {stats.weekMinutes === 0
                  ? "No entries this week"
                  : `${stats.weekMinutes} minutes`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Active Projects</CardDescription>
              <FolderOpen className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl">{stats.activeProjects}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {stats.activeProjects === 0
                  ? "Create your first project"
                  : "Projects"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
