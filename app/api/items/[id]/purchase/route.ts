import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import User from "@/models/User";
import InventoryItem from "@/models/InventoryItem";

interface RouteParams {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

// POST /api/items/:id/purchase - Secure atomic purchase endpoint
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itemId = params.id;
    if (!isValidObjectId(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Authoritative item verification
    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const price = item.price;
    const userId = session.user.id;

    // 2. Check if already owned
    const alreadyOwned = await InventoryItem.findOne({ userId, itemId });
    if (alreadyOwned) {
      return NextResponse.json(
        { error: "Item is already in your inventory" },
        { status: 400 }
      );
    }

    // 3. Atomic deduction: verify gold >= price and decrement gold in one atomic operation
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        gold: { $gte: price },
      },
      {
        $inc: { gold: -price },
      },
      { new: true }
    );

    if (!updatedUser) {
      const currentUser = await User.findById(userId).select("gold");
      const currentGold = currentUser?.gold || 0;
      return NextResponse.json(
        {
          error: `Not enough gold. Current: ${currentGold} Gold, Required: ${price} Gold.`,
        },
        { status: 400 }
      );
    }

    // 4. Create inventory record (with rollback safeguard if duplicate caught by unique index)
    try {
      await InventoryItem.create({
        userId,
        itemId: item._id,
        quantity: 1,
        purchasedAt: new Date(),
      });
    } catch (invErr: any) {
      // If unique index collision occurs, refund gold
      await User.findByIdAndUpdate(userId, { $inc: { gold: price } });
      return NextResponse.json(
        { error: "Item is already owned or concurrently acquired." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Item acquired successfully!",
        acquiredItem: item,
        remainingGold: updatedUser.gold,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/items/:id/purchase error:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
