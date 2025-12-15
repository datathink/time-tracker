"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "./ProjectForm";
import { archiveProject } from "@/lib/actions/projects";
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
import { MoreHorizontal, Pencil, Users, Archive } from "lucide-react";
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

interface Project {
    id: string;
    name: string;
    clientId: string;
    description: string | null;
    budgetAmount: number | null;
    status: string;
    color: string;
    client?: {
        name: string;
    } | null;
    _count?: {
        timeEntries: number;
        members: number;
    };
}

interface ProjectListProps {
    projects: Project[];
    loadProjects: (adminStatus: boolean) => Promise<void>;
    isAdmin: boolean;
}

export function ProjectList({
    projects,
    loadProjects,
    isAdmin,
}: ProjectListProps) {
    const router = useRouter();
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [archivingId, setArchivingId] = useState<string | null>(null);
    const [confirmArchiveProject, setConfirmArchiveProject] =
        useState<Project | null>(null);

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsFormOpen(true);
    };

    const handleManageTeam = (project: Project) => {
        router.push(`/projects/${project.id}/team`);
    };

    const handleArchive = (project: Project) => {
        setConfirmArchiveProject(project);
    };

    const performArchive = async (id: string) => {
        setArchivingId(id);
        const result = await archiveProject(id);
        setConfirmArchiveProject(null);

        if (result.success) {
            loadProjects(isAdmin);
            toast.success("Project archived successfully");
        } else {
            toast.error(result.error || "Failed to archive project");
        }

        setArchivingId(null);
    };

    const handleSuccess = () => {
        setEditingProject(null);
        loadProjects(isAdmin);
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
                <p className="text-gray-500">
                    No projects yet.{" "}
                    {isAdmin
                        ? "Create your first project to get started."
                        : "Ask an admin to add you to a project to get started."}
                </p>
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
                            <TableHead className="font-bold">Client</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold">Budget</TableHead>
                            <TableHead className="font-bold">Team</TableHead>
                            <TableHead className="font-bold">
                                Time Entries
                            </TableHead>
                            <TableHead className="font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.id}>
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
                                <TableCell>
                                    {project.client?.name || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={getStatusColor(
                                            project.status
                                        )}
                                    >
                                        {project.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {project.budgetAmount
                                        ? `$${project.budgetAmount}`
                                        : "-"}
                                </TableCell>
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
                                <TableCell>
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
                                                    handleEdit(project)
                                                }
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit Project
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleManageTeam(project)
                                                }
                                            >
                                                <Users className="mr-2 h-4 w-4" />
                                                Manage Team
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleArchive(project)
                                                }
                                                disabled={
                                                    archivingId === project.id
                                                }
                                                className="text-red-600"
                                            >
                                                <Archive className="mr-2 h-4 w-4" />
                                                {archivingId === project.id
                                                    ? "Archiving..."
                                                    : "Archive Project"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {editingProject && (
                <ProjectForm
                    open={isFormOpen}
                    onOpenChange={(open) => {
                        setIsFormOpen(open);
                        if (!open) setEditingProject(null);
                    }}
                    project={editingProject || undefined}
                    onSuccess={handleSuccess}
                />
            )}

            <AlertDialog
                open={!!confirmArchiveProject}
                onOpenChange={() => setConfirmArchiveProject(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to archive{" "}
                            <span className="font-bold">
                                {confirmArchiveProject?.name}?.
                            </span>{" "}
                            This will archive the project and all associated
                            data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                performArchive(confirmArchiveProject!.id)
                            }
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Archive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
