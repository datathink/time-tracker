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

        const profile = await prisma.userProfile.create({
            data: {
                userId: user.id,
                firstName: validated.firstName,
                lastName: validated.lastName,
                phone: validated.phoneNumber,
                address: validated.address,
                birthDate: validated.birthDate,
            },
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
export async function updateProfile(userProfileId: string, data: ProfileFormData) {
    try {
        const validated = profileSchema.parse(data);

        const profile = await prisma.userProfile.update({
            where: { id: userProfileId },
            data: {
                firstName: validated.firstName,
                lastName: validated.lastName,
                phone: validated.phoneNumber,
                address: validated.address,
                birthDate: validated.birthDate
            },
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
export async function getUserProfile() {
    try {
        const user = await getCurrentUser();
        const profile = await prisma.userProfile.findUnique({
            where: { id: user.id },
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