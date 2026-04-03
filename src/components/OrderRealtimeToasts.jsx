import { useEffect, useRef } from "react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle2, Trash2 } from "lucide-react";

const RECENT_EVENT_TTL_MS = 8000;

export default function OrderRealtimeToasts() {
  const { isAuthenticated } = useAuth();
  const recentEventsRef = useRef(new Set());

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const rememberEvent = (eventKey) => {
      if (recentEventsRef.current.has(eventKey)) return false;
      recentEventsRef.current.add(eventKey);
      setTimeout(() => recentEventsRef.current.delete(eventKey), RECENT_EVENT_TTL_MS);
      return true;
    };

    const channel = supabase
      .channel("orders-realtime-toasts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload?.new || {};
          const orderId = order.id || payload?.commit_timestamp || "unknown";
          const eventKey = `insert:${orderId}`;
          if (!rememberEvent(eventKey)) return;

          toast({
            variant: "success",
            title: "Nowe zlecenie",
            description: order?.title
              ? `Dodano „${order.title}”.`
              : "Dodano nowe zlecenie.",
            action: (
              <div className="rounded-full bg-emerald-500/20 p-1.5 text-emerald-300 animate-in zoom-in-50 fade-in-0 duration-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            ),
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          const order = payload?.old || {};
          const orderId = order.id || payload?.commit_timestamp || "unknown";
          const eventKey = `delete:${orderId}`;
          if (!rememberEvent(eventKey)) return;

          toast({
            variant: "destructive",
            title: "Usunięto zlecenie",
            description: order?.title
              ? `Usunięto „${order.title}”.`
              : "Usunięto zlecenie.",
            action: (
              <div className="rounded-full bg-red-500/20 p-1.5 text-red-200 animate-in zoom-in-50 fade-in-0 duration-300">
                <Trash2 className="h-4 w-4" />
              </div>
            ),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  return null;
}
