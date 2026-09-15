"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound
} from "lucide-react";
import { bookingSchema } from "@/lib/validations";
import { company, services } from "@/lib/constants";
import { formatHumanDate, isBookableDate, slotConflicts, slotFitsSchedule } from "@/lib/booking-utils";
import type { Booking } from "@/types/booking";

type SchedulerData = {
  customer_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  vehicle_brand: string;
  vehicle_model: string;
  license_plate: string;
  notes: string;
  accepted_policies: boolean;
};

const steps = [
  { id: 1, label: "Servicio", icon: Sparkles },
  { id: 2, label: "Fecha y hora", icon: CalendarDays },
  { id: 3, label: "Tus datos", icon: UserRound },
  { id: 4, label: "Confirmar", icon: CheckCircle2 }
];

const inputClass =
  "min-h-12 w-full rounded-xl border border-white/10 bg-ink/70 px-4 text-sm text-white placeholder:text-slate-500 transition focus:border-electric";
const blockedStatuses = ["pendiente", "confirmada"];

function getFirstBookableDate() {
  let date = new Date();
  while (!isBookableDate(format(date, "yyyy-MM-dd"))) date = addDays(date, 1);
  return format(date, "yyyy-MM-dd");
}

export function BookingForm() {
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(getFirstBookableDate);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [data, setData] = useState<SchedulerData>({
    customer_name: "",
    email: "",
    phone: "",
    vehicle_type: company.vehicleTypes[0],
    vehicle_brand: "",
    vehicle_model: "",
    license_plate: "",
    notes: "",
    accepted_policies: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = services.find((service) => service.id === selectedServiceId) || services[0];
  const validDate = isBookableDate(selectedDate);

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
    const serviceFromUrl = new URLSearchParams(window.location.search).get("servicio");
    if (serviceFromUrl && services.some((service) => service.id === serviceFromUrl)) {
      setSelectedServiceId(serviceFromUrl);
      setStep(2);
    }
  }, []);

  useEffect(() => {
    setSelectedTime("");
    loadSlots();
    const interval = window.setInterval(loadSlots, 15000);
    return () => window.clearInterval(interval);
  }, [selectedDate, selectedServiceId, validDate]);

  function updateField<K extends keyof SchedulerData>(name: K, value: SchedulerData[K]) {
    setData((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function moveToStep(nextStep: number) {
    setStep(nextStep);
    window.setTimeout(() => document.getElementById("booking-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function goForward() {
    setMessage("");
    if (step === 1) {
      moveToStep(2);
      return;
    }
    if (step === 2) {
      if (!validDate || !selectedTime) {
        setErrors((current) => ({ ...current, booking_time: "Selecciona una fecha y un horario disponible." }));
        return;
      }
      moveToStep(3);
      return;
    }
    if (step === 3) {
      const parsed = bookingSchema.pick({ customer_name: true, email: true, phone: true, vehicle_type: true }).safeParse(data);
      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] || "Revisa este campo."])));
        return;
      }
      setErrors({});
      moveToStep(4);
    }
  }

  async function reserve() {
    setMessage("");
    setBookingCode("");

    const payload = {
      ...data,
      service_id: selectedService.id,
      booking_date: selectedDate,
      booking_time: selectedTime
    };
    const parsed = bookingSchema.safeParse(payload);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] || "Revisa este campo."])));
      if (fieldErrors.accepted_policies) setMessage("Debes aceptar las condiciones para enviar la solicitud.");
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
      await loadSlots();
    } catch {
      setMessage("Ocurrió un problema de conexión. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startAnotherBooking() {
    setBookingCode("");
    setMessage("");
    setSelectedTime("");
    setData({
      customer_name: "",
      email: "",
      phone: "",
      vehicle_type: company.vehicleTypes[0],
      vehicle_brand: "",
      vehicle_model: "",
      license_plate: "",
      notes: "",
      accepted_policies: false
    });
    moveToStep(1);
  }

  return (
    <section id="agendar" className="container-x py-24">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-sm font-black uppercase tracking-[.2em] text-electric">Agenda online</p>
        <h2 className="font-display text-6xl leading-none sm:text-7xl">Reserva paso a paso</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Elige el servicio que necesita tu auto y solicita un horario. Aurocar revisará la cita antes de confirmarla.
        </p>
      </div>

      <div className="mx-auto mb-6 grid max-w-5xl grid-cols-4 overflow-hidden rounded-2xl border border-white/10 bg-carbon/70">
        {steps.map(({ id, label, icon: Icon }) => {
          const active = step === id;
          const complete = step > id || Boolean(bookingCode);
          return (
            <div key={id} className={`relative flex min-h-20 items-center justify-center gap-3 px-2 sm:px-4 ${active ? "bg-electric/10" : ""}`}>
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-black ${active ? "border-electric bg-electric text-ink" : complete ? "border-green-400 bg-green-400 text-ink" : "border-white/15 text-slate-500"}`}>
                {complete ? <Check size={17} /> : <Icon size={17} />}
              </div>
              <span className={`hidden text-xs font-black uppercase tracking-wide sm:block ${active ? "text-white" : "text-slate-500"}`}>{label}</span>
              {id < steps.length ? <span className="absolute right-0 h-8 w-px bg-white/10" /> : null}
            </div>
          );
        })}
      </div>

      <div id="booking-panel" className="premium-card mx-auto max-w-5xl scroll-mt-24 overflow-hidden rounded-2xl">
        {bookingCode ? (
          <SuccessState code={bookingCode} message={message} onRestart={startAnotherBooking} />
        ) : (
          <>
            <div className="border-b border-white/10 px-5 py-6 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[.2em] text-electric">Paso {step} de 4</p>
              <h3 className="mt-1 text-2xl font-black sm:text-3xl">
                {step === 1 && "¿Qué servicio quieres agendar?"}
                {step === 2 && "Elige fecha y horario"}
                {step === 3 && "Cuéntanos sobre ti y tu vehículo"}
                {step === 4 && "Revisa tu solicitud"}
              </h3>
            </div>

            <div className="p-5 sm:p-8">
              {step === 1 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => {
                    const selected = selectedServiceId === service.id;
                    return (
                      <button key={service.id} type="button" onClick={() => setSelectedServiceId(service.id)} className={`group overflow-hidden rounded-2xl border text-left transition ${selected ? "border-electric bg-electric/10 shadow-glow" : "border-white/10 bg-white/[.03] hover:border-white/25"}`}>
                        <div className="relative aspect-[16/8] overflow-hidden">
                          <Image src={service.image} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 30vw, 100vw" />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                          <span className={`absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border ${selected ? "border-electric bg-electric text-ink" : "border-white/30 bg-ink/70"}`}>{selected ? <Check size={16} /> : null}</span>
                        </div>
                        <div className="p-4">
                          <h4 className="text-lg font-black text-white">{service.name}</h4>
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-400">{service.description}</p>
                          <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold uppercase">
                            <span className="inline-flex items-center gap-1.5 text-sky-200"><Clock3 size={14} /> {service.durationMinutes} min</span>
                            <span className="text-slate-400">{service.priceLabel}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-electric/15 text-electric"><CalendarDays size={20} /></span>
                      <div><h4 className="font-black">Selecciona el día</h4><p className="text-xs text-slate-400">Atendemos de lunes a sábado</p></div>
                    </div>
                    <label className="grid gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                      Fecha de la cita
                      <input type="date" min={today} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className={inputClass} />
                    </label>
                    {!validDate ? <p className="mt-3 rounded-xl border border-action/40 bg-action/10 p-3 text-sm font-bold text-red-100">Elige una fecha de lunes a sábado.</p> : null}
                    <div className="mt-5 rounded-xl border border-electric/20 bg-electric/10 p-4 text-sm text-sky-100">
                      <p className="font-black">{selectedService.name}</p>
                      <p className="mt-1 text-sky-200/70">Duración estimada: {selectedService.durationMinutes} minutos</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-electric/15 text-electric"><Clock3 size={20} /></span>
                        <div><h4 className="font-black">Horarios disponibles</h4><p className="text-xs text-slate-400">La disponibilidad se actualiza automáticamente</p></div>
                      </div>
                      {loadingSlots ? <Loader2 className="animate-spin text-electric" size={18} /> : null}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {company.timeSlots.map((time) => {
                        const doesNotFit = !slotFitsSchedule(time, selectedService.durationMinutes);
                        const blocked = doesNotFit || bookings.some((booking) => booking.booking_date === selectedDate && blockedStatuses.includes(booking.status) && slotConflicts(time, selectedService.id, booking.booking_time, booking.service_id));
                        const selected = selectedTime === time;
                        return (
                          <button key={time} type="button" disabled={!validDate || blocked || isSubmitting} onClick={() => { setSelectedTime(time); setErrors((current) => ({ ...current, booking_time: "" })); }} className={`min-h-16 rounded-xl border px-3 text-left transition ${selected ? "border-green-300 bg-green-400 text-ink shadow-glow" : "border-white/10 bg-ink/70 text-white hover:border-electric/70 hover:bg-electric/10"} ${blocked ? "cursor-not-allowed border-white/5 bg-white/[.02] text-slate-600 line-through hover:border-white/5 hover:bg-white/[.02]" : ""} ${!validDate ? "cursor-not-allowed opacity-40" : ""}`}>
                            <span className="block text-lg font-black">{time}</span>
                            <span className="text-[10px] font-black uppercase">{blocked ? "No disponible" : selected ? "Seleccionado" : "Disponible"}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.booking_time ? <p className="mt-3 text-sm font-bold text-red-300">{errors.booking_time}</p> : null}
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-7 lg:grid-cols-2">
                  <div>
                    <SectionTitle icon={<UserRound size={18} />} title="Datos de contacto" subtitle="Los usaremos para confirmar tu cita" />
                    <div className="grid gap-4">
                      <Field label="Nombre completo" icon={<UserRound size={16} />} error={errors.customer_name}><input className={`${inputClass} pl-11`} value={data.customer_name} onChange={(event) => updateField("customer_name", event.target.value)} placeholder="Ej: Camila González" /></Field>
                      <Field label="Correo electrónico" icon={<Mail size={16} />} error={errors.email}><input type="email" className={`${inputClass} pl-11`} value={data.email} onChange={(event) => updateField("email", event.target.value)} placeholder="nombre@correo.cl" /></Field>
                      <Field label="Teléfono / WhatsApp" icon={<Phone size={16} />} error={errors.phone}><input type="tel" className={`${inputClass} pl-11`} value={data.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+56 9 1234 5678" /></Field>
                    </div>
                  </div>
                  <div>
                    <SectionTitle icon={<CarFront size={18} />} title="Datos del vehículo" subtitle="Así podremos preparar mejor el servicio" />
                    <label className="mb-4 grid gap-2 text-xs font-black uppercase tracking-wide text-slate-400">Tipo de vehículo<select className={inputClass} value={data.vehicle_type} onChange={(event) => updateField("vehicle_type", event.target.value)}>{company.vehicleTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Marca (opcional)" error={errors.vehicle_brand}><input className={inputClass} value={data.vehicle_brand} onChange={(event) => updateField("vehicle_brand", event.target.value)} placeholder="Ej: Toyota" /></Field>
                      <Field label="Modelo (opcional)" error={errors.vehicle_model}><input className={inputClass} value={data.vehicle_model} onChange={(event) => updateField("vehicle_model", event.target.value)} placeholder="Ej: Corolla" /></Field>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Patente (opcional)" error={errors.license_plate}><input className={`${inputClass} uppercase`} value={data.license_plate} onChange={(event) => updateField("license_plate", event.target.value.toUpperCase())} placeholder="ABCD12" /></Field>
                      <Field label="Indicaciones (opcional)" error={errors.notes}><input className={inputClass} value={data.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Manchas, cuidados, etc." /></Field>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-6">
                    <div className="flex items-start gap-4 border-b border-white/10 pb-5">
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl"><Image src={selectedService.image} alt="" fill className="object-cover" sizes="96px" /></div>
                      <div><p className="text-xs font-black uppercase tracking-wide text-electric">Servicio seleccionado</p><h4 className="mt-1 text-xl font-black">{selectedService.name}</h4><p className="mt-1 text-sm text-slate-400">{selectedService.durationMinutes} minutos · {selectedService.priceLabel}</p></div>
                    </div>
                    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                      <SummaryItem label="Fecha" value={formatHumanDate(selectedDate)} />
                      <SummaryItem label="Horario" value={`${selectedTime} hrs`} />
                      <SummaryItem label="Cliente" value={data.customer_name} />
                      <SummaryItem label="Contacto" value={data.phone} />
                      <SummaryItem label="Vehículo" value={`${data.vehicle_type}${data.vehicle_brand ? ` · ${data.vehicle_brand}` : ""}${data.vehicle_model ? ` ${data.vehicle_model}` : ""}`} />
                      <SummaryItem label="Patente" value={data.license_plate || "No informada"} />
                    </dl>
                  </div>
                  <div className="rounded-2xl border border-electric/20 bg-electric/[.07] p-5 sm:p-6">
                    <ShieldCheck className="text-electric" size={30} />
                    <h4 className="mt-4 text-xl font-black">Solicitud sujeta a confirmación</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-300">El horario quedará reservado temporalmente. El equipo de Aurocar revisará la solicitud y te contactará para confirmarla.</p>
                    <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-ink/40 p-4 text-sm leading-5 text-slate-300"><input type="checkbox" checked={data.accepted_policies} onChange={(event) => updateField("accepted_policies", event.target.checked)} className="mt-1 h-4 w-4 accent-sky-500" /><span>Acepto que Aurocar me contacte para confirmar esta solicitud y coordinar el servicio.</span></label>
                    {errors.accepted_policies ? <p className="mt-2 text-xs font-bold text-red-300">{errors.accepted_policies}</p> : null}
                    <button type="button" onClick={reserve} disabled={isSubmitting} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-action px-6 text-sm font-black uppercase text-white shadow-red transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}Enviar solicitud</button>
                  </div>
                </div>
              ) : null}

              {message && !bookingCode ? <p className="mt-5 rounded-xl border border-action/30 bg-action/10 p-4 text-sm font-bold text-red-100">{message}</p> : null}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-ink/30 px-5 py-5 sm:px-8">
              <button type="button" onClick={() => moveToStep(Math.max(1, step - 1))} disabled={step === 1 || isSubmitting} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-black text-slate-200 transition hover:bg-white/5 disabled:invisible"><ArrowLeft size={17} /> Volver</button>
              {step < 4 ? <button type="button" onClick={goForward} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-electric px-6 text-sm font-black uppercase text-ink transition hover:bg-sky-300">Continuar <ArrowRight size={17} /></button> : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-electric/15 text-electric">{icon}</span><div><h4 className="font-black">{title}</h4><p className="text-xs text-slate-400">{subtitle}</p></div></div>;
}

function Field({ label, icon, error, children }: { label: string; icon?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-xs font-black uppercase tracking-wide text-slate-400">{label}<span className="relative block">{icon ? <span className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-500">{icon}</span> : null}{children}</span>{error ? <span className="normal-case tracking-normal text-red-300">{error}</span> : null}</label>;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 font-bold text-white">{value}</dd></div>;
}

function SuccessState({ code, message, onRestart }: { code: string; message: string; onRestart: () => void }) {
  return (
    <div className="grid min-h-[560px] place-items-center p-6 text-center sm:p-12">
      <div className="max-w-xl">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-400 text-ink shadow-glow"><CheckCircle2 size={40} /></span>
        <p className="mt-7 text-sm font-black uppercase tracking-[.2em] text-green-300">Solicitud recibida</p>
        <h3 className="mt-2 font-display text-5xl sm:text-6xl">Tu cita está en revisión</h3>
        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-300">{message}</p>
        <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-electric/30 bg-electric/10 p-5"><p className="text-xs font-black uppercase tracking-wide text-sky-200">Código de reserva</p><p className="mt-1 text-2xl font-black text-white">{code}</p></div>
        <button type="button" onClick={onRestart} className="mt-7 rounded-xl border border-white/15 px-6 py-3 text-sm font-black uppercase transition hover:bg-white/5">Agendar otro servicio</button>
      </div>
    </div>
  );
}
