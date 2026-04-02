import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/supabase';

const AuthContext = createContext();
const ADMIN_USERNAMES = new Set(['kingastachura', 'gabrielsedkowski']);

const normalizeUsername = (s) => String(s || '').trim().toLowerCase();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

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

  const role = useMemo(() => {
    const u = normalizeUsername(username);
    return ADMIN_USERNAMES.has(u) ? 'admin' : 'user';
  }, [username]);

  const isAuthenticated = !!user;

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

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        username,
        role,
        isAuthenticated,
        isLoadingAuth,
        authError,
        signIn,
        signUp,
        signOut,
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
