"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient, updateClient } from "@/lib/actions/clients";
import { type ClientFormData } from "@/lib/schemas/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const clientFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email").or(z.literal("")),
    company: z.string().optional(),
});

type FormData = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: {
        id: string;
        name: string;
        email: string | null;
        company: string | null;
    };
    onSuccess?: () => void;
}

export function ClientForm({
    open,
    onOpenChange,
    client,
    onSuccess,
}: ClientFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            name: client?.name || "",
            email: client?.email || "",
            company: client?.company || "",
        },
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);

        // Transform the form data to match ClientFormData type
        const clientData: ClientFormData = {
            name: data.name,
            email: data.email,
            company: data.company,
        };

        const result = client
            ? await updateClient(client.id, clientData)
            : await createClient(clientData);

        if (result.success) {
            reset();
            onOpenChange(false);
            onSuccess?.();
        } else {
            setError(result.error || "An error occurred");
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {client ? "Edit Client" : "New Client"}
                    </DialogTitle>
                    <DialogDescription>
                        {client
                            ? "Update client information"
                            : "Add a new client to your account"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Acme Inc."
                                {...register("name")}
                                disabled={loading}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@acme.com"
                                {...register("email")}
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                placeholder="Company name"
                                {...register("company")}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? "Saving..."
                                : client
                                  ? "Update"
                                  : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
