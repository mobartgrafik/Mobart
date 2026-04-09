import React from "react";
import { supabase } from "@/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Printer, CheckCircle, Calendar, User, FileText, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import PriorityBadge from "@/components/orders/PriorityBadge";
import { normalizeOrderPriority, normalizeOrderStatus } from "@/lib/orderValues";
import { getStoredFilePreviewUrl, getStoredFileSequenceLabel } from "@/lib/fileStorage";

export default function Handoff() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((o) => ({
        ...o,
        status: normalizeOrderStatus(o.status),
        priority: normalizeOrderPriority(o.priority),
      }));
    },
  });

  const handoffOrders = orders.filter(o => o.status === "Do przekazania");

  const markPrinted = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "Wydrukowane" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Printer className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Do przekazania</h1>
          <p className="text-zinc-500 text-sm">Zlecenia gotowe do druku — {handoffOrders.length} pozycji</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-zinc-500">Ładowanie...</div>
      ) : !handoffOrders.length ? (
        <div className="text-center py-20 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">Wszystko przekazane!</p>
          <p className="text-sm mt-1">Brak zleceń oczekujących na druk</p>
        </div>
      ) : (
        <div className="space-y-3">
          {handoffOrders.map(order => (
            <div key={order.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-zinc-100 font-semibold text-lg">{order.title}</p>
                  <PriorityBadge priority={order.priority} />
                </div>
                <p className="text-zinc-500 text-sm">{order.client_name}</p>
                {order.description && <p className="text-zinc-600 text-sm mt-1 line-clamp-2">{order.description}</p>}
                <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-zinc-500">
                  {order.deadline && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(order.deadline), "d MMM yyyy", { locale: pl })}</span>
                  )}
                  {order.assignee && (
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{order.assignee}</span>
                  )}
                  {order.files?.length > 0 && (
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{order.files.length} plików</span>
                  )}
                </div>
                {order.files?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {order.files.map((f, i) => (
                      <a key={i} href={getStoredFilePreviewUrl(f)} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-md border border-zinc-700/50">
                        {getStoredFileSequenceLabel(f) || f.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={() => markPrinted.mutate(order.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0"
                disabled={markPrinted.isPending}>
                <ArrowRight className="w-4 h-4" />Oznacz jako wydrukowane
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
