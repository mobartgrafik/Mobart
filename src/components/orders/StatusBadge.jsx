import React from "react";
import { cn } from "@/lib/utils";
import { normalizeOrderStatus } from "@/lib/orderValues";

const statusConfig = {
  "Nowe": { bg: "bg-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  "W trakcie": { bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  "Do przekazania": { bg: "bg-purple-500/20", text: "text-purple-400", dot: "bg-purple-400" },
  "Przekazane": { bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  "Zakończone": { bg: "bg-zinc-500/20", text: "text-zinc-400", dot: "bg-zinc-400" },
  // Legacy key - zostawiamy awaryjnie.
  "Wydrukowane": { bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
};

export default function StatusBadge({ status, size = "sm" }) {
  const normalizedStatus = normalizeOrderStatus(status);
  const config = statusConfig[normalizedStatus] || statusConfig["Nowe"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-all cursor-pointer",
        config.bg,
        config.text,
        "hover:brightness-110 hover:bg-opacity-40",
        size === "sm"
          ? "px-2.5 py-0.5 text-xs"
          : "px-3 py-1 text-sm"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {normalizedStatus}
    </span>
  );
}
