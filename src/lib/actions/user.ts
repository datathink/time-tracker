"use server";

import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { usernameSchema, type UsernameUpdateData } from "@/lib/schemas/user";

// Update name on User model
export async function updateUserName(userId: string, name: UsernameUpdateData) {
    try {
        const validatedName = usernameSchema.parse(name);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name: validatedName.fullName },
        });
        return { success: true, data: updatedUser };
    } catch (error: unknown) {
        console.error("Error updating user name:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "Failed to update user name" };
    }
}

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { name: "asc" },
        });
        return { success: true, data: users };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Failed to fetch users", data: [] };
    }
}

export async function getUsersForRSC() {
    const users = await prisma.user.findMany({
        orderBy: { name: "asc" },
    });
    return users;
}
