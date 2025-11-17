"use server";

import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { profileSchema, type ProfileFormData } from "@/lib/schemas/profile";

// Get current user from session
async function getCurrentUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    return session.user;
}

// Create user profile
export async function createProfile(data: ProfileFormData) {
    try {
        const user = await getCurrentUser();
        const validated = profileSchema.parse(data);

        // Check if profile already exists
        const existingProfile = await prisma.userProfile.findUnique({
            where: { userId: user.id },
        });

        if (existingProfile) {
            return {
                success: false,
                error: "Profile already exists for this user",
            };
        }

        const profile = await prisma.userProfile.create({
            data: {
                userId: user.id,
                phone: validated.phoneNumber,
                address: validated.address,
                birthDate: new Date(validated.birthDate),
            },
        });

        return { success: true, data: profile };
    } catch (error: unknown) {
        console.error("Error creating profile:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "Failed to create profile" };
    }
}

// Update user's profile
export async function updateProfile(
    userProfileId: string,
    data: ProfileFormData
) {
    try {
        const user = await getCurrentUser();
        const validated = profileSchema.parse(data);

        // Verify the profile belongs to the current user
        const existingProfile = await prisma.userProfile.findUnique({
            where: { id: userProfileId },
        });

        if (!existingProfile || existingProfile.userId !== user.id) {
            return {
                success: false,
                error: "Unauthorized to update this profile",
            };
        }

        const profile = await prisma.userProfile.update({
            where: { id: userProfileId },
            data: {
                phone: validated.phoneNumber,
                address: validated.address,
                birthDate: new Date(validated.birthDate),
            },
        });

        return { success: true, data: profile };
    } catch (error: unknown) {
        console.error("Error updating profile:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "Failed to update profile" };
    }
}

// Fetch the current user's profile
export async function getUserProfile() {
    try {
        const user = await getCurrentUser();
        const profile = await prisma.userProfile.findUnique({
            where: { userId: user.id },
        });

        return { success: true, data: profile };
    } catch (error: unknown) {
        console.error("Error fetching user profile:", error);
        return { success: false, error: "Failed to fetch user profile" };
    }
}
