"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { clientSchema, type ClientFormData } from "@/lib/schemas/client";

// Create a new client
export async function createClient(data: ClientFormData) {
    try {
        const validated = clientSchema.parse(data);

        const client = await prisma.client.create({
            data: {
                name: validated.name,
                email: validated.email || null,
                company: validated.company || null,
                hourlyRate: validated.hourlyRate,
            },
        });

        revalidatePath("/clients");
        return { success: true, data: client };
    } catch (error) {
        console.error("Error creating client:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "Failed to create client" };
    }
}

// Update an existing client
export async function updateClient(id: string, data: ClientFormData) {
    try {
        const validated = clientSchema.parse(data);

        const client = await prisma.client.update({
            where: { id },
            data: {
                name: validated.name,
                email: validated.email || null,
                company: validated.company || null,
                hourlyRate: validated.hourlyRate,
            },
        });

        revalidatePath("/clients");
        return { success: true, data: client };
    } catch (error) {
        console.error("Error updating client:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        return { success: false, error: "Failed to update client" };
    }
}

// Delete a client
export async function deleteClient(id: string) {
    try {
        await prisma.client.delete({
            where: { id },
        });

        revalidatePath("/clients");
        return { success: true };
    } catch (error) {
        console.error("Error deleting client:", error);
        return { success: false, error: "Failed to delete client" };
    }
}

// Get all clients
export async function getClients() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: {
                        projects: true,
                    },
                },
            },
        });

        return { success: true, data: clients };
    } catch (error) {
        console.error("Error fetching clients:", error);
        return { success: false, error: "Failed to fetch clients", data: [] };
    }
}

// Get a single client by ID
export async function getClient(id: string) {
    try {
        const client = await prisma.client.findUnique({
            where: { id },
            include: {
                projects: true,
            },
        });

        if (!client) {
            return { success: false, error: "Client not found" };
        }

        return { success: true, data: client };
    } catch (error) {
        console.error("Error fetching client:", error);
        return { success: false, error: "Failed to fetch client" };
    }
}
