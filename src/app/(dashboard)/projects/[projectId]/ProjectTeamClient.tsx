"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, DollarSign, Briefcase } from "lucide-react";
import { ProjectMemberTable } from "@/components/projects/ProjectMemberTable";
import { ProjectMemberForm } from "@/components/projects/ProjectMemberForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProjectMembers } from "@/lib/actions/project-members";
import type { ProjectData, ProjectMember } from "@/lib/types/project";

interface ProjectTeamPageProps {
    project: ProjectData;
}

export function ProjectTeamPage({ project }: ProjectTeamPageProps) {
    const [members, setMembers] = useState<ProjectMember[]>(project.members);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

    const loadMembers = useCallback(async () => {
        const result = await getProjectMembers(project.id);
        if (result.success && result.data) {
            setMembers(result.data as ProjectMember[]);
        }
    }, [project.id]);

    const totalCostRate = members.reduce(
        (acc, curr) => acc + (curr.payoutRate || 0),
        0
    );
    const totalChargeRate = members.reduce(
        (acc, curr) => acc + (curr.chargeRate || 0),
        0
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
            {/* Page Header */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            {project.name}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Manage team access, roles, and financial rates.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="px-6"
                        onClick={() => setIsAddMemberOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Member
                    </Button>
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
        </div>
    );
}
