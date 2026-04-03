import React, { useState } from "react";
import { supabase } from "@/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, LayoutList, Columns3, SlidersHorizontal, CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import OrdersTable from "@/components/orders/OrdersTable";
import KanbanBoard from "@/components/orders/KanbanBoard";
import CalendarView from "@/components/orders/CalendarView";
import { useAuth } from "@/lib/AuthContext";
import { normalizeOrderPriority, normalizeOrderStatus } from "@/lib/orderValues";
import OrderPreviewDialog from "@/components/orders/OrderPreviewDialog";
import { useToast } from "@/components/ui/use-toast";

const STATUSES = ["Wszystkie", "Nowe", "W trakcie", "Do przekazania", "Wydrukowane", "Zakończone"];
const PRIORITIES = ["Wszystkie", "niski", "średni", "wysoki"];

export default function Orders() {
  const navigate = useNavigate();
  const { authorLabel, avatarUrl } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Wszystkie");
  const [priorityFilter, setPriorityFilter] = useState("Wszystkie");
  const [visibleCols, setVisibleCols] = useState({
    printType: true, priority: true, deadline: true, assignee: true, files: true,
    channel: true, meters: true, settlement: true
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewOrder, setPreviewOrder] = useState(null);

  const toggleCol = (col) => setVisibleCols(prev => ({ ...prev, [col]: !prev[col] }));
  const queryClient = useQueryClient();

const { data: orders = [], isLoading } = useQuery({
  queryKey: ["orders"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }

    return (data || []).map((o) => ({
      ...o,
      status: normalizeOrderStatus(o.status),
      priority: normalizeOrderPriority(o.priority),
    }));
  },
});

const deleteMutation = useMutation({
  mutationFn: async (order) => {

    // usuń zlecenie
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    if (error) throw error;

    // zapisz historię
    await supabase
      .from("order_comments")
      .insert([{
        order_id: order.id,
        type: "history",
        content: `Usunięto zlecenie: ${order.title}`,
        author: authorLabel,
        author_avatar_url: avatarUrl || null,
      }]);

  },
  onSuccess: async (_, order) => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["all-comments"] });

    toast({
      variant: "destructive",
      title: "Usunięto zlecenie",
      description: order?.title ? `Usunięto „${order.title}”.` : "Usunięto zlecenie.",
    });

    await supabase.channel("orders-realtime-toasts").send({
      type: "broadcast",
      event: "order-change",
      payload: {
        kind: "delete",
        orderId: order?.id || null,
        title: order?.title || "",
        ts: Date.now(),
      },
    });
  },
  onError: (error) => {
    console.error(error);
    alert("Nie udało się usunąć zlecenia. Spróbuj ponownie.");
  },
});

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.title?.toLowerCase().includes(search.toLowerCase()) || o.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Wszystkie" || o.status === statusFilter;
    const matchPriority = priorityFilter === "Wszystkie" || o.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleEdit = (order) => navigate(createPageUrl("OrderForm") + "?id=" + order.id);
  const handlePreview = (order) => {
    setPreviewOrder(order);
    setPreviewOpen(true);
  };
  const handleDelete = (order) => { 
  if (confirm("Usunąć zlecenie \"" + order.title + "\"?")) 
    deleteMutation.mutate(order); 
};
  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-100">Zlecenia</h1>
        <Link to={createPageUrl("OrderForm")}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="w-4 h-4" />Nowe zlecenie
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj zleceń..."
            className="bg-zinc-800/50 border-zinc-800 text-zinc-100 pl-9 placeholder:text-zinc-600" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-zinc-800/50 border-zinc-800 text-zinc-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {STATUSES.map(s => <SelectItem key={s} value={s} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36 bg-zinc-800/50 border-zinc-800 text-zinc-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {PRIORITIES.map(p => <SelectItem key={p} value={p} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="bg-zinc-800/50 border-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />Kolumny
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-zinc-800 border-zinc-700 w-52 p-3 space-y-2">
            {[
              { key: "printType", label: "Typ wydruku" },
              { key: "channel", label: "Kanał zlecenia" },
              { key: "priority", label: "Priorytet" },
              { key: "deadline", label: "Termin" },
              { key: "assignee", label: "Pracownik" },
              { key: "meters", label: "Metry (m²)" },
              { key: "settlement", label: "Rozliczenie" },
              { key: "files", label: "Pliki" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox id={key} checked={visibleCols[key]} onCheckedChange={() => toggleCol(key)} className="border-zinc-500" />
                <Label htmlFor={key} className="text-zinc-300 text-sm cursor-pointer">{label}</Label>
              </div>
            ))}
          </PopoverContent>
        </Popover>
        <div className="flex bg-zinc-800/50 rounded-lg border border-zinc-800 p-0.5">
          <Button variant="ghost" size="sm" onClick={() => setView("table")}
            className={`gap-1.5 text-xs ${view === "table" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
            <LayoutList className="w-3.5 h-3.5" />Lista
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setView("kanban")}
            className={`gap-1.5 text-xs ${view === "kanban" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
            <Columns3 className="w-3.5 h-3.5" />Kanban
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setView("calendar")}
            className={`gap-1.5 text-xs ${view === "calendar" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
            <CalendarDays className="w-3.5 h-3.5" />Kalendarz
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-zinc-500">Ładowanie...</div>
      ) : view === "table" ? (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <OrdersTable
            orders={filtered}
            onPreview={handlePreview}
            onEdit={handleEdit}
            onDelete={handleDelete}
            visibleCols={visibleCols}
          />
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard orders={filtered} onPreview={handlePreview} onRefresh={handleRefresh} />
      ) : (
        <CalendarView orders={filtered} onPreview={handlePreview} />
      )}

      <OrderPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        order={previewOrder}
        onEdit={(o) => {
          setPreviewOpen(false);
          handleEdit(o);
        }}
      />
    </div>
  );
}
