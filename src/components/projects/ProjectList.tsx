"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "./ProjectForm";
import { getProjects, deleteProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";

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
  } | null;
  _count?: {
    timeEntries: number;
    members: number;
  };
}

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const router = useRouter(); // Initialize router
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>(projects);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Removed teamProject and isTeamDialogOpen state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProjects = async () => {
    const result = await getProjects();
    if (result.success && result.data) {
      setAllProjects(result.data as Project[]);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  // New handler for navigation
  const handleManageTeam = (project: Project) => {
    router.push(`/projects/${project.id}/team`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    setDeletingId(id);
    const result = await deleteProject(id);

    if (result.success) {
      loadProjects();
    } else {
      alert(result.error || "Failed to delete project");
    }

    setDeletingId(null);
  };

  const handleSuccess = () => {
    setEditingProject(null);
    loadProjects();
  };

  useEffect(() => {
    setAllProjects(projects);
  }, [projects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (allProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No projects yet. Create your first project to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold pl-6">Project</TableHead>
              <TableHead className="font-bold">Client</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Budget</TableHead>
              <TableHead className="font-bold">Team</TableHead>
              <TableHead className="font-bold">Time Entries</TableHead>
              <TableHead className="font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="flex items-center gap-2 pl-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: project.color,
                      }}
                    />
                    <span className="font-medium">{project.name}</span>
                  </div>
                </TableCell>
                <TableCell>{project.client?.name || "-"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.budgetAmount ? `$${project.budgetAmount}` : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {project._count?.members || 0} members
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {project._count?.timeEntries || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(project)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleManageTeam(project)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Manage Team
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingId === project.id}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === project.id
                          ? "Deleting..."
                          : "Delete Project"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingProject && (
        <ProjectForm
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingProject(null);
          }}
          project={editingProject || undefined}
          onSuccess={handleSuccess}
        />
      )}

      {/* Removed ProjectTeamDialog component usage here */}
    </>
  );
}
