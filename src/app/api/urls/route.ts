import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const urls = await prisma.url.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(urls);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
