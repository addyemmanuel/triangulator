"use client";
import { AppShell } from "@/components/layout/AppShell";
import { InvestigationProvider } from "@/lib/investigation";
import { useSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const { session, hydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !session) router.replace("/login");
  }, [hydrated, session, router]);

 
  // avoids flashing the app shell to a not-yet-authenticated visitor.
  if (!hydrated) return null;
  if (!session) return null;

  return (
    <InvestigationProvider>
      <AppShell>{children}</AppShell>
    </InvestigationProvider>
  );
}