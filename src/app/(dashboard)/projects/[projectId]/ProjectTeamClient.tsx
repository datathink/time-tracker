"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Users,
    DollarSign,
    Briefcase,
    ArrowLeft,
    Archive,
    Edit,
} from "lucide-react";
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
import { ProjectMemberTable } from "@/components/projects/ProjectMemberTable";
import { ProjectMemberForm } from "@/components/projects/ProjectMemberForm";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProjectMembers } from "@/lib/actions/project-members";
import { archiveProject } from "@/lib/actions/projects";
import type { ProjectData, ProjectMember } from "@/lib/types/project";

interface ProjectTeamPageProps {
    project: ProjectData;
}

export function ProjectTeamPage({ project }: ProjectTeamPageProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [editingProject, setEditingProject] = useState<ProjectData | null>(
        null
    );
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [members, setMembers] = useState<ProjectMember[]>(project.members);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

    const handleEdit = (project: ProjectData) => {
        setEditingProject(project);
        setIsFormOpen(true);
    };

    const handleSuccess = () => {
        setEditingProject(null);
        setIsFormOpen(false);
        router.refresh();
        loadMembers();
    };

    const loadMembers = useCallback(async () => {
        const result = await getProjectMembers(project.id);
        if (result.success && result.data) {
            setMembers(result.data as ProjectMember[]);
        }
    }, [project.id]);

    const handleArchiveProject = async () => {
        startTransition(async () => {
            const result = await archiveProject(project.id);
            if (result.success) {
                toast.success("Project archived successfully.");
                router.push("/projects");
            } else {
                toast.error(result.error || "Failed to archive project.");
            }
        });
    };

    const totalCostRate = members.reduce(
        (acc, curr) => acc + (curr.payoutRate || 0),
        0
    );
    const totalChargeRate = members.reduce(
        (acc, curr) => acc + (curr.chargeRate || 0),
        0
    );

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-10">
            {/* Page Header */}
            <div className="space-y-6">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push("/projects")}
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Projects
                </Button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            {project.name}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Manage team access, roles, and financial rates.
                        </p>
                    </div>

                    <div className="flex gap-4 md:gap-6">
                        <Button
                            size="sm"
                            className="px-6"
                            onClick={() => setIsAddMemberOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Member
                        </Button>
                        <Button
                            size="sm"
                            className="px-6"
                            onClick={() => handleEdit(project)}
                        >
                            <Edit className="h-4 w-4" />
                            Edit Project
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="px-6"
                            onClick={() => setIsArchiveConfirmOpen(true)}
                        >
                            <Archive className=" h-4 w-4" />
                            Archive Project
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Stats Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium">
                            Total Members
                        </CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">
                            {members.length}
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium">
                            Hourly Billing
                        </CardTitle>
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">
                            ${totalChargeRate.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total charge per hour
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium">
                            Hourly Cost
                        </CardTitle>
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">
                            ${totalCostRate.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total payout per hour
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Members Table */}
            <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold">
                        Team Members
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ProjectMemberTable
                        members={members}
                        onUpdate={loadMembers}
                    />
                </CardContent>
            </Card>

            {/* Add Member Modal */}
            <ProjectMemberForm
                projectId={project.id}
                open={isAddMemberOpen}
                onOpenChange={setIsAddMemberOpen}
                onSuccess={loadMembers}
                existingMemberIds={members.map((m) => m.userId)}
            />

            {editingProject && (
                <ProjectForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    project={editingProject}
                    onSuccess={handleSuccess}
                />
            )}

            <AlertDialog
                open={isArchiveConfirmOpen}
                onOpenChange={setIsArchiveConfirmOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will archive the project. You can find it later
                            in the archived projects section.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleArchiveProject}
                            disabled={isPending}
                        >
                            {isPending ? "Archiving..." : "Archive"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
