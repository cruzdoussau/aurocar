import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Booking } from "@/types/booking";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "bookings.json");

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, "[]", "utf8");
  }
}

export async function readLocalBookings(): Promise<Booking[]> {
  await ensureStore();
  const content = await readFile(dataFile, "utf8");
  return JSON.parse(content) as Booking[];
}

export async function writeLocalBookings(bookings: Booking[]) {
  await ensureStore();
  await writeFile(dataFile, JSON.stringify(bookings, null, 2), "utf8");
}
