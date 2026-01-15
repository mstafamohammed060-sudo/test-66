import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { longUrl } = await req.json();

    if (!longUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Clean the URL (remove trailing slashes, normalize)
    const cleanedUrl = longUrl.trim().replace(/\/+$/, "");

    // Check if URL already exists in database
    const existingUrl = await prisma.url.findFirst({
      where: {
        longUrl: cleanedUrl,
      },
      select: {
        id: true,
        shortCode: true,
        clicks: true,
        createdAt: true,
      },
    });

    let shortCode: string;
    let isExisting = false;

    if (existingUrl) {
      // URL already exists, use existing short code
      shortCode = existingUrl.shortCode;
      isExisting = true;
    } else {
      // Generate new short code for new URL
      shortCode = nanoid(6);
      
      // Create new URL entry
      await prisma.url.create({
        data: {
          longUrl: cleanedUrl,
          shortCode,
        },
      });
    }

    // Dynamically detect the base URL from the request
    const baseUrl = req.headers.get("origin") || `https://${req.headers.get("host")}`;
    const shortUrl = `${baseUrl}/${shortCode}`;

    // Get the full URL record for response
    const urlRecord = await prisma.url.findUnique({
      where: { shortCode },
      select: {
        id: true,
        longUrl: true,
        shortCode: true,
        clicks: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      shortUrl,
      shortCode,
      originalUrl: cleanedUrl,
      isExisting, // Flag to indicate if this was an existing URL
      clicks: urlRecord?.clicks || 0,
      createdAt: urlRecord?.createdAt || new Date().toISOString(),
      message: isExisting 
        ? "This URL was already shortened previously!" 
        : "URL shortened successfully!",
    });
  } catch (error: any) {
    console.error("Shorten URL error:", error);
    
    // Handle duplicate short codes (very rare with nanoid, but just in case)
    if (error.code === 'P2002') {
      // Retry with a new short code
      return NextResponse.json({ error: "Please try again" }, { status: 500 });
    }
    
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}