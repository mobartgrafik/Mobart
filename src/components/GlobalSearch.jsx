import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/supabase";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, FileText, Users, X, ArrowRight } from "lucide-react";
import { normalizeOrderPriority, normalizeOrderStatus } from "@/lib/orderValues";

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        open ? onClose() : null;
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const q = query.toLowerCase().trim();

  const matchedOrders = q
    ? orders.filter(o =>
        o.title?.toLowerCase().includes(q) ||
        o.client_name?.toLowerCase().includes(q) ||
        o.print_type?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q)
      ).slice(0, 6)
    : orders.slice(0, 4);

  const matchedClients = q
    ? clients.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      ).slice(0, 4)
    : clients.slice(0, 3);

  const hasResults = matchedOrders.length > 0 || matchedClients.length > 0;

  const goToOrder = (order) => {
    navigate(createPageUrl("OrderForm") + "?id=" + order.id);
    onClose();
  };

  const goToClient = (client) => {
    navigate(createPageUrl("ClientDetail") + "?id=" + client.id);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Szukaj zleceń, klientów..."
            className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-600 outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-zinc-600 hover:text-zinc-400">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-xs text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto">
          {!hasResults && q && (
            <div className="text-center py-10 text-zinc-600 text-sm">Brak wyników dla „{query}"</div>
          )}

          {matchedOrders.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Zlecenia
              </div>
              {matchedOrders.map(order => (
                <button
                  key={order.id}
                  onClick={() => goToOrder(order)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-100 truncate">{order.title}</p>
                    <p className="text-xs text-zinc-500 truncate">{order.client_name} · {order.status}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {matchedClients.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Klienci
              </div>
              {matchedClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => goToClient(client)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-100 truncate">{client.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{client.email || client.phone || "Brak danych"}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {!q && (
            <div className="px-4 py-3 text-xs text-zinc-700 border-t border-zinc-800">
              Wpisz aby wyszukać · <kbd className="border border-zinc-700 rounded px-1">↑↓</kbd> nawigacja · <kbd className="border border-zinc-700 rounded px-1">Enter</kbd> otwórz
            </div>
          )}
        </div>
      </div>
    </div>
  );
}