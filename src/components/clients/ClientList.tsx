"use client";

import { useState } from "react";
import { ClientForm } from "./ClientForm";
import { archiveClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Client {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    _count?: {
        projects: number;
    };
}

interface ClientListProps {
    clients: Client[];
    loadClients: () => void;
}

export function ClientList({ clients, loadClients }: ClientListProps) {
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [archivingId, setArchivingId] = useState<string | null>(null);
    const [confirmArchiveClient, setConfirmArchiveClient] =
        useState<Client | null>(null);

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsFormOpen(true);
    };

    const handleArchive = (client: Client) => {
        setConfirmArchiveClient(client);
    };

    const performArchive = async (id: string) => {
        setArchivingId(id);
        const result = await archiveClient(id);
        setConfirmArchiveClient(null);

        if (result.success) {
            loadClients();
            toast.success("Client archived successfully");
        } else {
            toast.error(result.error || "Failed to archive client");
        }

        setArchivingId(null);
    };

    const handleSuccess = () => {
        setEditingClient(null);
        loadClients();
    };

    if (clients.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">
                    No clients yet. Create your first client to get started.
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
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Projects</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">
                                    {client.name}
                                </TableCell>
                                <TableCell>{client.email || "-"}</TableCell>
                                <TableCell>{client.company || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {client._count?.projects || 0}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleEdit(client)
                                                }
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleArchive(client)
                                                }
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Archive
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {editingClient && (
                <ClientForm
                    open={isFormOpen}
                    onOpenChange={(open) => {
                        setIsFormOpen(open);
                        if (!open) setEditingClient(null);
                    }}
                    client={editingClient || undefined}
                    onSuccess={handleSuccess}
                />
            )}

            <Dialog
                open={!!confirmArchiveClient}
                onOpenChange={() => setConfirmArchiveClient(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete client</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this client? This action
                        cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmArchiveClient(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirmArchiveClient) {
                                    performArchive(confirmArchiveClient.id);
                                }
                            }}
                            disabled={archivingId === confirmArchiveClient?.id}
                        >
                            {archivingId === confirmArchiveClient?.id
                                ? "Archiving..."
                                : "Archive"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
