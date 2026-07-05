import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

async function getServiceClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

type AdminSession = { authed?: boolean; at?: number };

function sessionConfig() {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET is not configured (must be at least 32 chars)");
  }
  return {
    password,
    name: "homewise_admin",
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: true,
      path: "/",
    },
  };
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) throw new Error("ADMIN_PASSWORD is not configured");
    const a = Buffer.from(data.password);
    const b = Buffer.from(expected);
    let ok = a.length === b.length;
    const len = Math.max(a.length, b.length);
    let diff = a.length ^ b.length;
    for (let i = 0; i < len; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
    ok = ok && diff === 0;
    if (!ok) return { ok: false as const };
    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ authed: true, at: Date.now() });
    return { ok: true as const };
  });

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const session = await useSession<AdminSession>(sessionConfig());
    return { authed: !!session.data.authed };
  } catch {
    return { authed: false };
  }
});

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true };
});

const ADMIN_LISTING_SELECT =
  "id, created_at, status, type, name, locality, address, college, gender, curfew, ac, walk_min, metro_station, food_type, wifi, deposit, price_single, price_double, price_triple, total_rent, ideal_sharers, owner_name, owner_whatsapp, owner_email, area_description, is_featured";

async function requireAdmin() {
  const session = await useSession<AdminSession>(sessionConfig());
  if (!session.data.authed) throw new Error("Unauthorized");
}

export const getPendingListings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const admin = await getServiceClient();
  const { data, error } = await admin
    .from("listings")
    .select(ADMIN_LISTING_SELECT)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getAllListings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const admin = await getServiceClient();
  const { data, error } = await admin
    .from("listings")
    .select(ADMIN_LISTING_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const updateListingStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().min(1), status: z.enum(["approved", "rejected"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = await getServiceClient();
    const { error } = await admin.from("listings").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteListing = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = await getServiceClient();
    const { error } = await admin.from("listings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
