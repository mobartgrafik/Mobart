import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, FileText, Image } from "lucide-react";
import PrintTypeSelect from "./PrintTypeSelect";

const STATUSES = ["Nowe", "W trakcie", "Do przekazania", "Przekazane", "Zakończone"];
const PRIORITIES = ["niski", "średni", "wysoki"];
const EMPLOYEES = ["Kinga", "Kinga Noszczyk", "Klaudia", "Gabryś", "Łukasz", "Darek", "Robert", "Artur"];

export default function OrderFormDialog({ open, onOpenChange, order, clients, onSaved }) {
  const [form, setForm] = useState({
    title: "", client_id: "", client_name: "", status: "Nowe", priority: "średni",
    deadline: "", description: "", assignee: "", print_type: "", files: []
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addClientToDatabase, setAddClientToDatabase] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const normalizedClientInput = String(form.client_name || "").trim().toLowerCase();
  const filteredClients = clients
    .filter(c => String(c.name || "").toLowerCase().includes(normalizedClientInput))
    .slice(0, 8);
  const exactClientMatch = clients.find(
    c => String(c.name || "").toLowerCase() === normalizedClientInput
  );

  useEffect(() => {
    if (order) {
      setForm({
        title: order.title || "",
        client_id: order.client_id || "",
        client_name: order.client_name || "",
        status: order.status || "Nowe",
        priority: order.priority || "średni",
        print_type: order.print_type || "",
        deadline: order.deadline || "",
        description: order.description || "",
        assignee: order.assignee || "",
        files: order.files || []
      });
    } else {
      setForm({ title: "", client_id: "", client_name: "", status: "Nowe", priority: "średni", deadline: "", description: "", assignee: "", files: [] });
    }
  }, [order, open]);

const handleFileUpload = async (e) => {
  const fileList = Array.from(e.target.files);
  if (!fileList.length) return;

  const newFiles = fileList.map(file => ({
    name: file.name,
    url: "",
    type: file.type
  }));

  setForm(prev => ({
    ...prev,
    files: [...prev.files, ...newFiles]
  }));
};

  const removeFile = (idx) => {
    setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }));
  };

const handleSave = async () => {
  const normalizedClientName = String(form.client_name || "").trim();
  if (!form.title || !normalizedClientName) return;

  setSaving(true);

  try {
    let client = clients.find(c => c.id === Number(form.client_id));
    if (!client) {
      client = clients.find(c => String(c.name || "").toLowerCase() === normalizedClientName.toLowerCase());
    }

    let resolvedClientId = client?.id ?? null;
    let resolvedClientName = client?.name || normalizedClientName;

    if (!client && addClientToDatabase) {
      const { data: insertedClient, error: clientInsertError } = await supabase
        .from("clients")
        .insert([{ name: normalizedClientName }])
        .select()
        .single();

      if (clientInsertError) throw clientInsertError;
      resolvedClientId = insertedClient?.id ?? null;
      resolvedClientName = insertedClient?.name || normalizedClientName;
    }

const data = {
  title: form.title || "",
  client_id: resolvedClientId,
  client_name: resolvedClientName,
  status: form.status || "Nowe",
  priority: form.priority || "średni",
  deadline: form.deadline || null,
  assignee: form.assignee || "",
  printType: form.print_type || "",
  channel: form.channel || "",
  meters: form.meters || null,
  settlement: form.settlement || "",
  notes: form.description || "",
  files: form.files || []
};

    if (order) {
      const { error } = await supabase
        .from("orders")
        .update(data)
        .eq("id", order.id);

      if (error) throw error;

    } else {
      const { error } = await supabase
        .from("orders")
        .insert([data]);

      if (error) throw error;
    }

    onSaved();
    onOpenChange(false);

  } catch (err) {
    console.error("Order save error:", err);
  }

  setSaving(false);
};

  const getFileIcon = (type) => {
    if (type?.startsWith("image")) return <Image className="w-4 h-4 text-purple-400" />;
    return <FileText className="w-4 h-4 text-blue-400" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{order ? "Edytuj zlecenie" : "Nowe zlecenie"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-zinc-400 text-xs">Nazwa zlecenia *</Label>
            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" placeholder="np. Wizytówki dla firmy X" />
          </div>
          <div>
            <Label className="text-zinc-400 text-xs">Klient *</Label>
            <div className="relative">
              <Input
                value={form.client_name || ""}
                onChange={e => {
                  const v = e.target.value;
                  const matched = clients.find(c => String(c.name || "").toLowerCase() === String(v || "").trim().toLowerCase());
                  setForm({ ...form, client_name: v, client_id: matched ? String(matched.id) : "" });
                  setAddClientToDatabase(false);
                  setClientDropdownOpen(true);
                }}
                onFocus={() => setClientDropdownOpen(true)}
                onBlur={() => setTimeout(() => setClientDropdownOpen(false), 150)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
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
                          onClick={() => {
                            setForm({ ...form, client_name: c.name, client_id: String(c.id) });
                            setAddClientToDatabase(false);
                            setClientDropdownOpen(false);
                          }}
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
                        setForm({ ...form, client_id: "", client_name: form.client_name.trim() });
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
            {!form.client_id && String(form.client_name || "").trim() && (
              <div className={`mt-2 text-xs ${addClientToDatabase ? "text-emerald-400" : "text-amber-400"}`}>
                {addClientToDatabase
                  ? "Nowy klient zostanie dodany do bazy przy zapisie."
                  : "Wybierz klienta z listy lub użyj opcji \"+ Dodaj nowego klienta\"."}
              </div>
            )}
          </div>
          <div>
            <Label className="text-zinc-400 text-xs">Typ wydruku</Label>
            <div className="mt-1">
              <PrintTypeSelect value={form.print_type} onChange={v => setForm({...form, print_type: v})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-zinc-400 text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Priorytet</Label>
              <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {PRIORITIES.map(p => (
                    <SelectItem key={p} value={p} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-zinc-400 text-xs">Termin realizacji</Label>
              <Input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Osoba odpowiedzialna</Label>
              <Select
                value={String(form.assignee || "")}
                onValueChange={v => setForm({ ...form, assignee: v })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
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
            <Label className="text-zinc-400 text-xs">Opis</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 h-20" placeholder="Szczegóły zlecenia..." />
          </div>
          <div>
            <Label className="text-zinc-400 text-xs">Pliki</Label>
            <div className="mt-1 space-y-2">
              {form.files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 text-sm">
                  {getFileIcon(f.type)}
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white truncate flex-1">{f.name}</a>
                  <button onClick={() => removeFile(i)} className="text-zinc-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-800 hover:bg-zinc-750 border border-dashed border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:text-zinc-300">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Przesyłanie..." : "Dodaj pliki (PDF, JPG, AI, PSD)"}
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.ai,.psd" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">Anuluj</Button>
          <Button onClick={handleSave} disabled={saving || !form.title || !String(form.client_name || "").trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {order ? "Zapisz zmiany" : "Utwórz zlecenie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
