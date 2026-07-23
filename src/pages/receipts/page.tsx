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
import { Receipt, Plus, Eye, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, generateNumber } from "@/lib/brand.ts";
import { LineItemsEditor, calcTotals, type LineItem } from "@/pages/documents/_components/LineItemsEditor.tsx";
import DocumentPreview from "@/pages/documents/_components/DocumentPreview.tsx";
import type { Id } from "@/convex/_generated/dataModel.js";

export default function ReceiptsPage() {
  const receipts = useQuery(api.receipts.list, {});
  const clients = useQuery(api.clients.list, {});
  const profile = useQuery(api.users.getCurrentUser, {});
  const createReceipt = useMutation(api.receipts.create);
  const removeReceipt = useMutation(api.receipts.remove);

  const [open, setOpen] = useState(false);
  const [previewId, setPreviewId] = useState<Id<"receipts"> | null>(null);
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [currency, setCurrency] = useState(profile?.currency ?? "ZMW");
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const previewReceipt = useQuery(api.receipts.get, previewId ? { id: previewId } : "skip");

  function openCreate() {
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setCurrency(profile?.currency ?? "ZMW");
    setClientId(""); setIssueDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Cash"); setNotes("");
    setOpen(true);
  }

  async function handleSave() {
    if (!clientId) { toast.error("Select a client"); return; }
    if (items.length === 0 || !items[0].description) { toast.error("Add at least one item"); return; }
    setSaving(true);
    try {
      const { subtotal: sub, total } = calcTotals(items, 0, 0);
      await createReceipt({
        clientId: clientId as Id<"clients">,
        receiptNumber: generateNumber("REC", receipts?.length ?? 0),
        issueDate,
        currency,
        items: items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })),
        subtotal: sub,
        total,
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined,
      });
      toast.success("Receipt created");
      setOpen(false);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: Id<"receipts">) {
    if (!confirm("Delete this receipt?")) return;
    await removeReceipt({ id });
    toast.success("Deleted");
  }

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>Receipts</h1>
          <p className="text-muted-foreground text-sm mt-1">{receipts?.length ?? 0} total</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> New Receipt</Button>
      </div>

      {!receipts ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : receipts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Receipt /></EmptyMedia>
            <EmptyTitle>No receipts yet</EmptyTitle>
            <EmptyDescription>Issue receipts to clients after payment</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Receipt</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-3">
          {receipts.map((r) => (
            <Card key={r._id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">{r.receiptNumber}</p>
                  <p className="text-sm text-muted-foreground">{r.client?.name ?? "\u2014"} \u00b7 {formatDate(r.issueDate)}</p>
                  {r.paymentMethod && <p className="text-xs text-muted-foreground">{r.paymentMethod}</p>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="font-bold text-foreground">{formatCurrency(r.total, r.currency)}</p>
                  <Button size="icon" variant="ghost" onClick={() => setPreviewId(r._id)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(r._id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Receipt</DialogTitle>
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
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Cash","Bank Transfer","Credit Card","EFT","Cheque","PayPal","Other"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes" /></div>
            </div>
            <LineItemsEditor items={items} onChange={setItems} currency={currency} onCurrencyChange={setCurrency} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Receipt"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewId} onOpenChange={(o) => !o && setPreviewId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Receipt Preview</DialogTitle></DialogHeader>
          {previewReceipt && (
            <DocumentPreview
              type="receipt"
              number={previewReceipt.receiptNumber}
              issueDate={previewReceipt.issueDate}
              status="paid"
              client={previewReceipt.client}
              userProfile={profile}
              items={previewReceipt.items}
              subtotal={previewReceipt.subtotal}
              taxAmount={previewReceipt.taxAmount}
              discountAmount={previewReceipt.discountAmount}
              total={previewReceipt.total}
              currency={previewReceipt.currency}
              notes={previewReceipt.notes}
              paymentMethod={previewReceipt.paymentMethod}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
