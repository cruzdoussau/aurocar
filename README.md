# Aurocar Booking

Sitio oficial de Aurocar para servicios de limpieza, detailing automotriz, lavado de vehiculos, tapiceria y pulido de focos.

## Stack

- Next.js 15 con App Router
- React + TypeScript
- Tailwind CSS
- Lucide React
- Supabase preparado para reservas
- React Hook Form + Zod
- date-fns

## Instalacion

```bash
npm install
npm run dev
```

El sitio queda en `http://localhost:8090`.

## Variables

Copia `.env.example` a `.env.local` y completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=aurocar-demo
ADMIN_SESSION_SECRET=una-clave-larga-y-privada
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_AUROCAR_ADDRESS=
```

Si Supabase no esta configurado, la app guarda reservas en `.data/bookings.json` para desarrollo local.

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en el SQL Editor.
3. Copia las variables del proyecto en `.env.local`.
4. Usa `SUPABASE_SERVICE_ROLE_KEY` solo en servidor y Vercel, nunca en frontend publico.

## Flujo de reserva

1. Cliente elige servicio en el primer paso.
2. Selecciona fecha y hora disponible segun la duracion del servicio.
3. Completa sus datos y revisa el resumen.
4. Envia la solicitud.
5. La reserva queda en estado `pendiente` y bloquea el horario durante 30 minutos.
6. Aurocar revisa y confirma desde `/admin`.
7. Solo despues se comparte el link de Mercado Pago.

## Admin

Ruta: `/admin/login`

Clave demo por defecto: `aurocar-demo`

Desde `/admin` se puede filtrar por fecha, estado y servicio; confirmar o rechazar citas; marcar pagos; guardar notas internas y contactar por WhatsApp. La sesion se protege con una cookie HTTP-only.

## Deploy en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Agrega las variables de entorno.
4. Ejecuta build con `npm run build`.
5. Publica.
