import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
              SouqFlow
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl shadow-blue-100/40 sm:p-10">
          <h1 className="text-2xl font-bold text-gray-900">Unable to sign in</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Your sign-in could not be completed. Please try again or create an account.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signin"
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-purple-700"
            >
              Try again
            </Link>
            <Link
              href="/register"
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
