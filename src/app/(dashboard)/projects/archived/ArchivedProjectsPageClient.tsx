"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArchivedProjectList } from "@/components/projects/ArchivedProjectList";
import { ArrowLeft } from "lucide-react";
import type { Project } from "@/lib/types/project";
import Link from "next/link";

interface ArchivedProjectsPageClientProps {
    initialProjects: Project[];
    isAdmin: boolean;
}

export function ArchivedProjectsPageClient({
    initialProjects,
    isAdmin,
}: ArchivedProjectsPageClientProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Archived Projects</h1>
                    <p className="text-gray-600">
                        View all your archived projects
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/projects">
                        <ArrowLeft className="h-4 w-4" /> Back to Projects
                    </Link>
                </Button>
            </div>

            <ArchivedProjectList projects={initialProjects} isAdmin={isAdmin} />
        </div>
    );
}
