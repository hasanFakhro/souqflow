"use client";

import { SessionProvider } from "next-auth/react";
import SiteDialogs from "@/components/SiteDialogs";

export default function Providers({ children}: { children: React.ReactNode }) {
  return <SessionProvider><SiteDialogs>{children}</SiteDialogs></SessionProvider>;
}

