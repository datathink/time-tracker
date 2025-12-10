"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";
import { getClients, isAdminUser } from "@/lib/actions/clients";
import { Prisma } from "@prisma/client";
import { toast } from "sonner";

type ClientWithCount = Prisma.ClientGetPayload<{
    include: {
        _count: {
            select: {
                projects: true;
            };
        };
    };
}>;

export default function ClientsPage() {
    const { data: session } = useSession();
    const [clients, setClients] = useState<ClientWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!session?.user) {
                setLoading(false);
                return;
            }
            const adminStatus = await isAdminUser();
            setIsAdmin(adminStatus);
            adminStatus ? loadClients() : setLoading(false);
        };
        checkAdmin();
    }, [session?.user]);

    const handleSuccess = () => {
        loadClients();
    };

    const loadClients = async () => {
        setLoading(true);
        const result = await getClients();
        if (result.success) {
            setClients(result.data as ClientWithCount[]);
        } else {
            toast.error(result.error || "Failed to load clients");
        }
        setLoading(false);
    };

    if (isAdmin) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Clients</h1>
                        <p className="text-gray-600">Manage your clients</p>
                    </div>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Client
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading clients...</p>
                    </div>
                ) : (
                    <ClientList clients={clients} loadClients={loadClients} />
                )}

                <ClientForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSuccess={handleSuccess}
                />
            </div>
        );
    } else {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">
                    You do not have permission to access this page.
                </p>
            </div>
        );
    }
}
