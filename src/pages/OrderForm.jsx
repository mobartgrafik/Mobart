import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, FileText, Image, ArrowLeft, Save } from "lucide-react";
import PrintTypeSelect from "@/components/orders/PrintTypeSelect";
import OrderActivity from "@/components/orders/OrderActivity";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getStorageProviderLabel, getStoredFileDownloadUrl, uploadOrderFiles } from "@/lib/fileStorage";

const STATUSES = ["Nowe", "W trakcie", "Do przekazania", "Wydrukowane", "Zakończone"];
const PRIORITIES = ["niski", "średni", "wysoki"];
const CHANNELS = ["Mobart", "Viper", "Zlecenie ze sklepu"];
const SETTLEMENTS = ["nierozliczone", "rozliczone", "częściowo rozliczone"];
const EMPLOYEES = ["Kinga", "Kinga Noszczyk", "Klaudia", "Gabryś", "Łukasz", "Darek", "Robert", "Artur"];

const SETTLEMENT_COLORS = {
  "nierozliczone": "text-red-400",
  "rozliczone": "text-green-400",
  "częściowo rozliczone": "text-yellow-400",
};

const emptyForm = {
  title: "", client_id: "", client_name: "", status: "Nowe", priority: "średni",
  print_type: "", channel: "Mobart", graphic: "", assignee: "",
  deadline: "", created_at: "", print_date: "", description: "",
  meters: "", price: "", settlement: "nierozliczone", files: []
};

const toDatetimeLocal = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function OrderForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authorLabel, avatarUrl } = useAuth();
  const { toast } = useToast();
  const [addClientToDatabase, setAddClientToDatabase] = useState(false);
  const storageProviderLabel = getStorageProviderLabel();

  const freshEmptyForm = () => ({
    ...emptyForm,
    created_at: toDatetimeLocal(new Date()),
  });

  const [form, setForm] = useState(freshEmptyForm);
  const [originalForm, setOriginalForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}
  });

  const { data: existingOrder, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
const { data, error } = await supabase
  .from("orders")
  .select("*")
  .eq("id", orderId)
  .maybeSingle();

  if (error) throw error;
  return data;
},
    enabled: !!orderId,
  });

  useEffect(() => {
    if (existingOrder) {
      const o = existingOrder;
      const loaded = {
        title: o.title || "",
        client_id: o.client_id?.toString() || "",
        client_name: o.client_name || "",
        status: o.status || "Nowe",
        priority: o.priority || "średni",
        print_type: o.printType || "",
        channel: o.channel || "Mobart",
        graphic: o.graphic || "",
        assignee: o.assignee || "",
        created_at: o.created_at ? o.created_at.slice(0, 16) : toDatetimeLocal(new Date()),
        deadline: o.deadline ? o.deadline.slice(0, 16) : "",
        print_date: o.print_date ? o.print_date.slice(0, 16) : "",
        description: o.description || "",
        meters: o.meters || "",
        price: o.price || "",
        settlement: o.settlement || "nierozliczone",
        files: o.files || [],
      };
      setForm(loaded);
      setOriginalForm(loaded);
    }
  }, [existingOrder, clients]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const normalizedClientInput = String(form.client_name || "").trim().toLowerCase();
  const filteredClients = clients
    .filter(c => String(c.name || "").toLowerCase().includes(normalizedClientInput))
    .slice(0, 8);
  const exactClientMatch = clients.find(
    c => String(c.name || "").toLowerCase() === normalizedClientInput
  );

  const handleClientInputChange = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    const matched = clients.find(c => String(c.name || "").toLowerCase() === normalized);
    setForm(prev => ({
      ...prev,
      client_name: value,
      client_id: matched ? String(matched.id) : "",
    }));
    setAddClientToDatabase(false);
    setClientDropdownOpen(true);
  };

  const selectClient = (client) => {
    setForm(prev => ({
      ...prev,
      client_name: client.name,
      client_id: String(client.id),
    }));
    setAddClientToDatabase(false);
    setClientDropdownOpen(false);
  };

  // Sets a datetime-local field to today/tomorrow while preserving current time portion (if any).
  const applyQuickDate = (key, dayOffset) => {
    const currentVal = form[key];
    const base = currentVal ? new Date(currentVal) : new Date();
    const target = new Date();
    target.setDate(target.getDate() + dayOffset);
    base.setFullYear(target.getFullYear(), target.getMonth(), target.getDate());
    set(key, toDatetimeLocal(base));
  };

  // Parses dimensions like "100x200cm", "1.5x3m", "100x200" (assumed cm) from a string
const parseMetersFromTitle = (title) => {
  if (!title) return null;

  const match = title.match(
    /(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)\s*(cm|mm|m)?/i
  );

  if (!match) return null;

  let w = parseFloat(match[1].replace(",", "."));
  let h = parseFloat(match[2].replace(",", "."));
  const unit = match[3]?.toLowerCase();

  if (unit === "mm") {
    w = w / 1000;
    h = h / 1000;
  } else if (unit === "cm" || !unit) {
    w = w / 100;
    h = h / 100;
  }

  return parseFloat((w * h).toFixed(2));
};

const handleTitleChange = (val) => {
  setForm(prev => {
    const calc = parseMetersFromTitle(val);

    return {
      ...prev,
      title: val,
      meters: calc !== null ? String(calc) : prev.meters
    };
  });
};

const handleFileUpload = async (e) => {
  const fileList = Array.from(e.target.files || []);
  if (!fileList.length) return;

  setUploading(true);
  try {
    const newFiles = await uploadOrderFiles(fileList);
    setForm(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));

    const filesWithPermissionWarnings = newFiles.filter((file) => file.permissionError);
    if (filesWithPermissionWarnings.length > 0) {
      toast({
        title: "Plik dodany z ograniczonym dostępem",
        description: filesWithPermissionWarnings[0].permissionError,
        duration: 6000,
      });
    }
  } catch (err) {
    console.error("Upload error:", err);
    toast({
      title: "Nie udało się dodać pliku",
      description: err?.message || "Google Drive odrzucił upload pliku.",
      duration: 7000,
    });
  } finally {
    setUploading(false);
    e.target.value = "";
  }
};

  const removeFile = (idx) => setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }));

  const TRACKED_FIELDS = ["status", "priority", "assignee", "graphic", "deadline", "print_date", "settlement", "channel", "meters", "price", "print_type", "title"];
  const FIELD_LABELS_SAVE = { status: "Status", priority: "Priorytet", assignee: "Pracownik", graphic: "Grafik", deadline: "Termin", print_date: "Data wydruku", settlement: "Rozliczenie", channel: "Kanał", meters: "Metry (m²)", price: "Cena", print_type: "Produkt", title: "Nazwa zlecenia" };

const handleSave = async (andNew = false) => {
  const normalizedClientName = String(form.client_name || "").trim();
  if (!form.title || !normalizedClientName) return;
  setSaving(true);

  let client = clients.find(c => String(c.id) === String(form.client_id));
  if (!client) {
    client = clients.find(c => String(c.name || "").toLowerCase() === normalizedClientName.toLowerCase());
  }

  let resolvedClientId = client?.id ?? null;
  let resolvedClientName = client?.name || normalizedClientName;

  if (!client && addClientToDatabase) {
    const { data: insertedClient, error: clientInsertError } = await supabase
      .from("clients")
      .insert([{
        name: normalizedClientName,
        phone: "",
      }])
      .select()
      .single();

    if (clientInsertError) {
      console.error("CLIENT INSERT ERROR:", clientInsertError);
      alert(clientInsertError.message);
      setSaving(false);
      return;
    }

    resolvedClientId = insertedClient?.id ?? null;
    resolvedClientName = insertedClient?.name || normalizedClientName;
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  }

  const data = {
    ...form,
    client_id: resolvedClientId,
    client_name: resolvedClientName,
    printType: form.print_type,
    meters: form.meters ? parseFloat(form.meters) : null,
    price: form.price ? parseFloat(form.price) : null,
    created_at: form.created_at || null,
    deadline: form.deadline || null,
    print_date: form.print_date || null
  };
  delete data.print_type;
if (orderId) {

  const { error } = await supabase
    .from("orders")
    .update(data)
    .eq("id", orderId);

  if (error) {
    console.error("SUPABASE ERROR:", error);
    alert(error.message);
  }

  // historia zmian
  if (originalForm) {
for (const field of TRACKED_FIELDS) {
  const oldVal = String(originalForm[field] ?? "");
  const newVal = String(form[field] ?? "");

  if (oldVal !== newVal) {
    const { error: historyError } = await supabase
      .from("order_comments")
      .insert([{
        order_id: orderId,
        type: "history",
        content: `Zmiana: ${FIELD_LABELS_SAVE[field]}`,
        author: authorLabel,
        author_avatar_url: avatarUrl || null,
        field_changed: field,
        old_value: oldVal,
        new_value: newVal,
      }]);

    if (historyError) {
      console.error("History error:", historyError);
    }
    }
  }
}

} else {

  const { data: inserted, error } = await supabase
    .from("orders")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("SUPABASE ERROR:", error);
    alert(error.message);
  }

  if (inserted) {
    toast({
      variant: "success",
      title: "Nowe zlecenie",
      description: inserted?.title ? `Dodano „${inserted.title}”.` : "Dodano nowe zlecenie.",
    });

    await supabase.channel("orders-realtime-toasts").send({
      type: "broadcast",
      event: "order-change",
      payload: {
        kind: "insert",
        orderId: inserted?.id || null,
        title: inserted?.title || "",
        ts: Date.now(),
      },
    });

    const { error: historyError } = await supabase
      .from("order_comments")
      .insert([{
        order_id: inserted.id,
        type: "history",
        content: "Utworzono zlecenie",
        author: authorLabel,
        author_avatar_url: avatarUrl || null,
      }]);

    if (historyError) {
      console.error("History insert error:", historyError);
    }
  }

}

queryClient.invalidateQueries({ queryKey: ["orders"] });
queryClient.invalidateQueries({ queryKey: ["all-comments"] });
setOriginalForm(form);
setSaving(false);

if (andNew) {
  setForm(freshEmptyForm());
  navigate(createPageUrl("OrderForm"));
} else {
  navigate(createPageUrl("Orders"));
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith("image")) return <Image className="w-4 h-4 text-purple-400" />;
    return <FileText className="w-4 h-4 text-blue-400" />;
  };

const downloadFile = async (url, name) => {
try {
    const response = await fetch(url);
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;
    link.target = "_self";
    link.rel = "noopener";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

  } catch (err) {
    console.error("Download error:", err);
  }
};

  if (isLoading) return <div className="text-center py-20 text-zinc-500">Ładowanie...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl("Orders"))} className="text-zinc-500 hover:text-zinc-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-zinc-100 uppercase tracking-wide">
            {orderId ? "Edytuj zlecenie" : "Utwórz"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleSave(false)} disabled={saving || !form.title || !String(form.client_name || "").trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Zapisz
          </Button>
          <Button onClick={() => navigate(createPageUrl("Orders"))} variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
            Anuluj
          </Button>
          {!orderId && (
            <Button onClick={() => handleSave(true)} disabled={saving || !form.title || !String(form.client_name || "").trim()}
              variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
              Zamknij i utwórz nowe
            </Button>
          )}
        </div>
      </div>

      {/* Section: Przegląd zadań */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-zinc-800/60 border-b border-zinc-700/50">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Przegląd zadań</h2>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Nr lub nazwa zlecenia *</Label>
              <Input value={form.title} onChange={e => handleTitleChange(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                placeholder="np. arciszewska 100x200cm Folia Mono" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Produkt (typ wydruku) *</Label>
              <PrintTypeSelect value={form.print_type} onChange={v => set("print_type", v)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Termin dodania zamówienia</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  onClick={() => applyQuickDate("created_at", 0)}
                >
                  Dzisiaj
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  onClick={() => applyQuickDate("created_at", 1)}
                >
                  Jutro
                </Button>
              </div>
              <Input
                type="datetime-local"
                value={form.created_at}
                onChange={(e) => set("created_at", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Termin wydania zamówienia *</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  onClick={() => applyQuickDate("deadline", 0)}
                >
                  Dzisiaj
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  onClick={() => applyQuickDate("deadline", 1)}
                >
                  Jutro
                </Button>
              </div>
              <Input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Klient *</Label>
              <div className="relative">
                <Input
                  value={form.client_name || ""}
                  onChange={(e) => handleClientInputChange(e.target.value)}
                  onFocus={() => setClientDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setClientDropdownOpen(false), 150)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  placeholder="Wpisz nazwę klienta..."
                />
                {clientDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 shadow-lg overflow-hidden">
                    {filteredClients.length > 0 ? (
                      <div className="max-h-56 overflow-y-auto">
                        {filteredClients.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectClient(c)}
                            className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-sm text-zinc-500">Brak pasujących klientów</div>
                    )}
                    {String(form.client_name || "").trim() && !exactClientMatch && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, client_id: "", client_name: prev.client_name.trim() }));
                          setAddClientToDatabase(true);
                          setClientDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-zinc-800 border-t border-zinc-800"
                      >
                        + Dodaj nowego klienta: "{form.client_name.trim()}"
                      </button>
                    )}
                  </div>
                )}
              </div>
              {!form.client_id && String(form.client_name || "").trim() && addClientToDatabase && (
                <div className="mt-2 text-xs text-emerald-400">
                  Nowy klient zostanie dodany do bazy przy zapisie.
                </div>
              )}
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Kanał zlecenia *</Label>
              <Select value={form.channel} onValueChange={v => set("channel", v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {CHANNELS.map(c => (
                    <SelectItem key={c} value={c} className="text-zinc-100 focus:bg-zinc-700">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Grafik</Label>
              <Input value={form.graphic} onChange={e => set("graphic", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100" placeholder="np. Klaudia" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Pracownik</Label>
              <Select
                value={form.assignee || ""}
                onValueChange={v => set("assignee", v)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Wybierz pracownika" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {EMPLOYEES.map(name => (
                    <SelectItem key={name} value={name} className="text-zinc-100 focus:bg-zinc-700">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block">Opis</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[100px]"
              placeholder="Szczegóły zlecenia, uwagi..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Stan rozliczenia</Label>
              <Select value={form.settlement} onValueChange={v => set("settlement", v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {SETTLEMENTS.map(s => (
                    <SelectItem key={s} value={s} className={`focus:bg-zinc-700 ${SETTLEMENT_COLORS[s] || "text-zinc-100"}`}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Status *</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s} className="text-zinc-100 focus:bg-zinc-700">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Dane produkcyjne */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-zinc-800/60 border-b border-zinc-700/50">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Dane produkcyjne</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">
                Metry (m²)
                {form.meters && parseMetersFromTitle(form.title) === parseFloat(form.meters) && (
                  <span className="ml-2 text-blue-400 font-normal">obliczone z nazwy</span>
                )}
              </Label>
              <Input type="number" step="0.01" value={form.meters} onChange={e => set("meters", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100" placeholder="0.00 (auto z nazwy np. 100x200cm)" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Cena (PLN)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={e => set("price", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100" placeholder="0.00" />
            </div>
          </div>
          <div className="mt-4">
            <Label className="text-zinc-400 text-xs mb-1.5 block">Priorytet</Label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button key={p} type="button" onClick={() => set("priority", p)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-all ${
                    form.priority === p
                      ? p === "wysoki" ? "bg-red-600 border-red-500 text-white"
                        : p === "średni" ? "bg-yellow-600 border-yellow-500 text-white"
                        : "bg-green-700 border-green-600 text-white"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Pliki */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-zinc-800/60 border-b border-zinc-700/50">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Pliki</h2>
        </div>
        <div className="p-5 space-y-2">
          {form.files.map((f, i) => (
  <div
    key={i}
    className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 text-sm"
  >
    {getFileIcon(f.type)}

    <span className="text-zinc-300 truncate flex-1">
      {f.name}
    </span>

    <Button
      size="sm"
      variant="ghost"
      onClick={() => downloadFile(getStoredFileDownloadUrl(f), f.name)}
      className="text-blue-400 hover:text-blue-300"
    >
      Pobierz
    </Button>

    <button
      onClick={() => removeFile(i)}
      className="text-zinc-500 hover:text-red-400"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
))}
          <label className="flex items-center gap-2 cursor-pointer bg-zinc-800 hover:bg-zinc-750 border border-dashed border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:text-zinc-300">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Przesyłanie..." : `Dodaj pliki do ${storageProviderLabel} (PDF, JPG, AI, PSD, CDR)`}
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.ai,.psd,.cdr" className="hidden"
              onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Section: Aktywność */}
      {orderId && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-zinc-800/60 border-b border-zinc-700/50">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Komentarze i historia zmian</h2>
          </div>
          <div className="p-5">
            <OrderActivity orderId={orderId} />
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="flex items-center gap-2 pb-4">
        <Button onClick={() => handleSave(false)} disabled={saving || !form.title || !String(form.client_name || "").trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Zapisz
        </Button>
        <Button onClick={() => navigate(createPageUrl("Orders"))} variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          Anuluj
        </Button>
        {!orderId && (
          <Button onClick={() => handleSave(true)} disabled={saving || !form.title || !String(form.client_name || "").trim()}
            variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
            Zamknij i utwórz nowe
          </Button>
        )}
      </div>
    </div>
  );
}
