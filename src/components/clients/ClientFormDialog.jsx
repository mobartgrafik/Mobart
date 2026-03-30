import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function ClientFormDialog({ open, onOpenChange, client, onSaved }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({ name: client.name || "", phone: client.phone || "", email: client.email || "", notes: client.notes || "" });
    } else {
      setForm({ name: "", phone: "", email: "", notes: "" });
    }
  }, [client, open]);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    if (client) {
      await base44.entities.Client.update(client.id, form);
    } else {
      await base44.entities.Client.create(form);
    }
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{client ? "Edytuj klienta" : "Nowy klient"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-zinc-400 text-xs">Nazwa *</Label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" placeholder="Nazwa firmy lub osoby" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-zinc-400 text-xs">Telefon</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" placeholder="+48 ..." />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Email</Label>
              <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" placeholder="email@firma.pl" />
            </div>
          </div>
          <div>
            <Label className="text-zinc-400 text-xs">Notatki</Label>
            <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 h-20" placeholder="Dodatkowe informacje..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">Anuluj</Button>
          <Button onClick={handleSave} disabled={saving || !form.name}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {client ? "Zapisz" : "Dodaj klienta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}