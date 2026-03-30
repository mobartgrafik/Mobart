import React from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { User, Calendar, FileText } from "lucide-react";

const STATUSES = ["Nowe", "W trakcie", "Do przekazania", "Wydrukowane", "Zakończone"];

const columnColors = {
  "Nowe": "border-t-blue-500",
  "W trakcie": "border-t-amber-500",
  "Do przekazania": "border-t-purple-500",
  "Wydrukowane": "border-t-emerald-500",
  "Zakończone": "border-t-zinc-500",
};

export default function KanbanBoard({ orders, onEdit, onRefresh }) {
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("orderId");
    if (!orderId) return;
    await base44.entities.Order.update(orderId, { status: newStatus });
    onRefresh();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {STATUSES.map(status => {
        const columnOrders = orders.filter(o => o.status === status);
        return (
          <div key={status}
            className={`bg-zinc-900/50 rounded-xl border border-zinc-800/50 border-t-2 ${columnColors[status]} min-h-[300px]`}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, status)}
          >
            <div className="px-3 py-3 flex items-center justify-between">
              <span className="text-zinc-300 text-sm font-medium">{status}</span>
              <span className="text-zinc-600 text-xs bg-zinc-800 px-2 py-0.5 rounded-full">{columnOrders.length}</span>
            </div>
            <div className="px-2 pb-2 space-y-2">
              {columnOrders.map(order => (
                <div key={order.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData("orderId", order.id)}
                  onClick={() => onEdit(order)}
                  className="bg-zinc-800/80 hover:bg-zinc-800 rounded-lg p-3 cursor-pointer border border-zinc-700/30 hover:border-zinc-700"
                >
                  <p className="text-zinc-100 text-sm font-medium mb-1.5">{order.title}</p>
                  <p className="text-zinc-500 text-xs mb-2">{order.client_name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={order.priority} />
                    {order.deadline && (
                      <span className="text-zinc-500 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(order.deadline), "d MMM", { locale: pl })}
                      </span>
                    )}
                    {order.files?.length > 0 && (
                      <span className="text-zinc-500 text-xs flex items-center gap-1">
                        <FileText className="w-3 h-3" />{order.files.length}
                      </span>
                    )}
                  </div>
                  {order.assignee && (
                    <p className="text-zinc-500 text-xs mt-2 flex items-center gap-1">
                      <User className="w-3 h-3" />{order.assignee}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}