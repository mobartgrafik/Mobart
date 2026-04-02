import React, { useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { user, username, displayName, avatarUrl, role, updateProfile } = useAuth();
  const [formDisplayName, setFormDisplayName] = useState(displayName || "");
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changingLogin, setChangingLogin] = useState(false);
  const [confirmCurrentLogin, setConfirmCurrentLogin] = useState("");
  const [newLogin, setNewLogin] = useState("");

  const normalizedRole = useMemo(() => (role === "admin" ? "Administrator" : "Użytkownik"), [role]);

  const onSave = async () => {
    setSaving(true);
    try {
      let uploadedAvatarUrl = undefined;

      if (newAvatarFile && user?.id) {
        const ext = newAvatarFile.name?.split(".").pop() || "png";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, newAvatarFile, { upsert: true, contentType: newAvatarFile.type });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        uploadedAvatarUrl = data?.publicUrl;
      }

      await updateProfile({
        displayName: formDisplayName.trim(),
        avatarUrl: uploadedAvatarUrl,
      });
      toast.success("Profil zapisany");
      setNewAvatarFile(null);
    } catch (e) {
      toast.error(e?.message || "Nie udało się zapisać profilu (sprawdź konfigurację bucketu `avatars` w Supabase)");
    } finally {
      setSaving(false);
    }
  };

  const onChangeLogin = async () => {
    const current = String(username || "").trim().toLowerCase();
    const typed = String(confirmCurrentLogin || "").trim().toLowerCase();
    const next = String(newLogin || "").trim();

    if (!current) {
      toast.error("Brak aktualnego loginu");
      return;
    }
    if (typed !== current) {
      toast.error("Niepoprawne potwierdzenie aktualnego loginu");
      return;
    }
    if (!next) {
      toast.error("Podaj nowy login");
      return;
    }

    setChangingLogin(true);
    try {
      await updateProfile({ username: next });
      toast.success("Login zmieniony");
      setConfirmCurrentLogin("");
      setNewLogin("");
    } catch (e) {
      toast.error(e?.message || "Nie udało się zmienić loginu");
    } finally {
      setChangingLogin(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Profil</h1>
        <p className="text-sm text-zinc-500 mt-1">Ustaw nazwę wyświetlaną i avatar.</p>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-5 space-y-4">
        <div className="text-sm text-zinc-500">
          Rola: <span className="text-zinc-200 font-medium">{normalizedRole}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-zinc-400 text-sm">Brak</span>
            )}
          </div>
          <div className="flex-1">
            <Label className="text-zinc-400 text-xs">Avatar</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setNewAvatarFile(e.target.files?.[0] || null)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
            />
            <div className="text-xs text-zinc-600 mt-1">
              Plik zapisuje się do Supabase Storage bucket `avatars` i jest podpinany do profilu.
            </div>
          </div>
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
          <Input value={username || ""} readOnly className="bg-zinc-800/50 border-zinc-700 text-zinc-500 mt-1" />
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

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-5">
        <Accordion type="single" collapsible>
          <AccordionItem value="advanced" className="border-none">
            <AccordionTrigger className="text-zinc-200 hover:no-underline">Zaawansowane</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="text-sm text-zinc-500">
                  Zmiana loginu wpływa na uprawnienia admina i identyfikację użytkownika. Ukryte tutaj, żeby nie zmienić przypadkiem.
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      Zmień login
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Zmień login</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Aby potwierdzić, wpisz aktualny login oraz nowy login.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-zinc-400 text-xs">Potwierdź aktualny login</Label>
                        <Input
                          value={confirmCurrentLogin}
                          onChange={(e) => setConfirmCurrentLogin(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                          placeholder={username || ""}
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-400 text-xs">Nowy login</Label>
                        <Input
                          value={newLogin}
                          onChange={(e) => setNewLogin(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                          placeholder="np. kinga.stachura"
                        />
                      </div>
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Nie</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onChangeLogin}
                        disabled={changingLogin}
                      >
                        {changingLogin ? "Zmieniam..." : "Tak, zmień"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

