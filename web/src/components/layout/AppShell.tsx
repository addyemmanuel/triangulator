"use client";
import { useState, ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="shell">
      <a href="#main" className="sr-skip">Skip to main content</a>
      <TopBar onMenu={() => setOpen(o => !o)} />
      <div className="shell-body">
        <Sidebar open={open} onNavigate={() => setOpen(false)} />
        <main id="main">{children}</main>
      </div>
    </div>
  );
}