"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  LogOut,
  RefreshCw,
  Search,
  Sparkles,
  UserRound,
  XCircle
} from "lucide-react";
import { buildWhatsAppMessage, formatHumanDate } from "@/lib/booking-utils";
import { bookingStatuses, company, services } from "@/lib/constants";
import type { Booking, BookingStatus, PaymentStatus } from "@/types/booking";

const statusLabels: Record<BookingStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  rechazada: "Rechazada",
  completada: "Completada",
  cancelada: "Cancelada"
};

const statusStyles: Record<BookingStatus, string> = {
  pendiente: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  confirmada: "border-sky-300/25 bg-sky-300/10 text-sky-200",
  rechazada: "border-red-300/25 bg-red-300/10 text-red-200",
  completada: "border-green-300/25 bg-green-300/10 text-green-200",
  cancelada: "border-slate-300/20 bg-slate-300/10 text-slate-300"
};

export function AdminBookingTable() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");
  const filteredBookings = useMemo(() => {
    const search = query.trim().toLowerCase();
    return bookings
      .filter((booking) => !status || booking.status === status)
      .filter((booking) => !service || booking.service_id === service)
      .filter((booking) => !date || booking.booking_date === date)
      .filter((booking) => !search || [booking.customer_name, booking.phone, booking.email, booking.license_plate, booking.booking_code].some((value) => value.toLowerCase().includes(search)));
  }, [bookings, status, service, query, date]);

  const stats = useMemo(() => ({
    pending: bookings.filter((booking) => booking.status === "pendiente").length,
    today: bookings.filter((booking) => booking.booking_date === today && ["pendiente", "confirmada"].includes(booking.status)).length,
    confirmed: bookings.filter((booking) => booking.status === "confirmada").length,
    completed: bookings.filter((booking) => booking.status === "completada").length
  }), [bookings, today]);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const response = await fetch("/api/bookings?admin=1", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const result = await response.json();
      setBookings(result.bookings || []);
    } finally {
      setLoading(false);
    }
  }

  async function update(id: string, patch: Partial<Pick<Booking, "status" | "payment_status" | "booking_date" | "booking_time" | "internal_notes">>) {
    setBusyId(id);
    setNotice("");
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch })
      });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("No se pudo actualizar la cita.");
      setNotice("Cita actualizada correctamente.");
      await load(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo actualizar la cita.");
    } finally {
      setBusyId("");
    }
  }

  async function copy(text: string, message: string) {
    await navigator.clipboard.writeText(text);
    setNotice(message);
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  useEffect(() => {
    load();
    const interval = window.setInterval(() => load(true), 30000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="container-x py-28">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[.2em] text-electric">Panel administrativo</p>
          <h1 className="font-display text-6xl leading-none sm:text-7xl">Gestión de citas</h1>
          <p className="mt-4 max-w-2xl text-slate-400">Revisa las solicitudes de la agenda online, identifica el servicio y confirma cada cita desde un solo lugar.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => load()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-black uppercase transition hover:bg-white/10"><RefreshCw className={loading ? "animate-spin" : ""} size={16} />Actualizar</button>
          <button onClick={logout} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-black uppercase text-slate-300 transition hover:bg-white/5"><LogOut size={16} />Salir</button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<CalendarClock size={22} />} label="Por revisar" value={stats.pending} tone="amber" />
        <StatCard icon={<CalendarCheck size={22} />} label="Citas de hoy" value={stats.today} tone="blue" />
        <StatCard icon={<CheckCircle2 size={22} />} label="Confirmadas" value={stats.confirmed} tone="green" />
        <StatCard icon={<Sparkles size={22} />} label="Completadas" value={stats.completed} tone="slate" />
      </div>

      <div className="premium-card mb-6 rounded-2xl p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} /><input className="min-h-12 w-full rounded-xl border border-white/10 bg-ink pl-11 pr-4 text-sm" placeholder="Buscar cliente, teléfono, patente o código" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <input className="min-h-12 rounded-xl border border-white/10 bg-ink px-4 text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <select className="min-h-12 rounded-xl border border-white/10 bg-ink px-4 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option>{bookingStatuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select>
          <select className="min-h-12 rounded-xl border border-white/10 bg-ink px-4 text-sm" value={service} onChange={(event) => setService(event.target.value)}><option value="">Todos los servicios</option>{services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <button onClick={() => { setQuery(""); setDate(""); setStatus(""); setService(""); }} className="min-h-12 rounded-xl border border-white/10 px-4 text-xs font-black uppercase text-slate-300 hover:bg-white/5">Limpiar</button>
        </div>
        <p className="mt-3 text-xs text-slate-500">Mostrando {filteredBookings.length} de {bookings.length} solicitudes · actualización automática cada 30 segundos</p>
      </div>

      {notice ? <div className="mb-5 flex items-center justify-between rounded-xl border border-electric/20 bg-electric/10 px-4 py-3 text-sm font-bold text-sky-100"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Cerrar aviso"><XCircle size={17} /></button></div> : null}

      <div className="grid gap-4">
        {loading && bookings.length === 0 ? <div className="premium-card rounded-2xl p-8 text-center text-slate-300"><RefreshCw className="mx-auto mb-3 animate-spin text-electric" />Cargando solicitudes...</div> : null}
        {filteredBookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} busy={busyId === booking.id} onUpdate={update} onCopy={copy} />
        ))}
        {!loading && filteredBookings.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 bg-white/[.03] p-10 text-center"><CalendarClock className="mx-auto text-slate-600" size={34} /><p className="mt-4 font-black">No hay citas con estos filtros</p><p className="mt-1 text-sm text-slate-400">Prueba con otra fecha, servicio o estado.</p></div> : null}
      </div>
    </section>
  );
}

function BookingCard({ booking, busy, onUpdate, onCopy }: { booking: Booking; busy: boolean; onUpdate: (id: string, patch: Partial<Pick<Booking, "status" | "payment_status" | "booking_date" | "booking_time" | "internal_notes">>) => Promise<void>; onCopy: (text: string, message: string) => Promise<void> }) {
  const service = services.find((item) => item.id === booking.service_id);
  const phone = booking.phone.replace(/\D/g, "");
  return (
    <article className={`premium-card overflow-hidden rounded-2xl transition ${busy ? "opacity-60" : ""}`}>
      <div className="grid xl:grid-cols-[1.05fr_.95fr_.7fr]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase ${statusStyles[booking.status]}`}>{statusLabels[booking.status]}</span>
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">{booking.booking_code}</span>
          </div>
          <div className="mt-5 flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-electric"><UserRound size={20} /></span>
            <div><h2 className="text-xl font-black">{booking.customer_name}</h2><p className="mt-1 text-sm text-slate-400">{booking.phone} · {booking.email}</p></div>
          </div>
          <div className="mt-5 rounded-xl border border-electric/20 bg-electric/[.07] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-electric">Servicio solicitado</p>
            <p className="mt-1 text-lg font-black text-white">{booking.service_name}</p>
            <p className="mt-1 text-sm text-sky-100/70">{service?.durationMinutes || 60} min · {booking.vehicle_type}{booking.vehicle_brand !== "No informado" ? ` · ${booking.vehicle_brand} ${booking.vehicle_model}` : ""}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300"><span className="inline-flex items-center gap-2"><CalendarCheck className="text-electric" size={16} />{formatHumanDate(booking.booking_date)}</span><span className="inline-flex items-center gap-2"><Clock3 className="text-electric" size={16} />{booking.booking_time} hrs</span></div>
          {booking.license_plate !== "No informada" ? <p className="mt-3 text-sm text-slate-400">Patente: <strong className="text-white">{booking.license_plate}</strong></p> : null}
          {booking.notes ? <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-slate-300"><strong className="text-white">Cliente indica:</strong> {booking.notes}</p> : null}
        </div>

        <div className="border-y border-white/10 p-5 sm:p-6 xl:border-x xl:border-y-0">
          <div className="grid gap-4">
            <label className="grid gap-2 text-xs font-black uppercase tracking-wide text-slate-400">Estado<select className="min-h-12 rounded-xl border border-white/10 bg-ink px-3 text-sm normal-case text-white" value={booking.status} disabled={busy} onChange={(event) => onUpdate(booking.id, { status: event.target.value as BookingStatus })}>{bookingStatuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-wide text-slate-400">Estado del pago<select className="min-h-12 rounded-xl border border-white/10 bg-ink px-3 text-sm normal-case text-white" value={booking.payment_status} disabled={busy} onChange={(event) => onUpdate(booking.id, { payment_status: event.target.value as PaymentStatus })}><option value="no_solicitado">No solicitado</option><option value="pendiente">Pendiente</option><option value="pagado">Pagado</option></select></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-xs font-black uppercase tracking-wide text-slate-400">Fecha<input className="min-h-12 rounded-xl border border-white/10 bg-ink px-3 text-sm text-white" type="date" defaultValue={booking.booking_date} disabled={busy} onBlur={(event) => event.target.value !== booking.booking_date && onUpdate(booking.id, { booking_date: event.target.value })} /></label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-wide text-slate-400">Hora<select className="min-h-12 rounded-xl border border-white/10 bg-ink px-3 text-sm text-white" defaultValue={booking.booking_time} disabled={busy} onChange={(event) => onUpdate(booking.id, { booking_time: event.target.value })}>{company.timeSlots.map((time) => <option key={time}>{time}</option>)}</select></label>
            </div>
            <label className="grid gap-2 text-xs font-black uppercase tracking-wide text-slate-400">Notas internas<textarea className="min-h-24 resize-y rounded-xl border border-white/10 bg-ink p-3 text-sm font-normal normal-case text-white" defaultValue={booking.internal_notes || ""} placeholder="Información solo para el equipo..." disabled={busy} onBlur={(event) => event.target.value !== (booking.internal_notes || "") && onUpdate(booking.id, { internal_notes: event.target.value })} /></label>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5 sm:p-6">
          <p className="mb-1 text-xs font-black uppercase tracking-wide text-slate-500">Acciones rápidas</p>
          <QuickButton primary onClick={() => onUpdate(booking.id, { status: "confirmada", payment_status: "pendiente" })}><Check size={16} />Confirmar cita</QuickButton>
          <QuickButton onClick={() => onUpdate(booking.id, { status: "completada" })}><CheckCircle2 size={16} />Marcar completada</QuickButton>
          <QuickButton danger onClick={() => onUpdate(booking.id, { status: "rechazada" })}><XCircle size={16} />Rechazar solicitud</QuickButton>
          <div className="my-1 h-px bg-white/10" />
          <a href={phone ? `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage(booking))}` : "#"} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-green-400/20 bg-green-400/10 px-3 text-xs font-black uppercase text-green-200 transition hover:bg-green-400/15"><ExternalLink size={15} />Abrir WhatsApp</a>
          <QuickButton onClick={() => onCopy(buildWhatsAppMessage(booking), "Mensaje de WhatsApp copiado.")}><Copy size={15} />Copiar mensaje</QuickButton>
          <QuickButton onClick={() => onCopy(company.paymentLink, "Link de pago copiado.")}><Copy size={15} />Copiar link de pago</QuickButton>
        </div>
      </div>
    </article>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "amber" | "blue" | "green" | "slate" }) {
  const colors = { amber: "bg-amber-300/10 text-amber-200", blue: "bg-electric/10 text-electric", green: "bg-green-300/10 text-green-300", slate: "bg-white/5 text-slate-300" };
  return <div className="premium-card flex items-center gap-4 rounded-2xl p-5"><span className={`grid h-12 w-12 place-items-center rounded-xl ${colors[tone]}`}>{icon}</span><div><p className="text-3xl font-black">{value}</p><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p></div></div>;
}

function QuickButton({ children, onClick, primary, danger }: { children: React.ReactNode; onClick: () => void; primary?: boolean; danger?: boolean }) {
  const colors = primary ? "border-electric/30 bg-electric text-ink hover:bg-sky-300" : danger ? "border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/15" : "border-white/10 bg-white/5 text-white hover:bg-white/10";
  return <button onClick={onClick} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black uppercase transition ${colors}`}>{children}</button>;
}
