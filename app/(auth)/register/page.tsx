"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        // Phone number validation from review-auth branch
        const phoneRegex = /^\+961\d{8}$/;
        const cleanPhone = phone.replace(/\s/g, "");

        if (!phoneRegex.test(cleanPhone)) {
            setError("Phone number must start with +961 and contain 8 digits.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, phone: cleanPhone }),
            });

            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                setError(data.error ?? "Unable to create your account. Please try again.");
                setIsLoading(false);
                return;
            }
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/dashboard");
            }
        } catch {
            setError("An error occurred while registering. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            SouqFlow
                        </span>
                    </Link>
                    <p className="mt-3 text-sm text-gray-500">
                        Create your SouqFlow account
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/40 border border-gray-100 p-8 sm:p-10">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Create an account
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Get started with SouqFlow today.
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 border border-red-200 p-3 mb-5">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+961 70 123 456"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
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
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                                    Confirm Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/signin" className="font-semibold text-blue-600 hover:text-blue-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}