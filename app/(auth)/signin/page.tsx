"use client";

import React, { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function SignInPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                return;
            }

            const session = await getSession();

            const user = session?.user as {
                role?: string;
                subscriptionActive?: boolean;
            };

            if (!user) {
                setError("Unable to get your session. Please try again.");
                return;
            }

            if (user.role === "ADMIN" || user.subscriptionActive === true) {
                router.push("/dashboard");
            } else {
                router.push("/subscription");
            }

            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />

            <div className="relative w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <Link href="/" aria-label="SouqFlow home" className="block rounded-lg">
                        <Image
                            src="/souqflow-logo.png"
                            alt="SouqFlow"
                            width={800}
                            height={163}
                            quality={100}
                            priority
                            className="h-12 w-auto"
                        />
                    </Link>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-xl shadow-blue-100/40 ring-1 ring-gray-100 sm:p-10">
                    <div className="mb-6">
                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Sign in to continue to your SouqFlow account.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Email address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className={inputClass}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="spinner" />
                                    Signing in…
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="font-semibold text-blue-600 transition hover:text-purple-600"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} SouqFlow. All rights reserved.
                </p>
            </div>
        </main>
    );
}