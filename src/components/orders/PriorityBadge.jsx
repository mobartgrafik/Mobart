import React from "react";
import { cn } from "@/lib/utils";

const priorityConfig = {
  "Niski": {
    bg: "bg-zinc-500/20",
    text: "text-zinc-400",
    dot: "bg-zinc-400"
  },
  "Normalny": {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    dot: "bg-blue-400"
  },
  "Wysoki": {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    dot: "bg-orange-400"
  },
  "Pilne": {
    bg: "bg-red-500/20",
    text: "text-red-400",
    dot: "bg-red-400"
  }
};

export default function PriorityBadge({ priority, size = "sm" }) {

  const config = priorityConfig[priority] || priorityConfig["Normalny"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-all cursor-pointer",
        config.bg,
        config.text,
        "hover:brightness-110",
        size === "sm"
          ? "px-2.5 py-0.5 text-xs"
          : "px-3 py-1 text-sm"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {priority}
    </span>
  );
}
