import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos invalidos", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  return NextResponse.json({
    message: "Mensaje recibido. Aurocar se comunicara contigo a la brevedad.",
    contact: parsed.data
  });
}
