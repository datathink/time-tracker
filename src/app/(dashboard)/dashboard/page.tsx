"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTimeEntryStats } from "@/lib/actions/entries";
import { formatDecimalHours } from "@/lib/utils";
import { Clock, TrendingUp, DollarSign, FolderOpen } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayMinutes: 0,
    weekMinutes: 0,
    billableMinutes: 0,
    activeProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const result = await getTimeEntryStats();
      if (result.success) {
        setStats(result.data);
      }
      setLoading(false);
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your time tracking dashboard</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading stats...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                <CardDescription>Billable Hours</CardDescription>
                <DollarSign className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl">
                  {formatDecimalHours(stats.billableMinutes)}h
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>Active Projects</CardDescription>
                <FolderOpen className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl">
                  {stats.activeProjects}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.activeProjects === 0
                    ? "Create your first project"
                    : "Projects"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Get started with time tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Create a Client</h3>
                <p className="text-sm text-gray-600">
                  Start by adding clients you work for
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Create Projects</h3>
                <p className="text-sm text-gray-600">
                  Set up projects for each client and assign team members
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Log Time Entries</h3>
                <p className="text-sm text-gray-600">
                  Record your work hours and associate them with projects
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. Generate Reports</h3>
                <p className="text-sm text-gray-600">
                  View reports and export data for invoicing
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
