import { getProject } from "@/lib/actions/projects";
import { ProjectTeamPage } from "./ProjectTeamClient";
import { redirect } from "next/navigation";
import { getValidatedSessionWithRole } from "@/lib/auth/getValidatedSession";

export default async function Page({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;
    const { session } = await getValidatedSessionWithRole();
    if (!session) redirect("/auth/login");

    const { success, data: projectData } = await getProject(projectId);
    if (!success || !projectData) redirect("/projects");

    return <ProjectTeamPage project={projectData} />;
}
