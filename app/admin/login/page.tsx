"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(formData: FormData) {
    const password = String(formData.get("password") || "");
    const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "aurocar-demo";
    if (password !== expected) {
      setError("Clave incorrecta.");
      return;
    }
    window.localStorage.setItem("aurocar-admin", "true");
    router.push("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form action={submit} className="premium-card grid w-full max-w-md gap-5 rounded-lg p-7">
        <div>
          <p className="text-sm font-black uppercase text-electric">Aurocar admin</p>
          <h1 className="font-display text-6xl">Iniciar sesion</h1>
        </div>
        <label className="grid gap-2 text-sm font-bold">Clave de administrador
          <input name="password" type="password" className="min-h-12 rounded-lg border border-white/10 bg-ink px-3 text-white" placeholder="aurocar-demo" />
        </label>
        {error ? <p className="text-sm font-bold text-red-300">{error}</p> : null}
        <button className="rounded-lg bg-action px-5 py-4 text-sm font-black uppercase text-white shadow-red">Entrar</button>
      </form>
    </main>
  );
}
