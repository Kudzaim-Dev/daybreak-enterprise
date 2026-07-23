import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { formatCurrency } from "@/lib/brand.ts";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, FileText, Clock, Receipt, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils.ts";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  const data = useQuery(api.dashboard.getDashboard, {});
  const profile = useQuery(api.users.getCurrentUser, {});
  const navigate = useNavigate();
  const currency = profile?.currency ?? "ZMW";

  if (!data) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const stats = [
    { label: "Total Revenue", value: formatCurrency(data.totalRevenue, currency), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "Outstanding", value: formatCurrency(data.outstanding, currency), icon: Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "Total Clients", value: String(data.totalClients), icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Total Invoices", value: String(data.totalInvoices), icon: FileText, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  const quickLinks = [
    { label: "Quotations", count: data.totalQuotations, icon: ClipboardList, href: "/quotations", color: "border-[#1B3A7A]" },
    { label: "Invoices", count: data.totalInvoices, icon: FileText, href: "/invoices", color: "border-[#F5A623]" },
    { label: "Receipts", count: data.totalReceipts, icon: Receipt, href: "/receipts", color: "border-green-500" },
    { label: "Clients", count: data.totalClients, icon: Users, href: "/clients", color: "border-purple-500" },
  ];

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: "Montserrat, sans-serif" }}>Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back to DayBreak Enterprise</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <div className={cn("p-2 rounded-lg", s.bg)}><s.icon className={cn("h-5 w-5", s.color)} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((q) => (
          <button key={q.label} onClick={() => navigate(q.href)}
            className={cn("bg-card border-l-4 rounded-xl p-4 text-left hover:shadow-md transition-all cursor-pointer", q.color)}>
            <q.icon className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">{q.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{q.label}</p>
          </button>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-bold">Recent Invoices</CardTitle></CardHeader>
        <CardContent>
          {data.recentInvoices.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No invoices yet. Create your first invoice.</p>
          ) : (
            <div className="space-y-3">
              {data.recentInvoices.map((inv) => (
                <div key={inv._id} onClick={() => navigate("/invoices")}
                  className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/30 rounded px-2 -mx-2 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">{inv.client?.name ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-sm">{formatCurrency(inv.total, inv.currency)}</p>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[inv.status] ?? "bg-muted text-muted-foreground")}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
