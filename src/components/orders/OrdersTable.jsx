import React from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User, FileText } from "lucide-react";
import { Download } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

const SETTLEMENT_COLORS = {
  "nierozliczone": "text-red-400",
  "rozliczone": "text-green-400",
  "częściowo rozliczone": "text-yellow-400",
};

const defaultCols = {
  printType: true, channel: true, priority: true, deadline: true,
  assignee: true, meters: true, settlement: true, files: true
};

export default function OrdersTable({ orders, onEdit, onDelete, visibleCols = defaultCols }) {
  const v = { ...defaultCols, ...visibleCols };

  if (!orders.length) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Brak zleceń do wyświetlenia</p>
      </div>
    );
  }

  const formatDate = (d) => {
    const downloadFile = async (url, name) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name || "plik";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

  } catch (err) {
    console.error("Download error:", err);
  }
};
    if (!d) return "—";
    try { return format(new Date(d), "d MMM yyyy", { locale: pl }); }
    catch { return "—"; }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-500 font-medium">Zlecenie</TableHead>
            <TableHead className="text-zinc-500 font-medium">Klient</TableHead>
            <TableHead className="text-zinc-500 font-medium">Status</TableHead>
            {v.printType && <TableHead className="text-zinc-500 font-medium">Produkt</TableHead>}
            {v.channel && <TableHead className="text-zinc-500 font-medium">Kanał</TableHead>}
            {v.priority && <TableHead className="text-zinc-500 font-medium">Priorytet</TableHead>}
            {v.deadline && <TableHead className="text-zinc-500 font-medium">Termin wyd.</TableHead>}
            {v.assignee && <TableHead className="text-zinc-500 font-medium">Pracownik</TableHead>}
            {v.meters && <TableHead className="text-zinc-500 font-medium">m²</TableHead>}
            {v.settlement && <TableHead className="text-zinc-500 font-medium">Rozliczenie</TableHead>}
            {v.files && <TableHead className="text-zinc-500 font-medium">Pliki</TableHead>}
            <TableHead className="text-zinc-500 font-medium w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id} className="border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer" onClick={() => onEdit(order)}>
              <TableCell className="text-zinc-100 font-medium max-w-[200px] truncate">{order.title}</TableCell>
              <TableCell className="text-zinc-400">{order.client_name}</TableCell>
              <TableCell><StatusBadge status={order.status} /></TableCell>
              {v.printType && (
  <TableCell className="text-zinc-400 text-sm max-w-[160px] truncate">
    {order.printType || order.print_type || "—"}
  </TableCell>
)}
              {v.channel && <TableCell className="text-zinc-400 text-sm">{order.channel || "—"}</TableCell>}
              {v.priority && <TableCell><PriorityBadge priority={order.priority} /></TableCell>}
              {v.deadline && <TableCell className="text-zinc-400 text-sm">{formatDate(order.deadline)}</TableCell>}
              {v.assignee && <TableCell className="text-zinc-400 text-sm">
                {order.assignee ? (
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />{order.assignee}
                  </span>
                ) : "—"}
              </TableCell>}
              {v.meters && <TableCell className="text-zinc-400 text-sm">
                {order.meters != null ? order.meters.toFixed(2) : "—"}
              </TableCell>}
              {v.settlement && <TableCell className={`text-sm font-medium ${SETTLEMENT_COLORS[order.settlement] || "text-zinc-400"}`}>
                {order.settlement || "—"}
              </TableCell>}
              {v.files && (
  <TableCell className="text-zinc-500 text-sm">
    <div className="flex items-center gap-2">
      <span>{order.files?.length || 0}</span>

      {order.files?.length > 0 && (
<button
  onClick={(e) => {
    e.stopPropagation();
    downloadFile(order.files[0].url, order.files[0].name);
  }}
  className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
>
  <Download className="w-3.5 h-3.5" />
</button>
      )}
    </div>
  </TableCell>
)}
              <TableCell>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => onEdit(order)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-zinc-800" onClick={() => onDelete(order)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
