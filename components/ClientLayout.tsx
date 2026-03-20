"use client";

import AuthProvider from "@/components/AuthProvider";
import TickerBar from "@/components/TickerBar";
import Navbar from "@/components/Navbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TickerBar />
      <Navbar />
      {children}
    </AuthProvider>
  );
}
