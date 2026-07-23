import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Plus, Trash2 } from "lucide-react";
import { CURRENCIES, formatCurrency } from "@/lib/brand.ts";
import type { Id } from "@/convex/_generated/dataModel.js";

export type LineItem = {
  productId?: Id<"products">;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency: string;
  onCurrencyChange: (c: string) => void;
}

export function LineItemsEditor({ items, onChange, currency, onCurrencyChange }: LineItemsEditorProps) {
  function addItem() { onChange([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]); }
  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    const updated = items.map((item, idx) => {
      if (idx !== i) return item;
      const next = { ...item, [field]: value };
      if (field === "quantity" || field === "unitPrice") next.total = Number(next.quantity) * Number(next.unitPrice);
      return next;
    });
    onChange(updated);
  }
  function removeItem(i: number) { onChange(items.filter((_, idx) => idx !== i)); }
  const subtotal = items.reduce((s, it) => s + it.total, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Line Items</Label>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Currency</Label>
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-1">
        <span className="col-span-5">Description</span>
        <span className="col-span-2 text-center">Qty</span>
        <span className="col-span-3 text-center">Unit Price</span>
        <span className="col-span-1 text-right">Total</span>
        <span className="col-span-1" />
      </div>
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-12 md:col-span-5"><Input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Item description" className="text-sm" /></div>
          <div className="col-span-4 md:col-span-2"><Input type="number" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)} className="text-sm text-center" /></div>
          <div className="col-span-6 md:col-span-3"><Input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} className="text-sm" /></div>
          <div className="col-span-1 text-right text-sm font-semibold">{formatCurrency(item.total, currency)}</div>
          <div className="col-span-1"><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeItem(i)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Add Line Item</Button>
      <div className="flex justify-end"><div className="text-sm font-bold">Subtotal: <span>{formatCurrency(subtotal, currency)}</span></div></div>
    </div>
  );
}

interface TotalsProps {
  subtotal: number;
  taxRate: number;
  discountRate: number;
  onTaxRateChange: (v: number) => void;
  onDiscountRateChange: (v: number) => void;
  currency: string;
}

export function TotalsEditor({ subtotal, taxRate, discountRate, onTaxRateChange, onDiscountRateChange, currency }: TotalsProps) {
  const discount = subtotal * (discountRate / 100);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (taxRate / 100);
  const total = afterDiscount + tax;
  return (
    <div className="space-y-2 border rounded-xl p-4 bg-muted/30">
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatCurrency(subtotal, currency)}</span></div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <Label className="text-muted-foreground w-32">Discount %</Label>
        <div className="flex items-center gap-2">
          <Input type="number" value={discountRate} onChange={(e) => onDiscountRateChange(parseFloat(e.target.value) || 0)} className="w-20 h-7 text-xs text-right" />
          <span className="text-muted-foreground">= -{formatCurrency(discount, currency)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <Label className="text-muted-foreground w-32">Tax %</Label>
        <div className="flex items-center gap-2">
          <Input type="number" value={taxRate} onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)} className="w-20 h-7 text-xs text-right" />
          <span className="text-muted-foreground">= +{formatCurrency(tax, currency)}</span>
        </div>
      </div>
      <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
        <span>Total</span>
        <span className="text-[#1B3A7A] dark:text-[#F5A623]">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  );
}

export function calcTotals(items: LineItem[], taxRate: number, discountRate: number) {
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const discountAmount = subtotal * (discountRate / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
}
