import AssetTable from "@/components/AssetTable";
import { db } from "@/lib/db";
import { Asset } from "@/components/data";

async function getAssets(): Promise<Asset[]> {
  const items: any[] = await db.item.findMany({
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    serial: item.serial,
    category: item.category,
    brand: item.brand,
    type: item.type,
    vehicle: item.vehicle,
    status: {
      state: item.statusState as any,
      level: item.statusLevel ?? undefined,
    },
  }));
}

export default async function Home() {
  const assets = await getAssets();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-50">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Asset Management</h1>
        <AssetTable data={assets} />
      </div>
    </main>
  );
}

