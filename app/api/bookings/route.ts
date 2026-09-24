import { NextResponse } from "next/server";
import { bookingSchema, bookingUpdateSchema } from "@/lib/validations";
import { bookingBlocksSlot, generateBookingCode, slotConflicts, slotFitsSchedule } from "@/lib/booking-utils";
import { getSupabaseAdmin, isProductionStorageRequired } from "@/lib/supabase";
import { readLocalBookings, writeLocalBookings } from "@/lib/local-bookings";
import { company, getServicePrice, services } from "@/lib/constants";
import { isAdminRequest } from "@/lib/admin-auth";
import { sendBookingRequestEmails } from "@/lib/booking-email";
import type { Booking } from "@/types/booking";

export async function GET(request: Request) {
  return withApiErrors(() => handleGet(request));
}

export async function POST(request: Request) {
  return withApiErrors(() => handlePost(request));
}

export async function PATCH(request: Request) {
  return withApiErrors(() => handlePatch(request));
}

async function handleGet(request: Request) {
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
    const visibleRows = adminMode ? filteredRows : filteredRows.filter((booking) => bookingBlocksSlot(booking));
    return NextResponse.json({ bookings: adminMode ? visibleRows : visibleRows.map(toAvailabilityRecord) });
  }

  if (isProductionStorageRequired()) return storageUnavailable();

  const bookings = await readLocalBookings();
  const filtered = bookings
    .filter((item) => !status || item.status === status)
    .filter((item) => !service || item.service_id === service)
    .filter((item) => !date || item.booking_date === date);

  const rows = filterQuery(filtered, query).reverse();
  const visibleRows = adminMode ? rows : rows.filter((booking) => bookingBlocksSlot(booking));
  return NextResponse.json({ bookings: adminMode ? visibleRows : visibleRows.map(toAvailabilityRecord) });
}

async function handlePost(request: Request) {
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
  const price = getServicePrice(service.id, parsed.data.vehicle_type);
  const supabase = getSupabaseAdmin();
  const blocksSlot = (booking: Booking) =>
    booking.booking_date === parsed.data.booking_date &&
    bookingBlocksSlot(booking) &&
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
    const booking = createBooking(parsed.data, service.name, price, generateBookingCode((count || 0) + 1), now);
    const { data, error } = await supabase.from("bookings").insert(booking).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const emailDelivery = await sendBookingRequestEmails(data as Booking);
    return NextResponse.json({ booking: data, emailDelivery, message: bookingSuccessMessage(emailDelivery.customer) });
  }

  if (isProductionStorageRequired()) return storageUnavailable();

  const bookings = await readLocalBookings();
  if (bookings.some(blocksSlot)) {
    return NextResponse.json({ error: "Ese horario acaba de ser reservado. Elige otro bloque disponible." }, { status: 409 });
  }
  const booking = createBooking(parsed.data, service.name, price, generateBookingCode(bookings.length + 1), now);
  bookings.push(booking);
  await writeLocalBookings(bookings);
  const emailDelivery = await sendBookingRequestEmails(booking);

  return NextResponse.json({ booking, emailDelivery, message: bookingSuccessMessage(emailDelivery.customer) });
}

async function handlePatch(request: Request) {
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
  const scheduleChanged = Boolean(parsed.data.status || parsed.data.booking_date || parsed.data.booking_time);

  if (supabase) {
    const { data: current, error: currentError } = await supabase.from("bookings").select("*").eq("id", parsed.data.id).single();
    if (currentError || !current) return NextResponse.json({ error: currentError?.message || "Reserva no encontrada" }, { status: 404 });
    const nextBooking = { ...(current as Booking), ...patch } as Booking;
    if (scheduleChanged && bookingBlocksSlot(nextBooking)) {
      const { data: sameDay, error: conflictError } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_date", nextBooking.booking_date)
        .in("status", ["pendiente", "confirmada"]);
      if (conflictError) return NextResponse.json({ error: conflictError.message }, { status: 500 });
      if (((sameDay || []) as Booking[]).some((item) => item.id !== nextBooking.id && bookingBlocksSlot(item) && slotConflicts(nextBooking.booking_time, nextBooking.service_id, item.booking_time, item.service_id))) {
        return NextResponse.json({ error: "No se puede confirmar: el horario se cruza con otra cita activa." }, { status: 409 });
      }
    }
    const { data, error } = await supabase.from("bookings").update(patch).eq("id", parsed.data.id).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ booking: data });
  }

  if (isProductionStorageRequired()) return storageUnavailable();

  const bookings = await readLocalBookings();
  const index = bookings.findIndex((booking) => booking.id === parsed.data.id);
  if (index === -1) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  const nextBooking = { ...bookings[index], ...patch };
  if (scheduleChanged && bookingBlocksSlot(nextBooking) && bookings.some((item) => item.id !== nextBooking.id && item.booking_date === nextBooking.booking_date && bookingBlocksSlot(item) && slotConflicts(nextBooking.booking_time, nextBooking.service_id, item.booking_time, item.service_id))) {
    return NextResponse.json({ error: "No se puede confirmar: el horario se cruza con otra cita activa." }, { status: 409 });
  }
  bookings[index] = nextBooking;
  await writeLocalBookings(bookings);
  return NextResponse.json({ booking: bookings[index] });
}

function createBooking(data: Record<string, unknown>, serviceName: string, price: number | null, code: string, now: string): Booking {
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
    price,
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

function bookingSuccessMessage(customerEmailSent: boolean) {
  const holdMessage = `Tu solicitud fue enviada correctamente. El horario se mantendrá reservado por ${company.pendingHoldMinutes} minutos mientras Aurocar revisa la cita.`;
  return customerEmailSent ? `${holdMessage} También enviamos el comprobante a tu correo.` : holdMessage;
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

function storageUnavailable() {
  return NextResponse.json(
    {
      error: "La agenda no tiene una base de datos configurada en este entorno.",
      code: "BOOKING_STORAGE_NOT_CONFIGURED"
    },
    { status: 503 }
  );
}

async function withApiErrors(action: () => Promise<NextResponse>) {
  try {
    return await action();
  } catch (error) {
    console.error("Booking API error", error);
    return NextResponse.json(
      {
        error: "No pudimos conectar con la agenda. Revisa la configuración de Supabase en Vercel.",
        code: "BOOKING_API_ERROR"
      },
      { status: 500 }
    );
  }
}
