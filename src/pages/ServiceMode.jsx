import React, { useEffect, useMemo, useState } from "react";
import { Plus, Save, RotateCcw, Trash2, Settings2, Loader2, ShieldAlert, ChevronDown, Users, Layers3, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PRINT_TYPE_COLORS, usePrintTypeConfig } from "@/lib/printTypeConfig";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { useTeamConfig } from "@/lib/teamConfig";
import { useUserProfiles } from "@/lib/userProfiles";

const createTechnologyDraft = () => ({
  key: `tech_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
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
  const { config: teamConfig, setConfig: setTeamConfig, isLoading: isLoadingTeam, storageMode: teamStorageMode } = useTeamConfig();
  const { profiles, isLoading: isLoadingProfiles, isAvailable: areProfilesAvailable, saveProfiles } = useUserProfiles();
  const { role } = useAuth();
  const { toast } = useToast();
  const [draft, setDraft] = useState(config);
  const [teamDraft, setTeamDraft] = useState(teamConfig);
  const [profilesDraft, setProfilesDraft] = useState(profiles);
  const [saving, setSaving] = useState(false);
  const [openTechnologyKey, setOpenTechnologyKey] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  useEffect(() => {
    setTeamDraft(teamConfig);
  }, [teamConfig]);

  useEffect(() => {
    setProfilesDraft(profiles);
  }, [profiles]);

  useEffect(() => {
    if (!draft.length) {
      setOpenTechnologyKey(null);
      return;
    }
    if (openTechnologyKey && !draft.some((technology) => technology.key === openTechnologyKey)) {
      setOpenTechnologyKey(null);
    }
  }, [draft, openTechnologyKey]);

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
    setDraft((prev) => {
      const next = [...prev, createTechnologyDraft()];
      const nextIndex = next.length - 1;
      setOpenTechnologyKey(next[nextIndex].key || null);
      return next;
    });
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
    Promise.all([setConfig(draft), setTeamConfig(teamDraft), saveProfiles(profilesDraft)])
      .then(([savedConfig, savedTeam, savedProfiles]) => {
        setDraft(savedConfig);
        setTeamDraft(savedTeam);
        setProfilesDraft(savedProfiles);
        toast({
          variant: "success",
          title: "Tryb serwisowy zapisany",
          description:
            storageMode === "supabase" && teamStorageMode === "supabase" && areProfilesAvailable
              ? "Kategorie, pracownicy, graficy i admini są już aktywni dla wszystkich."
              : "Zmiany zapisane. Gdy wszystkie klucze będą gotowe w Supabase, zapis będzie wspólny dla wszystkich.",
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

  const handleBackToCategories = () => {
    setActiveSection(null);
    setOpenTechnologyKey(null);
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

  if (isLoading || isLoadingTeam || isLoadingProfiles) {
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
              Najpierw wybierz obszar, który chcesz edytować. Osobno możesz zarządzać technologiami i materiałami albo zespołem.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-400">
              Tryb zapisu: {storageMode === "supabase" ? "Supabase wspólny dla wszystkich" : "lokalny awaryjny"}
            </div>
            <div className="mt-2 inline-flex rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-400">
              Zespół: {teamStorageMode === "supabase" ? "Supabase wspólny dla wszystkich" : "lokalny awaryjny"}
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[240px] xl:items-stretch">
            {activeSection && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToCategories}
                className="h-11 justify-center border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Wróć do wyboru
              </Button>
            )}
            {activeSection === "technologies" && (
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
            )}
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

      {!activeSection && (
        <div className="grid gap-6 lg:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveSection("technologies")}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 text-left transition-all hover:border-blue-500/30 hover:bg-zinc-900 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                  <Layers3 className="w-5 h-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-zinc-100">Technologie i materiały</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                  Edytuj technologie, grupy materiałów, kolory przycisków i wszystkie pozycje widoczne w formularzu zleceń.
                </p>
              </div>
              <ChevronDown className="w-5 h-5 rotate-[-90deg] text-zinc-500" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-zinc-300">{draft.length} technologii</span>
              <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-zinc-300">
                {draft.reduce((count, technology) => count + technology.groups.length, 0)} grup
              </span>
              <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-zinc-300">{totalItems} materiałów</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("team")}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 text-left transition-all hover:border-emerald-500/30 hover:bg-zinc-900 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-zinc-100">Zespół</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                  Zarządzaj listą pracowników i grafików używanych później w formularzach zamówień.
                </p>
              </div>
              <ChevronDown className="w-5 h-5 rotate-[-90deg] text-zinc-500" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-zinc-300">{teamDraft.employees.length} pracowników</span>
              <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-zinc-300">{teamDraft.designers.length} grafików</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("admins")}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 text-left transition-all hover:border-amber-500/30 hover:bg-zinc-900 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.15)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-zinc-100">Administratorzy</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                  Zobacz zarejestrowane osoby i nadaj im uprawnienia administratora w aplikacji.
                </p>
              </div>
              <ChevronDown className="w-5 h-5 rotate-[-90deg] text-zinc-500" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-zinc-300">{profilesDraft.length} kont</span>
              <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-zinc-300">
                {profilesDraft.filter((profile) => profile.is_admin).length} adminów
              </span>
            </div>
          </button>
        </div>
      )}

      {activeSection === "team" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Zespół</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Pracownicy</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTeamDraft((prev) => ({ ...prev, employees: [...prev.employees, "Nowy pracownik"] }))}
              className="h-10 border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <Plus className="w-4 h-4" />
              Dodaj pracownika
            </Button>
          </div>
          <div className="mt-5 grid gap-3">
            {teamDraft.employees.map((employee, index) => (
              <div key={`${employee}-${index}`} className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-2">
                <Input
                  value={employee}
                  onChange={(e) =>
                    setTeamDraft((prev) => ({
                      ...prev,
                      employees: prev.employees.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)),
                    }))
                  }
                  className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  placeholder="np. Gabriel"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setTeamDraft((prev) => ({
                      ...prev,
                      employees: prev.employees.filter((_, itemIndex) => itemIndex !== index),
                    }))
                  }
                  className="h-10 w-10 shrink-0 border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Zespół</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Graficy</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTeamDraft((prev) => ({ ...prev, designers: [...prev.designers, "Nowy grafik"] }))}
              className="h-10 border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <Plus className="w-4 h-4" />
              Dodaj grafika
            </Button>
          </div>
          <div className="mt-5 grid gap-3">
            {teamDraft.designers.map((designer, index) => (
              <div key={`${designer}-${index}`} className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-2">
                <Input
                  value={designer}
                  onChange={(e) =>
                    setTeamDraft((prev) => ({
                      ...prev,
                      designers: prev.designers.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)),
                    }))
                  }
                  className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  placeholder="np. Klaudia"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setTeamDraft((prev) => ({
                      ...prev,
                      designers: prev.designers.filter((_, itemIndex) => itemIndex !== index),
                    }))
                  }
                  className="h-10 w-10 shrink-0 border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          </section>
        </div>
      )}

      {activeSection === "admins" && (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Uprawnienia</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Administratorzy</h2>
            </div>
            <div className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-xs text-zinc-400">
              {profilesDraft.filter((profile) => profile.is_admin).length} adminów
            </div>
          </div>

          {!areProfilesAvailable ? (
            <div className="mt-5 rounded-2xl border border-amber-900/40 bg-amber-500/5 p-5 text-sm text-amber-200">
              Brakuje tabeli `user_profiles` w Supabase. Po uruchomieniu nowego SQL ta sekcja pokaże zarejestrowanych użytkowników.
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {profilesDraft.map((profile, index) => (
                <div key={profile.id || `${profile.username}-${index}`} className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${profile.is_admin ? "bg-amber-400" : "bg-zinc-600"}`} />
                      <p className="truncate text-base font-medium text-zinc-100">
                        {profile.display_name || profile.username || "Bez nazwy"}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-sm text-zinc-400">
                      @{profile.username || "brak-loginu"}{profile.email ? ` • ${profile.email}` : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setProfilesDraft((prev) =>
                        prev.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, is_admin: !item.is_admin } : item
                        )
                      )
                    }
                    className={cn(
                      "h-10 min-w-[180px] justify-center",
                      profile.is_admin
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
                        : "border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
                    )}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {profile.is_admin ? "Usuń admina" : "Nadaj admina"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeSection === "technologies" && (
      <div className="grid gap-6 xl:grid-cols-3">
        {draft.map((technology, techIndex) => {
          const accent = getColorAccent(technology.color);
          const isOpen = openTechnologyKey === technology.key;

          return (
            <section
              key={`${technology.key || "technology"}-${techIndex}`}
              className={cn(
                "overflow-hidden rounded-3xl border shadow-[0_0_0_1px_rgba(24,24,27,0.3)]",
                accent.section,
                isOpen && "xl:col-span-3"
              )}
            >
              <button
                type="button"
                onClick={() => setOpenTechnologyKey(isOpen ? null : technology.key)}
                className={cn(
                  "w-full border-b border-zinc-800 px-6 py-5 text-left transition-colors",
                  accent.header,
                  isOpen ? "bg-opacity-100" : "hover:bg-zinc-900/70"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Technologia</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${accent.dot}`} />
                      <h2 className="truncate text-2xl font-semibold text-zinc-100">
                        {technology.label || `Technologia ${techIndex + 1}`}
                      </h2>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full border px-3 py-1 ${accent.pill}`}>
                        {technology.groups.length} grup
                      </span>
                      <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-zinc-400">
                        {technology.groups.reduce((count, group) => count + group.items.length, 0)} materiałów
                      </span>
                      <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-zinc-400">
                        Kolor: {formatColorLabel(technology.color)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-xs text-zinc-400 lg:block">
                      {isOpen ? "Ukryj edycję" : "Rozwiń edycję"}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="space-y-5 p-6">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/75 p-5">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Ustawienia technologii</p>
                        <h3 className="mt-2 text-lg font-semibold text-zinc-100">Edytujesz: {technology.label || `Technologia ${techIndex + 1}`}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
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

                    <div className="grid gap-4 lg:grid-cols-3">
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
                  </div>

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
              )}
            </section>
          );
        })}
      </div>
      )}

      {activeSection === "technologies" && (
        <Button
          type="button"
          variant="outline"
          onClick={addTechnology}
          className="h-14 w-full rounded-2xl border-dashed border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Plus className="w-4 h-4" />
          Dodaj nową technologię
        </Button>
      )}
    </div>
  );
}
