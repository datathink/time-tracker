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
import { ProjectMemberTable } from "@/components/projects/ProjectMemberTable";
import { ProjectMemberForm } from "@/components/projects/ProjectMemberForm";
import { getProjectMembers } from "@/lib/actions/project-members";
import { getProject } from "@/lib/actions/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prisma } from "@prisma/client";
import { Separator } from "@/components/ui/separator";

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
  chargeRate: number;
  payoutRate: number;
};

interface ProjectData {
  id: string;
  name: string;
}

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
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {project?.name}
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
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{members.length}</p>
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
            <CardTitle className="text-sm font-medium">Hourly Cost</CardTitle>
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
          <CardTitle className="text-lg font-bold">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectMemberTable members={members} onUpdate={loadData} />
        </CardContent>
      </Card>

      {/* Add Member Modal */}
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
