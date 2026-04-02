import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const { isAuthenticated, isLoadingAuth, signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (isLoadingAuth) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp({ email, password, username });
      setDone(true);
    } catch (err) {
      setError(err?.message || "Nie udało się zarejestrować");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">Rejestracja</h1>
        <p className="text-sm text-zinc-500 mt-1">Utwórz konto do GCRM</p>

        {done ? (
          <div className="mt-6 space-y-3">
            <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              Konto utworzone. Jeśli masz włączone potwierdzanie emaila w Supabase, sprawdź skrzynkę i potwierdź adres.
            </div>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">
              Przejdź do logowania
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label className="text-zinc-400 text-xs">Login *</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                placeholder="np. kingastachura"
                autoComplete="username"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Email *</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                placeholder="email@firma.pl"
                autoComplete="email"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Hasło *</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !username || !email || !password}
            >
              {loading ? "Rejestracja..." : "Zarejestruj"}
            </Button>
          </form>
        )}

        <div className="mt-5 text-sm text-zinc-500">
          Masz konto?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Zaloguj się
          </Link>
        </div>
      </div>
    </div>
  );
}

