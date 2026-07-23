import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";

async function getAuthUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ message: "Not authenticated", code: "UNAUTHENTICATED" });
  const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
  if (!user) throw new ConvexError({ message: "User not found", code: "NOT_FOUND" });
  return user;
}

const itemValidator = v.object({ description: v.string(), quantity: v.number(), unitPrice: v.number(), total: v.number() });

export const list = query({ args: {}, handler: async (ctx) => { const user = await getAuthUser(ctx); const receipts = await ctx.db.query("receipts").withIndex("by_user", (q) => q.eq("userId", user._id)).order("desc").collect(); return await Promise.all(receipts.map(async (r) => ({ ...r, client: await ctx.db.get(r.clientId) }))); } });
export const get = query({ args: { id: v.id("receipts") }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); const receipt = await ctx.db.get(args.id); if (!receipt || receipt.userId !== user._id) return null; return { ...receipt, client: await ctx.db.get(receipt.clientId) }; } });
export const create = mutation({ args: { clientId: v.id("clients"), invoiceId: v.optional(v.id("invoices")), receiptNumber: v.string(), issueDate: v.string(), currency: v.string(), items: v.array(itemValidator), subtotal: v.number(), taxAmount: v.optional(v.number()), discountAmount: v.optional(v.number()), total: v.number(), paymentMethod: v.optional(v.string()), notes: v.optional(v.string()) }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); return await ctx.db.insert("receipts", { ...args, userId: user._id }); } });
export const remove = mutation({ args: { id: v.id("receipts") }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); const doc = await ctx.db.get(args.id); if (!doc || doc.userId !== user._id) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" }); await ctx.db.delete(args.id); } });
