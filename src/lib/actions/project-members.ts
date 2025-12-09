"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { Role } from "@prisma/client";
import { getCurrentUser, isAdminUser } from "./clients";
import { Decimal } from "@prisma/client/runtime/library";

// Check if user is admin or project owner
async function canManageProject(projectId: string) {
    const currentUser = await getCurrentUser();

    const user = await prisma.user.findUnique({
        where: { id: currentUser?.id },
        select: { role: true },
    });

    if (user?.role === "admin") {
        return true;
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true },
    });

    return project?.userId === currentUser?.id;
}

// Schema for adding a project member
const addMemberSchema = z.object({
    projectId: z.string(),
    userId: z.string(),
    payoutRate: z.union([z.number().positive(), z.instanceof(Decimal)]),
    chargeRate: z.union([z.number().positive(), z.instanceof(Decimal)]),
    role: z.enum(["owner", "manager", "member"]).default("member"),
});

// Add a user to a project with their rate
export async function addProjectMember(data: z.infer<typeof addMemberSchema>) {
    try {
        const validated = addMemberSchema.parse(data);

        // Check if current user can manage this project
        const canManage = await canManageProject(validated.projectId);
        if (!canManage) {
            return {
                success: false,
                error: "You don't have permission to manage this project",
            };
        }

        // Check if member already exists
        const existing = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: validated.projectId,
                    userId: validated.userId,
                },
            },
        });

        if (existing) {
            return {
                success: false,
                error: "User is already a member of this project",
            };
        }

        // Add the member
        const member = await prisma.projectMember.create({
            data: {
                projectId: validated.projectId,
                userId: validated.userId,
                payoutRate: new Decimal(validated.payoutRate),
                chargeRate: new Decimal(validated.chargeRate),
                role: validated.role,
                isActive: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        revalidatePath("/projects");
        return {
            success: true,
            data: {
                ...member,
                payoutRate: member.payoutRate.toNumber(),
                chargeRate: member.chargeRate.toNumber(),
            },
        };
    } catch (error) {
        console.error("Error adding project member:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "Failed to add project member" };
    }
}

// Update a project member's rate or role
export async function updateProjectMember(
    memberId: string,
    data: {
        payoutRate?: number;
        chargeRate?: number;
        role?: string;
        isActive?: boolean;
    }
) {
    try {
        // Get the member to check project ownership
        const member = await prisma.projectMember.findUnique({
            where: { id: memberId },
            include: { project: true },
        });

        if (!member) {
            return { success: false, error: "Project member not found" };
        }

        // Check if current user can manage this project
        const canManage = await canManageProject(member.projectId);
        if (!canManage) {
            return {
                success: false,
                error: "You don't have permission to manage this project",
            };
        }

        // Update the member
        const updated = await prisma.projectMember.update({
            where: { id: memberId },
            data: {
                ...(data.payoutRate !== undefined && {
                    payoutRate: new Decimal(data.payoutRate),
                }),
                ...(data.chargeRate !== undefined && {
                    chargeRate: new Decimal(data.chargeRate),
                }),
                ...(data.role !== undefined && { role: data.role as Role }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        revalidatePath("/projects");
        return {
            success: true,
            data: {
                ...updated,
                payoutRate: updated.payoutRate.toNumber(),
                chargeRate: updated.chargeRate.toNumber(),
            },
        };
    } catch (error) {
        console.error("Error updating project member:", error);
        return { success: false, error: "Failed to update project member" };
    }
}

// Remove a user from a project
export async function removeProjectMember(memberId: string) {
    try {
        // Get the member to check project ownership
        const member = await prisma.projectMember.findUnique({
            where: { id: memberId },
            include: { project: true },
        });

        if (!member) {
            return { success: false, error: "Project member not found" };
        }

        // Check if current user can manage this project
        const canManage = await canManageProject(member.projectId);
        if (!canManage) {
            return {
                success: false,
                error: "You don't have permission to manage this project",
            };
        }

        // Delete the member
        await prisma.projectMember.delete({
            where: { id: memberId },
        });

        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Error removing project member:", error);
        return { success: false, error: "Failed to remove project member" };
    }
}

// Get all members of a project
export async function getProjectMembers(projectId: string) {
    try {
        const currentUser = await getCurrentUser();

        // Check if user has access to this project
        const canManage = await canManageProject(projectId);

        // Also check if user is a member of the project
        const isMember = await prisma.projectMember.findFirst({
            where: {
                projectId,
                userId: currentUser.id,
                isActive: true,
            },
        });

        if (!canManage && !isMember) {
            return {
                success: false,
                error: "You don't have access to this project",
            };
        }

        const members = await prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        return {
            success: true,
            data: members.map((member) => ({
                ...member,
                payoutRate: member.payoutRate.toNumber(),
                chargeRate: member.chargeRate.toNumber(),
            })),
        };
    } catch (error) {
        console.error("Error fetching project members:", error);
        return {
            success: false,
            error: "Failed to fetch project members",
            data: [],
        };
    }
}

// Get all users (for adding to projects) - admin only
export async function getAllUsers() {
    try {
        const isAdmin = await isAdminUser();

        if (!isAdmin) {
            return {
                success: false,
                error: "Only admins can view all users",
                data: [],
            };
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: { name: "asc" },
        });

        return { success: true, data: users };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Failed to fetch users", data: [] };
    }
}
