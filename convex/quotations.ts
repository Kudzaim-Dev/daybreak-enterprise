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

const itemValidator = v.object({ productId: v.optional(v.id("products")), description: v.string(), quantity: v.number(), unitPrice: v.number(), total: v.number() });

export const list = query({ args: {}, handler: async (ctx) => { const user = await getAuthUser(ctx); const quotations = await ctx.db.query("quotations").withIndex("by_user", (q) => q.eq("userId", user._id)).order("desc").collect(); return await Promise.all(quotations.map(async (q) => ({ ...q, client: await ctx.db.get(q.clientId) }))); } });
export const get = query({ args: { id: v.id("quotations") }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); const quotation = await ctx.db.get(args.id); if (!quotation || quotation.userId !== user._id) return null; return { ...quotation, client: await ctx.db.get(quotation.clientId) }; } });
export const create = mutation({ args: { clientId: v.id("clients"), quoteNumber: v.string(), status: v.union(v.literal("draft"), v.literal("sent"), v.literal("accepted"), v.literal("declined"), v.literal("expired")), issueDate: v.string(), expiryDate: v.optional(v.string()), currency: v.string(), items: v.array(itemValidator), subtotal: v.number(), taxRate: v.optional(v.number()), taxAmount: v.optional(v.number()), discountRate: v.optional(v.number()), discountAmount: v.optional(v.number()), total: v.number(), notes: v.optional(v.string()), terms: v.optional(v.string()) }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); return await ctx.db.insert("quotations", { ...args, userId: user._id }); } });
export const update = mutation({ args: { id: v.id("quotations"), clientId: v.id("clients"), status: v.union(v.literal("draft"), v.literal("sent"), v.literal("accepted"), v.literal("declined"), v.literal("expired")), issueDate: v.string(), expiryDate: v.optional(v.string()), currency: v.string(), items: v.array(itemValidator), subtotal: v.number(), taxRate: v.optional(v.number()), taxAmount: v.optional(v.number()), discountRate: v.optional(v.number()), discountAmount: v.optional(v.number()), total: v.number(), notes: v.optional(v.string()), terms: v.optional(v.string()) }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); const doc = await ctx.db.get(args.id); if (!doc || doc.userId !== user._id) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" }); const { id, ...data } = args; await ctx.db.patch(id, data); } });
export const updateStatus = mutation({ args: { id: v.id("quotations"), status: v.union(v.literal("draft"), v.literal("sent"), v.literal("accepted"), v.literal("declined"), v.literal("expired")) }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); const doc = await ctx.db.get(args.id); if (!doc || doc.userId !== user._id) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" }); await ctx.db.patch(args.id, { status: args.status }); } });
export const remove = mutation({ args: { id: v.id("quotations") }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); const doc = await ctx.db.get(args.id); if (!doc || doc.userId !== user._id) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" }); await ctx.db.delete(args.id); } });
