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
import { Badge } from "@/components/ui/badge.tsx";
import { toast } from "sonner";
import { ClipboardList, Plus, Eye, Pencil, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { formatCurrency, formatDate, generateNumber } from "@/lib/brand.ts";
import { LineItemsEditor, TotalsEditor, calcTotals, type LineItem } from "@/pages/documents/_components/LineItemsEditor.tsx";
import DocumentPreview from "@/pages/documents/_components/DocumentPreview.tsx";
import { generateDocumentPDF } from "@/lib/pdf.ts";
import type { Id } from "@/convex/_generated/dataModel.js";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  declined: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  expired: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

type QStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export default function QuotationsPage() {
  const quotations = useQuery(api.quotations.list, {});
  const clients = useQuery(api.clients.list, {});
  const profile = useQuery(api.users.getCurrentUser, {});
  const createQuotation = useMutation(api.quotations.create);
  const updateQuotation = useMutation(api.quotations.update);
  const updateStatus = useMutation(api.quotations.updateStatus);
  const removeQuotation = useMutation(api.quotations.remove);

  const [open, setOpen] = useState(false);
  const [previewId, setPreviewId] = useState<Id<"quotations"> | null>(null);
  const [editing, setEditing] = useState<Id<"quotations"> | null>(null);
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [currency, setCurrency] = useState(profile?.currency ?? "ZMW");
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [saving, setSaving] = useState(false);

  const previewQuotation = useQuery(api.quotations.get, previewId ? { id: previewId } : "skip");

  function openCreate() {
    setEditing(null);
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setCurrency(profile?.currency ?? "ZMW");
    setTaxRate(0); setDiscountRate(0);
    setClientId(""); setIssueDate(new Date().toISOString().split("T")[0]);
    setExpiryDate(""); setNotes(""); setTerms("");
    setOpen(true);
  }

  function openEdit(q: NonNullable<typeof quotations>[0]) {
    setEditing(q._id);
    setItems(q.items);
    setCurrency(q.currency);
    setTaxRate(q.taxRate ?? 0);
    setDiscountRate(q.discountRate ?? 0);
    setClientId(q.clientId);
    setIssueDate(q.issueDate);
    setExpiryDate(q.expiryDate ?? "");
    setNotes(q.notes ?? "");
    setTerms(q.terms ?? "");
    setOpen(true);
  }

  async function handleSave() {
    if (!clientId) { toast.error("Select a client"); return; }
    if (items.length === 0 || !items[0].description) { toast.error("Add at least one item"); return; }
    setSaving(true);
    try {
      const { subtotal, discountAmount, taxAmount, total } = calcTotals(items, taxRate, discountRate);
      const quoteNumber = editing
        ? quotations?.find((q) => q._id === editing)?.quoteNumber ?? ""
        : generateNumber("QUO", quotations?.length ?? 0);
      const payload = {
        clientId: clientId as Id<"clients">,
        quoteNumber,
        status: "draft" as QStatus,
        issueDate,
        expiryDate: expiryDate || undefined,
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
        await updateQuotation({ id: editing, ...payload });
        toast.success("Quotation updated");
      } else {
        await createQuotation(payload);
        toast.success("Quotation created");
      }
      setOpen(false);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: Id<"quotations">, status: QStatus) {
    await updateStatus({ id, status });
    toast.success(`Status updated to ${status}`);
  }

  async function handleDelete(id: Id<"quotations">) {
    if (!confirm("Delete this quotation?")) return;
    await removeQuotation({ id });
    toast.success("Deleted");
  }

  async function handleDownload(q: NonNullable<typeof quotations>[0]) {
    try {
      await generateDocumentPDF({
        type: "quotation",
        number: q.quoteNumber,
        issueDate: q.issueDate,
        expiryDate: q.expiryDate,
        status: q.status,
        client: q.client,
        userProfile: profile,
        items: q.items,
        subtotal: q.subtotal,
        taxRate: q.taxRate,
        taxAmount: q.taxAmount,
        discountRate: q.discountRate,
        discountAmount: q.discountAmount,
        total: q.total,
        currency: q.currency,
        notes: q.notes,
        terms: q.terms,
      });
    } catch {
      toast.error("Failed to generate PDF");
    }
  }

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>Quotations</h1>
          <p className="text-muted-foreground text-sm mt-1">{quotations?.length ?? 0} total</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> New Quotation</Button>
      </div>

      {!quotations ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : quotations.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><ClipboardList /></EmptyMedia>
            <EmptyTitle>No quotations yet</EmptyTitle>
            <EmptyDescription>Create your first quotation to send to clients</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Quotation</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-3">
          {quotations.map((q) => (
            <Card key={q._id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{q.quoteNumber}</p>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[q.status])}>{q.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{q.client?.name ?? "\u2014"} \u00b7 {formatDate(q.issueDate)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="font-bold text-foreground">{formatCurrency(q.total, q.currency)}</p>
                  <Select value={q.status} onValueChange={(v) => handleStatusChange(q._id, v as QStatus)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["draft","sent","accepted","declined","expired"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => handleDownload(q)} title="Download PDF"><Download className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setPreviewId(q._id)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(q)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(q._id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Quotation" : "New Quotation"}</DialogTitle>
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
              <div>
                <Label>Issue Date</Label>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </div>
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
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Quotation"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewId} onOpenChange={(o) => !o && setPreviewId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Quotation Preview</DialogTitle></DialogHeader>
          {previewQuotation && (
            <DocumentPreview
              type="quotation"
              number={previewQuotation.quoteNumber}
              issueDate={previewQuotation.issueDate}
              expiryDate={previewQuotation.expiryDate}
              status={previewQuotation.status}
              client={previewQuotation.client}
              userProfile={profile}
              items={previewQuotation.items}
              subtotal={previewQuotation.subtotal}
              taxRate={previewQuotation.taxRate}
              taxAmount={previewQuotation.taxAmount}
              discountRate={previewQuotation.discountRate}
              discountAmount={previewQuotation.discountAmount}
              total={previewQuotation.total}
              currency={previewQuotation.currency}
              notes={previewQuotation.notes}
              terms={previewQuotation.terms}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
