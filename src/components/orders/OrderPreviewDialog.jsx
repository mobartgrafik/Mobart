import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { FileText, Pencil } from "lucide-react";
import { normalizeOrderPriority, normalizeOrderStatus } from "@/lib/orderValues";

function safeFormatDate(value, pattern = "d MMM yyyy, HH:mm") {
  if (!value) return "—";
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return format(d, pattern, { locale: pl });
  } catch {
    return "—";
  }
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-zinc-500 text-[11px] uppercase tracking-wide">{label}</Label>
      <div className="text-zinc-200 text-sm break-words">{children}</div>
    </div>
  );
}

export default function OrderPreviewDialog({
  open,
  onOpenChange,
  order,
  onEdit,
}) {
  const normalized = useMemo(() => {
    if (!order) return null;
    const printType = order.printType ?? order.print_type ?? null;
    return {
      ...order,
      status: normalizeOrderStatus(order.status),
      priority: normalizeOrderPriority(order.priority),
      printType,
      print_type: printType ?? "",
      files: order.files || [],
    };
  }, [order]);

  if (!normalized) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center justify-between gap-4">
            <span className="truncate">Podgląd zlecenia</span>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={normalized.priority} size="sm" />
              <StatusBadge status={normalized.status} size="sm" />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
            <Field label="Nr lub nazwa zlecenia">{normalized.title || "—"}</Field>
            <Field label="Data dodania">{safeFormatDate(normalized.created_at)}</Field>
            <Field label="Rodzaj zadania">{normalized.printType || "—"}</Field>
            <Field label="Grafik">{normalized.graphic || "—"}</Field>
            <Field label="Opis">{normalized.description || "—"}</Field>
            <Field label="Stan rozliczenia">{normalized.settlement || "—"}</Field>
          </div>

          <div className="space-y-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
            <Field label="Produkt">{normalized.printType || "—"}</Field>
            <Field label="Termin wyd. zamówienia">{safeFormatDate(normalized.deadline, "d MMM yyyy, HH:mm")}</Field>
            <Field label="Kanał zlecenia">{normalized.channel || "—"}</Field>
            <Field label="Pracownik">{normalized.assignee || "—"}</Field>
            <Field label="Status">{normalized.status || "—"}</Field>

            {normalized.files?.length ? (
              <div className="space-y-2">
                <Label className="text-zinc-500 text-[11px] uppercase tracking-wide">Pliki</Label>
                <div className="flex flex-wrap gap-2">
                  {normalized.files.slice(0, 6).map((f, idx) => (
                    <a
                      key={`${f.url || f.name}-${idx}`}
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 hover:text-white hover:border-zinc-600 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="max-w-[180px] truncate">{f.name || "plik"}</span>
                    </a>
                  ))}
                  {normalized.files.length > 6 && (
                    <span className="text-zinc-500 text-xs self-center">+{normalized.files.length - 6} więcej</span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
            <Accordion type="single" collapsible>
            <AccordionItem value="other">
              <AccordionTrigger className="text-zinc-200 hover:no-underline">
                INNY
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <Field label="Data wydruku">{safeFormatDate(normalized.print_date)}</Field>
                  <Field label="Metry (m²)">
                    {normalized.meters != null && normalized.meters !== ""
                      ? Number(normalized.meters).toFixed(2)
                      : "—"}
                  </Field>
                  <Field label="Cena (PLN)">
                    {normalized.price != null && normalized.price !== ""
                      ? Number(normalized.price).toFixed(2)
                      : "—"}
                  </Field>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={() => onOpenChange(false)}
          >
            Zamknij
          </Button>
          {onEdit ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={() => onEdit(normalized)}
            >
              <Pencil className="w-4 h-4" />
              Edytuj
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

