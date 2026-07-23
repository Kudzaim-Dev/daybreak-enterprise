import { query } from "./_generated/server";
import { ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";

async function getAuthUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ message: "Not authenticated", code: "UNAUTHENTICATED" });
  const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
  if (!user) throw new ConvexError({ message: "User not found", code: "NOT_FOUND" });
  return user;
}

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const [clients, invoices, quotations, receipts] = await Promise.all([
      ctx.db.query("clients").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("invoices").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("quotations").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("receipts").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
    ]);
    const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0);
    const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((sum, i) => sum + i.total, 0);
    const recentInvoices = await Promise.all(invoices.slice(0, 5).map(async (inv) => ({ ...inv, client: await ctx.db.get(inv.clientId) })));
    return {
      totalClients: clients.length,
      totalRevenue,
      outstanding,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter((i) => i.status === "paid").length,
      pendingInvoices: invoices.filter((i) => i.status === "sent" || i.status === "overdue").length,
      totalQuotations: quotations.length,
      totalReceipts: receipts.length,
      recentInvoices,
    };
  },
});
