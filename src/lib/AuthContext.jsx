import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/supabase';
import { fetchCurrentUserProfile, syncCurrentUserProfile } from '@/lib/userProfiles';

const AuthContext = createContext();
const LEGACY_ADMIN_USERNAMES = new Set(['kingastachura', 'gabrielsedkowski']);

const normalizeUsername = (s) => String(s || '').trim().toLowerCase();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [profileRole, setProfileRole] = useState(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoadingAuth(true);
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error) setAuthError({ type: 'unknown', message: error.message });
      setSession(data?.session ?? null);
      setIsLoadingAuth(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;
  const username =
    user?.user_metadata?.username ||
    user?.user_metadata?.login ||
    (user?.email ? user.email.split('@')[0] : null);
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.displayName ||
    null;
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.avatarUrl ||
    null;

  const authorLabel = useMemo(() => {
    const dn = String(displayName || '').trim();
    const un = String(username || '').trim();
    return dn || un || 'Użytkownik';
  }, [displayName, username]);

  const role = useMemo(() => {
    const u = normalizeUsername(username);
    if (profileRole) return profileRole;
    return LEGACY_ADMIN_USERNAMES.has(u) ? 'admin' : 'user';
  }, [profileRole, username]);

  const isAuthenticated = !!user;

  useEffect(() => {
    let cancelled = false;

    const syncProfile = async () => {
      if (!user?.id) {
        setProfileRole(null);
        return;
      }

      try {
        await syncCurrentUserProfile({
          id: user.id,
          username,
          email: user.email,
          displayName,
          avatarUrl,
        });
        const profile = await fetchCurrentUserProfile(user.id);
        if (!cancelled) {
          setProfileRole(profile?.is_admin ? 'admin' : 'user');
        }
      } catch (error) {
        console.error('Nie udało się zsynchronizować profilu użytkownika:', error);
        if (!cancelled) setProfileRole(null);
      }
    };

    syncProfile();

    return () => {
      cancelled = true;
    };
  }, [avatarUrl, displayName, user?.email, user?.id, username]);

  const signIn = async ({ identifier, password }) => {
    setAuthError(null);
    const isEmail = String(identifier || '').includes('@');
    const email = isEmail ? identifier : null;

    if (!email) {
      // Na Supabase standardowo logujemy się email+hasło; jeśli użytkownik poda "login",
      // prosimy, żeby użył emaila (lub możemy rozszerzyć to o tabelę profili).
      throw new Error('Podaj email (Supabase Auth loguje się emailem).');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async ({ email, password, username: desiredUsername }) => {
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: desiredUsername,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async ({ username: newUsername, displayName: newDisplayName, avatarUrl: newAvatarUrl } = {}) => {
    setAuthError(null);
    const data = {};
    if (newUsername !== undefined) data.username = newUsername;
    if (newDisplayName !== undefined) data.display_name = newDisplayName;
    if (newAvatarUrl !== undefined) data.avatar_url = newAvatarUrl;
    const { error } = await supabase.auth.updateUser({ data });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        username,
        displayName,
        avatarUrl,
        authorLabel,
        role,
        isAuthenticated,
        isLoadingAuth,
        authError,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
