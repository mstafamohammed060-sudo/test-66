import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/urls/:id
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; // <-- unwrap the promise
  const idParam = params?.id;

  if (!idParam) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const id = parseInt(idParam, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const url = await prisma.url.findUnique({ where: { id } });
  if (!url) return NextResponse.json({ error: "URL not found" }, { status: 404 });

  return NextResponse.json(url);
}

// PATCH /api/urls/:id
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const idParam = params?.id;

  if (!idParam) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const id = parseInt(idParam, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const { longUrl } = await req.json();
  if (!longUrl) return NextResponse.json({ error: "Missing longUrl" }, { status: 400 });

  const updated = await prisma.url.update({ where: { id }, data: { longUrl } });
  return NextResponse.json(updated);
}

// DELETE /api/urls/:id
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const idParam = params?.id;

  if (!idParam) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const id = parseInt(idParam, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await prisma.url.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
