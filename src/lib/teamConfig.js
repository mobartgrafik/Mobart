import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabase";

const TEAM_CONFIG_STORAGE_KEY = "mobart.teamConfig";
const REMOTE_KEYS = {
  employees: "employee_list",
  designers: "designer_list",
};

const DEFAULT_TEAM_CONFIG = {
  employees: ["Kinga", "Kinga Noszczyk", "Klaudia", "Gabryś", "Łukasz", "Darek", "Robert", "Artur"],
  designers: ["Gabriel", "Klaudia"],
};

function normalizeList(items) {
  const seen = new Set();

  return (Array.isArray(items) ? items : [])
    .map((item) => String(item || "").trim())
    .filter((item) => {
      if (!item) return false;
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeTeamConfig(config) {
  return {
    employees: normalizeList(config?.employees?.length ? config.employees : DEFAULT_TEAM_CONFIG.employees),
    designers: normalizeList(config?.designers?.length ? config.designers : DEFAULT_TEAM_CONFIG.designers),
  };
}

function getFallbackTeamConfig() {
  if (typeof window === "undefined") return normalizeTeamConfig(DEFAULT_TEAM_CONFIG);

  try {
    const raw = window.localStorage.getItem(TEAM_CONFIG_STORAGE_KEY);
    if (!raw) return normalizeTeamConfig(DEFAULT_TEAM_CONFIG);
    return normalizeTeamConfig(JSON.parse(raw));
  } catch (error) {
    console.error("Nie udało się odczytać lokalnej konfiguracji zespołu:", error);
    return normalizeTeamConfig(DEFAULT_TEAM_CONFIG);
  }
}

function saveFallbackTeamConfig(config) {
  const normalized = normalizeTeamConfig(config);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(TEAM_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent("team-config-change"));
  }

  return normalized;
}

async function fetchRemoteTeamConfig() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", Object.values(REMOTE_KEYS));

  if (error) throw error;

  const remote = {
    employees: DEFAULT_TEAM_CONFIG.employees,
    designers: DEFAULT_TEAM_CONFIG.designers,
  };

  (data || []).forEach((row) => {
    if (row.key === REMOTE_KEYS.employees) remote.employees = row.value;
    if (row.key === REMOTE_KEYS.designers) remote.designers = row.value;
  });

  return normalizeTeamConfig(remote);
}

async function saveRemoteTeamConfig(config) {
  const normalized = normalizeTeamConfig(config);
  const rows = [
    { key: REMOTE_KEYS.employees, value: normalized.employees },
    { key: REMOTE_KEYS.designers, value: normalized.designers },
  ];

  const { error } = await supabase
    .from("app_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) throw error;

  saveFallbackTeamConfig(normalized);
  return normalized;
}

export function useTeamConfig() {
  const [config, setConfigState] = useState(() => getFallbackTeamConfig());
  const [isLoading, setIsLoading] = useState(true);
  const [storageMode, setStorageMode] = useState("local");

  useEffect(() => {
    let mounted = true;

    const syncRemote = async () => {
      setIsLoading(true);
      try {
        const remote = await fetchRemoteTeamConfig();
        if (!mounted) return;
        setConfigState(remote);
        saveFallbackTeamConfig(remote);
        setStorageMode("supabase");
      } catch (error) {
        if (!mounted) return;
        console.error("Nie udało się pobrać konfiguracji zespołu z Supabase:", error);
        setConfigState(getFallbackTeamConfig());
        setStorageMode("local");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    syncRemote();

    const syncFallback = () => setConfigState(getFallbackTeamConfig());
    window.addEventListener("storage", syncFallback);
    window.addEventListener("team-config-change", syncFallback);

    return () => {
      mounted = false;
      window.removeEventListener("storage", syncFallback);
      window.removeEventListener("team-config-change", syncFallback);
    };
  }, []);

  const setConfig = useCallback(async (nextConfig) => {
    try {
      const saved = await saveRemoteTeamConfig(nextConfig);
      setConfigState(saved);
      setStorageMode("supabase");
      return saved;
    } catch (error) {
      console.error("Nie udało się zapisać konfiguracji zespołu do Supabase:", error);
      const saved = saveFallbackTeamConfig(nextConfig);
      setConfigState(saved);
      setStorageMode("local");
      return saved;
    }
  }, []);

  return useMemo(
    () => ({
      config,
      isLoading,
      storageMode,
      setConfig,
      defaultConfig: normalizeTeamConfig(DEFAULT_TEAM_CONFIG),
    }),
    [config, isLoading, setConfig, storageMode]
  );
}
