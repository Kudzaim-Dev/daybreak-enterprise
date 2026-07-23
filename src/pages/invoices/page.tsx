import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { toast } from "sonner";
import { FileText, Plus, Eye, Pencil, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { formatCurrency, formatDate, generateNumber } from "@/lib/brand.ts";
import { LineItemsEditor, TotalsEditor, calcTotals, type LineItem } from "@/pages/documents/_components/LineItemsEditor.tsx";
import DocumentPreview from "@/pages/documents/_components/DocumentPreview.tsx";
import { generateDocumentPDF } from "@/lib/pdf.ts";
import type { Id } from "@/convex/_generated/dataModel.js";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-muted text-muted-foreground",
};

type InvStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export default function InvoicesPage() {
  const invoices = useQuery(api.invoices.list, {});
  const clients = useQuery(api.clients.list, {});
  const profile = useQuery(api.users.getCurrentUser, {});
  const createInvoice = useMutation(api.invoices.create);
  const updateInvoice = useMutation(api.invoices.update);
  const updateStatus = useMutation(api.invoices.updateStatus);
  const removeInvoice = useMutation(api.invoices.remove);

  const [open, setOpen] = useState(false);
  const [previewId, setPreviewId] = useState<Id<"invoices"> | null>(null);
  const [editing, setEditing] = useState<Id<"invoices"> | null>(null);
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [currency, setCurrency] = useState(profile?.currency ?? "ZMW");
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [saving, setSaving] = useState(false);

  const previewInvoice = useQuery(api.invoices.get, previewId ? { id: previewId } : "skip");

  function openCreate() {
    setEditing(null);
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setCurrency(profile?.currency ?? "ZMW");
    setTaxRate(0); setDiscountRate(0);
    setClientId(""); setIssueDate(new Date().toISOString().split("T")[0]);
    setDueDate(""); setNotes(""); setTerms("");
    setOpen(true);
  }

  function openEdit(inv: NonNullable<typeof invoices>[0]) {
    setEditing(inv._id);
    setItems(inv.items);
    setCurrency(inv.currency);
    setTaxRate(inv.taxRate ?? 0);
    setDiscountRate(inv.discountRate ?? 0);
    setClientId(inv.clientId);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate ?? "");
    setNotes(inv.notes ?? "");
    setTerms(inv.terms ?? "");
    setOpen(true);
  }

  async function handleSave() {
    if (!clientId) { toast.error("Select a client"); return; }
    if (items.length === 0 || !items[0].description) { toast.error("Add at least one item"); return; }
    setSaving(true);
    try {
      const { subtotal, discountAmount, taxAmount, total } = calcTotals(items, taxRate, discountRate);
      const invoiceNumber = editing
        ? invoices?.find((i) => i._id === editing)?.invoiceNumber ?? ""
        : generateNumber("INV", invoices?.length ?? 0);
      const payload = {
        clientId: clientId as Id<"clients">,
        invoiceNumber,
        status: "draft" as InvStatus,
        issueDate,
        dueDate: dueDate || undefined,
        currency,
        items,
        subtotal,
        taxRate: taxRate || undefined,
        taxAmount: taxAmount || undefined,
        discountRate: discountRate || undefined,
        discountAmount: discountAmount || undefined,
        total,
        notes: notes || undefined,
        terms: terms || undefined,
      };
      if (editing) {
        await updateInvoice({ id: editing, ...payload });
        toast.success("Invoice updated");
      } else {
        await createInvoice(payload);
        toast.success("Invoice created");
      }
      setOpen(false);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: Id<"invoices">, status: InvStatus) {
    const paidDate = status === "paid" ? new Date().toISOString().split("T")[0] : undefined;
    const inv = invoices?.find((i) => i._id === id);
    const paidAmount = status === "paid" ? inv?.total : undefined;
    await updateStatus({ id, status, paidDate, paidAmount });
    toast.success(`Status updated to ${status}`);
  }

  async function handleDelete(id: Id<"invoices">) {
    if (!confirm("Delete this invoice?")) return;
    await removeInvoice({ id });
    toast.success("Deleted");
  }

  async function handleDownload(inv: NonNullable<typeof invoices>[0]) {
    try {
      await generateDocumentPDF({
        type: "invoice",
        number: inv.invoiceNumber,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        status: inv.status,
        client: inv.client,
        userProfile: profile,
        items: inv.items,
        subtotal: inv.subtotal,
        taxRate: inv.taxRate,
        taxAmount: inv.taxAmount,
        discountRate: inv.discountRate,
        discountAmount: inv.discountAmount,
        total: inv.total,
        currency: inv.currency,
        notes: inv.notes,
        terms: inv.terms,
      });
    } catch {
      toast.error("Failed to generate PDF");
    }
  }

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">{invoices?.length ?? 0} total</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> New Invoice</Button>
      </div>

      {!invoices ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : invoices.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><FileText /></EmptyMedia>
            <EmptyTitle>No invoices yet</EmptyTitle>
            <EmptyDescription>Create your first invoice to start getting paid</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Invoice</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv._id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{inv.invoiceNumber}</p>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[inv.status])}>{inv.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{inv.client?.name ?? "\u2014"} \u00b7 {formatDate(inv.issueDate)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="font-bold text-foreground">{formatCurrency(inv.total, inv.currency)}</p>
                  <Select value={inv.status} onValueChange={(v) => handleStatusChange(inv._id, v as InvStatus)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["draft","sent","paid","overdue","cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => handleDownload(inv)} title="Download PDF"><Download className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setPreviewId(inv._id)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(inv)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(inv._id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Invoice" : "New Invoice"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client *</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients?.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Issue Date</Label><Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></div>
              <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
            </div>
            <LineItemsEditor items={items} onChange={setItems} currency={currency} onCurrencyChange={setCurrency} />
            <TotalsEditor
              subtotal={items.reduce((s, it) => s + it.total, 0)}
              taxRate={taxRate} discountRate={discountRate}
              onTaxRateChange={setTaxRate} onDiscountRateChange={setDiscountRate}
              currency={currency}
            />
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes" /></div>
              <div><Label>Terms {"&"} Conditions</Label><Input value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Payment terms..." /></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Invoice"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewId} onOpenChange={(o) => !o && setPreviewId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Invoice Preview</DialogTitle></DialogHeader>
          {previewInvoice && (
            <DocumentPreview
              type="invoice"
              number={previewInvoice.invoiceNumber}
              issueDate={previewInvoice.issueDate}
              dueDate={previewInvoice.dueDate}
              status={previewInvoice.status}
              client={previewInvoice.client}
              userProfile={profile}
              items={previewInvoice.items}
              subtotal={previewInvoice.subtotal}
              taxRate={previewInvoice.taxRate}
              taxAmount={previewInvoice.taxAmount}
              discountRate={previewInvoice.discountRate}
              discountAmount={previewInvoice.discountAmount}
              total={previewInvoice.total}
              currency={previewInvoice.currency}
              notes={previewInvoice.notes}
              terms={previewInvoice.terms}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
