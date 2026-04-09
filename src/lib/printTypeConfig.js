import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabase";

export const PRINT_TYPE_CONFIG_STORAGE_KEY = "mobart.printTypeConfig";
export const PRINT_TYPE_CONFIG_REMOTE_KEY = "print_type_config";

export const COLOR_MAP = {
  blue: { btn: "bg-blue-600 text-white border-blue-500", inactive: "border-zinc-700 text-zinc-400 hover:border-blue-500/50 hover:text-blue-400" },
  orange: { btn: "bg-orange-600 text-white border-orange-500", inactive: "border-zinc-700 text-zinc-400 hover:border-orange-500/50 hover:text-orange-400" },
  violet: { btn: "bg-violet-600 text-white border-violet-500", inactive: "border-zinc-700 text-zinc-400 hover:border-violet-500/50 hover:text-violet-400" },
  green: { btn: "bg-green-600 text-white border-green-500", inactive: "border-zinc-700 text-zinc-400 hover:border-green-500/50 hover:text-green-400" },
  pink: { btn: "bg-pink-600 text-white border-pink-500", inactive: "border-zinc-700 text-zinc-400 hover:border-pink-500/50 hover:text-pink-400" },
  teal: { btn: "bg-teal-600 text-white border-teal-500", inactive: "border-zinc-700 text-zinc-400 hover:border-teal-500/50 hover:text-teal-400" },
  amber: { btn: "bg-amber-600 text-white border-amber-500", inactive: "border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400" },
  red: { btn: "bg-red-600 text-white border-red-500", inactive: "border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-400" },
};

export const PRINT_TYPE_COLORS = Object.keys(COLOR_MAP);

export const DEFAULT_PRINT_TYPE_CONFIG = [
  {
    key: "mild_solvent",
    label: "Mild Solvent",
    color: "blue",
    groups: [
      {
        group: "Folie",
        items: [
          "Folia Mono",
          "Folia Mono + Laminat",
          "Folia Polimerowa",
          "Folia Polimerowa + Laminat",
          "Folia Wylewana",
          "Folia Wylewana + Laminat",
          "Folia Odblaskowa",
          "Folia Odblaskowa + Laminat",
          "Folia Magnetyczna",
          "Folia Magnetyczna + Cięcie",
          "Folia Mrożona",
          "Folia MacTac",
          "Folia BackLight",
          "Folia BackLight + Laminat",
          "Folia OWV",
        ],
      },
      {
        group: "Banery i rollup",
        items: [
          "Baner Laminowany",
          "Baner Powlekany",
          "Baner Odblaskowy",
          "Baner Blockout",
          "Roll-up 85",
          "Roll-up 100",
          "Roll-up 120",
          "X-Banner",
        ],
      },
      {
        group: "Inne materiały",
        items: [
          "Plakat",
          "Siatka Mesh",
          "Papier Blue back",
          "Tworzywo PCV 3mm",
          "Tworzywo PCV 5mm",
          "Tworzywo Di-bond",
          "Materiał PET",
          "Druk na materiale klienta",
          "Flaga",
          "Inne",
        ],
      },
    ],
  },
  {
    key: "hard_solvent",
    label: "Hard Solvent",
    color: "orange",
    groups: [
      {
        group: "Banery i rollup",
        items: [
          "Baner Laminowany",
          "Baner Powlekany",
          "Baner Odblaskowy",
          "Baner Blockout",
          "Roll-up 85",
          "Roll-up 100",
          "Roll-up 120",
          "X-Banner",
        ],
      },
      {
        group: "Inne materiały",
        items: [
          "Plakat",
          "Siatka Mesh",
          "Papier Blue back",
          "Tworzywo PCV 3mm",
          "Tworzywo PCV 5mm",
          "Tworzywo Di-bond",
          "Materiał PET",
          "Druk na materiale klienta",
          "Flaga",
          "Inne",
        ],
      },
    ],
  },
  {
    key: "uv",
    label: "Druk UV",
    color: "violet",
    groups: [
      {
        group: "Tworzywa",
        items: ["Tworzywo PCV 3mm", "Tworzywo PCV 5mm", "Tworzywo Di-bond", "Pleksi"],
      },
      {
        group: "Inne",
        items: ["Druk na materiale klienta", "Inne"],
      },
    ],
  },
  {
    key: "latex",
    label: "HP Latex",
    color: "green",
    groups: [
      {
        group: "Folie",
        items: [
          "Folia Mono",
          "Folia Mono + Laminat",
          "Folia Polimerowa",
          "Folia Polimerowa + Laminat",
          "Folia Wylewana",
          "Folia Wylewana + Laminat",
          "Folia Odblaskowa",
          "Folia OWV",
        ],
      },
      {
        group: "Banery i rollup",
        items: [
          "Baner Laminowany",
          "Baner Powlekany",
          "Baner Blockout",
          "Roll-up 85",
          "Roll-up 100",
          "Roll-up 120",
          "X-Banner",
        ],
      },
      {
        group: "Inne materiały",
        items: ["Plakat", "Siatka Mesh", "Papier Blue back", "Materiał PET", "Flaga", "Inne"],
      },
    ],
  },
  {
    key: "sublimacja",
    label: "Sublimacyjny",
    color: "pink",
    groups: [
      {
        group: "Materiały",
        items: ["Flaga", "Materiał tekstylny", "Inne"],
      },
    ],
  },
  {
    key: "cyfrowy",
    label: "Cyfrowy",
    color: "teal",
    groups: [
      {
        group: "Poligrafia",
        items: [
          "Wizytówki",
          "Ulotki A6",
          "Ulotki A5",
          "Ulotki A4",
          "Plakaty A3",
          "Plakaty A2",
          "Plakaty A1",
          "Plakaty A0",
          "Katalogi",
          "Teczki",
          "Kalendarze",
          "Naklejki",
          "Inne",
        ],
      },
    ],
  },
  {
    key: "offsetowy",
    label: "Offsetowy",
    color: "amber",
    groups: [
      {
        group: "Poligrafia",
        items: ["Wizytówki", "Ulotki A6", "Ulotki A5", "Ulotki A4", "Plakaty A3", "Plakaty A2", "Broszury", "Katalogi", "Inne"],
      },
    ],
  },
  {
    key: "ploter",
    label: "Wycinanie na Ploterze",
    color: "red",
    groups: [
      {
        group: "Materiały",
        items: ["Folia Mono", "Folia Polimerowa", "Folia Odblaskowa", "Folia Magnetyczna", "Inne"],
      },
    ],
  },
];

function cloneConfig(config) {
  return JSON.parse(JSON.stringify(config));
}

function slugifyKey(value, fallback = "nowa_technologia") {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
}

function normalizeItems(items) {
  const seen = new Set();

  return (Array.isArray(items) ? items : [])
    .map((item) => String(item || "").trim())
    .filter((item) => {
      if (!item) return false;
      const dedupeKey = item.toLowerCase();
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });
}

function normalizeGroups(groups) {
  return (Array.isArray(groups) ? groups : [])
    .map((group, index) => ({
      group: String(group?.group || "").trim() || `Grupa ${index + 1}`,
      items: normalizeItems(group?.items),
    }))
    .filter((group) => group.items.length > 0);
}

export function normalizePrintTypeConfig(config) {
  const usedKeys = new Set();

  return (Array.isArray(config) ? config : [])
    .map((technology, index) => {
      const label = String(technology?.label || "").trim() || `Technologia ${index + 1}`;
      let key = slugifyKey(technology?.key || label, `technologia_${index + 1}`);
      while (usedKeys.has(key)) {
        key = `${key}_${index + 1}`;
      }
      usedKeys.add(key);

      const color = PRINT_TYPE_COLORS.includes(technology?.color) ? technology.color : "blue";
      const groups = normalizeGroups(technology?.groups);

      return { key, label, color, groups };
    })
    .filter((technology) => technology.groups.length > 0);
}

function getFallbackConfig() {
  if (typeof window === "undefined") {
    return cloneConfig(DEFAULT_PRINT_TYPE_CONFIG);
  }

  try {
    const raw = window.localStorage.getItem(PRINT_TYPE_CONFIG_STORAGE_KEY);
    if (!raw) return cloneConfig(DEFAULT_PRINT_TYPE_CONFIG);
    const parsed = JSON.parse(raw);
    const normalized = normalizePrintTypeConfig(parsed);
    return normalized.length > 0 ? normalized : cloneConfig(DEFAULT_PRINT_TYPE_CONFIG);
  } catch (error) {
    console.error("Nie udało się odczytać lokalnej konfiguracji typów wydruku:", error);
    return cloneConfig(DEFAULT_PRINT_TYPE_CONFIG);
  }
}

function saveFallbackConfig(config) {
  const normalized = normalizePrintTypeConfig(config);
  const nextConfig = normalized.length > 0 ? normalized : cloneConfig(DEFAULT_PRINT_TYPE_CONFIG);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(PRINT_TYPE_CONFIG_STORAGE_KEY, JSON.stringify(nextConfig));
    window.dispatchEvent(new CustomEvent("print-type-config-change"));
  }

  return nextConfig;
}

async function fetchRemoteConfig() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", PRINT_TYPE_CONFIG_REMOTE_KEY)
    .maybeSingle();

  if (error) throw error;

  const normalized = normalizePrintTypeConfig(data?.value);
  return normalized.length > 0 ? normalized : cloneConfig(DEFAULT_PRINT_TYPE_CONFIG);
}

async function saveRemoteConfig(config) {
  const normalized = normalizePrintTypeConfig(config);
  const nextConfig = normalized.length > 0 ? normalized : cloneConfig(DEFAULT_PRINT_TYPE_CONFIG);

  const { error } = await supabase
    .from("app_settings")
    .upsert(
      [{ key: PRINT_TYPE_CONFIG_REMOTE_KEY, value: nextConfig }],
      { onConflict: "key" }
    );

  if (error) throw error;

  saveFallbackConfig(nextConfig);
  return nextConfig;
}

function isMissingRemoteTable(error) {
  const message = String(error?.message || "").toLowerCase();
  const details = String(error?.details || "").toLowerCase();
  return (
    message.includes("app_settings") ||
    message.includes("relation") ||
    message.includes("does not exist") ||
    details.includes("does not exist")
  );
}

export function findTechnologyByItem(config, value) {
  return config.find((technology) =>
    technology.groups.some((group) => group.items.includes(value))
  );
}

export function usePrintTypeConfig() {
  const [config, setConfig] = useState(() => getFallbackConfig());
  const [isLoading, setIsLoading] = useState(true);
  const [storageMode, setStorageMode] = useState("local");

  useEffect(() => {
    let mounted = true;

    const syncRemote = async () => {
      setIsLoading(true);
      try {
        const remoteConfig = await fetchRemoteConfig();
        if (!mounted) return;
        setConfig(remoteConfig);
        saveFallbackConfig(remoteConfig);
        setStorageMode("supabase");
      } catch (error) {
        if (!mounted) return;
        console.error("Nie udało się pobrać konfiguracji z Supabase:", error);
        setConfig(getFallbackConfig());
        setStorageMode(isMissingRemoteTable(error) ? "local" : "local");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    syncRemote();

    const syncFallback = () => setConfig(getFallbackConfig());
    window.addEventListener("storage", syncFallback);
    window.addEventListener("print-type-config-change", syncFallback);

    return () => {
      mounted = false;
      window.removeEventListener("storage", syncFallback);
      window.removeEventListener("print-type-config-change", syncFallback);
    };
  }, []);

  const saveConfig = useCallback(async (nextConfig) => {
    try {
      const saved = await saveRemoteConfig(nextConfig);
      setConfig(saved);
      setStorageMode("supabase");
      return saved;
    } catch (error) {
      console.error("Nie udało się zapisać konfiguracji do Supabase:", error);
      const saved = saveFallbackConfig(nextConfig);
      setConfig(saved);
      setStorageMode("local");
      return saved;
    }
  }, []);

  const resetConfig = useCallback(async () => {
    return saveConfig(cloneConfig(DEFAULT_PRINT_TYPE_CONFIG));
  }, [saveConfig]);

  return useMemo(
    () => ({
      config,
      isLoading,
      storageMode,
      setConfig: saveConfig,
      resetConfig,
      defaultConfig: cloneConfig(DEFAULT_PRINT_TYPE_CONFIG),
    }),
    [config, isLoading, resetConfig, saveConfig, storageMode]
  );
}
