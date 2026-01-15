import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function Page({ params }: PageProps) {
  const { code } = await params;

  if (!code) return <h1>Invalid URL</h1>;

  const url = await prisma.url.findUnique({ where: { shortCode: code } });

  if (!url) return <h1>URL not found</h1>;

  // Increment clicks
  await prisma.url.update({
    where: { id: url.id },
    data: { clicks: url.clicks + 1 },
  });

  // Redirect to original URL
  redirect(url.longUrl);
}
