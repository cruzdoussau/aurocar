# Aurocar Booking

Sitio oficial de Aurocar para servicios de detailing, lavado, tapiceria y pulido de focos.

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
NEXT_PUBLIC_ADMIN_PASSWORD=aurocar-demo
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

1. Cliente elige servicio.
2. Selecciona fecha y hora de lunes a sabado.
3. Envia solicitud.
4. La reserva queda en estado `pendiente`.
5. Aurocar revisa y confirma desde `/admin`.
6. Solo despues se comparte el link de Mercado Pago.

## Admin

Ruta: `/admin/login`

Clave demo por defecto: `aurocar-demo`

Desde `/admin` se puede filtrar, confirmar, rechazar, marcar pagado y copiar mensaje de WhatsApp.

## Deploy en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Agrega las variables de entorno.
4. Ejecuta build con `npm run build`.
5. Publica.
