"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Users,
  DollarSign,
  Briefcase,
} from "lucide-react";
// Import the updated table component
import { ProjectMemberTable } from "@/components/projects/ProjectMemberTable";
import { ProjectMemberForm } from "@/components/projects/ProjectMemberForm";
import { getProjectMembers } from "@/lib/actions/project-members";
import { getProject } from "@/lib/actions/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prisma } from "@prisma/client";
import { Separator } from "@/components/ui/separator";

// --- Types ---
type RawProjectMemberWithUser = Prisma.ProjectMemberGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

type ProjectMemberWithUser = Omit<
  RawProjectMemberWithUser,
  "chargeRate" | "payoutRate"
> & {
  payoutRate: number;
  chargeRate: number;
};

interface ProjectData {
  id: string;
  name: string;
}
// --- End Types ---

export default function ProjectTeamPage() {
  const params = useParams();
  const router = useRouter();
  const projectIdParam = params.projectId;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [members, setMembers] = useState<ProjectMemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const [projectResult, membersResult] = await Promise.all([
      getProject(projectId),
      getProjectMembers(projectId),
    ]);

    if (projectResult.success && projectResult.data)
      setProject(projectResult.data);
    if (membersResult.success && membersResult.data)
      setMembers(membersResult.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    if (projectId) loadData();
  }, [projectId, loadData]);

  // Calculate simple stats
  const totalCostRate = members.reduce(
    (acc, curr) => acc + (curr.payoutRate || 0),
    0
  );
  const totalChargeRate = members.reduce(
    (acc, curr) => acc + (curr.chargeRate || 0),
    0
  );

  if (!projectId || (!project && !loading)) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Invalid Project ID</p>
      </div>
    );
  }

  if (loading && !project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {project?.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage team access, roles, and financial rates.
            </p>
          </div>
          <Button onClick={() => setIsAddMemberOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hourly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalCostRate.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total payout per hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hourly Billing
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalChargeRate.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total charge per hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Member List/Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectMemberTable members={members} onUpdate={loadData} />
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <ProjectMemberForm
        projectId={projectId}
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        onSuccess={loadData}
        existingMemberIds={members.map((m) => m.userId)}
      />
    </div>
  );
}
