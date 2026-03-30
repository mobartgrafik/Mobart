import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TECHNOLOGIES = [
  {
    key: "mild_solvent",
    label: "Mild Solvent",
    color: "blue",
    groups: [
      { group: "Folie", items: [
        "Folia Mono", "Folia Mono + Laminat", "Folia Polimerowa", "Folia Polimerowa + Laminat",
        "Folia Wylewana", "Folia Wylewana + Laminat", "Folia Odblaskowa", "Folia Odblaskowa + Laminat",
        "Folia Magnetyczna", "Folia Magnetyczna + Cięcie", "Folia Mrożona", "Folia MacTac",
        "Folia BackLight", "Folia BackLight + Laminat", "Folia OWV",
      ]},
      { group: "Banery i rollup", items: [
        "Baner Laminowany", "Baner Powlekany", "Baner Odblaskowy", "Baner Blockout",
        "Roll-up 85", "Roll-up 100", "Roll-up 120", "X-Banner",
      ]},
      { group: "Inne materiały", items: [
        "Plakat", "Siatka Mesh", "Papier Blue back", "Tworzywo PCV 3mm",
        "Tworzywo PCV 5mm", "Tworzywo Di-bond", "Materiał PET", "Druk na materiale klienta", "Flaga", "Inne",
      ]},
    ],
  },
  {
    key: "hard_solvent",
    label: "Hard Solvent",
    color: "orange",
    groups: [
      { group: "Banery i rollup", items: [
        "Baner Laminowany", "Baner Powlekany", "Baner Odblaskowy", "Baner Blockout",
        "Roll-up 85", "Roll-up 100", "Roll-up 120", "X-Banner",
      ]},
      { group: "Inne materiały", items: [
        "Plakat", "Siatka Mesh", "Papier Blue back", "Tworzywo PCV 3mm",
        "Tworzywo PCV 5mm", "Tworzywo Di-bond", "Materiał PET", "Druk na materiale klienta", "Flaga", "Inne",
      ]},
    ],
  },
  {
    key: "uv",
    label: "Druk UV",
    color: "violet",
    groups: [
      { group: "Tworzywa", items: [
        "Tworzywo PCV 3mm", "Tworzywo PCV 5mm", "Tworzywo Di-bond", "Pleksi",
      ]},
      { group: "Inne", items: [
        "Druk na materiale klienta", "Inne",
      ]},
    ],
  },
  {
    key: "latex",
    label: "HP Latex",
    color: "green",
    groups: [
      { group: "Folie", items: [
        "Folia Mono", "Folia Mono + Laminat", "Folia Polimerowa", "Folia Polimerowa + Laminat",
        "Folia Wylewana", "Folia Wylewana + Laminat", "Folia Odblaskowa", "Folia OWV",
      ]},
      { group: "Banery i rollup", items: [
        "Baner Laminowany", "Baner Powlekany", "Baner Blockout",
        "Roll-up 85", "Roll-up 100", "Roll-up 120", "X-Banner",
      ]},
      { group: "Inne materiały", items: [
        "Plakat", "Siatka Mesh", "Papier Blue back", "Materiał PET", "Flaga", "Inne",
      ]},
    ],
  },
  {
    key: "sublimacja",
    label: "Sublimacyjny",
    color: "pink",
    groups: [
      { group: "Materiały", items: [
        "Flaga", "Materiał tekstylny", "Inne",
      ]},
    ],
  },
  {
    key: "cyfrowy",
    label: "Cyfrowy",
    color: "teal",
    groups: [
      { group: "Poligrafia", items: [
        "Wizytówki", "Ulotki A6", "Ulotki A5", "Ulotki A4",
        "Plakaty A3", "Plakaty A2", "Plakaty A1", "Plakaty A0",
        "Katalogi", "Teczki", "Kalendarze", "Naklejki", "Inne",
      ]},
    ],
  },
  {
    key: "offsetowy",
    label: "Offsetowy",
    color: "amber",
    groups: [
      { group: "Poligrafia", items: [
        "Wizytówki", "Ulotki A6", "Ulotki A5", "Ulotki A4",
        "Plakaty A3", "Plakaty A2", "Broszury", "Katalogi", "Inne",
      ]},
    ],
  },
  {
    key: "ploter",
    label: "Wycinanie na Ploterze",
    color: "red",
    groups: [
      { group: "Materiały", items: [
        "Folia Mono", "Folia Polimerowa", "Folia Odblaskowa", "Folia Magnetyczna", "Inne",
      ]},
    ],
  },
];

const COLOR_MAP = {
  blue:   { btn: "bg-blue-600 text-white border-blue-500",   inactive: "border-zinc-700 text-zinc-400 hover:border-blue-500/50 hover:text-blue-400" },
  orange: { btn: "bg-orange-600 text-white border-orange-500", inactive: "border-zinc-700 text-zinc-400 hover:border-orange-500/50 hover:text-orange-400" },
  violet: { btn: "bg-violet-600 text-white border-violet-500", inactive: "border-zinc-700 text-zinc-400 hover:border-violet-500/50 hover:text-violet-400" },
  green:  { btn: "bg-green-600 text-white border-green-500",  inactive: "border-zinc-700 text-zinc-400 hover:border-green-500/50 hover:text-green-400" },
  pink:   { btn: "bg-pink-600 text-white border-pink-500",    inactive: "border-zinc-700 text-zinc-400 hover:border-pink-500/50 hover:text-pink-400" },
  teal:   { btn: "bg-teal-600 text-white border-teal-500",    inactive: "border-zinc-700 text-zinc-400 hover:border-teal-500/50 hover:text-teal-400" },
  amber:  { btn: "bg-amber-600 text-white border-amber-500",  inactive: "border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400" },
  red:    { btn: "bg-red-600 text-white border-red-500",      inactive: "border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-400" },
};

export default function PrintTypeSelect({ value, onChange }) {
  const [selectedTech, setSelectedTech] = useState(() => {
    if (!value) return null;
    return TECHNOLOGIES.find(t => t.groups.some(g => g.items.includes(value)))?.key || null;
  });

  const currentTech = TECHNOLOGIES.find(t => t.key === selectedTech);

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
        {TECHNOLOGIES.map(tech => {
          const colors = COLOR_MAP[tech.color];
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