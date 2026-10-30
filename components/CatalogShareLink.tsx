"use client";

import { Check, Copy, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type CatalogShareLinkProps = {
  catalogUrl: string;
};

export default function CatalogShareLink({ catalogUrl }: CatalogShareLinkProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function copyCatalogUrl() {
    try {
      await navigator.clipboard.writeText(catalogUrl);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setIsCopied(false);
      toast.error("Unable to copy the link. Select and copy it below.");
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <LinkIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Your catalog link</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Share this link with customers to view your product catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={copyCatalogUrl}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          {isCopied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {isCopied ? "Copied" : "Copy link"}
        </button>
      </div>

      <p className="mt-4 break-all rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
        <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-gray-300 underline-offset-4 hover:text-blue-600">{catalogUrl}</a>
      </p>
    </section>
  );
}
