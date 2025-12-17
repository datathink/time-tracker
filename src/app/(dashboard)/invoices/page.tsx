"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserInvoiceList } from "@/components/invoices/UserInvoiceList";
import { UserInvoiceDisplay } from "@/components/invoices/UserInvoiceDisplay";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";

interface UserLineItem {
  id: string;
  invoiceId: string;
  name: string;
  summary: string;
  amount: number;
}

interface UserInvoice {
  id: string;
  userId: string;
  lineItems: UserLineItem[];
  user?: {
    name?: string;
    email?: string;
  };
}

export default function UserInvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<UserInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<UserInvoice | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // TODO: Replace with actual API call to fetch user invoices
        const response = await fetch(`/api/invoices/user/${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
          if (data.length > 0) {
            setSelectedInvoice(data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [session?.user?.id]);

  const handleDownload = async () => {
    if (!selectedInvoice) return;
    toast.success("Downloading invoice...");
    // TODO: Implement PDF download functionality
  };

  const handleSendEmail = async () => {
    if (!selectedInvoice) return;
    toast.success("Email sent successfully");
    // TODO: Implement email sending functionality
  };

  const handleEditInvoice = () => {
    if (!selectedInvoice) return;
    // TODO: Navigate to edit page or open modal
    toast.info("Edit functionality coming soon");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600">View and manage your invoices</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold mb-4">All Invoices</h2>
            <UserInvoiceList
              invoices={invoices}
              onSelectInvoice={setSelectedInvoice}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Invoice Detail */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <UserInvoiceDisplay
              invoice={selectedInvoice}
              onDownload={handleDownload}
              onSendEmail={handleSendEmail}
              onEdit={handleEditInvoice}
            />
          ) : (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-gray-500">
                Select an invoice from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
