import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Phone, Mail, Pencil, Trash2, ChevronRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ClientFormDialog from "@/components/clients/ClientFormDialog";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date"),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => base44.entities.Order.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const filtered = clients.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const getOrderCount = (clientId) => orders.filter(o => o.client_id === clientId).length;

  const handleEdit = (client) => { setEditingClient(client); setDialogOpen(true); };
  const handleNew = () => { setEditingClient(null); setDialogOpen(true); };
  const handleDelete = (client) => { if (confirm("Usunąć klienta \"" + client.name + "\"?")) deleteMutation.mutate(client.id); };
  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ["clients"] });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-100">Klienci</h1>
        <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />Nowy klient
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Szukaj klientów..."
          className="bg-zinc-800/50 border-zinc-800 text-zinc-100 pl-9 placeholder:text-zinc-600" />
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50">
        {isLoading ? (
          <div className="text-center py-16 text-zinc-500">Ładowanie...</div>
        ) : !filtered.length ? (
          <div className="text-center py-16 text-zinc-500">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Brak klientów</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500 font-medium">Nazwa</TableHead>
                <TableHead className="text-zinc-500 font-medium">Telefon</TableHead>
                <TableHead className="text-zinc-500 font-medium">Email</TableHead>
                <TableHead className="text-zinc-500 font-medium">Zlecenia</TableHead>
                <TableHead className="text-zinc-500 font-medium w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(client => (
                <TableRow key={client.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                  <TableCell>
                    <Link to={createPageUrl("ClientDetail") + "?id=" + client.id}
                      className="text-zinc-100 font-medium hover:text-blue-400 flex items-center gap-1">
                      {client.name}<ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {client.phone ? <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{client.phone}</span> : "—"}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {client.email ? <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{client.email}</span> : "—"}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">{getOrderCount(client.id)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => handleEdit(client)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-zinc-800" onClick={() => handleDelete(client)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} client={editingClient} onSaved={handleRefresh} />
    </div>
  );
}