import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import InventoryItem from "@/models/InventoryItem";
import User from "@/models/User";
import { ensureArmoryCatalogSeeded } from "@/lib/armoryCatalog";

export const dynamic = "force-dynamic";

// GET /api/items - Retrieve all armory items, user's current gold, and owned item IDs
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureArmoryCatalogSeeded();

    const [items, user, inventory] = await Promise.all([
      Item.find({}).sort({ price: 1 }).lean(),
      User.findById(session.user.id).select("gold").lean(),
      InventoryItem.find({ userId: session.user.id }).lean(),
    ]);

    const ownedItemIds = inventory.map((inv) => String(inv.itemId));

    return NextResponse.json(
      {
        success: true,
        items,
        gold: user?.gold || 0,
        ownedItemIds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch armory items" },
      { status: 500 }
    );
  }
}
