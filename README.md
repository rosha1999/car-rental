# Car Rental Management

Modern full-stack car rental management system built with Next.js, TypeScript, Prisma and PostgreSQL.

## Access model
- One private administrator account.
- Customers/visitors never need an account.
- Public pages show vehicle information and availability only; rental prices are private to the admin dashboard.
- All admin pages and non-public APIs require an authenticated ADMIN session.

## Development
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to a PostgreSQL database.
3. Set a strong `AUTH_SECRET`.
4. Install dependencies with `npm install`.
5. Generate Prisma Client: `npm run db:generate`.
6. Create/update the database: `npm run db:push` (or create a migration with `npm run db:migrate`).
7. Seed demo data: `npm run db:seed`.
8. Start: `npm run dev`.

## Demo admin
The seed creates one development administrator. Change the seeded password before any real deployment.

## Important
Vehicle images can be managed from the admin car editor by URL: add images, choose the main image, and remove images. A production deployment can later replace this with object-storage uploads (S3/Cloudinary/etc.) without changing the rental data model.


## ALRAID branding and fleet assets
- Official logo is bundled at `public/brand/alraid-logo.JPG`.
- The provided fleet photos are bundled under `public/cars/` and are linked by the development seed to the three real fleet vehicles: Toyota Corolla, Dodge Challenger, and Toyota Camry.
- Business details are preconfigured in Prisma settings: Arabic/English business name, phone, email, Kirkuk address, WhatsApp and logo path.
- Public visitors see vehicle photos/specifications and availability only; rental prices remain private inside the admin area.
- The public website includes a final Arabic/English language switcher with RTL/LTR direction support.

## Vehicle photo upload

The admin car editor now supports **Upload from device**. Selecting a JPG, PNG, or WEBP image (up to 2 MB) uploads it automatically and saves it with the vehicle. Uploaded images are stored as data URLs in the existing `CarImage.url` field, so no additional storage service or environment variable is required.
