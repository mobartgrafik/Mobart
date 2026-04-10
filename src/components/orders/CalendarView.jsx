import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { normalizeOrderPriority, normalizeOrderStatus } from "@/lib/orderValues";

const STATUS_COLORS = {
  "Nowe": "bg-blue-600/80 border-blue-500",
  "W trakcie": "bg-yellow-600/80 border-yellow-500",
  "Do przekazania": "bg-orange-600/80 border-orange-500",
  "Przekazane": "bg-purple-600/80 border-purple-500",
  "Zakończone": "bg-green-700/80 border-green-600",
};

export default function CalendarView({ orders, onPreview }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const queryClient = useQueryClient();

  const normalizedOrders = orders.map((o) => ({
    ...o,
    status: normalizeOrderStatus(o.status),
    priority: normalizeOrderPriority(o.priority),
  }));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getOrdersForDay = (date) =>
    normalizedOrders.filter(o => {
      if (!o.deadline) return false;
      try { return isSameDay(parseISO(o.deadline), date); }
      catch { return false; }
    });

  const handleDragStart = (e, order) => {
    setDragging(order);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(date.toISOString());
  };

 const handleDrop = async (e, date) => {
  e.preventDefault();
  if (!dragging) return;

  const newDeadline = new Date(date);

  if (dragging.deadline) {
    const orig = parseISO(dragging.deadline);
    newDeadline.setHours(orig.getHours(), orig.getMinutes(), 0, 0);
  } else {
    newDeadline.setHours(9, 0, 0, 0);
  }

  const { error } = await supabase
    .from("orders")
    .update({
      deadline: newDeadline.toISOString()
    })
    .eq("id", dragging.id);

  if (error) {
    console.error("Calendar update error:", error);
  }

  queryClient.invalidateQueries({ queryKey: ["orders"] });

  setDragging(null);
  setDragOver(null);
};

  // Clear dragging state when the user releases the draggable item.
  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };


  const WEEK_DAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-base font-semibold text-zinc-100 capitalize">
          {format(currentMonth, "LLLL yyyy", { locale: pl })}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-zinc-800/50">
        {WEEK_DAYS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((date, idx) => {
          const dayOrders = getOrdersForDay(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isToday = isSameDay(date, new Date());
          const isDragOver = dragOver === date.toISOString();

          return (
            <div
              key={idx}
              onDragOver={(e) => handleDragOver(e, date)}
              onDrop={(e) => handleDrop(e, date)}
              className={`
                min-h-[110px] border-b border-r border-zinc-800/40 p-1.5 transition-colors
                ${!isCurrentMonth ? "bg-zinc-900/20" : "bg-transparent"}
                ${isDragOver ? "bg-blue-600/10 border-blue-500/40" : ""}
              `}
            >
              <div className={`
                text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
                ${isToday ? "bg-blue-600 text-white" : isCurrentMonth ? "text-zinc-400" : "text-zinc-700"}
              `}>
                {format(date, "d")}
              </div>

              <div className="space-y-0.5">
                {dayOrders.map(order => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onPreview?.(order)}
                    className={`
                      px-1.5 py-0.5 rounded text-xs cursor-grab active:cursor-grabbing truncate
                      border-l-2 text-white font-medium hover:opacity-80 transition-opacity
                      ${STATUS_COLORS[order.status] || "bg-zinc-700 border-zinc-500"}
                      ${dragging?.id === order.id ? "opacity-40" : ""}
                    `}
                    title={`${order.title} — ${order.client_name || ""}`}
                  >
                    {order.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-5 py-3 border-t border-zinc-800/50">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${cls.split(" ")[0]}`} />
            <span className="text-xs text-zinc-500">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
