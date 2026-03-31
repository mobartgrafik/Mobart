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

const STATUSES = ["Nowe", "W trakcie", "Do przekazania", "Wydrukowane", "Zakończone"];
const PRIORITIES = ["niski", "średni", "wysoki"];

export default function OrderFormDialog({ open, onOpenChange, order, clients, onSaved }) {
  const [form, setForm] = useState({
    title: "", client_id: "", status: "Nowe", priority: "średni",
    deadline: "", description: "", assignee: "", print_type: "", files: []
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (order) {
      setForm({
        title: order.title || "",
        client_id: order.client_id || "",
        status: order.status || "Nowe",
        priority: order.priority || "średni",
        print_type: order.print_type || "",
        deadline: order.deadline || "",
        description: order.description || "",
        assignee: order.assignee || "",
        files: order.files || []
      });
    } else {
      setForm({ title: "", client_id: "", status: "Nowe", priority: "średni", deadline: "", description: "", assignee: "", files: [] });
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
  if (!form.title || !form.client_id) return;
  setSaving(true);

  try {
    const client = clients.find(c => c.id === Number(form.client_id));

    const data = {
      title: form.title,
      client_id: Number(form.client_id),
      client_name: client?.name || "",
      status: form.status,
      priority: form.priority,
      deadline: form.deadline || null,
      assignee: form.assignee || "",
      printType: form.print_type || "",
      notes: form.description || "",
      files: form.files || []
    };

    console.log("Saving order:", data);

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
            <Select value={String(form.client_id || "")} onValueChange={v => setForm({...form, client_id: v})}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                <SelectValue placeholder="Wybierz klienta" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {clients.map(c => (
                  <SelectItem key={c.id} value={String(c.id)} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Input value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" placeholder="np. Jan" />
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
          <Button onClick={handleSave} disabled={saving || !form.title || !form.client_id}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {order ? "Zapisz zmiany" : "Utwórz zlecenie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
