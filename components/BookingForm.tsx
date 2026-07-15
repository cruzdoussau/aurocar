"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle2, Clock3, Loader2, Mail, Phone, UserRound } from "lucide-react";
import { bookingSchema } from "@/lib/validations";
import { company, services } from "@/lib/constants";
import { isBookableDate } from "@/lib/booking-utils";
import type { Booking } from "@/types/booking";

type SchedulerData = {
  customer_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
};

const inputClass = "min-h-12 rounded-lg border border-white/10 bg-ink/70 px-3 text-sm text-white placeholder:text-slate-500";
const blockedStatuses = ["pendiente", "confirmada"];

export function BookingForm() {
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [data, setData] = useState<SchedulerData>({
    customer_name: "",
    email: "",
    phone: "",
    vehicle_type: company.vehicleTypes[0]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = services[0];
  const validDate = isBookableDate(selectedDate);
  const blockedSlots = useMemo(
    () =>
      new Set(
        bookings
          .filter((booking) => booking.booking_date === selectedDate && blockedStatuses.includes(booking.status))
          .map((booking) => booking.booking_time)
      ),
    [bookings, selectedDate]
  );

  async function loadSlots() {
    if (!validDate) {
      setBookings([]);
      return;
    }

    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/bookings?date=${selectedDate}`, { cache: "no-store" });
      const result = await response.json();
      setBookings(result.bookings || []);
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    setSelectedTime("");
    loadSlots();
    const interval = window.setInterval(loadSlots, 10000);
    return () => window.clearInterval(interval);
  }, [selectedDate, validDate]);

  function updateField(name: keyof SchedulerData, value: string) {
    setData((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function reserve() {
    setMessage("");
    setBookingCode("");

    const payload = {
      ...data,
      service_id: selectedService.id,
      booking_date: selectedDate,
      booking_time: selectedTime,
      accepted_policies: true
    };
    const parsed = bookingSchema.safeParse(payload);

    if (!selectedTime) {
      setErrors({ booking_time: "Selecciona un horario disponible." });
      return;
    }

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] || "Revisa este campo."])));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "No pudimos tomar ese horario. Intenta con otro bloque.");
        await loadSlots();
        return;
      }

      setMessage(result.message);
      setBookingCode(result.booking.booking_code);
      setSelectedTime("");
      await loadSlots();
    } catch {
      setMessage("Ocurrio un problema de conexion. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="agendar" className="container-x py-24">
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 text-sm font-black uppercase text-electric">Agenda online</p>
        <h2 className="font-display text-6xl leading-none sm:text-7xl">Elige tu horario disponible</h2>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Selecciona fecha y hora como en una agenda real. Cuando un bloque queda reservado, se bloquea automaticamente para nuevas solicitudes.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr_.9fr]">
        <section className="premium-card rounded-lg p-5">
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="text-electric" />
            <div>
              <h3 className="text-lg font-black">1. Fecha</h3>
              <p className="text-sm text-slate-400">Lunes a sabado</p>
            </div>
          </div>
          <input
            type="date"
            min={today}
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className={`${inputClass} w-full`}
          />
          {!validDate ? (
            <p className="mt-3 rounded-lg border border-action/40 bg-action/10 p-3 text-sm font-bold text-red-100">
              Domingo cerrado o fecha no disponible.
            </p>
          ) : null}
          <div className="mt-5 rounded-lg border border-electric/30 bg-electric/10 p-4 text-sm leading-6 text-sky-100">
            Horario: {company.scheduleLabel}
          </div>
        </section>

        <section className="premium-card rounded-lg p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock3 className="text-electric" />
              <div>
                <h3 className="text-lg font-black">2. Horario</h3>
                <p className="text-sm text-slate-400">Bloques en tiempo real</p>
              </div>
            </div>
            {loadingSlots ? <Loader2 className="animate-spin text-electric" size={18} /> : null}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {company.timeSlots.map((time) => {
              const blocked = blockedSlots.has(time);
              const selected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  disabled={!validDate || blocked || isSubmitting}
                  onClick={() => {
                    setSelectedTime(time);
                    setErrors((current) => {
                      const next = { ...current };
                      delete next.booking_time;
                      return next;
                    });
                  }}
                  className={[
                    "min-h-16 rounded-lg border px-3 text-left transition",
                    selected ? "border-green-300 bg-green-400 text-ink shadow-glow" : "border-white/10 bg-ink/70 text-white hover:border-electric/70 hover:bg-electric/10",
                    blocked ? "cursor-not-allowed border-white/5 bg-white/5 text-slate-600 line-through hover:border-white/5 hover:bg-white/5" : "",
                    !validDate ? "cursor-not-allowed opacity-40" : ""
                  ].join(" ")}
                >
                  <span className="block text-xl font-black">{time}</span>
                  <span className="text-xs font-bold uppercase">{blocked ? "Reservado" : selected ? "Seleccionado" : "Disponible"}</span>
                </button>
              );
            })}
          </div>
          {errors.booking_time ? <p className="mt-3 text-sm font-bold text-red-300">{errors.booking_time}</p> : null}
        </section>

        <section className="premium-card rounded-lg p-5">
          <div className="mb-5 flex items-center gap-3">
            <UserRound className="text-electric" />
            <div>
              <h3 className="text-lg font-black">3. Tus datos</h3>
              <p className="text-sm text-slate-400">Solo lo necesario</p>
            </div>
          </div>

          <div className="grid gap-3">
            <Field icon={<UserRound size={16} />} error={errors.customer_name}>
              <input className={`${inputClass} w-full`} value={data.customer_name} onChange={(event) => updateField("customer_name", event.target.value)} placeholder="Nombre completo" />
            </Field>
            <Field icon={<Mail size={16} />} error={errors.email}>
              <input className={`${inputClass} w-full`} value={data.email} onChange={(event) => updateField("email", event.target.value)} placeholder="Correo electronico" />
            </Field>
            <Field icon={<Phone size={16} />} error={errors.phone}>
              <input className={`${inputClass} w-full`} value={data.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Telefono" />
            </Field>
            <div>
              <div className="mb-2 text-xs font-black uppercase text-slate-400">Tipo de vehiculo</div>
              <div className="grid grid-cols-2 gap-2">
                {company.vehicleTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField("vehicle_type", type)}
                    className={`min-h-11 rounded-lg border px-3 text-sm font-black ${data.vehicle_type === type ? "border-electric bg-electric text-ink" : "border-white/10 bg-white/5 text-slate-200"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.vehicle_type ? <p className="mt-2 text-xs font-bold text-red-300">{errors.vehicle_type}</p> : null}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-ink/60 p-4 text-sm">
            <p className="font-black text-white">Resumen</p>
            <p className="mt-2 text-slate-300">Servicio: {selectedService.name}</p>
            <p className="text-slate-300">Fecha: {selectedDate || "Selecciona fecha"}</p>
            <p className="text-slate-300">Hora: {selectedTime || "Selecciona horario"}</p>
          </div>

          <button
            type="button"
            onClick={reserve}
            disabled={isSubmitting || !validDate}
            className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-action px-6 text-sm font-black uppercase text-white shadow-red disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
            Reservar horario
          </button>

          {message ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm font-bold text-slate-100">
              {bookingCode ? (
                <div className="mb-1 flex items-center gap-2 text-green-300">
                  <CheckCircle2 size={18} />
                  Horario tomado
                </div>
              ) : null}
              <p>{message}</p>
              {bookingCode ? <p className="mt-2 text-electric">Codigo de reserva: {bookingCode}</p> : null}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}

function Field({ icon, error, children }: { icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        <div className="[&_input]:pl-10">{children}</div>
      </div>
      {error ? <p className="mt-2 text-xs font-bold text-red-300">{error}</p> : null}
    </div>
  );
}
