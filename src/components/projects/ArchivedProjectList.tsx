"use client";

import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Project } from "@/lib/types/project";

interface ProjectListProps {
    projects: Project[];
    isAdmin: boolean;
}

export function ArchivedProjectList({
    projects,
    isAdmin,
}: ProjectListProps) {
    const router = useRouter();

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

    if (projects.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No archived projects found.</p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold pl-6">
                                Project
                            </TableHead>
                            {isAdmin && <TableHead>Client</TableHead>}
                            <TableHead className="font-bold">Status</TableHead>
                            {isAdmin && (
                                <TableHead className="font-bold">
                                    Budget
                                </TableHead>
                            )}
                            <TableHead className="font-bold">Team</TableHead>
                            <TableHead className="font-bold">
                                Time Entries
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="h-15">
                        {projects.map((project) => (
                            <TableRow
                                key={project.id}
                                className="h-14 cursor-pointer hover:bg-muted/50"
                                onClick={() => router.push(`/projects/${project.id}`)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-2 pl-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: project.color,
                                            }}
                                        />
                                        <span className="font-medium">
                                            {project.name}
                                        </span>
                                    </div>
                                </TableCell>
                                {isAdmin && (
                                    <TableCell>
                                        {project.client?.name || "-"}
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Badge
                                        className={getStatusColor(
                                            project.status
                                        )}
                                    >
                                        {project.status}
                                    </Badge>
                                </TableCell>
                                {isAdmin && (
                                    <TableCell>
                                        {project.budgetAmount
                                            ? `$${project.budgetAmount}`
                                            : "-"}
                                    </TableCell>
                                )}
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
