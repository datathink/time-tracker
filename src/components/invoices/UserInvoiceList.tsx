"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

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
}

interface UserInvoiceListProps {
  invoices: UserInvoice[];
  onSelectInvoice?: (invoice: UserInvoice) => void;
  isLoading?: boolean;
}

export function UserInvoiceList({
  invoices,
  onSelectInvoice,
  isLoading,
}: UserInvoiceListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateTotal = (lineItems: UserLineItem[]) => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading invoices...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No invoices yet</p>
        <p className="text-sm text-gray-400">Create your first invoice to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => {
        const total = calculateTotal(invoice.lineItems);
        const itemCount = invoice.lineItems.length;

        return (
          <Card
            key={invoice.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectInvoice?.(invoice)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">
                    Invoice #{invoice.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <Badge variant="secondary">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(total)}
                  </span>
                </div>
                {itemCount > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {invoice.lineItems
                      .slice(0, 2)
                      .map((item) => item.name)
                      .join(", ")}
                    {itemCount > 2 && `... +${itemCount - 2} more`}
                  </div>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
