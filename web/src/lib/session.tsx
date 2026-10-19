"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Session = { user: { badge: string; name: string; role: string } } | null;
type Ctx = {
  session: Session;
  hydrated: boolean;
  signIn: (s: Session) => void;
  lock: () => void;
  lockModalOpen: boolean;
  setLockModalOpen: (v: boolean) => void;
};

const SessionCtx = createContext<Ctx>({} as Ctx);
const KEY = "imei-triangulator-session";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [hydrated, setHydrated] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {
      /* ignore corrupted entry */
    }
    setHydrated(true);
  }, []);

  const signIn = (s: Session) => {
    setSession(s);
    try {
      if (s) localStorage.setItem(KEY, JSON.stringify(s));
      else localStorage.removeItem(KEY);
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  };

  const lock = () => {
    signIn(null);
    window.location.href = "/login";
  };

  return (
    <SessionCtx.Provider
      value={{ session, hydrated, signIn, lock, lockModalOpen, setLockModalOpen }}
    >
      {children}
    </SessionCtx.Provider>
  );
}

export const useSession = () => useContext(SessionCtx);