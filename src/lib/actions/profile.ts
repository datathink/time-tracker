"use server";

import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { profileSchema, type ProfileFormData } from "@/lib/schemas/profile";

// Create user profile
export async function createProfile(data: ProfileFormData) {
    try {
        const validated = profileSchema.parse(data);

        const profile = await prisma.userProfile.create({
            data: validated,
        });

        return { success: true, data: profile };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "Failed to create profile" };
    }
}

// Update user's profile
export async function updateProfile(userId: string, data: ProfileFormData) {
    try {
        const validated = profileSchema.parse(data);

        const profile = await prisma.userProfile.update({
            where: { userId },
            data: validated,
        });

        return { success: true, data: profile };
    } catch (error) {
        console.error("Error updating profile:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "Failed to update profile" };
    }
}

// Fetch the current user's profile
export async function getUserProfile(userId: string) {
    try {
        const profile = await prisma.userProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            return { success: false, error: "Profile not found" };
        }

        return { success: true, data: profile };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return { success: false, error: "Failed to fetch user profile" };
    }
}