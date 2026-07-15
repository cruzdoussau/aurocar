"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, RefreshCw } from "lucide-react";
import { buildWhatsAppMessage } from "@/lib/booking-utils";
import { bookingStatuses, company, services } from "@/lib/constants";
import type { Booking, BookingStatus, PaymentStatus } from "@/types/booking";

export function AdminBookingTable() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const params = useMemo(() => {
    const search = new URLSearchParams();
    if (status) search.set("status", status);
    if (service) search.set("service", service);
    if (query) search.set("query", query);
    if (date) search.set("date", date);
    return search.toString();
  }, [status, service, query, date]);

  async function load() {
    setLoading(true);
    const response = await fetch(`/api/bookings?${params}`);
    const result = await response.json();
    setBookings(result.bookings || []);
    setLoading(false);
  }

  async function update(id: string, patch: Partial<Pick<Booking, "status" | "payment_status" | "booking_date" | "booking_time" | "internal_notes">>) {
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch })
    });
    await load();
  }

  useEffect(() => {
    if (window.localStorage.getItem("aurocar-admin") !== "true") {
      router.push("/admin/login");
      return;
    }
    load();
  }, [params]);

  return (
    <section className="container-x py-28">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-3 text-sm font-black uppercase text-electric">Panel administrativo</p>
          <h1 className="font-display text-6xl leading-none sm:text-7xl">Solicitudes de reserva</h1>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-black uppercase">
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      <div className="premium-card mb-5 grid gap-3 rounded-lg p-4 md:grid-cols-4">
        <input className="rounded-lg border border-white/10 bg-ink px-3 py-3 text-sm" placeholder="Buscar nombre, telefono o patente" value={query} onChange={(event) => setQuery(event.target.value)} />
        <input className="rounded-lg border border-white/10 bg-ink px-3 py-3 text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <select className="rounded-lg border border-white/10 bg-ink px-3 py-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Todos los estados</option>
          {bookingStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="rounded-lg border border-white/10 bg-ink px-3 py-3 text-sm" value={service} onChange={(event) => setService(event.target.value)}>
          <option value="">Todos los servicios</option>
          {services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>

      <div className="grid gap-4">
        {loading ? <p className="text-slate-300">Cargando reservas...</p> : null}
        {bookings.map((booking) => (
          <article key={booking.id} className="premium-card rounded-lg p-5">
            <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr_.7fr]">
              <div>
                <p className="text-xs font-black uppercase text-electric">{booking.booking_code}</p>
                <h2 className="mt-1 text-xl font-black">{booking.customer_name}</h2>
                <p className="mt-2 text-sm text-slate-300">{booking.phone} · {booking.email}</p>
                <p className="text-sm text-slate-300">{booking.vehicle_brand} {booking.vehicle_model} · {booking.license_plate} · {booking.vehicle_type}</p>
                <p className="mt-3 font-bold">{booking.service_name}</p>
                <p className="text-sm text-slate-300">{booking.booking_date} a las {booking.booking_time}</p>
                {booking.notes ? <p className="mt-3 rounded-lg bg-white/5 p-3 text-sm text-slate-300">{booking.notes}</p> : null}
              </div>
              <div className="grid gap-3">
                <label className="grid gap-2 text-xs font-black uppercase text-slate-400">Estado
                  <select className="rounded-lg border border-white/10 bg-ink px-3 py-3 text-sm text-white" value={booking.status} onChange={(event) => update(booking.id, { status: event.target.value as BookingStatus })}>
                    {bookingStatuses.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-black uppercase text-slate-400">Pago
                  <select className="rounded-lg border border-white/10 bg-ink px-3 py-3 text-sm text-white" value={booking.payment_status} onChange={(event) => update(booking.id, { payment_status: event.target.value as PaymentStatus })}>
                    <option value="no_solicitado">no_solicitado</option>
                    <option value="pendiente">pendiente</option>
                    <option value="pagado">pagado</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input className="rounded-lg border border-white/10 bg-ink px-3 py-3 text-sm" type="date" defaultValue={booking.booking_date} onBlur={(event) => update(booking.id, { booking_date: event.target.value })} />
                  <input className="rounded-lg border border-white/10 bg-ink px-3 py-3 text-sm" defaultValue={booking.booking_time} onBlur={(event) => update(booking.id, { booking_time: event.target.value })} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <QuickButton onClick={() => update(booking.id, { status: "confirmada", payment_status: "pendiente" })}>Confirmar cita</QuickButton>
                <QuickButton onClick={() => update(booking.id, { status: "rechazada" })}>Rechazar</QuickButton>
                <QuickButton onClick={() => update(booking.id, { payment_status: "pagado" })}>Marcar pagado</QuickButton>
                <QuickButton onClick={() => navigator.clipboard.writeText(buildWhatsAppMessage(booking))}><Copy size={15} /> Copiar mensaje WhatsApp</QuickButton>
                <QuickButton onClick={() => navigator.clipboard.writeText(company.paymentLink)}><Copy size={15} /> Copiar Mercado Pago</QuickButton>
              </div>
            </div>
          </article>
        ))}
        {!loading && bookings.length === 0 ? <p className="rounded-lg border border-white/10 bg-white/5 p-6 text-slate-300">No hay reservas con estos filtros.</p> : null}
      </div>
    </section>
  );
}

function QuickButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 text-xs font-black uppercase text-white transition hover:bg-white/15">
      {children}
    </button>
  );
}
