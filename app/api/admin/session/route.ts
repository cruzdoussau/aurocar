import { NextResponse } from "next/server";
import { adminCookieName, adminSessionToken, isAdminRequest, isValidAdminPassword } from "@/lib/admin-auth";

export async function GET(request: Request) {
  return NextResponse.json({ authenticated: isAdminRequest(request) }, { status: isAdminRequest(request) ? 200 : 401 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!isValidAdminPassword(String(body.password || ""))) {
    return NextResponse.json({ error: "Clave incorrecta." }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(adminCookieName, adminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminCookieName, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
