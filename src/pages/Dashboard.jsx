import React from "react";
import { supabase } from "@/supabase";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, Users, Printer, AlertTriangle, Clock } from "lucide-react";
import StatusBadge from "@/components/orders/StatusBadge";
import PriorityBadge from "@/components/orders/PriorityBadge";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { normalizeOrderPriority, normalizeOrderStatus } from "@/lib/orderValues";

function StatCard({ icon: Icon, label, value, color, to }) {
  const content = (
    <div className={`bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 hover:border-zinc-700/50`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-zinc-100">{value}</p>
      <p className="text-zinc-500 text-sm mt-1">{label}</p>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function Dashboard() {
  const { data: orders = [] } = useQuery({
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

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const activeOrders = orders.filter(o => o.status !== "Zakończone");
  const handoffOrders = orders.filter(o => o.status === "Do przekazania");
  const urgentOrders = orders.filter(o => o.priority === "wysoki" && o.status !== "Zakończone");
  const recentOrders = orders.slice(0, 8);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Pulpit</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Aktywne zlecenia" value={activeOrders.length}
          color="bg-blue-500/20 text-blue-400" to={createPageUrl("Orders")} />
        <StatCard icon={Printer} label="Do przekazania" value={handoffOrders.length}
          color="bg-purple-500/20 text-purple-400" to={createPageUrl("Handoff")} />
        <StatCard icon={AlertTriangle} label="Wysoki priorytet" value={urgentOrders.length}
          color="bg-red-500/20 text-red-400" />
        <StatCard icon={Users} label="Klienci" value={clients.length}
          color="bg-emerald-500/20 text-emerald-400" to={createPageUrl("Clients")} />
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
          <h2 className="text-zinc-200 font-semibold">Ostatnie zlecenia</h2>
          <Link to={createPageUrl("Orders")} className="text-blue-400 text-sm hover:text-blue-300">Zobacz wszystkie</Link>
        </div>
        <div className="divide-y divide-zinc-800/30">
          {recentOrders.map(order => (
            <Link key={order.id} to={createPageUrl("Orders")} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-800/20">
              <div className="flex-1 min-w-0">
                <p className="text-zinc-100 text-sm font-medium truncate">{order.title}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{order.client_name}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <PriorityBadge priority={order.priority} />
                <StatusBadge status={order.status} />
                {order.deadline && (
                  <span className="text-zinc-600 text-xs hidden sm:block">
                    {format(new Date(order.deadline), "d MMM", { locale: pl })}
                  </span>
                )}
              </div>
            </Link>
          ))}
          {!recentOrders.length && (
            <div className="text-center py-10 text-zinc-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Brak zleceń</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
