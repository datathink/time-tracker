"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "./ProjectForm";
import { updateProject, deleteProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type ProjectFormData } from "@/lib/schemas/project";
import { type Project } from "@/lib/types/project";

interface ProjectListProps {
    projects: Project[];
    loadProjects: (adminStatus: boolean) => Promise<void>;
    isAdmin: boolean;
}

export function ArchivedProjectList({
    projects,
    loadProjects,
    isAdmin,
}: ProjectListProps) {
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [confirmRestoreProject, setConfirmRestoreProject] =
        useState<Project | null>(null);
    const [confirmDeleteProject, setConfirmDeleteProject] =
        useState<Project | null>(null);

    const handleRestore = (project: Project) => {
        setConfirmRestoreProject(project);
    };

    const handleDelete = (project: Project) => {
        setConfirmDeleteProject(project);
    };

    const performRestore = async (project: Project) => {
        setRestoringId(project.id);

        const updatedProjectData: ProjectFormData = {
            name: project.name,
            clientId: project.clientId,
            description: project.description ?? "",
            budgetAmount: project.budgetAmount,
            status: "active",
            color: project.color,
        };

        const result = await updateProject(project.id, updatedProjectData);
        setConfirmRestoreProject(null);

        if (result.success) {
            loadProjects(isAdmin);
            toast.success("Project restored successfully");
        } else {
            toast.error(result.error || "Failed to restore project");
        }

        setRestoringId(null);
    };

    const performDelete = async (id: string) => {
        setDeletingId(id);
        const result = await deleteProject(id);
        setConfirmDeleteProject(null);

        if (result.success) {
            loadProjects(isAdmin);
            toast.success("Project deleted permanently");
        } else {
            toast.error(result.error || "Failed to delete project");
        }

        setDeletingId(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "archived":
                return "bg-gray-100 text-gray-800";
            case "completed":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (projects.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No archived projects found.</p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold pl-6">
                                Project
                            </TableHead>
                            {isAdmin && <TableHead>Client</TableHead>}
                            <TableHead className="font-bold">Status</TableHead>
                            {isAdmin && (
                                <TableHead className="font-bold">
                                    Budget
                                </TableHead>
                            )}
                            <TableHead className="font-bold">Team</TableHead>
                            <TableHead className="font-bold">
                                Time Entries
                            </TableHead>
                            {isAdmin && (
                                <TableHead className="font-bold">
                                    Actions
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="h-15">
                        {projects.map((project) => (
                            <TableRow>
                                <TableCell>
                                    <div className="flex items-center gap-2 pl-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: project.color,
                                            }}
                                        />
                                        <span className="font-medium">
                                            {project.name}
                                        </span>
                                    </div>
                                </TableCell>
                                {isAdmin && (
                                    <TableCell>
                                        {project.client?.name || "-"}
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Badge
                                        className={getStatusColor(
                                            project.status
                                        )}
                                    >
                                        {project.status}
                                    </Badge>
                                </TableCell>
                                {isAdmin && (
                                    <TableCell>
                                        {project.budgetAmount
                                            ? `$${project.budgetAmount}`
                                            : "-"}
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Badge variant="secondary">
                                        {project._count?.members || 0} members
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {project._count?.timeEntries || 0}
                                    </Badge>
                                </TableCell>
                                {isAdmin && (
                                    <TableCell
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleRestore(project)
                                                    }
                                                    disabled={
                                                        restoringId ===
                                                        project.id
                                                    }
                                                >
                                                    <ArchiveRestore className="mr-2 h-4 w-4" />
                                                    {restoringId === project.id
                                                        ? "Restoring..."
                                                        : "Restore Project"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <AlertDialog
                open={!!confirmRestoreProject}
                onOpenChange={() => setConfirmRestoreProject(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore Project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to restore{" "}
                            <span className="font-bold">
                                {confirmRestoreProject?.name}
                            </span>
                            ? This will make the project active again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                performRestore(confirmRestoreProject!)
                            }
                            disabled={restoringId === confirmRestoreProject?.id}
                        >
                            {restoringId === confirmRestoreProject?.id
                                ? "Restoring..."
                                : "Restore"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={!!confirmDeleteProject}
                onOpenChange={() => setConfirmDeleteProject(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Permanently Delete Project?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete{" "}
                            <span className="font-bold">
                                {confirmDeleteProject?.name}
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                performDelete(confirmDeleteProject!.id)
                            }
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deletingId === confirmDeleteProject?.id}
                        >
                            {deletingId === confirmDeleteProject?.id
                                ? "Deleting..."
                                : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
