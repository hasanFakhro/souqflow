import Link from "@/components/NavigationLink";
import Image from "next/image";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

const gradient = "bg-gradient-to-r from-blue-600 to-purple-600";
const gradientHover = "hover:from-blue-700 hover:to-purple-700";
const focus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

const Logo = ({ className = "h-10" }: { className?: string }) => (
    <Link href="/" aria-label="SouqFlow home" className={`block rounded-lg ${focus}`}>
        <Image
            src="/souqflow-logo.png"
            alt="SouqFlow"
            width={800}
            height={163}
            quality={100}
            priority
            className={`${className} w-auto`}
        />
    </Link>
);

const Phone = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div
        className={`w-[165px] shrink-0 rounded-[2rem] border-[7px] border-gray-900 bg-gray-100 shadow-xl sm:w-[210px] ${className}`}
    >
        <div className="flex h-[300px] flex-col overflow-hidden rounded-[1.5rem] bg-white sm:h-[380px]">
            {children}
        </div>
    </div>
);

export default function HomePage() {
    return (
        <div className={`${font.className} min-h-screen bg-white text-gray-900`}>
            {/* Navbar */}
            <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
                <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-5">
                    <Logo className="h-6 sm:h-10" />
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <a
                            href="#how"
                            className={`hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 sm:block ${focus}`}
                        >
                            How it works
                        </a>
                        <Link
                            href="/signin"
                            className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition sm:min-h-0 sm:border-transparent ${focus}`}
                        >
                            Log in
                        </Link>
                        <Link
                            href="/register"
                            className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg ${gradient} ${gradientHover} px-3 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] sm:min-h-0 sm:px-4 ${focus}`}
                        >
                            Sign up
                        </Link>
                    </div>
                </nav>
            </header>

            <main>
                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
                    <div className="pointer-events-none absolute -right-24 top-20 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />

                    <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 md:grid-cols-2 md:pb-28 md:pt-24">
                        <div>
                            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                                Stop running your shop from notes and chat threads.
                            </h1>
                            <p className="mt-5 max-w-md text-lg leading-relaxed text-gray-600">
                                SouqFlow keeps your stock, orders and profit in one place. Share your catalog
                                link so customers can order, then download each invoice in one tap and send it
                                on any chat app.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/register"
                                    className={`rounded-xl ${gradient} ${gradientHover} px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition active:scale-[0.98] ${focus}`}
                                >
                                    Create your account
                                </Link>
                                <a
                                    href="#how"
                                    className={`rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50 ${focus}`}
                                >
                                    See how it works
                                </a>
                            </div>
                            <p className="mt-6 text-sm text-gray-500">
                                Made for sellers on Instagram, on WhatsApp and in physical shops.
                            </p>
                        </div>

                        {/* Phone mockup: the invoice a customer receives */}
                        <div className="relative mx-auto w-full max-w-[320px]">
                            <div className="absolute -left-6 bottom-16 z-10 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-100 sm:block">
                                <p className="text-xs text-gray-500">Today&apos;s profit</p>
                                <p className={`mt-1 bg-clip-text text-2xl font-extrabold text-transparent ${gradient}`}>
                                    +$86.00
                                </p>
                            </div>

                            <div className="rounded-[2.5rem] border-[10px] border-gray-900 bg-gray-100 shadow-2xl">
                                <div className="flex items-center gap-2.5 rounded-t-[1.8rem] bg-white px-4 py-3 border-b border-gray-100">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                                        R
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold leading-tight">Rima</p>
                                        <p className="text-[11px] text-emerald-600">online</p>
                                    </div>
                                </div>

                                <div className="space-y-3 px-3 py-5">
                                    <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 px-3.5 py-2 text-sm text-white">
                                        Hi! Can I get 2 tote bags and a candle set?
                                    </div>

                                    <div className="rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold">Invoice #1042</p>
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                                Ready
                                            </span>
                                        </div>
                                        <ul className="mt-3 divide-y divide-gray-100 text-sm">
                                            <li className="flex justify-between py-1.5">
                                                <span className="text-gray-600">Tote bag × 2</span>
                                                <span className="font-medium">$36.00</span>
                                            </li>
                                            <li className="flex justify-between py-1.5">
                                                <span className="text-gray-600">Candle set × 1</span>
                                                <span className="font-medium">$14.00</span>
                                            </li>
                                        </ul>
                                        <div className="mt-2 flex justify-between border-t border-gray-200 pt-3 text-sm font-bold">
                                            <span>Total</span>
                                            <span>$50.00</span>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="bg-gray-50 py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-5">
                        <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Selling is the easy part. SouqFlow handles everything behind it.
                        </h2>

                        <div className="mt-12 grid gap-4 md:grid-cols-6">
                            {/* Inventory */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:col-span-4 md:p-8">
                                <h3 className="text-xl font-bold">Know exactly what&apos;s in stock</h3>
                                <p className="mt-2 max-w-md text-gray-600">
                                    Quantities drop automatically with every order, and you get notified
                                    when an item runs low.
                                </p>
                                <ul className="mt-6 space-y-3">
                                    {[
                                        { name: "Tote bag", left: 12, pct: "w-4/5", low: false },
                                        { name: "Phone case", left: 3, pct: "w-1/5", low: true },
                                        { name: "Candle set", left: 24, pct: "w-full", low: false },
                                    ].map((p) => (
                                        <li key={p.name} className="flex items-center gap-4 text-sm">
                                            <span className="w-24 shrink-0 font-medium">{p.name}</span>
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className={`h-full rounded-full ${p.pct} ${p.low ? "bg-amber-400" : gradient
                                                        }`}
                                                />
                                            </div>
                                            <span className={`w-14 text-right ${p.low ? "font-semibold text-amber-600" : "text-gray-500"}`}>
                                                {p.left} left
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                                    Phone case is running low. Only 3 left.
                                </div>
                            </div>

                            {/* Profit */}
                            <div className={`rounded-3xl ${gradient} p-6 text-white shadow-lg shadow-blue-600/20 md:col-span-2 md:p-8`}>
                                <h3 className="text-xl font-bold">See what you really earn</h3>
                                <p className="mt-2 text-white/80">Cost and price in, profit out.</p>
                                <dl className="mt-6 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-white/80">Sell price</dt>
                                        <dd>$18.00</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-white/80">Cost</dt>
                                        <dd>−$11.00</dd>
                                    </div>
                                    <div className="flex items-end justify-between border-t border-white/30 pt-3">
                                        <dt className="font-semibold">Profit</dt>
                                        <dd className="text-3xl font-extrabold">$7.00</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Catalog link */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:col-span-3 md:p-8">
                                <h3 className="text-xl font-bold">Your own catalog link</h3>
                                <p className="mt-2 text-gray-600">
                                    Every seller gets a link to share with customers. They browse your products
                                    and place orders themselves.
                                </p>
                                <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                                    <span className="truncate font-medium text-gray-700">souqflow.com/your-shop</span>
                                    <span className={`shrink-0 rounded-lg ${gradient} px-3 py-1 text-xs font-semibold text-white`}>
                                        Copy
                                    </span>
                                </div>
                            </div>

                            {/* Currency */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:col-span-3 md:p-8">
                                <h3 className="text-xl font-bold">The dollar rate moves. You keep up.</h3>
                                <p className="mt-2 text-gray-600">
                                    Update the exchange rate yourself in a few taps and your prices follow.
                                </p>
                                <div className="mt-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                                    <span className="font-medium text-gray-700">$1 =</span>
                                    <span className="rounded-lg bg-white px-3 py-1 font-bold ring-1 ring-gray-200">89,500 LL</span>
                                    <span className="ml-auto text-xs text-gray-400">Edit rate</span>
                                </div>
                            </div>

                            {/* Orders */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:col-span-2 md:p-8">
                                <h3 className="text-xl font-bold">Orders and deliveries, tracked</h3>
                                <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
                                    <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">Pending</span>
                                    <span className={`rounded-full ${gradient} px-3 py-1.5 text-white`}>Delivering</span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-400">Done</span>
                                    <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-600">Problem</span>
                                </div>
                            </div>

                            {/* Invoices */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:col-span-4 md:p-8">
                                <h3 className="text-xl font-bold">An invoice for every order, one tap away</h3>
                                <p className="mt-2 max-w-md text-gray-600">
                                    Download it when you&apos;re ready, then send it on WhatsApp, Instagram,
                                    Messenger or any chat app your customer uses.
                                </p>
                                <span className="inline-flex items-center justify-center p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 mt-4 transition-colors hover:bg-emerald-500/10">
                                    <svg
                                        className="w-6 h-6"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                </span>



                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section id="how" className="scroll-mt-16 py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-5">
                        <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                            From first product to first invoice
                        </h2>
                        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
                            {[
                                {
                                    title: "Add your products",
                                    body: "Enter each product with its cost, price and quantity. That's your whole catalog.",
                                },
                                {
                                    title: "Get orders from chats or your catalog link",
                                    body: "Add a customer's items from any conversation, or share your catalog link and let them order themselves.",
                                },
                                {
                                    title: "Download the invoice, track delivery",
                                    body: "Download the invoice in one tap, send it on any chat app, then follow the order until it arrives.",
                                },
                            ].map((s, i) => (
                                <li key={s.title} className="flex gap-4">
                                    <span
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${gradient} text-sm font-bold text-white`}
                                    >
                                        {i + 1}
                                    </span>
                                    <div>
                                        <h3 className="text-lg font-bold">{s.title}</h3>
                                        <p className="mt-1.5 leading-relaxed text-gray-600">{s.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Mobile-first */}
                <section className="overflow-hidden bg-gray-50 py-20 md:py-28">
                    <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 md:grid-cols-2">
                        <div>
                            <h2 className="max-w-md text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Your shop is on your phone. So is SouqFlow.
                            </h2>
                            <p className="mt-4 max-w-md text-lg leading-relaxed text-gray-600">
                                Built for phones first, so running your business never means sitting at a
                                computer.
                            </p>
                            <ul className="mt-8 space-y-4">
                                {[
                                    "Take an order in a few taps, right after the chat ends",
                                    "Check your stock and update the dollar rate from anywhere",
                                    "Open it on a laptop for the bigger view when you want it",
                                ].map((point) => (
                                    <li key={point} className="flex items-start gap-3">
                                        <span
                                            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${gradient} text-[11px] font-bold text-white`}
                                        >
                                            ✓
                                        </span>
                                        <span className="text-gray-700">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-center gap-4 sm:gap-6">
                            {/* Cart screen */}
                            <Phone>
                                <div className="flex-1 p-3 sm:p-4">
                                    <p className="text-xs font-bold sm:text-sm">Your cart</p>
                                    <ul className="mt-3 divide-y divide-gray-100 text-[11px] sm:text-xs">
                                        <li className="flex items-center justify-between py-2.5">
                                            <span className="text-gray-700">Tote bag × 2</span>
                                            <span className="font-semibold">$36.00</span>
                                        </li>
                                        <li className="flex items-center justify-between py-2.5">
                                            <span className="text-gray-700">Candle set × 1</span>
                                            <span className="font-semibold">$14.00</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="border-t border-gray-100 p-3">
                                    <div
                                        className={`rounded-xl ${gradient} py-2.5 text-center text-[11px] font-semibold text-white sm:text-xs`}
                                    >
                                        Create Order · $50.00
                                    </div>
                                </div>
                            </Phone>

                            {/* Customer details sheet */}
                            <Phone className="mt-10">
                                <div className="relative flex-1 bg-gray-900/40">
                                    <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-3 sm:p-4">
                                        <p className="text-xs font-bold sm:text-sm">Customer details</p>
                                        {["Name", "Address", "Phone"].map((label) => (
                                            <div key={label} className="mt-2">
                                                <p className="text-[10px] text-gray-500">{label}</p>
                                                <div className="mt-0.5 h-7 rounded-md border border-gray-300 sm:h-8" />
                                            </div>
                                        ))}
                                        <div
                                            className={`mt-3 rounded-lg ${gradient} py-2 text-center text-[11px] font-semibold text-white sm:text-xs`}
                                        >
                                            Confirm order
                                        </div>
                                    </div>
                                </div>
                            </Phone>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-5 py-20 md:py-28">
                    <div
                        className={`mx-auto max-w-6xl rounded-3xl ${gradient} px-6 py-14 text-center text-white shadow-xl shadow-purple-600/20 md:py-20`}
                    >
                        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Your next order is probably already sitting in your DMs.
                        </h2>
                        <p className="mx-auto mt-4 max-w-md text-white/80">
                            Add your products, take your first order and send your first invoice.
                        </p>
                        <Link
                            href="/register"
                            className="mt-8 inline-block rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-600"
                        >
                            Create your account
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-100">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
                    <Logo className="h-9" />
                    <div className="flex items-center gap-5 text-sm text-gray-500">
                        <Link href="/signin" className={`rounded hover:text-gray-900 ${focus}`}>
                            Log in
                        </Link>
                        <Link href="/register" className={`rounded hover:text-gray-900 ${focus}`}>
                            Sign up
                        </Link>
                        <span>© {new Date().getFullYear()} SouqFlow</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
