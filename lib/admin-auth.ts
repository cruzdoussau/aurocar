import { createHash, timingSafeEqual } from "node:crypto";

export const adminCookieName = "aurocar-admin-session";

function adminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "aurocar-demo";
}

export function adminSessionToken() {
  const secret = process.env.ADMIN_SESSION_SECRET || "aurocar-local-development";
  return createHash("sha256").update(`${adminPassword()}:${secret}`).digest("hex");
}

export function isValidAdminPassword(password: string) {
  const expected = Buffer.from(adminPassword());
  const received = Buffer.from(password);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function isAdminRequest(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === adminCookieName)?.[1];
  return token === adminSessionToken();
}
