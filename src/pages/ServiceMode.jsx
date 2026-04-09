import React, { useEffect, useMemo, useState } from "react";
import { Plus, Save, RotateCcw, Trash2, Settings2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PRINT_TYPE_COLORS, usePrintTypeConfig } from "@/lib/printTypeConfig";
import { useAuth } from "@/lib/AuthContext";

const createTechnologyDraft = () => ({
  key: "",
  label: "",
  color: "blue",
  groups: [
    {
      group: "Nowa grupa",
      items: ["Nowy materiał"],
    },
  ],
});

export default function ServiceMode() {
  const { config, setConfig, resetConfig, isLoading, storageMode } = usePrintTypeConfig();
  const { role } = useAuth();
  const { toast } = useToast();
  const [draft, setDraft] = useState(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const totalItems = useMemo(
    () =>
      draft.reduce(
        (count, technology) =>
          count + technology.groups.reduce((groupCount, group) => groupCount + group.items.length, 0),
        0
      ),
    [draft]
  );

  const updateTechnology = (techIndex, updater) => {
    setDraft((prev) =>
      prev.map((technology, index) =>
        index === techIndex ? updater(technology) : technology
      )
    );
  };

  const addTechnology = () => {
    setDraft((prev) => [...prev, createTechnologyDraft()]);
  };

  const removeTechnology = (techIndex) => {
    setDraft((prev) => prev.filter((_, index) => index !== techIndex));
  };

  const addGroup = (techIndex) => {
    updateTechnology(techIndex, (technology) => ({
      ...technology,
      groups: [...technology.groups, { group: "Nowa grupa", items: ["Nowy materiał"] }],
    }));
  };

  const updateGroup = (techIndex, groupIndex, updater) => {
    updateTechnology(techIndex, (technology) => ({
      ...technology,
      groups: technology.groups.map((group, index) =>
        index === groupIndex ? updater(group) : group
      ),
    }));
  };

  const removeGroup = (techIndex, groupIndex) => {
    updateTechnology(techIndex, (technology) => ({
      ...technology,
      groups: technology.groups.filter((_, index) => index !== groupIndex),
    }));
  };

  const addItem = (techIndex, groupIndex) => {
    updateGroup(techIndex, groupIndex, (group) => ({
      ...group,
      items: [...group.items, "Nowy materiał"],
    }));
  };

  const updateItem = (techIndex, groupIndex, itemIndex, value) => {
    updateGroup(techIndex, groupIndex, (group) => ({
      ...group,
      items: group.items.map((item, index) => (index === itemIndex ? value : item)),
    }));
  };

  const removeItem = (techIndex, groupIndex, itemIndex) => {
    updateGroup(techIndex, groupIndex, (group) => ({
      ...group,
      items: group.items.filter((_, index) => index !== itemIndex),
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setConfig(draft)
      .then((saved) => {
        setDraft(saved);
        toast({
          variant: "success",
          title: "Tryb serwisowy zapisany",
          description:
            storageMode === "supabase"
              ? "Nowa konfiguracja kategorii i materiałów jest już aktywna dla wszystkich."
              : "Konfiguracja została zapisana. Gdy tabela w Supabase będzie gotowa, zapis przełączy się na wspólny.",
        });
      })
      .finally(() => setSaving(false));
  };

  const handleReset = () => {
    setSaving(true);
    resetConfig()
      .then((reset) => {
        setDraft(reset);
        toast({
          title: "Przywrócono ustawienia domyślne",
          description: "Domyślna lista technologii i materiałów została odtworzona.",
        });
      })
      .finally(() => setSaving(false));
  };

  if (role !== "admin") {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-red-900/50 bg-zinc-900/70 p-8 text-center">
        <ShieldAlert className="w-10 h-10 mx-auto text-red-400" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-100">Brak dostępu do trybu serwisowego</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Ten ekran jest dostępny tylko dla administratorów.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-400" />
        <p className="mt-3 text-sm text-zinc-400">Ładowanie konfiguracji trybu serwisowego...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
            <Settings2 className="w-3.5 h-3.5" />
            Tryb serwisowy
          </div>
          <h1 className="mt-3 text-3xl font-bold text-zinc-100">Edytor kategorii i materiałów</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Tutaj zmienisz technologie, grupy i konkretne pozycje widoczne w formularzu zleceń.
            Przykładowo możesz dodać plakaty i flagi, podmienić folie w Mild Solvent albo całkiem usunąć banery.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Tryb zapisu: {storageMode === "supabase" ? "Supabase wspólny dla wszystkich" : "lokalny awaryjny"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Przywróć domyślne
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Zapisz konfigurację
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Technologie</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-100">{draft.length}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Grupy</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-100">
            {draft.reduce((count, technology) => count + technology.groups.length, 0)}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Materiały</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-100">{totalItems}</div>
        </div>
      </div>

      <div className="space-y-4">
        {draft.map((technology, techIndex) => (
          <section
            key={`${technology.key || "technology"}-${techIndex}`}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden"
          >
            <div className="border-b border-zinc-800 bg-zinc-900/80 px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                <div className="grid flex-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label className="text-xs text-zinc-400">Nazwa technologii</Label>
                    <Input
                      value={technology.label}
                      onChange={(e) =>
                        updateTechnology(techIndex, (current) => ({
                          ...current,
                          label: e.target.value,
                        }))
                      }
                      className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100"
                      placeholder="np. Mild Solvent"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">Klucz techniczny</Label>
                    <Input
                      value={technology.key}
                      onChange={(e) =>
                        updateTechnology(techIndex, (current) => ({
                          ...current,
                          key: e.target.value,
                        }))
                      }
                      className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100"
                      placeholder="np. mild_solvent"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">Kolor przycisku</Label>
                    <Select
                      value={technology.color}
                      onValueChange={(value) =>
                        updateTechnology(techIndex, (current) => ({
                          ...current,
                          color: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {PRINT_TYPE_COLORS.map((color) => (
                          <SelectItem key={color} value={color} className="text-zinc-100 focus:bg-zinc-700">
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addGroup(techIndex)}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Dodaj grupę
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeTechnology(techIndex)}
                    className="border-red-900/70 text-red-300 hover:bg-red-950/40 hover:text-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Usuń technologię
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {technology.groups.map((group, groupIndex) => (
                <div key={`${group.group}-${groupIndex}`} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <Label className="text-xs text-zinc-400">Nazwa grupy</Label>
                      <Input
                        value={group.group}
                        onChange={(e) =>
                          updateGroup(techIndex, groupIndex, (current) => ({
                            ...current,
                            group: e.target.value,
                          }))
                        }
                        className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100"
                        placeholder="np. Folie"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addItem(techIndex, groupIndex)}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Dodaj materiał
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeGroup(techIndex, groupIndex)}
                        className="border-red-900/70 text-red-300 hover:bg-red-950/40 hover:text-red-200"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Usuń grupę
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {group.items.map((item, itemIndex) => (
                      <div key={`${item}-${itemIndex}`} className="flex items-center gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateItem(techIndex, groupIndex, itemIndex, e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                          placeholder="np. Flaga"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem(techIndex, groupIndex, itemIndex)}
                          className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addTechnology}
        className="w-full border-dashed border-zinc-700 bg-zinc-900/40 py-6 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
      >
        <Plus className="w-4 h-4 mr-2" />
        Dodaj nową technologię
      </Button>
    </div>
  );
}
