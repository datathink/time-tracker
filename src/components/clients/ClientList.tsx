"use client";

import { useState } from "react";
import { ClientForm } from "./ClientForm";
import { getClients, deleteClient } from "@/lib/actions/clients";
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
import { AlertCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { set } from "zod";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
}

export function ClientList({ clients }: ClientListProps) {
  const [allClients, setAllClients] = useState<Client[]>(clients);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteClient, setConfirmDeleteClient] = useState<Client | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadClients = async () => {
    const result = await getClients();
    if (result.success) {
      setAllClients(result.data);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = (client: Client) => {
    setConfirmDeleteClient(client);
  };

  const performDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    const result = await deleteClient(id);

    if (result.success) {
      loadClients();
      setConfirmDeleteClient(null);
    } else {
      setDeleteError(result.error || "Failed to delete client");
    }

    setDeletingId(null);
  };

  const handleSuccess = () => {
    setEditingClient(null);
    loadClients();
  };

  if (allClients.length === 0) {
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
            {allClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(client)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(client)}
                        disabled={deletingId === client.id}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === client.id ? "Deleting..." : "Delete"}
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
        open={!!confirmDeleteClient}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteClient(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete client</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this client? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setConfirmDeleteClient(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDeleteClient) {
                  performDelete(confirmDeleteClient.id);
                }
              }}
              disabled={
                !!confirmDeleteClient && deletingId === confirmDeleteClient?.id
              }
            >
              {deletingId === confirmDeleteClient?.id
                ? "Deleting..."
                : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleteError && (
        <div className="fixed bottom-4 right-4 max-w-sm z-50">
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{deleteError}</AlertDescription>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="mt-2 h-auto p-0 text-destructive hover:text-destructive/80"
              onClick={() => setDeleteError(null)}
            >
              Dismiss
            </Button>
          </Alert>
        </div>
      )}
    </>
  );
}
