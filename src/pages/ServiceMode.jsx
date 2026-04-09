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

const SERVICE_COLOR_ACCENTS = {
  blue: {
    section: "border-blue-900/40 bg-gradient-to-br from-blue-500/8 via-zinc-900/60 to-zinc-900/60",
    header: "bg-blue-500/8",
    pill: "border-blue-500/30 bg-blue-500/10 text-blue-200",
    trigger: "border-blue-500/35 bg-blue-500/10 text-blue-100",
    dot: "bg-blue-400",
    optionText: "text-blue-300",
  },
  orange: {
    section: "border-orange-900/40 bg-gradient-to-br from-orange-500/8 via-zinc-900/60 to-zinc-900/60",
    header: "bg-orange-500/8",
    pill: "border-orange-500/30 bg-orange-500/10 text-orange-200",
    trigger: "border-orange-500/35 bg-orange-500/10 text-orange-100",
    dot: "bg-orange-400",
    optionText: "text-orange-300",
  },
  violet: {
    section: "border-violet-900/40 bg-gradient-to-br from-violet-500/8 via-zinc-900/60 to-zinc-900/60",
    header: "bg-violet-500/8",
    pill: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    trigger: "border-violet-500/35 bg-violet-500/10 text-violet-100",
    dot: "bg-violet-400",
    optionText: "text-violet-300",
  },
  green: {
    section: "border-green-900/40 bg-gradient-to-br from-green-500/8 via-zinc-900/60 to-zinc-900/60",
    header: "bg-green-500/8",
    pill: "border-green-500/30 bg-green-500/10 text-green-200",
    trigger: "border-green-500/35 bg-green-500/10 text-green-100",
    dot: "bg-green-400",
    optionText: "text-green-300",
  },
  pink: {
    section: "border-pink-900/40 bg-gradient-to-br from-pink-500/8 via-zinc-900/60 to-zinc-900/60",
    header: "bg-pink-500/8",
    pill: "border-pink-500/30 bg-pink-500/10 text-pink-200",
    trigger: "border-pink-500/35 bg-pink-500/10 text-pink-100",
    dot: "bg-pink-400",
    optionText: "text-pink-300",
  },
  teal: {
    section: "border-teal-900/40 bg-gradient-to-br from-teal-500/8 via-zinc-900/60 to-zinc-900/60",
    header: "bg-teal-500/8",
    pill: "border-teal-500/30 bg-teal-500/10 text-teal-200",
    trigger: "border-teal-500/35 bg-teal-500/10 text-teal-100",
    dot: "bg-teal-400",
    optionText: "text-teal-300",
  },
  amber: {
    section: "border-amber-900/40 bg-gradient-to-br from-amber-500/8 via-zinc-900/60 to-zinc-900/60",
    header: "bg-amber-500/8",
    pill: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    trigger: "border-amber-500/35 bg-amber-500/10 text-amber-100",
    dot: "bg-amber-400",
    optionText: "text-amber-300",
  },
  red: {
    section: "border-red-900/40 bg-gradient-to-br from-red-500/8 via-zinc-900/60 to-zinc-900/60",
    header: "bg-red-500/8",
    pill: "border-red-500/30 bg-red-500/10 text-red-200",
    trigger: "border-red-500/35 bg-red-500/10 text-red-100",
    dot: "bg-red-400",
    optionText: "text-red-300",
  },
};

const getColorAccent = (color) => SERVICE_COLOR_ACCENTS[color] || SERVICE_COLOR_ACCENTS.blue;
const formatColorLabel = (color) => color.charAt(0).toUpperCase() + color.slice(1);

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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
            <Settings2 className="w-3.5 h-3.5" />
            Tryb serwisowy
          </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-100 lg:text-4xl">Edytor kategorii i materiałów</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-400">
              Tutaj zmienisz technologie, grupy i konkretne pozycje widoczne w formularzu zleceń.
              Przykładowo możesz dodać plakaty i flagi, podmienić folie w Mild Solvent albo całkiem usunąć banery.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-400">
              Tryb zapisu: {storageMode === "supabase" ? "Supabase wspólny dla wszystkich" : "lokalny awaryjny"}
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[240px] xl:items-stretch">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={saving}
              className="h-11 justify-center border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <RotateCcw className="w-4 h-4" />
              Przywróć domyślne
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-11 justify-center bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Zapisz konfigurację
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Technologie</div>
          <div className="mt-3 text-4xl font-semibold text-zinc-100">{draft.length}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Grupy</div>
          <div className="mt-3 text-4xl font-semibold text-zinc-100">
            {draft.reduce((count, technology) => count + technology.groups.length, 0)}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Materiały</div>
          <div className="mt-3 text-4xl font-semibold text-zinc-100">{totalItems}</div>
        </div>
      </div>

      <div className="space-y-6">
        {draft.map((technology, techIndex) => {
          const accent = getColorAccent(technology.color);

          return (
            <section
              key={`${technology.key || "technology"}-${techIndex}`}
              className={`overflow-hidden rounded-3xl border shadow-[0_0_0_1px_rgba(24,24,27,0.3)] ${accent.section}`}
            >
              <div className={`border-b border-zinc-800 px-6 py-5 ${accent.header}`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Technologia</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${accent.dot}`} />
                    <h2 className="text-2xl font-semibold text-zinc-100">{technology.label || `Technologia ${techIndex + 1}`}</h2>
                  </div>
                </div>
                <div className={`rounded-full border px-3 py-1 text-xs ${accent.pill}`}>
                  {technology.groups.length} grup
                </div>
              </div>

              <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end">
                <div className="grid flex-1 gap-4 lg:grid-cols-3">
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
                      <SelectTrigger className={`mt-1 ${accent.trigger}`}>
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                          <SelectValue>{formatColorLabel(technology.color)}</SelectValue>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {PRINT_TYPE_COLORS.map((color) => (
                          <SelectItem key={color} value={color} className="text-zinc-100 focus:bg-zinc-700">
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${getColorAccent(color).dot}`} />
                              <span className={getColorAccent(color).optionText}>
                                {formatColorLabel(color)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 2xl:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addGroup(techIndex)}
                    className="h-10 border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj grupę
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeTechnology(techIndex)}
                    className="h-10 border-red-900/70 bg-zinc-950 text-red-300 hover:bg-red-950/40 hover:text-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Usuń technologię
                  </Button>
                </div>
              </div>
            </div>

              <div className="space-y-5 p-6">
                {technology.groups.map((group, groupIndex) => (
                  <div key={`${group.group}-${groupIndex}`} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                      <div className="flex-1">
                        <p className="mb-1 text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Grupa {groupIndex + 1}</p>
                        <Label className="text-sm font-medium text-zinc-300">Nazwa grupy</Label>
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
                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addItem(techIndex, groupIndex)}
                          className="h-10 border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
                        >
                          <Plus className="w-4 h-4" />
                          Dodaj materiał
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeGroup(techIndex, groupIndex)}
                          className="h-10 border-red-900/70 bg-zinc-950 text-red-300 hover:bg-red-950/40 hover:text-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Usuń grupę
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-zinc-800/80 pt-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-zinc-300">Materiały w tej grupie</p>
                        <p className="text-xs text-zinc-500">{group.items.length} pozycji</p>
                      </div>
                      <div className="grid gap-3 xl:grid-cols-2">
                        {group.items.map((item, itemIndex) => (
                          <div key={`${item}-${itemIndex}`} className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-2">
                            <Input
                              value={item}
                              onChange={(e) => updateItem(techIndex, groupIndex, itemIndex, e.target.value)}
                              className="border-zinc-700 bg-zinc-800 text-zinc-100"
                              placeholder="np. Flaga"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeItem(techIndex, groupIndex, itemIndex)}
                              className="h-10 w-10 shrink-0 border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addTechnology}
        className="h-14 w-full rounded-2xl border-dashed border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
      >
        <Plus className="w-4 h-4" />
        Dodaj nową technologię
      </Button>
    </div>
  );
}
