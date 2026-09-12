"use client";

import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import { IItem } from "@/models/Item";

export default function ArmoryClient() {
  const [items, setItems] = useState<IItem[]>([]);
  const [gold, setGold] = useState<number>(0);
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchArmoryData = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setGold(data.gold || 0);
        setOwnedItemIds(data.ownedItemIds || []);
      }
    } catch (err) {
      console.error("Failed to load armory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArmoryData();
  }, [fetchArmoryData]);

  async function handlePurchase(item: IItem) {
    const itemId = String(item._id);
    if (purchasingId) return;

    if (gold < item.price) {
      setNotification({
        type: "error",
        message: `Not enough gold. Current: ${gold} Gold, Required: ${item.price} Gold.`,
      });
      return;
    }

    setPurchasingId(itemId);
    setNotification(null);

    try {
      const res = await fetch(`/api/items/${itemId}/purchase`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setNotification({
          type: "error",
          message: data.error || "Purchase failed. Try again.",
        });
        return;
      }

      // Authoritative server state update
      setGold(data.remainingGold);
      setOwnedItemIds((prev) => [...prev, itemId]);
      setNotification({
        type: "success",
        message: `Acquired ${item.name}! Added to your inventory.`,
      });

      // Auto-dismiss notification after 4.5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 4500);
    } catch {
      setNotification({
        type: "error",
        message: "Network error during purchase. Try again.",
      });
      setTimeout(() => {
        setNotification(null);
      }, 4500);
    } finally {
      setPurchasingId(null);
    }
  }

  function getBonusLabel(bonus: IItem["attributeBonus"]) {
    if (!bonus) return null;
    const entries = Object.entries(bonus).filter(([, val]) => val > 0);
    if (entries.length === 0) return null;
    return entries.map(([attr, val]) => (
      <span key={attr} className="uppercase text-xs font-mono font-bold text-indigo-300">
        +{val} {attr}
      </span>
    ));
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 pb-16">
      <Navigation />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-300 mb-2">
              <span>🛡️</span>
              <span>VALOR VAULT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ARMORY
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400">
              Spend your hard-earned gold to strengthen your character.
            </p>
          </div>

          {/* Current Gold Display */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 shadow-lg shadow-yellow-500/5 backdrop-blur-md self-start sm:self-auto">
            <span className="text-2xl">🪙</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500/80 block">
                Treasury
              </span>
              <span className="text-xl font-mono font-black text-yellow-300">
                {gold} Gold
              </span>
            </div>
          </div>
        </div>

        {/* Notification / Alert */}
        {notification && (
          <div
            role={notification.type === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`flex items-center justify-between rounded-xl border p-4 text-sm font-medium backdrop-blur-md ${
              notification.type === "error"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              aria-label="Dismiss notification"
              className="text-xs hover:opacity-80 ml-4 p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Items Catalog */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-52 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center">
            <p className="text-neutral-400">The armory is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const itemId = String(item._id);
              const isOwned = ownedItemIds.includes(itemId);
              const isPurchasing = purchasingId === itemId;
              const canAfford = gold >= item.price;

              return (
                <div
                  key={itemId}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                    isOwned
                      ? "border-neutral-800/80 bg-neutral-950/40 opacity-80"
                      : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 shadow-xl"
                  }`}
                >
                  <div>
                    {/* Item Type & Bonus */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-md border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                        {item.type}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getBonusLabel(item.attributeBonus)}
                      </div>
                    </div>

                    {/* Item Name */}
                    <h3 className="text-lg font-bold tracking-tight text-white">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Price & Action */}
                  <div className="mt-6 flex items-center justify-between border-t border-neutral-800/80 pt-4">
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-yellow-400">
                      <span>🪙</span>
                      <span>{item.price} Gold</span>
                    </div>

                    {isOwned ? (
                      <span className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-400 cursor-not-allowed">
                        OWNED
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePurchase(item)}
                        disabled={isPurchasing || !canAfford}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow ${
                          canAfford
                            ? "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-400"
                            : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
                        } disabled:opacity-60`}
                      >
                        {isPurchasing
                          ? "Acquiring..."
                          : canAfford
                          ? "ACQUIRE"
                          : "INSUFFICIENT GOLD"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
