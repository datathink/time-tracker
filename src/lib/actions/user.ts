"use server";

import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { usernameSchema, type UsernameUpdateData } from "@/lib/schemas/user";
import { revalidatePath } from "next/cache";

// get list of users with profiles
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });
    return { success: true, data: users };
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

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

export async function deactivateUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "inactive" },
    });
    revalidatePath("/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deactivating user:", error);
    return { success: false, error: "Failed to deactivate user" };
  }
}

export async function reactivateUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "active" },
    });
    revalidatePath("/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deactivating user:", error);
    return { success: false, error: "Failed to reactivate user" };
  }
}
