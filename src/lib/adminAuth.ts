import { createContext, useContext } from "react";

export const AdminAuthContext = createContext<{ logout: () => Promise<void> } | null>(null);

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminLayout");
  return ctx;
}
