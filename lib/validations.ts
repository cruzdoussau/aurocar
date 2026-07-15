import { z } from "zod";
import { company, services } from "@/lib/constants";
import { isBookableDate, isBookableTime } from "@/lib/booking-utils";

export const bookingSchema = z.object({
  customer_name: z.string().min(3, "Ingresa tu nombre completo."),
  phone: z.string().min(8, "Ingresa un telefono valido."),
  email: z.string().email("Ingresa un correo valido."),
  vehicle_type: z.enum(company.vehicleTypes as [string, ...string[]], {
    errorMap: () => ({ message: "Selecciona el tipo de vehiculo." })
  }),
  service_id: z.string().refine((value) => services.some((service) => service.id === value), "Selecciona un servicio.").default(services[0].id),
  booking_date: z.string().refine(isBookableDate, "Elige una fecha de lunes a sabado y no pasada."),
  booking_time: z.string().refine(isBookableTime, "Selecciona un horario de atencion valido."),
  accepted_policies: z.boolean().default(true)
});

export const contactSchema = z.object({
  name: z.string().min(3, "Ingresa tu nombre."),
  phone: z.string().min(8, "Ingresa tu telefono."),
  email: z.string().email("Ingresa un correo valido."),
  message: z.string().min(8, "Escribe tu mensaje.")
});

export const bookingUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(["pendiente", "confirmada", "rechazada", "completada", "cancelada"]).optional(),
  payment_status: z.enum(["pendiente", "pagado", "no_solicitado"]).optional(),
  booking_date: z.string().optional(),
  booking_time: z.string().optional(),
  internal_notes: z.string().optional()
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
