import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Clock, Send, Loader2, User } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const FIELD_LABELS = {
  status: "Status",
  priority: "Priorytet",
  assignee: "Pracownik",
  graphic: "Grafik",
  deadline: "Termin",
  print_date: "Data wydruku",
  settlement: "Rozliczenie",
  channel: "Kanał",
  meters: "Metry (m²)",
  price: "Cena",
  print_type: "Produkt",
  title: "Nazwa zlecenia",
};

export default function OrderActivity({ orderId }) {
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["order-comments", orderId],
    queryFn: () => base44.entities.OrderComment.filter({ order_id: orderId }, "created_date"),
    enabled: !!orderId,
  });

  const addComment = useMutation({
    mutationFn: (content) =>
      base44.entities.OrderComment.create({
        order_id: orderId,
        content,
        type: "comment",
        author: "Użytkownik",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-comments", orderId] });
      setComment("");
    },
  });

  const handleSubmit = () => {
    if (!comment.trim()) return;
    addComment.mutate(comment.trim());
  };

  const formatDate = (d) => {
    if (!d) return "";
    try { return format(new Date(d), "d MMM yyyy, HH:mm", { locale: pl }); }
    catch { return ""; }
  };

  return (
    <div className="space-y-4">
      {/* Add comment */}
      <div className="flex gap-2">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Dodaj komentarz..."
          className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
          }}
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!comment.trim() || addComment.isPending}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        size="sm"
      >
        {addComment.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        Dodaj komentarz
      </Button>

      {/* Timeline */}
      {isLoading ? (
        <div className="text-zinc-500 text-sm py-4 text-center">Ładowanie...</div>
      ) : entries.length === 0 ? (
        <div className="text-zinc-600 text-sm py-4 text-center">Brak aktywności</div>
      ) : (
        <div className="space-y-3 mt-4">
          {[...entries].reverse().map((entry) => (
            <div key={entry.id} className="flex gap-3">
              <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                entry.type === "comment" ? "bg-blue-600/20" : "bg-zinc-800"
              }`}>
                {entry.type === "comment"
                  ? <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  : <Clock className="w-3.5 h-3.5 text-zinc-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-zinc-400">
                    {entry.author || "System"}
                  </span>
                  <span className="text-xs text-zinc-600">{formatDate(entry.created_date)}</span>
                </div>
                {entry.type === "comment" ? (
                  <p className="text-sm text-zinc-200 bg-zinc-800/60 rounded-lg px-3 py-2">
                    {entry.content}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400">
                    Zmieniono <span className="text-zinc-300 font-medium">{FIELD_LABELS[entry.field_changed] || entry.field_changed}</span>
                    {entry.old_value && (
                      <> z <span className="text-red-400 line-through">{entry.old_value}</span></>
                    )}
                    {entry.new_value && (
                      <> na <span className="text-green-400">{entry.new_value}</span></>
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}