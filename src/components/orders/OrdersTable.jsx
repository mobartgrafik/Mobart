import React from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { supabase } from "@/supabase";
import { useQueryClient } from "@tanstack/react-query";

import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow
} from "@/components/ui/table";

import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User, FileText, Download } from "lucide-react";

import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

const STATUSES = [
"Nowe",
"W trakcie",
"Do przekazania",
"Przekazane",
"Zakończone"
];

const PRIORITIES = [
"Niski",
"Normalny",
"Wysoki",
"Pilne"
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

export default function OrdersTable({
orders,
onEdit,
onDelete,
visibleCols = defaultCols
}) {

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

const changePriority = async (order, priority) => {
await supabase
.from("orders")
.update({ priority })
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

{v.printType && <TableHead>Produkt</TableHead>}
{v.channel && <TableHead>Kanał</TableHead>}
{v.priority && <TableHead>Priorytet</TableHead>}
{v.deadline && <TableHead>Termin wyd.</TableHead>}
{v.assignee && <TableHead>Pracownik</TableHead>}
{v.meters && <TableHead>m²</TableHead>}
{v.settlement && <TableHead>Rozliczenie</TableHead>}
{v.files && <TableHead>Pliki</TableHead>}

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

<TableCell onClick={(e) => e.stopPropagation()}>
<DropdownMenu>
<DropdownMenuTrigger asChild>
<div>
<StatusBadge status={order.status} />
</div>
</DropdownMenuTrigger>

<DropdownMenuContent className="bg-zinc-900 border-zinc-700">
{STATUSES.map(s => (
<DropdownMenuItem
key={s}
onClick={() => changeStatus(order, s)}
className="text-zinc-300 hover:bg-zinc-800"
>
{s}
</DropdownMenuItem>
))}
</DropdownMenuContent>

</DropdownMenu>
</TableCell>

{v.printType && (
<TableCell>
{order.printType || order.print_type || "—"}
</TableCell>
)}

{v.channel && (
<TableCell>
{order.channel || "—"}
</TableCell>
)}

{v.priority && (
<TableCell onClick={(e) => e.stopPropagation()}>
<DropdownMenu>

<DropdownMenuTrigger asChild>
<div>
<PriorityBadge priority={order.priority} />
</div>
</DropdownMenuTrigger>

<DropdownMenuContent className="bg-zinc-900 border-zinc-700">
{PRIORITIES.map(p => (
<DropdownMenuItem
key={p}
onClick={() => changePriority(order, p)}
className="text-zinc-300 hover:bg-zinc-800"
>
{p}
</DropdownMenuItem>
))}
</DropdownMenuContent>

</DropdownMenu>
</TableCell>

{v.deadline && (
<TableCell>
{formatDate(order.deadline)}
</TableCell>
)}

{v.assignee && (
<TableCell>
{order.assignee ? (
<span className="flex items-center gap-1">
<User className="w-3 h-3" />
{order.assignee}
</span>
) : "—"}
</TableCell>
)}

{v.meters && (
<TableCell>
{order.meters != null ? order.meters.toFixed(2) : "—"}
</TableCell>
)}

{v.settlement && (
<TableCell className={SETTLEMENT_COLORS[order.settlement]}>
{order.settlement || "—"}
</TableCell>
)}

{v.files && (
<TableCell>
<div className="flex items-center gap-2">
<span>{order.files?.length || 0}</span>

{order.files?.length > 0 && (
<button
onClick={(e) => {
e.stopPropagation();
downloadFile(
order.files[0].url,
order.files[0].name
);
}}
className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md"
>
<Download className="w-3.5 h-3.5" />
</button>
)}

</div>
</TableCell>
)}

<TableCell>
<div
className="flex gap-1"
onClick={e => e.stopPropagation()}
>

<Button
size="icon"
variant="ghost"
onClick={() => onEdit(order)}
>
<Pencil className="w-3.5 h-3.5" />
</Button>

<Button
size="icon"
variant="ghost"
onClick={() => onDelete(order)}
>
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
