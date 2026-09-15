
import { prisma } from "@/lib/db";
import FleetGrid from "@/components/FleetGrid";
import FleetIntro from "@/components/FleetIntro";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const cars = await prisma.car.findMany({
    where: { status: "AVAILABLE", isDeleted: false },
    include: { images: { orderBy: { isPrimary: "desc" } } },
    orderBy: { name: "asc" },
  });
  return <div className="mx-auto max-w-6xl px-5 py-14"><FleetIntro/><FleetGrid cars={cars}/></div>;
}
