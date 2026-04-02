import React, { useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Profile() {
  const { username, displayName, role, updateProfile } = useAuth();
  const [formUsername, setFormUsername] = useState(username || "");
  const [formDisplayName, setFormDisplayName] = useState(displayName || "");
  const [saving, setSaving] = useState(false);

  const normalizedRole = useMemo(() => (role === "admin" ? "Administrator" : "Użytkownik"), [role]);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        username: formUsername.trim(),
        displayName: formDisplayName.trim(),
      });
      toast.success("Profil zapisany");
    } catch (e) {
      toast.error(e?.message || "Nie udało się zapisać profilu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Profil</h1>
        <p className="text-sm text-zinc-500 mt-1">Ustaw nazwę wyświetlaną i login.</p>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-5 space-y-4">
        <div className="text-sm text-zinc-500">
          Rola: <span className="text-zinc-200 font-medium">{normalizedRole}</span>
        </div>

        <div>
          <Label className="text-zinc-400 text-xs">Nazwa wyświetlana</Label>
          <Input
            value={formDisplayName}
            onChange={(e) => setFormDisplayName(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
            placeholder="np. Kinga"
          />
          <div className="text-xs text-zinc-600 mt-1">
            Ta nazwa będzie widoczna w komentarzach i historii zmian.
          </div>
        </div>

        <div>
          <Label className="text-zinc-400 text-xs">Login</Label>
          <Input
            value={formUsername}
            onChange={(e) => setFormUsername(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
            placeholder="np. kingastachura"
          />
          <div className="text-xs text-zinc-600 mt-1">
            Login jest używany m.in. do nadawania uprawnień admina (dla `kingastachura`, `gabrielsedkowski`).
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </div>
    </div>
  );
}

