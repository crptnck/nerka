"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

/* ─── Types ───────────────────────────────────────────────────── */

export type UserData = {
  phone: string;
  name: string;
  address: string;
};

type View = "catalog" | "cart" | "thanks";

type CartCtx = {
  cart: Record<number, number>;
  view: View;
  userData: UserData | null;
  setQty: (id: number, delta: number) => void;
  clearCart: () => void;
  setView: (v: View) => void;
  saveUser: (data: UserData) => void;
  totalItems: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

/* ─── Provider ────────────────────────────────────────────────── */

function loadJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [view, setView] = useState<View>("catalog");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  /* Hydrate from localStorage once */
  useEffect(() => {
    setCart(loadJSON<Record<number, number>>("nerka_cart") ?? {});
    setUserData(loadJSON<UserData>("nerka_user") ?? null);
    setHydrated(true);
  }, []);

  /* Persist cart */
  useEffect(() => {
    if (hydrated) localStorage.setItem("nerka_cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  /* Persist user */
  useEffect(() => {
    if (hydrated && userData) localStorage.setItem("nerka_user", JSON.stringify(userData));
  }, [userData, hydrated]);

  const setQty = useCallback((id: number, delta: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const val = (next[id] ?? 0) + delta;
      if (val <= 0) delete next[id];
      else next[id] = val;
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const saveUser = useCallback((data: UserData) => {
    setUserData(data);
    localStorage.setItem("nerka_user", JSON.stringify(data));
  }, []);

  const totalItems = Object.keys(cart).length;

  return (
    <Ctx.Provider value={{ cart, view, userData, setQty, clearCart, setView, saveUser, totalItems }}>
      {children}
    </Ctx.Provider>
  );
}
