import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET clicks for a specific URL
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const urlId = parseInt(id, 10);

  if (isNaN(urlId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const url = await prisma.url.findUnique({ where: { id: urlId } });

  if (!url) return NextResponse.json({ error: "URL not found" }, { status: 404 });

  return NextResponse.json({ id: url.id, clicks: url.clicks });
}
