"use client";

import { useState } from "react";
import { company } from "@/lib/constants";

const inputClass = "min-h-12 rounded-lg border border-white/10 bg-ink/70 px-3 text-sm text-white placeholder:text-slate-500";

export function Contact() {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    setMessage(result.message || result.error || "Solicitud procesada.");
  }

  return (
    <section id="contacto" className="container-x grid gap-10 py-24 lg:grid-cols-[.9fr_1.1fr]">
      <div>
        <p className="mb-3 text-sm font-black uppercase text-electric">Contacto</p>
        <h2 className="font-display text-6xl leading-none sm:text-7xl">Hablemos de tu vehiculo</h2>
        <div className="mt-6 grid gap-3 text-slate-300">
          <p>Instagram: <a className="font-bold text-white" href={company.instagramUrl} target="_blank" rel="noreferrer">{company.instagram}</a></p>
          <p>Horario: {company.scheduleLabel}</p>
          <p>WhatsApp: {company.whatsappNumber || "Numero por configurar"}</p>
          <p>Direccion: {company.address}</p>
        </div>
      </div>
      <form action={submit} className="premium-card grid gap-4 rounded-lg p-6">
        <label className="grid gap-2 text-sm font-bold">Nombre<input className={inputClass} name="name" required /></label>
        <label className="grid gap-2 text-sm font-bold">Telefono<input className={inputClass} name="phone" required /></label>
        <label className="grid gap-2 text-sm font-bold">Correo<input className={inputClass} name="email" type="email" required /></label>
        <label className="grid gap-2 text-sm font-bold">Mensaje<textarea className={`${inputClass} min-h-28 py-3`} name="message" required /></label>
        <button className="rounded-lg bg-action px-6 py-4 text-sm font-black uppercase text-white shadow-red">Enviar mensaje</button>
        {message ? <p className="rounded-lg bg-white/10 p-4 text-sm font-bold text-slate-100">{message}</p> : null}
      </form>
    </section>
  );
}
