"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { isAdminUser, getCurrentUser } from "./clients";
import { projectSchema, type ProjectFormData } from "@/lib/schemas/project";

// Create a new project
export async function createProject(data: ProjectFormData) {
    try {
        const validated = projectSchema.parse(data);
        const isAdmin = await isAdminUser();

        // Check if user is admin
        if (!isAdmin) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await getCurrentUser();

        const project = await prisma.project.create({
            data: {
                name: validated.name,
                clientId: validated.clientId,
                description: validated.description || null,
                budgetAmount: validated.budgetAmount,
                status: validated.status,
                color: validated.color,
                userId: user.id,
            },
        });

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
        const validated = projectSchema.parse(data);
        const isAdmin = await isAdminUser();

        // Check if user is admin
        if (!isAdmin) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if project exists
        const existingProject = await prisma.project.findUnique({
            where: { id },
        });

        if (!existingProject) {
            return { success: false, error: "Project not found" };
        }

        const project = await prisma.project.update({
            where: { id },
            data: {
                name: validated.name,
                clientId: validated.clientId,
                description: validated.description || null,
                budgetAmount: validated.budgetAmount,
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

// Archive a project
export async function archiveProject(id: string) {
    try {
        const isAdmin = await isAdminUser();

        // Check if user is admin
        if (!isAdmin) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if project exists
        const existingProject = await prisma.project.findUnique({
            where: { id },
        });

        if (!existingProject) {
            return { success: false, error: "Project not found" };
        }

        await prisma.project.update({
            where: { id },
            data: {
                status: "archived",
            },
        });

        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Error archiving project:", error);
        return { success: false, error: "Failed to archive project" };
    }
}

// Get all projects for the current user (member of)
export async function getUsersProjects() {
    try {
        const user = await getCurrentUser();

        if (!user.id) {
            return { success: false, error: "Invalid User", data: [] };
        }

        // Get projects where user is a member
        const projects = await prisma.project.findMany({
            where: {
                status: "active",
                members: {
                    some: {
                        userId: user.id,
                        isActive: true,
                    },
                }, // Projects where user is an active member
            },
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: {
                        timeEntries: true,
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

// Get all projects (admin only)
export async function getAllProjects(active: boolean = true) {
    try {
        const isAdmin = await isAdminUser();

        // Check if user is admin
        if (!isAdmin) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        // Get all projects (for admin users)
        const projects = active
            ? await prisma.project.findMany({
                  where: { status: "active" },
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
              })
            : await prisma.project.findMany({
                  where: { status: "archived" },
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
        console.error("Error fetching all projects:", error);
        return { success: false, error: "Failed to fetch projects", data: [] };
    }
}

// Get active projects for dropdown selects (only projects where user is an active member)
export async function getActiveProjects() {
    try {
        const user = await getCurrentUser();

        if (!user.id) {
            return { success: false, error: "Invalid User", data: [] };
        }

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

// RSC version: Get projects for user (no auth check - RSC validates session)
export async function getProjectsForUserRSC(userId: string) {
    const projects = await prisma.project.findMany({
        where: {
            status: "active",
            members: {
                some: {
                    userId,
                    isActive: true,
                },
            },
        },
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: {
                    timeEntries: true,
                },
            },
        },
    });

    return projects.map((project) => ({
        ...project,
        budgetAmount: project.budgetAmount
            ? project.budgetAmount.toNumber()
            : null,
    }));
}

// RSC version: Get all projects for admin (no auth check - RSC validates session)
export async function getAllProjectsForRSC(active: boolean = true) {
    const projects = await prisma.project.findMany({
        where: { status: active ? "active" : "archived" },
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

    return projects.map((project) => ({
        ...project,
        budgetAmount: project.budgetAmount
            ? project.budgetAmount.toNumber()
            : null,
    }));
}

// Get all archived projects (admin only)
export async function getAllArchivedProjects() {
    return getAllProjects(false);
}

// RSC version: Get all archived projects for admin (no auth check - RSC validates session)
export async function getArchivedProjectsRSC() {
    return getAllProjectsForRSC(false);
}

// Get a single project by ID
export async function getProject(id: string) {
    try {
        const isAdmin = await isAdminUser();

        // Check if user is admin
        if (!isAdmin) {
            return { success: false, error: "Unauthorized" };
        }

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

        return {
            success: true,
            data: {
                ...project,
                members: project.members.map((member) => ({
                    ...member,
                    payoutRate: member.payoutRate.toNumber(),
                    chargeRate: member.chargeRate.toNumber(),
                })),
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

// Delete a project
export async function deleteProject(id: string) {
    try {
        const isAdmin = await isAdminUser();

        // Check if user is admin
        if (!isAdmin) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if project exists
        const existingProject = await prisma.project.findUnique({
            where: { id },
        });

        if (!existingProject) {
            return { success: false, error: "Project not found" };
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
