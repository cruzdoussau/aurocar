"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { company } from "@/lib/constants";

const links = [
  ["Inicio", "#inicio"],
  ["Servicios", "#servicios"],
  ["Agendar", "#agendar"],
  ["Como funciona", "#como-funciona"],
  ["Nosotros", "#nosotros"],
  ["Contacto", "#contacto"]
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/86 backdrop-blur-xl">
      <div className="container-x flex h-20 items-center justify-between gap-5">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg border border-white/15 bg-gradient-to-br from-action to-red-950 font-display text-4xl text-white shadow-red">A</span>
          <span className="leading-tight">
            <strong className="block font-display text-3xl tracking-wide">{company.legalName}</strong>
            <small className="block text-[11px] uppercase text-slate-400">{company.tagline}</small>
          </span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([label, href]) => (
            <a key={href} className="text-sm font-bold uppercase text-slate-300 transition hover:text-white" href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a href="#agendar" className="hidden rounded-lg bg-action px-5 py-3 text-sm font-black uppercase text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-600 md:inline-flex">
          Agendar ahora
        </a>
        <button className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 lg:hidden" type="button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 bg-carbon px-5 py-4 lg:hidden">
          <nav className="grid gap-2">
            {links.map(([label, href]) => (
              <a key={href} className="rounded-lg px-3 py-3 text-sm font-bold uppercase text-slate-200 hover:bg-white/10" href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
