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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { toast } from "sonner";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { CURRENCIES, formatCurrency } from "@/lib/brand.ts";
import type { Id } from "@/convex/_generated/dataModel.js";

type ProductForm = {
  name: string;
  description: string;
  price: string;
  currency: string;
  unit: string;
  category: string;
  isService: boolean;
};

const emptyForm: ProductForm = { name: "", description: "", price: "", currency: "ZMW", unit: "", category: "", isService: false };

export default function ProductsPage() {
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const profile = useQuery(api.users.getCurrentUser, {});

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState<ProductForm>({ ...emptyForm, currency: profile?.currency ?? "ZMW" });
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, currency: profile?.currency ?? "ZMW" });
    setOpen(true);
  }

  function openEdit(p: NonNullable<typeof products>[0]) {
    setEditing(p._id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      currency: p.currency,
      unit: p.unit ?? "",
      category: p.category ?? "",
      isService: p.isService,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { toast.error("Invalid price"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price,
        currency: form.currency,
        unit: form.unit || undefined,
        category: form.category || undefined,
        isService: form.isService,
      };
      if (editing) {
        await updateProduct({ id: editing, ...payload });
        toast.success("Updated");
      } else {
        await createProduct(payload);
        toast.success("Created");
      }
      setOpen(false);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: Id<"products">) {
    if (!confirm("Delete this item?")) return;
    await removeProduct({ id });
    toast.success("Deleted");
  }

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>Products {"&"} Services</h1>
          <p className="text-muted-foreground text-sm mt-1">{products?.length ?? 0} items</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> New Item</Button>
      </div>

      {!products ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : products.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Package /></EmptyMedia>
            <EmptyTitle>No products yet</EmptyTitle>
            <EmptyDescription>Add products or services to use in your documents</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3">
          {products.map((p) => (
            <Card key={p._id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-[#F5A623]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <Badge variant="secondary" className="text-xs">{p.isService ? "Service" : "Product"}</Badge>
                      {p.category && <Badge variant="outline" className="text-xs">{p.category}</Badge>}
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                    <p className="text-sm font-bold text-[#1B3A7A] dark:text-[#F5A623] mt-1">
                      {formatCurrency(p.price, p.currency)}{p.unit ? ` / ${p.unit}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p._id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Item" : "New Product / Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Web Design" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label>Price *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="hour, project, item" /></div>
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Design, Dev..." /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isService" checked={form.isService} onChange={(e) => setForm({ ...form, isService: e.target.checked })} />
              <Label htmlFor="isService">This is a service (not a physical product)</Label>
            </div>
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
