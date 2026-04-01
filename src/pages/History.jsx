import React, { useState } from "react";
import { supabase } from "@/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Clock, MessageSquare, RotateCcw, Search, Filter, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const FIELD_LABELS = {
  status: "Status", priority: "Priorytet", assignee: "Pracownik", graphic: "Grafik",
  deadline: "Termin", print_date: "Data wydruku", settlement: "Rozliczenie",
  channel: "Kanał", meters: "Metry (m²)", price: "Cena", print_type: "Produkt", title: "Nazwa zlecenia",
};

function groupBySession(entries) {
  // Group consecutive history entries from same author within 60s window
  const groups = [];
  let current = null;
  for (const e of entries) {
    if (
      current &&
      e.type === "history" &&
      current.type === "history" &&
      current.author === e.author &&
      current.order_id === e.order_id &&
      Math.abs(new Date(e.created_at) - new Date(current.entries[current.entries.length - 1].created_at)) < 60000
    ) {
      current.entries.push(e);
    } else {
      current = {
        id: e.id,
        type: e.type,
        author: e.author,
        order_id: e.order_id,
        order_title: e.order_title,
        created_at: e.created_at,
        entries: [e],
      };
      groups.push(current);
    }
  }
  return groups;
}

export default function History() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [revertingId, setRevertingId] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rawComments = [], isLoading: loadingComments } = useQuery({
    queryKey: ["all-comments"],
    queryFn: async () => {
  const { data, error } = await supabase
    .from("order_comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
},
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*");

  if (error) throw error;
  return data;
},
  });

  // Enrich comments with order titles
  const comments = rawComments.map(c => ({
    ...c,
    order_title: orders.find(o => o.id === c.order_id)?.title || c.order_id,
  }));

  // Filter
  const filtered = comments.filter(c => {
    const matchType = typeFilter === "all" || c.type === typeFilter;
    const matchSearch =
      !search ||
      c.order_title?.toLowerCase().includes(search.toLowerCase()) ||
      c.author?.toLowerCase().includes(search.toLowerCase()) ||
      c.content?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleRevert = async (entry) => {
    if (!entry.field_changed || !entry.old_value || !entry.order_id) return;
    const confirm = window.confirm(
      `Cofnąć zmianę pola "${FIELD_LABELS[entry.field_changed] || entry.field_changed}" z powrotem na "${entry.old_value}"?`
    );
    if (!confirm) return;

    setRevertingId(entry.id);
    const numFields = ["meters", "price"];
    const revertValue = numFields.includes(entry.field_changed)
      ? (entry.old_value ? parseFloat(entry.old_value) : null)
      : entry.old_value;

    await supabase
  .from("orders")
  .update({ [entry.field_changed]: revertValue })
  .eq("id", entry.order_id);

    // Log the revert as a history entry
    await supabase
  .from("order_comments")
  .insert([{
      order_id: entry.order_id,
      type: "history",
      content: `Cofnięto zmianę: ${FIELD_LABELS[entry.field_changed] || entry.field_changed}`,
      author: "Użytkownik",
      field_changed: entry.field_changed,
      old_value: entry.new_value,
      new_value: entry.old_value,
    });

    queryClient.invalidateQueries({ queryKey: ["all-comments"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    setRevertingId(null);
    toast.success("Zmiana cofnięta");
  };

  const formatDate = (d) => {
    if (!d) return "";
    try { return format(new Date(d), "d MMM yyyy, HH:mm", { locale: pl }); }
    catch { return ""; }
  };

  const dayGroups = {};
  filtered.forEach(c => {
    const day = c.created_at ? format(new Date(c.created_at), "d MMMM yyyy", { locale: pl }) : "Brak daty";
    if (!dayGroups[day]) dayGroups[day] = [];
    dayGroups[day].push(c);
  });

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Historia zmian</h1>
        <span className="text-sm text-zinc-500">{filtered.length} wpisów</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj zlecenia, autora..."
            className="bg-zinc-800/50 border-zinc-800 text-zinc-100 pl-9 placeholder:text-zinc-600"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44 bg-zinc-800/50 border-zinc-800 text-zinc-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all" className="text-zinc-100 focus:bg-zinc-700">Wszystkie typy</SelectItem>
            <SelectItem value="history" className="text-zinc-100 focus:bg-zinc-700">Zmiany pól</SelectItem>
            <SelectItem value="comment" className="text-zinc-100 focus:bg-zinc-700">Komentarze</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline grouped by day */}
      {loadingComments ? (
        <div className="text-center py-16 text-zinc-500">Ładowanie...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">Brak historii</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(dayGroups).map(([day, dayEntries]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{day}</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              <div className="space-y-2">
                {dayEntries.map(entry => (
                  <HistoryRow
                    key={entry.id}
                    entry={entry}
                    onRevert={handleRevert}
                    revertingId={revertingId}
                    formatDate={formatDate}
                    navigate={navigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryRow({ entry, onRevert, revertingId, formatDate, navigate }) {
  const isHistory = entry.type === "history";
  const canRevert = isHistory && entry.field_changed && entry.old_value;

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/60 transition-colors group">
      {/* Icon */}
      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isHistory ? "bg-zinc-800" : "bg-blue-600/20"
      }`}>
        {isHistory
          ? <Clock className="w-3.5 h-3.5 text-zinc-500" />
          : <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-semibold text-zinc-300">{entry.author || "System"}</span>
          <span className="text-xs text-zinc-600">{formatDate(entry.created_at)}</span>
          <button
            onClick={() => navigate(createPageUrl("OrderForm") + "?id=" + entry.order_id)}
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
          >
            {entry.order_title || entry.order_id}
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {isHistory ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-zinc-400">
              <span className="font-medium text-zinc-200">{FIELD_LABELS[entry.field_changed] || entry.field_changed}</span>
              {entry.old_value && (
                <> <span className="text-red-400 line-through">{entry.old_value}</span></>
              )}
              {entry.old_value && entry.new_value && (
                <ArrowRight className="w-3 h-3 inline mx-1 text-zinc-600" />
              )}
              {entry.new_value && (
                <span className="text-green-400">{entry.new_value}</span>
              )}
            </span>
          </div>
        ) : (
          <p className="text-sm text-zinc-300 bg-zinc-800/50 rounded-lg px-3 py-1.5 inline-block">
            {entry.content}
          </p>
        )}
      </div>

      {/* Revert button */}
      {canRevert && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRevert(entry)}
            disabled={revertingId === entry.id}
            className="h-7 px-2 text-xs text-zinc-500 hover:text-orange-400 hover:bg-orange-400/10 gap-1"
          >
            {revertingId === entry.id
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <RotateCcw className="w-3 h-3" />
            }
            Cofnij
          </Button>
        </div>
      )}
    </div>
  );
}
