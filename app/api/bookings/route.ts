import { NextResponse } from "next/server";
import { bookingSchema, bookingUpdateSchema } from "@/lib/validations";
import { generateBookingCode } from "@/lib/booking-utils";
import { getSupabaseAdmin } from "@/lib/supabase";
import { readLocalBookings, writeLocalBookings } from "@/lib/local-bookings";
import { services } from "@/lib/constants";
import type { Booking } from "@/types/booking";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const service = searchParams.get("service");
  const date = searchParams.get("date");
  const query = searchParams.get("query")?.toLowerCase();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    let builder = supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (status) builder = builder.eq("status", status);
    if (service) builder = builder.eq("service_id", service);
    if (date) builder = builder.eq("booking_date", date);
    const { data, error } = await builder;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = (data || []) as Booking[];
    return NextResponse.json({ bookings: filterQuery(rows, query) });
  }

  const bookings = await readLocalBookings();
  const filtered = bookings
    .filter((item) => !status || item.status === status)
    .filter((item) => !service || item.service_id === service)
    .filter((item) => !date || item.booking_date === date);

  return NextResponse.json({ bookings: filterQuery(filtered, query).reverse() });
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

  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { count } = await supabase.from("bookings").select("id", { count: "exact", head: true });
    const booking = createBooking(parsed.data, service.name, generateBookingCode((count || 0) + 1), now);
    const { data, error } = await supabase.from("bookings").insert(booking).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ booking: data, message: "Tu solicitud fue enviada correctamente. Aurocar revisara la disponibilidad y se comunicara contigo para confirmar la cita." });
  }

  const bookings = await readLocalBookings();
  const booking = createBooking(parsed.data, service.name, generateBookingCode(bookings.length + 1), now);
  bookings.push(booking);
  await writeLocalBookings(bookings);

  return NextResponse.json({ booking, message: "Tu solicitud fue enviada correctamente. Aurocar revisara la disponibilidad y se comunicara contigo para confirmar la cita." });
}

export async function PATCH(request: Request) {
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
    vehicle_brand: String(data.vehicle_brand),
    vehicle_model: String(data.vehicle_model),
    license_plate: String(data.license_plate).toUpperCase(),
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
