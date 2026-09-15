"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/session").then((response) => {
      if (response.ok) router.replace("/admin");
    });
  }, [router]);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const password = String(formData.get("password") || "");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (!response.ok) {
      const result = await response.json();
      setError(result.error || "No pudimos iniciar la sesión.");
      setLoading(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form action={submit} className="premium-card grid w-full max-w-md gap-5 rounded-2xl p-7 sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-electric/15 text-electric"><LockKeyhole size={22} /></span>
        <div>
          <p className="text-sm font-black uppercase text-electric">Aurocar admin</p>
          <h1 className="font-display text-6xl">Iniciar sesión</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Acceso exclusivo para gestionar las solicitudes de la agenda online.</p>
        </div>
        <label className="grid gap-2 text-sm font-bold">Clave de administrador
          <input name="password" type="password" required autoFocus className="min-h-12 rounded-xl border border-white/10 bg-ink px-4 text-white" placeholder="Ingresa tu clave" />
        </label>
        {error ? <p className="text-sm font-bold text-red-300">{error}</p> : null}
        <button disabled={loading} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-action px-5 text-sm font-black uppercase text-white shadow-red disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={18} /> : null} Entrar al panel</button>
      </form>
    </main>
  );
}
