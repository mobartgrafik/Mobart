import React from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User, FileText, Download } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

const STATUSES = [
  "Nowe",
  "W trakcie",
  "Do przekazania",
  "Wydrukowane",
  "Zakończone"
];

const SETTLEMENT_COLORS = {
  "nierozliczone": "text-red-400",
  "rozliczone": "text-green-400",
  "częściowo rozliczone": "text-yellow-400",
};

const defaultCols = {
  printType: true,
  channel: true,
  priority: true,
  deadline: true,
  assignee: true,
  meters: true,
  settlement: true,
  files: true
};

export default function OrdersTable({ orders, onEdit, onDelete, visibleCols = defaultCols }) {

  const queryClient = useQueryClient();
  const v = { ...defaultCols, ...visibleCols };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return format(new Date(d), "d MMM yyyy", { locale: pl });
    } catch {
      return "—";
    }
  };

  const changeStatus = async (order, status) => {
    await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id);

    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const downloadFile = async (url, name) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = name;

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error("Download error:", err);
    }
  };

  if (!orders.length) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Brak zleceń do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead>Zlecenie</TableHead>
            <TableHead>Klient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.map(order => (
            <TableRow
              key={order.id}
              className="border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer"
              onClick={() => onEdit(order)}
            >
              <TableCell>{order.title}</TableCell>
              <TableCell>{order.client_name}</TableCell>

              <TableCell onClick={e => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <StatusBadge status={order.status} />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {STATUSES.map(status => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => changeStatus(order, status)}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>

              {/* reszta twojego kodu bez zmian */}

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
