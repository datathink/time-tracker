"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectList } from "@/components/projects/ProjectList";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { getUsersProjects, getAllProjects } from "@/lib/actions/projects";
import type { Project } from "@/lib/types/project";
import { toast } from "sonner";

interface ProjectsPageClientProps {
    initialProjects: Project[];
    isAdmin: boolean;
}

export function ProjectsPageClient({
    initialProjects,
    isAdmin,
}: ProjectsPageClientProps) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const router = useRouter();

    const loadProjects = async (adminStatus: boolean) => {
        setLoading(true);
        if (adminStatus) {
            const result = await getAllProjects();
            if (result.success) {
                setProjects(result.data as Project[]);
            } else {
                toast.error(result.error || "Failed to load projects");
            }
        } else {
            const result = await getUsersProjects();
            if (result.success) {
                setProjects(result.data as Project[]);
            } else {
                toast.error(result.error || "Failed to load projects");
            }
        }
        setLoading(false);
    };

    const handleSuccess = () => {
        loadProjects(isAdmin);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    {isAdmin ? (
                        <p className="text-gray-600">
                            Manage users projects and team members
                        </p>
                    ) : (
                        <p className="text-gray-600">
                            View your list of projects
                        </p>
                    )}
                </div>
                <div className="flex gap-5">
                    {isAdmin && (
                        <Button onClick={() => setIsFormOpen(true)}>
                            <Plus className="h-4 w-4" />
                            New Project
                        </Button>
                    )}
                    {isAdmin && (
                        <Button
                            variant="outline"
                            onClick={() => router.push("/projects/archived")}
                        >
                            View Archived Projects
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading projects...</p>
                </div>
            ) : (
                <ProjectList
                    projects={projects}
                    loadProjects={loadProjects}
                    isAdmin={isAdmin}
                />
            )}

            {isAdmin && (
                <ProjectForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
