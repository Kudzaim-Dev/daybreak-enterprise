import { DAYBREAK_LOGO, DAYBREAK_BRAND, DAYBREAK_COPYRIGHT, formatCurrency, formatDate } from "@/lib/brand.ts";
import type { LineItem } from "./LineItemsEditor.tsx";
import type { Doc } from "@/convex/_generated/dataModel.js";

interface DocumentPreviewProps {
  type: "quotation" | "invoice" | "receipt";
  number: string;
  issueDate: string;
  expiryDate?: string;
  dueDate?: string;
  status: string;
  client: Pick<Doc<"clients">, "name" | "email" | "phone" | "address" | "company"> | null | undefined;
  userProfile: Pick<Doc<"users">, "name" | "email" | "businessName" | "phone" | "address" | "taxNumber"> | null | undefined;
  items: LineItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  paymentMethod?: string;
}

export default function DocumentPreview({ type, number, issueDate, expiryDate, dueDate, status, client, userProfile, items, subtotal, taxRate, taxAmount, discountRate, discountAmount, total, currency, notes, terms, paymentMethod }: DocumentPreviewProps) {
  const typeLabel = type === "quotation" ? "QUOTATION" : type === "invoice" ? "INVOICE" : "RECEIPT";
  return (
    <div className="bg-white text-[#1B3A7A] font-sans text-sm" style={{ minWidth: 600 }}>
      <div className="flex justify-between items-start p-8 border-b-4 border-[#1B3A7A]">
        <div>
          <img src={DAYBREAK_LOGO} alt={DAYBREAK_BRAND} className="h-12 w-auto mb-2" />
          <p className="text-xs text-gray-500 mt-1">{userProfile?.businessName ?? DAYBREAK_BRAND}</p>
          {userProfile?.address && <p className="text-xs text-gray-500">{userProfile.address}</p>}
          {userProfile?.email && <p className="text-xs text-gray-500">{userProfile.email}</p>}
          {userProfile?.phone && <p className="text-xs text-gray-500">{userProfile.phone}</p>}
          {userProfile?.taxNumber && <p className="text-xs text-gray-500">Tax No: {userProfile.taxNumber}</p>}
        </div>
        <div className="text-right">
          <div className="inline-block bg-[#1B3A7A] text-white px-4 py-1.5 rounded-lg font-bold text-lg mb-3">{typeLabel}</div>
          <p className="font-bold text-xl text-[#1B3A7A]">{number}</p>
          <p className="text-xs text-gray-500 mt-1">Issue Date: {formatDate(issueDate)}</p>
          {dueDate && <p className="text-xs text-gray-500">Due Date: {formatDate(dueDate)}</p>}
          {expiryDate && <p className="text-xs text-gray-500">Expiry: {formatDate(expiryDate)}</p>}
          <div className="mt-2"><span className="inline-block bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/40 px-3 py-0.5 rounded-full text-xs font-bold uppercase">{status}</span></div>
        </div>
      </div>
      <div className="px-8 py-4 bg-gray-50">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
        <p className="font-bold text-[#1B3A7A]">{client?.name ?? "—"}</p>
        {client?.company && <p className="text-xs text-gray-500">{client.company}</p>}
        {client?.address && <p className="text-xs text-gray-500">{client.address}</p>}
        {client?.email && <p className="text-xs text-gray-500">{client.email}</p>}
        {client?.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
      </div>
      <div className="px-8 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#1B3A7A]">
              <th className="text-left py-2 font-bold text-[#1B3A7A]">Description</th>
              <th className="text-center py-2 font-bold text-[#1B3A7A] w-16">Qty</th>
              <th className="text-right py-2 font-bold text-[#1B3A7A] w-28">Unit Price</th>
              <th className="text-right py-2 font-bold text-[#1B3A7A] w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
                <td className="py-2 text-gray-700">{item.description}</td>
                <td className="py-2 text-center text-gray-700">{item.quantity}</td>
                <td className="py-2 text-right text-gray-700">{formatCurrency(item.unitPrice, currency)}</td>
                <td className="py-2 text-right font-medium text-[#1B3A7A]">{formatCurrency(item.total, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-8 pb-4 flex justify-end">
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
          {discountAmount !== undefined && discountAmount > 0 && <div className="flex justify-between text-xs text-gray-500"><span>Discount ({discountRate ?? 0}%)</span><span>-{formatCurrency(discountAmount, currency)}</span></div>}
          {taxAmount !== undefined && taxAmount > 0 && <div className="flex justify-between text-xs text-gray-500"><span>Tax ({taxRate ?? 0}%)</span><span>+{formatCurrency(taxAmount, currency)}</span></div>}
          {paymentMethod && <div className="flex justify-between text-xs text-gray-500"><span>Payment Method</span><span>{paymentMethod}</span></div>}
          <div className="flex justify-between font-black text-base border-t-2 border-[#1B3A7A] pt-2 text-[#1B3A7A]"><span>TOTAL</span><span>{formatCurrency(total, currency)}</span></div>
        </div>
      </div>
      {(notes || terms) && (
        <div className="px-8 pb-4 grid grid-cols-2 gap-4 border-t">
          {notes && <div className="pt-4"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p><p className="text-xs text-gray-600">{notes}</p></div>}
          {terms && <div className="pt-4"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Terms & Conditions</p><p className="text-xs text-gray-600">{terms}</p></div>}
        </div>
      )}
      <div className="bg-[#1B3A7A] text-white px-8 py-3 flex items-center justify-between mt-2">
        <img src={DAYBREAK_LOGO} alt={DAYBREAK_BRAND} className="h-6 w-auto brightness-0 invert" />
        <p className="text-xs opacity-70">{DAYBREAK_COPYRIGHT}</p>
      </div>
    </div>
  );
}
