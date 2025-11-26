"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";
import { getClients } from "@/lib/actions/clients";
import { Prisma } from "@prisma/client";

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
  const [clients, setClients] = useState<ClientWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    const result = await getClients();
    if (result.success) {
      setClients(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSuccess = () => {
    loadClients();
  };

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
        <ClientList clients={clients} />
      )}

      <ClientForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
