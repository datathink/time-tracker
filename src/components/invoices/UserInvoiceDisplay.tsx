"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Mail, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserLineItem {
  id: string;
  invoiceId: string;
  name: string;
  summary: string;
  amount: number;
}

interface UserInvoiceWithItems {
  id: string;
  userId: string;
  lineItems: UserLineItem[];
  user?: {
    name?: string;
    email?: string;
  };
}

interface UserInvoiceDisplayProps {
  invoice: UserInvoiceWithItems;
  onDownload?: () => void;
  onSendEmail?: () => void;
  onEdit?: () => void;
}

export function UserInvoiceDisplay({
  invoice,
  onDownload,
  onSendEmail,
  onEdit,
}: UserInvoiceDisplayProps) {
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Invoice #{invoice.id.slice(0, 8).toUpperCase()}</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onSendEmail && (
                <DropdownMenuItem onClick={onSendEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  Edit Invoice
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Invoice Recipient */}
        {invoice.user && (
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">BILL TO</h3>
            <div>
              <p className="font-medium">{invoice.user.name || "User"}</p>
              <p className="text-sm text-gray-600">{invoice.user.email}</p>
            </div>
          </div>
        )}

        {/* Line Items */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-600">INVOICE ITEMS</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Description</th>
                  <th className="text-left py-2 font-semibold">Details</th>
                  <th className="text-right py-2 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{item.name}</p>
                    </td>
                    <td className="py-3 text-gray-600 text-xs">{item.summary}</td>
                    <td className="text-right py-3 font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {invoice.lineItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No items in this invoice</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
