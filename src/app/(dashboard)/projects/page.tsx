import { getValidatedSessionWithRole } from "@/lib/auth/getValidatedSession";
import {
    getProjectsForUserRSC,
    getAllProjectsForRSC,
} from "@/lib/actions/projects";
import { ProjectsPageClient } from "./ProjectsPageClient";

export default async function ProjectsPage() {
    const { session, isAdmin } = await getValidatedSessionWithRole();

    const projects = isAdmin
        ? await getAllProjectsForRSC()
        : await getProjectsForUserRSC(session.user.id);

    return <ProjectsPageClient initialProjects={projects} isAdmin={isAdmin} />;
}
