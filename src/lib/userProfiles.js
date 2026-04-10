import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabase";

function normalizeProfile(profile) {
  return {
    id: profile?.id || "",
    username: String(profile?.username || "").trim(),
    email: String(profile?.email || "").trim(),
    display_name: String(profile?.display_name || "").trim(),
    avatar_url: String(profile?.avatar_url || "").trim(),
    is_admin: Boolean(profile?.is_admin),
  };
}

function isMissingProfilesTable(error) {
  const message = String(error?.message || "").toLowerCase();
  const details = String(error?.details || "").toLowerCase();
  return message.includes("user_profiles") || details.includes("user_profiles") || message.includes("does not exist");
}

export async function syncCurrentUserProfile({ id, username, email, displayName, avatarUrl }) {
  if (!id) return null;

  const payload = {
    id,
    username: String(username || "").trim(),
    email: String(email || "").trim(),
    display_name: String(displayName || "").trim() || null,
    avatar_url: String(avatarUrl || "").trim() || null,
  };

  const { error } = await supabase
    .from("user_profiles")
    .upsert([payload], { onConflict: "id" });

  if (error) throw error;
  return payload;
}

export async function fetchCurrentUserProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeProfile(data) : null;
}

export async function deleteUserAccount(targetUserId) {
  if (!targetUserId) {
    throw new Error("Brak identyfikatora użytkownika.");
  }

  const { error } = await supabase.rpc("admin_delete_user", {
    target_user_id: targetUserId,
  });

  if (error) throw error;
  return true;
}

export function useUserProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("username", { ascending: true });

      if (error) throw error;

      setProfiles((data || []).map(normalizeProfile));
      setIsAvailable(true);
    } catch (error) {
      console.error("Nie udało się pobrać user_profiles:", error);
      setProfiles([]);
      setIsAvailable(!isMissingProfilesTable(error) ? false : false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveProfiles = useCallback(async (nextProfiles) => {
    const normalized = (Array.isArray(nextProfiles) ? nextProfiles : []).map(normalizeProfile);

    const { error } = await supabase
      .from("user_profiles")
      .upsert(normalized, { onConflict: "id" });

    if (error) throw error;

    setProfiles(normalized.sort((a, b) => a.username.localeCompare(b.username, "pl")));
    setIsAvailable(true);
    return normalized;
  }, []);

  return useMemo(
    () => ({
      profiles,
      isLoading,
      isAvailable,
      refresh,
      saveProfiles,
    }),
    [isAvailable, isLoading, profiles, refresh, saveProfiles]
  );
}
