"use client";

import Link, { useLinkStatus } from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";

function NavigationFeedback() {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center border-b border-blue-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm"
    >
      <span className="flex items-center gap-2">
        <LoaderCircle className="h-4 w-4 text-blue-600 motion-safe:animate-spin" aria-hidden="true" />
        Opening page…
      </span>
    </span>
  );
}

export default function NavigationLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavigationFeedback />
    </Link>
  );
}
