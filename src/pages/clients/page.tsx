import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty.tsx";
import { toast } from "sonner";
import { Users, Plus, Pencil, Trash2, Mail, Phone, Building2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.js";

type ClientForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  notes: string;
};

const emptyForm: ClientForm = { name: "", email: "", phone: "", address: "", company: "", notes: "" };

export default function ClientsPage() {
  const clients = useQuery(api.clients.list, {});
  const createClient = useMutation(api.clients.create);
  const updateClient = useMutation(api.clients.update);
  const removeClient = useMutation(api.clients.remove);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Id<"clients"> | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(client: NonNullable<typeof clients>[0]) {
    setEditing(client._id);
    setForm({
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      company: client.company ?? "",
      notes: client.notes ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        company: form.company || undefined,
        notes: form.notes || undefined,
      };
      if (editing) {
        await updateClient({ id: editing, ...payload });
        toast.success("Client updated");
      } else {
        await createClient(payload);
        toast.success("Client created");
      }
      setOpen(false);
    } catch {
      toast.error("Failed to save client");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: Id<"clients">) {
    if (!confirm("Delete this client?")) return;
    await removeClient({ id });
    toast.success("Client deleted");
  }

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients?.length ?? 0} total clients</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Client
        </Button>
      </div>

      {!clients ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : clients.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Users /></EmptyMedia>
            <EmptyTitle>No clients yet</EmptyTitle>
            <EmptyDescription>Add your first client to get started</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Client</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3">
          {clients.map((c) => (
            <Card key={c._id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B3A7A]/10 dark:bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#1B3A7A] dark:text-[#F5A623] font-bold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    {c.company && <p className="text-sm text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" />{c.company}</p>}
                    <div className="flex flex-wrap gap-3 mt-1">
                      {c.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                      {c.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(c._id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Client" : "New Client"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@gmail.com" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" /></div>
            </div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City" /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes" /></div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
