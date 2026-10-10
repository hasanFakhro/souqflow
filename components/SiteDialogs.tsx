"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type Request = { message: string; kind: "alert" | "confirm" | "prompt"; resolve: (value: string | boolean | null) => void };
const Context = createContext<{
  alert: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
  prompt: (message: string) => Promise<string | null>;
} | null>(null);

export function useSiteDialogs() {
  const context = useContext(Context);
  if (!context) throw new Error("SiteDialogs provider is required");
  return context;
}

export default function SiteDialogs({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<Request[]>([]);
  const active = useRef<Request | null>(null);
  const [request, setRequest] = useState<Request | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (request) dialog.current?.showModal();
  }, [request]);

  function next() {
    const item = pending.current.shift() ?? null;
    active.current = item;
    setRequest(item);
    setValue("");
  }
  function ask(kind: Request["kind"], message: string) {
    return new Promise<string | boolean | null>((resolve) => {
      pending.current.push({ kind, message, resolve });
      if (!active.current) next();
    });
  }
  function finish(accepted: boolean) {
    const item = active.current;
    if (!item) return;
    active.current = null;
    dialog.current?.close();
    item.resolve(item.kind === "prompt" ? (accepted ? value : null) : accepted);
    next();
  }

  return <Context.Provider value={{
    alert: async (message) => { await ask("alert", message); },
    confirm: async (message) => Boolean(await ask("confirm", message)),
    prompt: async (message) => await ask("prompt", message) as string | null,
  }}>
    {children}
    <dialog ref={dialog} aria-labelledby="site-dialog-title" aria-describedby="site-dialog-message"
      onCancel={(event) => { event.preventDefault(); finish(false); }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl backdrop:bg-slate-900/40">
      <form onSubmit={(event) => { event.preventDefault(); finish(true); }}>
        <h2 id="site-dialog-title" className="text-lg font-semibold">{request?.kind === "confirm" ? "Confirm action" : request?.kind === "prompt" ? "Restock product" : "SouqFlow"}</h2>
        <p id="site-dialog-message" className="mt-3 text-sm text-gray-600">{request?.message}</p>
        {request?.kind === "prompt" && <input aria-label="Units to add" type="number" min="1" step="1" required value={value} onChange={(event) => setValue(event.target.value)} className="mt-4 w-full rounded-lg border px-3 py-2" />}
        <div className="mt-6 flex justify-end gap-3">
          {request?.kind !== "alert" && <button type="button" autoFocus onClick={() => finish(false)} className="btn-secondary">Cancel</button>}
          <button type="submit" autoFocus={request?.kind === "alert"} className="btn-primary">{request?.kind === "confirm" ? "Confirm" : request?.kind === "prompt" ? "Add stock" : "OK"}</button>
        </div>
      </form>
    </dialog>
  </Context.Provider>;
}
