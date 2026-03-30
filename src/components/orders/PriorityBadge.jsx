import React from "react";
import { cn } from "@/lib/utils";

const priorityConfig = {
  "niski": { bg: "bg-slate-500/20", text: "text-slate-400" },
  "średni": { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  "wysoki": { bg: "bg-red-500/20", text: "text-red-400" },
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig["średni"];
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      config.bg, config.text
    )}>
      {priority}
    </span>
  );
}