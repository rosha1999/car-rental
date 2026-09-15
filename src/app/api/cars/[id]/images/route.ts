import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const imageSchema = z.object({ url: z.string().url(), isPrimary: z.boolean().optional().default(false) });
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function admin() { const s = await getSession(); return s && s.role === "ADMIN" ? s : null; }

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await admin(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id }, include: { images: true } });
  if (!car) return NextResponse.json({ error: "Car not found" }, { status: 404 });

  const contentType = request.headers.get("content-type") ?? "";
  let url: string;
  let isPrimary = false;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    isPrimary = form.get("isPrimary") === "true";
    if (!(file instanceof File)) return NextResponse.json({ error: "Please choose an image file" }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Only JPG, PNG, and WEBP images are allowed" }, { status: 400 });
    if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Image is too large. Please use an image under 2 MB" }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    url = `data:${file.type};base64,${bytes.toString("base64")}`;
  } else {
    const data = imageSchema.safeParse(await request.json());
    if (!data.success) return NextResponse.json({ error: "Please provide a valid image URL" }, { status: 400 });
    url = data.data.url;
    isPrimary = data.data.isPrimary;
  }

  if (isPrimary || car.images.length === 0) {
    isPrimary = true;
  }
  const image = await prisma.$transaction(async tx => {
    if (isPrimary) await tx.carImage.updateMany({ where: { carId: id }, data: { isPrimary: false } });
    return tx.carImage.create({ data: { carId: id, url, isPrimary } });
  });
  await prisma.auditLog.create({ data: { userId: session.id, action: "CREATE", entity: "CarImage", entityId: image.id, description: `Added image to car ${car.name}` } });
  return NextResponse.json({ image }, { status: 201 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await admin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const body = await request.json(); const imageId = z.string().min(1).safeParse(body.imageId);
  if (!imageId.success) return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
  const image = await prisma.carImage.findFirst({ where: { id: imageId.data, carId: id } }); if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  await prisma.$transaction([prisma.carImage.updateMany({ where: { carId: id }, data: { isPrimary: false } }), prisma.carImage.update({ where: { id: image.id }, data: { isPrimary: true } })]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await admin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const body = await request.json().catch(() => ({})); const imageId = z.string().min(1).safeParse(body.imageId);
  if (!imageId.success) return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
  const image = await prisma.carImage.findFirst({ where: { id: imageId.data, carId: id } }); if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  await prisma.carImage.delete({ where: { id: image.id } }); return NextResponse.json({ ok: true });
}
