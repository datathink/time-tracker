"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Users,
    DollarSign,
    Briefcase,
    Archive,
    ArchiveRestore,
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
import { getProjectMembers } from "@/lib/actions/project-members";
import { archiveProject, updateProject } from "@/lib/actions/projects";
import type { ProjectData, ProjectMember } from "@/lib/types/project";

interface ProjectTeamPageProps {
    project: ProjectData;
}

export function ProjectTeamPage({ project }: ProjectTeamPageProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [members, setMembers] = useState<ProjectMember[]>(project.members);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
    const [isUnarchiveConfirmOpen, setIsUnarchiveConfirmOpen] = useState(false);

    const isArchived = project.status === "archived";

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

    const handleUnarchiveProject = async () => {
        startTransition(async () => {
            const result = await updateProject(project.id, {
                name: project.name,
                clientId: project.clientId,
                description: project.description ?? "",
                budgetAmount: project.budgetAmount,
                status: "active",
                color: project.color,
            });
            if (result.success) {
                toast.success("Project unarchived successfully.");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to unarchive project.");
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
        <div className="space-y-10">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {project.name}
                            </h1>
                            {isArchived && (
                                <Badge
                                    variant="secondary"
                                    className="bg-gray-200 text-gray-600"
                                >
                                    Archived
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {isArchived
                                ? "This project is archived and read-only."
                                : "Manage team access, roles, and financial rates."}
                        </p>
                    </div>

                    <div className="flex gap-4 md:gap-6">
                        {isArchived ? (
                            <Button
                                onClick={() => setIsUnarchiveConfirmOpen(true)}
                                disabled={isPending}
                            >
                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                {isPending ? "Unarchiving..." : "Unarchive"}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditFormOpen(true)}
                                >
                                    <Edit />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setIsArchiveConfirmOpen(true)
                                    }
                                >
                                    <Archive />
                                    Archive
                                </Button>
                                <Button
                                    onClick={() => setIsAddMemberOpen(true)}
                                >
                                    <Plus />
                                    Add Member
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div
                className={`grid gap-6 md:grid-cols-3 ${isArchived ? "opacity-60" : ""}`}
            >
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
            <Card
                className={`rounded-2xl shadow-sm ${isArchived ? "opacity-60" : ""}`}
            >
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold">
                        Team Members
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ProjectMemberTable
                        members={members}
                        onUpdate={loadMembers}
                        isArchived={isArchived}
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

            <ProjectForm
                open={editFormOpen}
                onOpenChange={setEditFormOpen}
                project={project}
            />

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

            <AlertDialog
                open={isUnarchiveConfirmOpen}
                onOpenChange={setIsUnarchiveConfirmOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unarchive Project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will restore the project to active status. Team
                            members will be able to log time again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnarchiveProject}
                            disabled={isPending}
                        >
                            {isPending ? "Unarchiving..." : "Unarchive"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
