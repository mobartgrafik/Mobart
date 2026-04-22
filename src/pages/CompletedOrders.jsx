import React, { useState } from "react";
import { supabase } from "@/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArchiveX } from "lucide-react";
import OrdersTable from "@/components/orders/OrdersTable";
import OrderPreviewDialog from "@/components/orders/OrderPreviewDialog";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { normalizeOrderPriority, normalizeOrderStatus } from "@/lib/orderValues";
import { useToast } from "@/components/ui/use-toast";

export default function CompletedOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authorLabel, avatarUrl } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewOrder, setPreviewOrder] = useState(null);

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

      return (data || []).map((order) => ({
        ...order,
        status: normalizeOrderStatus(order.status),
        priority: normalizeOrderPriority(order.priority),
      }));
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (order) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "Przekazane" })
        .eq("id", order.id);

      if (error) throw error;

      await supabase
        .from("order_comments")
        .insert([{
          order_id: order.id,
          type: "history",
          content: `Przywrócono zlecenie z zakończonych: ${order.title}`,
          author: authorLabel,
          author_avatar_url: avatarUrl || null,
        }]);
    },
    onSuccess: (_, order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["all-comments"] });
      toast({
        title: "Zlecenie przywrócone",
        description: order?.title ? `Przywrócono „${order.title}”.` : "Przywrócono zlecenie.",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Nie udało się przywrócić zlecenia",
        description: error?.message || "Spróbuj ponownie.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (order) => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      if (error) throw error;

      await supabase
        .from("order_comments")
        .insert([{
          order_id: order.id,
          type: "history",
          content: `Usunięto zakończone zlecenie: ${order.title}`,
          author: authorLabel,
          author_avatar_url: avatarUrl || null,
        }]);
    },
    onSuccess: (_, order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["all-comments"] });
      toast({
        variant: "destructive",
        title: "Usunięto zlecenie",
        description: order?.title ? `Usunięto „${order.title}”.` : "Usunięto zlecenie.",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Nie udało się usunąć zlecenia",
        description: error?.message || "Spróbuj ponownie.",
      });
    },
  });

  const completedOrders = orders
    .filter((order) => order.status === "Zakończone")
    .filter((order) => {
      if (!search) return true;
      const normalizedSearch = search.toLowerCase();
      return (
        order.title?.toLowerCase().includes(normalizedSearch) ||
        order.client_name?.toLowerCase().includes(normalizedSearch)
      );
    });

  const handleEdit = (order) => navigate(createPageUrl("OrderForm") + "?id=" + order.id);
  const handlePreview = (order) => {
    setPreviewOrder(order);
    setPreviewOpen(true);
  };
  const handleDelete = (order) => {
    if (confirm(`Usunąć zakończone zlecenie "${order.title}"?`)) {
      deleteMutation.mutate(order);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Zakończone</h1>
          <p className="text-sm text-zinc-500 mt-1">Tutaj lądują zakończone zlecenia. Możesz je przywrócić do aktywnych.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("Orders"))}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 gap-2"
        >
          <ArchiveX className="w-4 h-4" />
          Wróć do zleceń
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj zakończonych..."
          className="bg-zinc-800/50 border-zinc-800 text-zinc-100 pl-9 placeholder:text-zinc-600"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-zinc-500">Ładowanie...</div>
      ) : (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <OrdersTable
            orders={completedOrders}
            onPreview={handlePreview}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={(order) => restoreMutation.mutate(order)}
            restoreLabel="Przywróć do aktywnych"
          />
        </div>
      )}

      <OrderPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        order={previewOrder}
        onEdit={(order) => {
          setPreviewOpen(false);
          handleEdit(order);
        }}
      />
    </div>
  );
}
