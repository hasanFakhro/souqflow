import { LoaderCircle } from "lucide-react";

export default function PageLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <span className="rounded-2xl bg-blue-50 p-4">
        <LoaderCircle className="h-8 w-8 text-blue-600 motion-safe:animate-spin" aria-hidden="true" />
      </span>
      <div>
        <p className="text-lg font-semibold text-gray-900">Loading page…</p>
        <p className="mt-1 text-sm text-gray-500">Please wait a moment.</p>
      </div>
    </div>
  );
}
