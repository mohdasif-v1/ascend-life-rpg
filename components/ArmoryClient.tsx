"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Coins, Check, X, Sparkles } from "lucide-react";
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
        message: `Insufficient gold. Treasury holds ${gold} Gold; item requires ${item.price} Gold.`,
      });
      setTimeout(() => setNotification(null), 4500);
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
        setTimeout(() => setNotification(null), 4500);
        return;
      }

      setGold(data.remainingGold);
      setOwnedItemIds((prev) => [...prev, itemId]);
      setNotification({
        type: "success",
        message: `Acquired ${item.name}! Added to your active inventory.`,
      });
      setTimeout(() => setNotification(null), 4500);
    } catch {
      setNotification({
        type: "error",
        message: "Network error during purchase. Try again.",
      });
      setTimeout(() => setNotification(null), 4500);
    } finally {
      setPurchasingId(null);
    }
  }

  function getBonusLabel(bonus: IItem["attributeBonus"]) {
    if (!bonus) return null;
    const entries = Object.entries(bonus).filter(([, val]) => val > 0);
    if (entries.length === 0) return null;
    return entries.map(([attr, val]) => (
      <span key={attr} className="uppercase text-xs font-mono font-bold text-arcane-light">
        +{val} {attr}
      </span>
    ));
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 pb-16 bg-arcane-radial bg-rpg-grid">
      <Navigation />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-obsidian-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-0.5 text-xs font-semibold text-yellow-300 mb-2">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-display font-bold">VALOR VAULT</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-white">
              ARMORY
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400">
              Exchange hard-earned gold for artifacts and permanent attribute enhancements
            </p>
          </div>

          {/* Treasury Display */}
          <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 shadow-gold backdrop-blur-md self-start sm:self-auto">
            <Coins className="h-6 w-6 text-yellow-400" aria-hidden="true" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500/80 block">
                Treasury Balance
              </span>
              <span className="font-display font-black text-xl text-yellow-300">
                {gold} Gold
              </span>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
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
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Catalog Items */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-52 rounded-2xl border border-obsidian-800 bg-obsidian-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-obsidian-800 bg-obsidian-900/40 p-12 text-center">
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
                <article
                  key={itemId}
                  className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                    isOwned
                      ? "border-obsidian-800/80 bg-obsidian-950/40 opacity-75"
                      : "border-obsidian-800 bg-obsidian-900/80 hover:border-obsidian-700 shadow-xl"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-md border border-obsidian-700 bg-obsidian-950 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                        {item.type}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getBonusLabel(item.attributeBonus)}
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-lg tracking-wide text-white">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-obsidian-800 pt-4">
                    <div className="flex items-center gap-1.5 font-display font-bold text-sm text-yellow-400">
                      <Coins className="h-4 w-4" aria-hidden="true" />
                      <span>{item.price} Gold</span>
                    </div>

                    {isOwned ? (
                      <span className="inline-flex items-center gap-1 rounded-xl border border-obsidian-700 bg-obsidian-950 px-3.5 py-1.5 text-xs font-bold text-neutral-400 cursor-not-allowed">
                        <Check className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
                        <span>OWNED</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePurchase(item)}
                        disabled={isPurchasing || !canAfford}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-display font-bold tracking-wider transition shadow ${
                          canAfford
                            ? "bg-arcane hover:bg-arcane-dark text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light"
                            : "bg-obsidian-850 text-neutral-500 cursor-not-allowed border border-obsidian-800"
                        } disabled:opacity-60`}
                      >
                        {isPurchasing
                          ? "ACQUIRING..."
                          : canAfford
                          ? "ACQUIRE"
                          : "INSUFFICIENT GOLD"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
