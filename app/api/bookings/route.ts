import { NextResponse } from "next/server";
import { bookingSchema, bookingUpdateSchema } from "@/lib/validations";
import { generateBookingCode, slotConflicts, slotFitsSchedule } from "@/lib/booking-utils";
import { getSupabaseAdmin } from "@/lib/supabase";
import { readLocalBookings, writeLocalBookings } from "@/lib/local-bookings";
import { services } from "@/lib/constants";
import { isAdminRequest } from "@/lib/admin-auth";
import type { Booking } from "@/types/booking";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const service = searchParams.get("service");
  const date = searchParams.get("date");
  const query = searchParams.get("query")?.toLowerCase();
  const adminMode = searchParams.get("admin") === "1";
  const supabase = getSupabaseAdmin();

  if (adminMode && !isAdminRequest(request)) {
    return NextResponse.json({ error: "Sesión de administrador requerida." }, { status: 401 });
  }

  if (!adminMode && (!date || status || service || query)) {
    return NextResponse.json({ error: "Solicitud no autorizada." }, { status: 401 });
  }

  if (supabase) {
    let builder = supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (status) builder = builder.eq("status", status);
    if (service) builder = builder.eq("service_id", service);
    if (date) builder = builder.eq("booking_date", date);
    const { data, error } = await builder;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = (data || []) as Booking[];
    const filteredRows = filterQuery(rows, query);
    return NextResponse.json({ bookings: adminMode ? filteredRows : filteredRows.map(toAvailabilityRecord) });
  }

  const bookings = await readLocalBookings();
  const filtered = bookings
    .filter((item) => !status || item.status === status)
    .filter((item) => !service || item.service_id === service)
    .filter((item) => !date || item.booking_date === date);

  const rows = filterQuery(filtered, query).reverse();
  return NextResponse.json({ bookings: adminMode ? rows : rows.map(toAvailabilityRecord) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos invalidos", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const service = services.find((item) => item.id === parsed.data.service_id);
  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 400 });
  }

  if (!slotFitsSchedule(parsed.data.booking_time, service.durationMinutes)) {
    return NextResponse.json({ error: "Ese horario no permite completar el servicio antes del cierre." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  const blocksSlot = (booking: Booking) =>
    booking.booking_date === parsed.data.booking_date &&
    ["pendiente", "confirmada"].includes(booking.status) &&
    slotConflicts(parsed.data.booking_time, parsed.data.service_id, booking.booking_time, booking.service_id);

  if (supabase) {
    const { data: existing, error: existingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_date", parsed.data.booking_date)
      .in("status", ["pendiente", "confirmada"]);
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
    if (((existing || []) as Booking[]).some(blocksSlot)) {
      return NextResponse.json({ error: "Ese horario acaba de ser reservado. Elige otro bloque disponible." }, { status: 409 });
    }
    const { count } = await supabase.from("bookings").select("id", { count: "exact", head: true });
    const booking = createBooking(parsed.data, service.name, generateBookingCode((count || 0) + 1), now);
    const { data, error } = await supabase.from("bookings").insert(booking).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ booking: data, message: "Tu solicitud fue enviada correctamente. Aurocar revisara la disponibilidad y se comunicara contigo para confirmar la cita." });
  }

  const bookings = await readLocalBookings();
  if (bookings.some(blocksSlot)) {
    return NextResponse.json({ error: "Ese horario acaba de ser reservado. Elige otro bloque disponible." }, { status: 409 });
  }
  const booking = createBooking(parsed.data, service.name, generateBookingCode(bookings.length + 1), now);
  bookings.push(booking);
  await writeLocalBookings(bookings);

  return NextResponse.json({ booking, message: "Tu solicitud fue enviada correctamente. Aurocar revisara la disponibilidad y se comunicara contigo para confirmar la cita." });
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Sesión de administrador requerida." }, { status: 401 });
  }
  const body = await request.json();
  const parsed = bookingUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const patch = { ...parsed.data, updated_at: new Date().toISOString() };
  delete (patch as Partial<typeof patch>).id;

  if (supabase) {
    const { data, error } = await supabase.from("bookings").update(patch).eq("id", parsed.data.id).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ booking: data });
  }

  const bookings = await readLocalBookings();
  const index = bookings.findIndex((booking) => booking.id === parsed.data.id);
  if (index === -1) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  bookings[index] = { ...bookings[index], ...patch };
  await writeLocalBookings(bookings);
  return NextResponse.json({ booking: bookings[index] });
}

function createBooking(data: Record<string, unknown>, serviceName: string, code: string, now: string): Booking {
  return {
    id: crypto.randomUUID(),
    booking_code: code,
    customer_name: String(data.customer_name),
    phone: String(data.phone),
    email: String(data.email),
    vehicle_brand: data.vehicle_brand ? String(data.vehicle_brand) : "No informado",
    vehicle_model: data.vehicle_model ? String(data.vehicle_model) : "No informado",
    license_plate: data.license_plate ? String(data.license_plate).toUpperCase() : "No informada",
    vehicle_type: String(data.vehicle_type),
    service_id: String(data.service_id),
    service_name: serviceName,
    booking_date: String(data.booking_date),
    booking_time: String(data.booking_time),
    notes: data.notes ? String(data.notes) : null,
    internal_notes: null,
    status: "pendiente",
    payment_status: "no_solicitado",
    payment_link_sent: false,
    created_at: now,
    updated_at: now
  };
}

function filterQuery(bookings: Booking[], query?: string) {
  if (!query) return bookings;
  return bookings.filter((item) =>
    [item.customer_name, item.phone, item.license_plate].some((value) => value.toLowerCase().includes(query))
  );
}

function toAvailabilityRecord(booking: Booking) {
  return {
    id: booking.id,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    service_id: booking.service_id,
    status: booking.status
  };
}
