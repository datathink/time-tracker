import { getValidatedSessionWithRole } from "@/lib/auth/getValidatedSession";
import { getArchivedProjectsRSC } from "@/lib/actions/projects";
import { ArchivedProjectsPageClient } from "./ArchivedProjectsPageClient";

export default async function ArchivedProjectsPage() {
    const { isAdmin } = await getValidatedSessionWithRole();

    const projects = await getArchivedProjectsRSC();

    return (
        <ArchivedProjectsPageClient
            initialProjects={projects}
            isAdmin={isAdmin}
        />
    );
}
