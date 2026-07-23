import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DAYBREAK_LOGO, DAYBREAK_BRAND, DAYBREAK_COPYRIGHT, formatCurrency, formatDate } from "@/lib/brand.ts";
import type { LineItem } from "@/pages/documents/_components/LineItemsEditor.tsx";

// DayBreak navy and orange
const NAVY: [number, number, number] = [27, 58, 122];
const ORANGE: [number, number, number] = [245, 166, 35];
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT_GRAY: [number, number, number] = [248, 249, 250];
const MID_GRAY: [number, number, number] = [100, 100, 100];

interface UserProfile {
  name?: string;
  email?: string;
  businessName?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
}

interface ClientInfo {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
}

interface DocumentData {
  type: "quotation" | "invoice" | "receipt";
  number: string;
  issueDate: string;
  expiryDate?: string;
  dueDate?: string;
  status: string;
  client: ClientInfo | null | undefined;
  userProfile: UserProfile | null | undefined;
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

async function loadLogoAsBase64(): Promise<string | null> {
  try {
    const response = await fetch(DAYBREAK_LOGO);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateDocumentPDF(data: DocumentData): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;

  const typeLabel = data.type === "quotation" ? "QUOTATION" : data.type === "invoice" ? "INVOICE" : "RECEIPT";

  // ── Header bar ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 40, "F");

  // Logo
  const logoBase64 = await loadLogoAsBase64();
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", margin, 8, 40, 22);
  } else {
    doc.setTextColor(...WHITE);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(DAYBREAK_BRAND, margin, 22);
  }

  // Document type badge (orange pill)
  doc.setFillColor(...ORANGE);
  doc.roundedRect(pageW - margin - 45, 10, 45, 10, 2, 2, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(typeLabel, pageW - margin - 22.5, 16.5, { align: "center" });

  // Document number
  doc.setTextColor(...WHITE);
  doc.setFontSize(14);
  doc.text(data.number, pageW - margin, 28, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Issue Date: ${formatDate(data.issueDate)}`, pageW - margin, 34, { align: "right" });

  let y = 50;

  // ── Business info (left) + document meta (right) ──
  const bizName = data.userProfile?.businessName ?? DAYBREAK_BRAND;
  doc.setTextColor(...NAVY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(bizName, margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MID_GRAY);
  let leftY = y + 5;
  if (data.userProfile?.address) { doc.text(data.userProfile.address, margin, leftY); leftY += 4; }
  if (data.userProfile?.email) { doc.text(data.userProfile.email, margin, leftY); leftY += 4; }
  if (data.userProfile?.phone) { doc.text(data.userProfile.phone, margin, leftY); leftY += 4; }
  if (data.userProfile?.taxNumber) { doc.text(`Tax No: ${data.userProfile.taxNumber}`, margin, leftY); leftY += 4; }

  // Right side: status + dates
  doc.setTextColor(...NAVY);
  doc.setFontSize(8);
  const rightX = pageW - margin;
  let rightY = y;
  if (data.dueDate) { doc.text(`Due: ${formatDate(data.dueDate)}`, rightX, rightY, { align: "right" }); rightY += 5; }
  if (data.expiryDate) { doc.text(`Expires: ${formatDate(data.expiryDate)}`, rightX, rightY, { align: "right" }); rightY += 5; }
  if (data.paymentMethod) { doc.text(`Payment: ${data.paymentMethod}`, rightX, rightY, { align: "right" }); rightY += 5; }
  // Status badge
  doc.setFillColor(...ORANGE);
  doc.roundedRect(rightX - 30, rightY - 1, 30, 7, 1.5, 1.5, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(data.status.toUpperCase(), rightX - 15, rightY + 3.5, { align: "center" });

  y = Math.max(leftY, rightY + 10) + 4;

  // ── Bill To ──
  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(margin, y, contentW, data.client?.company ? 28 : 24, 2, 2, "F");
  doc.setTextColor(...MID_GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", margin + 4, y + 5);
  doc.setTextColor(...NAVY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.client?.name ?? "\u2014", margin + 4, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MID_GRAY);
  let billY = y + 16;
  if (data.client?.company) { doc.text(data.client.company, margin + 4, billY); billY += 4; }
  if (data.client?.address) { doc.text(data.client.address, margin + 4, billY); billY += 4; }
  if (data.client?.email) { doc.text(data.client.email, margin + 4, billY); billY += 4; }
  if (data.client?.phone) { doc.text(data.client.phone, margin + 4, billY); }

  y += data.client?.company ? 33 : 29;

  // ── Line items table ──
  autoTable(doc, {
    startY: y,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: data.items.map((item) => [
      item.description,
      String(item.quantity),
      formatCurrency(item.unitPrice, data.currency),
      formatCurrency(item.total, data.currency),
    ]),
    theme: "grid",
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: margin, right: margin },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── Totals box ──
  const totalsW = 75;
  const totalsX = pageW - margin - totalsW;

  let totalsH = 18;
  if (data.discountAmount && data.discountAmount > 0) totalsH += 6;
  if (data.taxAmount && data.taxAmount > 0) totalsH += 6;

  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(totalsX, y, totalsW, totalsH, 2, 2, "F");

  let ty = y + 6;
  doc.setFontSize(8);
  doc.setTextColor(...MID_GRAY);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal", totalsX + 4, ty);
  doc.text(formatCurrency(data.subtotal, data.currency), totalsX + totalsW - 4, ty, { align: "right" });
  ty += 6;

  if (data.discountAmount && data.discountAmount > 0) {
    doc.text(`Discount (${data.discountRate ?? 0}%)`, totalsX + 4, ty);
    doc.text(`-${formatCurrency(data.discountAmount, data.currency)}`, totalsX + totalsW - 4, ty, { align: "right" });
    ty += 6;
  }
  if (data.taxAmount && data.taxAmount > 0) {
    doc.text(`Tax (${data.taxRate ?? 0}%)`, totalsX + 4, ty);
    doc.text(`+${formatCurrency(data.taxAmount, data.currency)}`, totalsX + totalsW - 4, ty, { align: "right" });
    ty += 6;
  }

  // Total line with navy background
  doc.setFillColor(...NAVY);
  doc.roundedRect(totalsX, ty - 1, totalsW, 9, 1.5, 1.5, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", totalsX + 4, ty + 5);
  doc.text(formatCurrency(data.total, data.currency), totalsX + totalsW - 4, ty + 5, { align: "right" });

  y = Math.max(y + totalsH, ty + 13) + 6;

  // ── Notes / Terms ──
  if (data.notes || data.terms) {
    const colW = data.notes && data.terms ? (contentW - 4) / 2 : contentW;
    if (data.notes) {
      doc.setFillColor(...LIGHT_GRAY);
      doc.roundedRect(margin, y, colW, 20, 2, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(...MID_GRAY);
      doc.setFont("helvetica", "bold");
      doc.text("NOTES", margin + 4, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      const noteLines = doc.splitTextToSize(data.notes, colW - 8);
      doc.text(noteLines, margin + 4, y + 10);
    }
    if (data.terms) {
      const tx = data.notes ? margin + colW + 4 : margin;
      doc.setFillColor(...LIGHT_GRAY);
      doc.roundedRect(tx, y, colW, 20, 2, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(...MID_GRAY);
      doc.setFont("helvetica", "bold");
      doc.text("TERMS & CONDITIONS", tx + 4, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      const termLines = doc.splitTextToSize(data.terms, colW - 8);
      doc.text(termLines, tx + 4, y + 10);
    }
    y += 26;
  }

  // ── Footer ──
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...NAVY);
  doc.rect(0, pageH - 14, pageW, 14, "F");
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", margin, pageH - 12, 20, 10);
  }
  doc.setTextColor(...WHITE);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(DAYBREAK_COPYRIGHT, pageW / 2, pageH - 5, { align: "center" });

  const filename = `${data.type}-${data.number}.pdf`;
  doc.save(filename);
}
