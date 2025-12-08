"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import {
  timeEntrySchema,
  type TimeEntryFormData,
} from "@/lib/schemas/time-entry";

// Get current user from session
async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

// Create a new time entry
export async function createTimeEntry(data: TimeEntryFormData) {
  try {
    const user = await getCurrentUser();
    const validated = timeEntrySchema.parse(data);

    // If project is specified, validate user is an active member
    if (validated.projectId) {
      const membership = await prisma.projectMember.findFirst({
        where: {
          projectId: validated.projectId,
          userId: user.id,
          isActive: true,
        },
      });

      if (!membership) {
        return {
          success: false,
          error:
            "You must be an active member of this project to log time to it",
        };
      }
    }

    // Parse date in local timezone to avoid timezone issues
    const [year, month, day] = validated.date.split("-").map(Number);
    const localDate = new Date(Date.UTC(year, month - 1, day));

    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId: user.id,
        date: localDate,
        projectId: validated.projectId,
        duration: validated.duration,
        startTime: validated.startTime || null,
        endTime: validated.endTime || null,
        description: validated.description,
        billable: validated.billable,
      },
    });

    revalidatePath("/entries");
    return { success: true, data: timeEntry };
  } catch (error) {
    console.error("Error creating time entry:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to create time entry" };
  }
}

// Update an existing time entry
export async function updateTimeEntry(id: string, data: TimeEntryFormData) {
  try {
    const user = await getCurrentUser();
    const validated = timeEntrySchema.parse(data);

    // Check if user owns the time entry
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return { success: false, error: "Time entry not found" };
    }

    if (existingEntry.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // If project is specified, validate user is an active member
    if (validated.projectId) {
      const membership = await prisma.projectMember.findFirst({
        where: {
          projectId: validated.projectId,
          userId: user.id,
          isActive: true,
        },
      });

      if (!membership) {
        return {
          success: false,
          error:
            "You must be an active member of this project to log time to it",
        };
      }
    }

    // Parse date in local timezone to avoid timezone issues
    const [year, month, day] = validated.date.split("-").map(Number);
    const localDate = new Date(Date.UTC(year, month - 1, day));

    const timeEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        date: localDate,
        projectId: validated.projectId,
        duration: validated.duration,
        startTime: validated.startTime || null,
        endTime: validated.endTime || null,
        description: validated.description,
        billable: validated.billable,
      },
    });

    revalidatePath("/entries");
    return { success: true, data: timeEntry };
  } catch (error) {
    console.error("Error updating time entry:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update time entry" };
  }
}

// Delete a time entry
export async function deleteTimeEntry(id: string) {
  try {
    const user = await getCurrentUser();

    // Check if user owns the time entry
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return { success: false, error: "Time entry not found" };
    }

    if (existingEntry.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.timeEntry.delete({
      where: { id },
    });

    revalidatePath("/entries");
    return { success: true };
  } catch (error) {
    console.error("Error deleting time entry:", error);
    return { success: false, error: "Failed to delete time entry" };
  }
}

// Get time entries with filters
export async function getTimeEntries(filters?: {
  startDate?: string;
  endDate?: string;
  projectId?: string;
}) {
  try {
    const user = await getCurrentUser();

    const where: {
      userId: string;
      date?: {
        gte?: Date;
        lte?: Date;
      };
      projectId?: string;
    } = {
      userId: user.id,
    };

    if (filters?.startDate) {
      where.date = {
        ...where.date,
        gte: new Date(filters.startDate),
      };
    }

    if (filters?.endDate) {
      where.date = {
        ...where.date,
        lte: new Date(filters.endDate),
      };
    }

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return { success: true, data: entries };
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return {
      success: false,
      error: "Failed to fetch time entries",
      data: [],
    };
  }
}

// Get a single time entry by ID
export async function getTimeEntry(id: string) {
  try {
    const user = await getCurrentUser();

    const entry = await prisma.timeEntry.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!entry) {
      return { success: false, error: "Time entry not found" };
    }

    if (entry.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    return { success: true, data: entry };
  } catch (error) {
    console.error("Error fetching time entry:", error);
    return { success: false, error: "Failed to fetch time entry" };
  }
}

// Get time entries for a specific week
export async function getWeekTimeEntries(weekStart: string, weekEnd: string) {
  try {
    const user = await getCurrentUser();

    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(weekStart),
          lte: new Date(weekEnd),
        },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return { success: true, data: entries };
  } catch (error) {
    console.error("Error fetching week time entries:", error);
    return {
      success: false,
      error: "Failed to fetch time entries",
      data: [],
    };
  }
}

// Get time entry stats
export async function getTimeEntryStats() {
  try {
    const user = await getCurrentUser();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // Today's hours
    const todayEntries = await prisma.timeEntry.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: today,
        },
      },
      _sum: {
        duration: true,
      },
    });

    // This week's hours
    const weekEntries = await prisma.timeEntry.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: weekStart,
        },
      },
      _sum: {
        duration: true,
      },
    });

    // Active projects count
    const activeProjectsCount = await prisma.project.count({
      where: {
        userId: user.id,
        status: "active",
      },
    });

    return {
      success: true,
      data: {
        todayMinutes: todayEntries._sum.duration || 0,
        weekMinutes: weekEntries._sum.duration || 0,
        activeProjects: activeProjectsCount,
      },
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      success: false,
      error: "Failed to fetch stats",
      data: {
        todayMinutes: 0,
        weekMinutes: 0,
        activeProjects: 0,
      },
    };
  }
}
