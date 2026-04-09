import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_MAP, findTechnologyByItem, usePrintTypeConfig } from "@/lib/printTypeConfig";

export default function PrintTypeSelect({ value, onChange }) {
  const { config } = usePrintTypeConfig();
  const [selectedTech, setSelectedTech] = useState(() => {
    if (!value) return null;
    return findTechnologyByItem(config, value)?.key || null;
  });

  useEffect(() => {
    if (!value) {
      setSelectedTech(null);
      return;
    }

    const matchedTech = findTechnologyByItem(config, value);
    setSelectedTech(matchedTech?.key || null);
  }, [config, value]);

  const currentTech = config.find((technology) => technology.key === selectedTech);

  const handleTechClick = (tech) => {
    if (selectedTech === tech.key) {
      setSelectedTech(null);
      onChange("");
    } else {
      setSelectedTech(tech.key);
      onChange("");
    }
  };

  const handleItemClick = (item) => {
    onChange(value === item ? "" : item);
  };

  const handleClear = () => {
    setSelectedTech(null);
    onChange("");
  };

  return (
    <div className="space-y-3">
      {/* Technology buttons */}
      <div className="flex flex-wrap gap-2">
        {config.map((tech) => {
          const colors = COLOR_MAP[tech.color] || COLOR_MAP.blue;
          const isActive = selectedTech === tech.key;
          return (
            <button
              key={tech.key}
              type="button"
              onClick={() => handleTechClick(tech)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                isActive ? colors.btn : colors.inactive
              )}
            >
              {tech.label}
            </button>
          );
        })}
      </div>

      {/* Material list for selected technology */}
      {currentTech && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
          {currentTech.groups.map(group => (
            <div key={group.group}>
              <p className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-800/50 border-b border-zinc-700/50">
                {group.group}
              </p>
              <div className="grid grid-cols-2 gap-px bg-zinc-700/20 p-1">
                {group.items.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-sm rounded text-left transition-colors",
                      value === item
                        ? "bg-blue-600/20 text-blue-300"
                        : "text-zinc-300 hover:bg-zinc-700/60 hover:text-zinc-100"
                    )}
                  >
                    {value === item && <Check className="w-3 h-3 shrink-0 text-blue-400" />}
                    <span className={value === item ? "" : "pl-5"}>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current selection summary */}
      {value && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-md">
          <span className="text-xs text-blue-300 flex-1">
            <span className="text-zinc-500">Wybrano: </span>{value}
          </span>
          <button type="button" onClick={handleClear} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
