import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { isAuthenticated, isLoadingAuth, signIn } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  if (isLoadingAuth) return null;
  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn({ identifier, password });
    } catch (err) {
      setError(err?.message || "Nie udało się zalogować");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">Logowanie</h1>
        <p className="text-sm text-zinc-500 mt-1">Zaloguj się do GCRM</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label className="text-zinc-400 text-xs">Email</Label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
              placeholder="email@firma.pl"
              autoComplete="email"
            />
          </div>
          <div>
            <Label className="text-zinc-400 text-xs">Hasło</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
              autoComplete="current-password"
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
            disabled={loading || !identifier || !password}
          >
            {loading ? "Logowanie..." : "Zaloguj"}
          </Button>
        </form>

        <div className="mt-5 text-sm text-zinc-500">
          Nie masz konta?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-300">
            Zarejestruj się
          </Link>
        </div>
      </div>
    </div>
  );
}

