"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSignIcon,
  DownloadCloud,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Transaction = {
  id: string;
  amount: number;
  transactionType: "EARNED" | "SPENT" | "BOUGHT";
  description: string | null;
  createdAt: string;
  invoiceId?: string; // Ajouter cette propriété
};

export function UserTransactionsTab({ userId }: { userId: string }) {
  const [filter, setFilter] = useState<string>("ALL");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", userId, filter],
    queryFn: async () => {
      const response = await fetch(`/api/user/transactions?filter=${filter}`);
      if (!response.ok)
        throw new Error("Impossible de charger les transactions");
      return response.json();
    },
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "EARNED":
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case "SPENT":
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      case "BOUGHT":
        return <DollarSignIcon className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "EARNED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Gagné
          </Badge>
        );
      case "SPENT":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Dépensé
          </Badge>
        );
      case "BOUGHT":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Acheté
          </Badge>
        );
      default:
        return null;
    }
  };

  const openInvoicePdf = (invoiceId: string) => {
    if (!invoiceId) return;
    window.open(`/api/user/invoices/${invoiceId}/pdf`, "_blank");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Historique des transactions</CardTitle>
            <CardDescription>
              Consultez toutes vos transactions de couronnes
            </CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les types</SelectItem>
              <SelectItem value="EARNED">Gagné</SelectItem>
              <SelectItem value="SPENT">Dépensé</SelectItem>
              <SelectItem value="BOUGHT">Acheté</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((transaction: Transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionBadge(transaction.transactionType)}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`font-medium ${
                          transaction.transactionType === "SPENT"
                            ? "text-red-600"
                            : transaction.transactionType === "EARNED"
                              ? "text-green-600"
                              : "text-blue-600"
                        }`}
                      >
                        {transaction.transactionType === "SPENT" ? "-" : "+"}
                        {transaction.amount} 👑
                      </TableCell>
                      <TableCell>
                        {transaction.description || "Pas de description"}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.transactionType === "BOUGHT" &&
                          transaction.invoiceId && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    openInvoicePdf(transaction.invoiceId!)
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  <DownloadCloud className="h-4 w-4" />
                                  <span className="sr-only">
                                    Telecharger la facture
                                  </span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Telecharger la facture</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Aucune transaction trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
