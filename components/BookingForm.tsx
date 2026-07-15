"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { bookingSchema, type BookingFormValues } from "@/lib/validations";
import { company, services } from "@/lib/constants";
import { isBookableDate } from "@/lib/booking-utils";

const inputClass = "min-h-12 rounded-lg border border-white/10 bg-ink/70 px-3 text-sm text-white placeholder:text-slate-500";

export function BookingForm() {
  const [serverMessage, setServerMessage] = useState<string>("");
  const [bookingCode, setBookingCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service_id: services[0].id,
      vehicle_type: company.vehicleTypes[0],
      booking_date: today,
      booking_time: company.timeSlots[0],
      accepted_policies: false
    }
  });

  const selectedDate = watch("booking_date");
  const validDate = selectedDate ? isBookableDate(selectedDate) : false;

  async function onSubmit(values: BookingFormValues) {
    setIsSubmitting(true);
    setServerMessage("");
    setBookingCode("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const result = await response.json();

      if (!response.ok) {
        setServerMessage(result.error || "No pudimos enviar la solicitud. Revisa los datos.");
        return;
      }

      setServerMessage(result.message);
      setBookingCode(result.booking.booking_code);
      reset({ ...values, notes: "", accepted_policies: false });
    } catch {
      setServerMessage("Ocurrio un problema de conexion. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="agendar" className="container-x grid gap-10 py-24 lg:grid-cols-[.85fr_1.15fr]">
      <div>
        <p className="mb-3 text-sm font-black uppercase text-electric">Agenda online</p>
        <h2 className="font-display text-6xl leading-none sm:text-7xl">Solicita tu reserva</h2>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Completa los datos y Aurocar revisara disponibilidad. El pago se realiza solo despues de la confirmacion por WhatsApp o correo.
        </p>
        <div className="mt-7 rounded-lg border border-electric/30 bg-electric/10 p-5 text-sm leading-6 text-sky-100">
          Horario disponible: {company.scheduleLabel}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="premium-card grid gap-5 rounded-lg p-5 sm:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre completo" error={errors.customer_name?.message}>
            <input className={inputClass} {...register("customer_name")} placeholder="Ej: Camila Rojas" />
          </Field>
          <Field label="Telefono" error={errors.phone?.message}>
            <input className={inputClass} {...register("phone")} placeholder="+56 9 1234 5678" />
          </Field>
          <Field label="Correo electronico" error={errors.email?.message}>
            <input className={inputClass} {...register("email")} placeholder="correo@ejemplo.cl" />
          </Field>
          <Field label="Tipo de vehiculo" error={errors.vehicle_type?.message}>
            <select className={inputClass} {...register("vehicle_type")}>
              {company.vehicleTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="Marca" error={errors.vehicle_brand?.message}>
            <input className={inputClass} {...register("vehicle_brand")} placeholder="Toyota" />
          </Field>
          <Field label="Modelo" error={errors.vehicle_model?.message}>
            <input className={inputClass} {...register("vehicle_model")} placeholder="Corolla" />
          </Field>
          <Field label="Patente" error={errors.license_plate?.message}>
            <input className={inputClass} {...register("license_plate")} placeholder="ABCD12" />
          </Field>
          <Field label="Servicio solicitado" error={errors.service_id?.message}>
            <select className={inputClass} {...register("service_id")}>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Fecha" error={errors.booking_date?.message}>
            <input className={inputClass} type="date" min={today} {...register("booking_date")} />
          </Field>
          <Field label="Hora" error={errors.booking_time?.message}>
            <select className={inputClass} {...register("booking_time")} disabled={!validDate}>
              {company.timeSlots.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Observaciones" error={errors.notes?.message}>
          <textarea className={`${inputClass} min-h-28 py-3`} {...register("notes")} placeholder="Indica manchas, estado del interior o cualquier detalle importante." />
        </Field>
        <label className="flex gap-3 rounded-lg border border-white/10 bg-ink/50 p-4 text-sm text-slate-300">
          <input type="checkbox" className="mt-1 size-4 accent-action" {...register("accepted_policies")} />
          <span>Acepto que esta es una solicitud de reserva y que Aurocar confirmara disponibilidad antes de solicitar el pago.</span>
        </label>
        {errors.accepted_policies?.message ? <p className="text-sm font-bold text-red-300">{errors.accepted_policies.message}</p> : null}
        <button type="submit" disabled={isSubmitting} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-action px-6 text-sm font-black uppercase text-white shadow-red disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
          Enviar solicitud
        </button>
        {serverMessage ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm font-bold text-slate-100">
            <div className="mb-1 flex items-center gap-2 text-green-300">
              <CheckCircle2 size={18} />
              Solicitud recibida
            </div>
            <p>{serverMessage}</p>
            {bookingCode ? <p className="mt-2 text-electric">Codigo de reserva: {bookingCode}</p> : null}
          </div>
        ) : null}
      </form>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-200">
      <span>{label}</span>
      {children}
      {error ? (
        <span className="flex items-center gap-1 text-xs font-bold text-red-300">
          <AlertCircle size={14} />
          {error}
        </span>
      ) : null}
    </label>
  );
}
