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

export const list = query({ args: {}, handler: async (ctx) => { const user = await getAuthUser(ctx); return await ctx.db.query("clients").withIndex("by_user", (q) => q.eq("userId", user._id)).order("desc").collect(); } });
export const get = query({ args: { id: v.id("clients") }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); const client = await ctx.db.get(args.id); if (!client || client.userId !== user._id) return null; return client; } });
export const create = mutation({ args: { name: v.string(), email: v.optional(v.string()), phone: v.optional(v.string()), address: v.optional(v.string()), company: v.optional(v.string()), notes: v.optional(v.string()) }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); return await ctx.db.insert("clients", { ...args, userId: user._id }); } });
export const update = mutation({ args: { id: v.id("clients"), name: v.string(), email: v.optional(v.string()), phone: v.optional(v.string()), address: v.optional(v.string()), company: v.optional(v.string()), notes: v.optional(v.string()) }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); const client = await ctx.db.get(args.id); if (!client || client.userId !== user._id) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" }); const { id, ...data } = args; await ctx.db.patch(id, data); } });
export const remove = mutation({ args: { id: v.id("clients") }, handler: async (ctx, args) => { const user = await getAuthUser(ctx); const client = await ctx.db.get(args.id); if (!client || client.userId !== user._id) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" }); await ctx.db.delete(args.id); } });
