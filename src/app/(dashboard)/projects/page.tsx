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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    const result = await getProjects();
    if (result.success) {
      setProjects(result.data as Project[]);
    } else {
      toast.error(result.error || "Failed to load projects");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSuccess = () => {
    loadProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600">Manage your projects and team members</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      ) : (
        <ProjectList projects={projects} />
      )}

      <ProjectForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
