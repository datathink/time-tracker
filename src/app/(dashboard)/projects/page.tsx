"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectList } from "@/components/projects/ProjectList";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { getUsersProjects, getAllProjects } from "@/lib/actions/projects";
import { isAdminUser } from "@/lib/actions/clients";
import { toast } from "sonner";

interface Project {
    id: string;
    name: string;
    clientId: string;
    description: string | null;
    budgetAmount: number | null;
    status: string;
    color: string;
    client?: {
        name: string;
        clientId: string | null;
    } | null;
    _count?: {
        timeEntries: number;
        members: number;
    };
}

export default function ProjectsPage() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

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

    useEffect(() => {
        const checkAdmin = async () => {
            if (!session?.user) {
                setLoading(false);
                return;
            }
            const adminStatus = await isAdminUser();
            setIsAdmin(adminStatus);
            await loadProjects(adminStatus);
        };
        checkAdmin();
    }, [session?.user]);

    const handleSuccess = () => {
        loadProjects(isAdmin);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-gray-600">
                        Manage your projects and team members
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                )}
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
