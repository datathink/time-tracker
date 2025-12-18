"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArchivedProjectList } from "@/components/projects/ArchivedProjectList";
import { getAllArchivedProjects } from "@/lib/actions/projects";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import type { Project } from "@/lib/types/project";

interface ArchivedProjectsPageClientProps {
    initialProjects: Project[];
    isAdmin: boolean;
}

export function ArchivedProjectsPageClient({
    initialProjects,
    isAdmin,
}: ArchivedProjectsPageClientProps) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const loadProjects = async () => {
        setLoading(true);
        const result = await getAllArchivedProjects();
        if (result.success) {
            setProjects(result.data as Project[]);
        } else {
            toast.error(result.error || "Failed to load projects");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Archived Projects</h1>
                    <p className="text-gray-600">
                        View all your archived projects
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/projects")}
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Projects
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading projects...</p>
                </div>
            ) : (
                <ArchivedProjectList
                    projects={projects}
                    loadProjects={loadProjects}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
}
