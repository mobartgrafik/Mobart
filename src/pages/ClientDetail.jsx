import React, { useState } from "react";
import { supabase } from "@/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, Pencil, Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatusBadge from "@/components/orders/StatusBadge";
import PriorityBadge from "@/components/orders/PriorityBadge";
import ClientFormDialog from "@/components/clients/ClientFormDialog";
import OrderFormDialog from "@/components/orders/OrderFormDialog";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default function ClientDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("id");
  const queryClient = useQueryClient();
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

const { data: clients = [] } = useQuery({
  queryKey: ["clients"],
  queryFn: () => base44.entities.Client.list(),
});

const client = clients.find(c => c.id === clientId);

const { data: allOrders = [] } = useQuery({
  queryKey: ["orders"],
  queryFn: () => base44.entities.Order.list("-created_date"),
});

  const clientOrders = allOrders.filter(o => o.client_id === clientId);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["clients"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  if (!client) {
    return <div className="text-center py-16 text-zinc-500">Ładowanie klienta...</div>;
  }

  return (
    <div className="space-y-6">
      <Link to={createPageUrl("Clients")} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm">
        <ArrowLeft className="w-4 h-4" />Powrót do klientów
      </Link>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{client.name}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-zinc-400">
              {client.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{client.phone}</span>}
              {client.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{client.email}</span>}
            </div>
            {client.notes && <p className="mt-3 text-zinc-500 text-sm">{client.notes}</p>}
          </div>
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => setEditClientOpen(true)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-200">Zlecenia ({clientOrders.length})</h2>
        <Button onClick={() => { setEditingOrder(null); setOrderDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm" size="sm">
          <Plus className="w-3.5 h-3.5" />Nowe zlecenie
        </Button>
      </div>

      {!clientOrders.length ? (
        <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Brak zleceń dla tego klienta</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clientOrders.map(order => (
            <div key={order.id} onClick={() => { setEditingOrder(order); setOrderDialogOpen(true); }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800/30 cursor-pointer flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-zinc-100 font-medium">{order.title}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <StatusBadge status={order.status} />
                  <PriorityBadge priority={order.priority} />
                  {order.deadline && (
                    <span className="text-zinc-500 text-xs">{format(new Date(order.deadline), "d MMM yyyy", { locale: pl })}</span>
                  )}
                </div>
              </div>
              {order.assignee && <span className="text-zinc-500 text-xs whitespace-nowrap">{order.assignee}</span>}
            </div>
          ))}
        </div>
      )}

      <ClientFormDialog open={editClientOpen} onOpenChange={setEditClientOpen} client={client} onSaved={handleRefresh} />
      <OrderFormDialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}
        order={editingOrder ? editingOrder : { client_id: clientId, client_name: client.name }}
        clients={clients} onSaved={handleRefresh} />
    </div>
  );
}
