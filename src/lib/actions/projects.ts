"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { projectSchema, type ProjectFormData } from "@/lib/schemas/project";
import { Decimal } from "@prisma/client/runtime/library";

// Get current user from session
async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

// Create a new project
export async function createProject(data: ProjectFormData) {
  try {
    const user = await getCurrentUser();
    const validated = projectSchema.parse(data);

    const project = await prisma.project.create({
      data: {
        name: validated.name,
        clientId: validated.clientId,
        description: validated.description || null,
        budgetAmount: validated.budgetAmount
          ? new Decimal(validated.budgetAmount)
          : null,
        status: validated.status,
        color: validated.color,
        userId: user.id,
      },
    });

    revalidatePath("/projects");
    return { success: true, data: project };
  } catch (error) {
    console.error("Error creating project:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to create project" };
  }
}

// Update an existing project
export async function updateProject(id: string, data: ProjectFormData) {
  try {
    const user = await getCurrentUser();
    const validated = projectSchema.parse(data);

    // Check if user owns the project
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return { success: false, error: "Project not found" };
    }

    if (existingProject.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: validated.name,
        clientId: validated.clientId,
        description: validated.description || null,
        budgetAmount: validated.budgetAmount
          ? new Decimal(validated.budgetAmount)
          : null,
        status: validated.status,
        color: validated.color,
      },
    });

    revalidatePath("/projects");
    return {
      success: true,
      data: {
        ...project,
        budgetAmount: project.budgetAmount
          ? project.budgetAmount.toNumber()
          : null,
      },
    };
  } catch (error) {
    console.error("Error updating project:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update project" };
  }
}

// Delete a project
export async function deleteProject(id: string) {
  try {
    const user = await getCurrentUser();

    // Check if user owns the project
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return { success: false, error: "Project not found" };
    }

    if (existingProject.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

// Get all projects for the current user (owned or member of)
export async function getProjects() {
  try {
    const user = await getCurrentUser();

    // Get projects where user is owner or member
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId: user.id }, // Projects owned by user
          {
            members: {
              some: {
                userId: user.id,
                isActive: true,
              },
            },
          }, // Projects where user is active member
        ],
      },
      orderBy: { name: "asc" },
      include: {
        client: true,
        _count: {
          select: {
            timeEntries: true,
            members: true,
          },
        },
      },
    });

    return {
      success: true,
      data: projects.map((project) => ({
        ...project,
        budgetAmount: project.budgetAmount
          ? project.budgetAmount.toNumber()
          : null,
      })),
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { success: false, error: "Failed to fetch projects", data: [] };
  }
}

// Get active projects for dropdown selects (only projects where user is an active member)
export async function getActiveProjects() {
  try {
    const user = await getCurrentUser();

    // Get projects where user is an active member
    const projects = await prisma.project.findMany({
      where: {
        status: "active",
        members: {
          some: {
            userId: user.id,
            isActive: true,
          },
        },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, data: projects };
  } catch (error) {
    console.error("Error fetching active projects:", error);
    return { success: false, error: "Failed to fetch projects", data: [] };
  }
}

// Get a single project by ID
export async function getProject(id: string) {
  try {
    const user = await getCurrentUser();

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    if (project.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    return {
      success: true,
      data: {
        ...project,
        budgetAmount: project.budgetAmount
          ? project.budgetAmount.toNumber()
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching project:", error);
    return { success: false, error: "Failed to fetch project" };
  }
}
