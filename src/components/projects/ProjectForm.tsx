"use client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProject, updateProject } from "@/lib/actions/projects";
import { type ProjectFormData } from "@/lib/schemas/project";
import { getClients } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Prisma } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";

type ClientWithCount = Prisma.ClientGetPayload<{
    select: {
        id: true;
        name: true;
        email: true;
        company: true;
        _count: {
            select: {
                projects: true;
            };
        };
    };
}>;

const projectFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    clientId: z.string().min(5, "Client is required"),
    description: z.string().optional(),
    budgetAmount: z.number().optional().nullable(),
    status: z.enum(["active", "archived", "completed"]),
    color: z.string(),
});

type FormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: {
        id: string;
        name: string;
        clientId: string;
        description: string | null;
        budgetAmount: number | null;
        status: string;
        color: string;
    };
}

export function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<ClientWithCount[]>([]);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            name: project?.name || "",
            clientId: project?.clientId || "",
            description: project?.description || "",
            budgetAmount: project?.budgetAmount || null,
            status:
                (project?.status as "active" | "archived" | "completed") ||
                "active",
            color: project?.color || "#6366f1",
        },
    });

    const selectedClientId = watch("clientId");

    useEffect(() => {
        const loadClients = async () => {
            const result = await getClients();
            if (result.success) {
                setClients(result.data);
            }
        };
        if (open) {
            loadClients();
        }
    }, [open]);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);

        // Transform the form data to match ProjectFormData type
        const projectData: ProjectFormData = {
            name: data.name,
            clientId: data.clientId,
            description: data.description,
            budgetAmount:
                data.budgetAmount !== null && data.budgetAmount !== undefined
                    ? data.budgetAmount
                    : null,
            status: data.status,
            color: data.color,
        };

        const result = project
            ? await updateProject(project.id, projectData)
            : await createProject(projectData);

        if (result.success) {
            reset();
            onOpenChange(false);
            router.push(`/projects/${result.data?.id}`);
        } else {
            setError(result.error || "An error occurred");
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {project ? "Edit Project" : "New Project"}
                    </DialogTitle>
                    <DialogDescription>
                        {project
                            ? "Update project information"
                            : "Create a new project to track time"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="name">
                                    Project Name{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Website Redesign"
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
                                <Label htmlFor="clientId">Client</Label>
                                <Select
                                    value={selectedClientId || undefined}
                                    onValueChange={(value) =>
                                        setValue("clientId", value)
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem
                                                key={client.id}
                                                value={client.id}
                                            >
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.clientId && (
                                    <p className="text-sm text-red-500">
                                        {errors.clientId.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={watch("status")}
                                    onValueChange={(value) =>
                                        setValue(
                                            "status",
                                            value as
                                                | "active"
                                                | "archived"
                                                | "completed"
                                        )
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="archived">
                                            Archived
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budgetAmount">Budget ($)</Label>
                                <Input
                                    id="budgetAmount"
                                    type="number"
                                    min="0"
                                    placeholder="5000.00"
                                    {...register("budgetAmount", {
                                        valueAsNumber: true,
                                    })}
                                    disabled={loading}
                                />
                                {errors.budgetAmount && (
                                    <p className="text-sm text-red-500">
                                        {errors.budgetAmount.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Project description..."
                                    rows={3}
                                    {...register("description")}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        className="w-16 h-10"
                                        {...register("color")}
                                        disabled={loading}
                                    />
                                    <Input
                                        type="text"
                                        value={watch("color")}
                                        onChange={(e) =>
                                            setValue("color", e.target.value)
                                        }
                                        placeholder="#6366f1"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
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
                                : project
                                  ? "Update"
                                  : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
