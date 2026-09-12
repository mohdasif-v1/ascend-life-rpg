import React from "react";
import { Swords, Brain, Heart, Crosshair, Shield } from "lucide-react";
import { IUserAttributes } from "@/models/User";

interface AttributeBarProps {
  attributes: IUserAttributes;
  recentlyBumped?: {
    attribute: string;
    amount: number;
  } | null;
}

const ATTRIBUTE_CONFIG = [
  {
    key: "strength" as keyof IUserAttributes,
    label: "Strength",
    icon: Swords,
    color: "text-rose-400",
    barColor: "bg-rose-500",
  },
  {
    key: "intellect" as keyof IUserAttributes,
    label: "Intellect",
    icon: Brain,
    color: "text-sky-400",
    barColor: "bg-sky-500",
  },
  {
    key: "vitality" as keyof IUserAttributes,
    label: "Vitality",
    icon: Heart,
    color: "text-emerald-400",
    barColor: "bg-emerald-500",
  },
  {
    key: "focus" as keyof IUserAttributes,
    label: "Focus",
    icon: Crosshair,
    color: "text-amber-400",
    barColor: "bg-amber-500",
  },
  {
    key: "discipline" as keyof IUserAttributes,
    label: "Discipline",
    icon: Shield,
    color: "text-arcane-light",
    barColor: "bg-arcane",
  },
];

export default function AttributeBar({
  attributes,
  recentlyBumped,
}: AttributeBarProps) {
  const maxDisplay = 100;

  return (
    <section aria-label="Core Attributes" className="rounded-2xl border border-obsidian-800 bg-obsidian-900/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-obsidian-800 mb-5">
        <h3 className="font-display font-bold text-base tracking-wide text-white">
          CORE ATTRIBUTES
        </h3>
        <span className="text-xs font-mono text-neutral-500">Growth Matrix</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {ATTRIBUTE_CONFIG.map((attr) => {
          const Icon = attr.icon;
          const val = attributes[attr.key] || 0;
          const percentage = Math.min(100, Math.round((val / maxDisplay) * 100));
          const isBumped = recentlyBumped?.attribute === attr.key;

          return (
            <div
              key={attr.key}
              className={`relative flex flex-col rounded-xl border p-3.5 transition-all duration-300 ${
                isBumped
                  ? "border-arcane/80 bg-arcane/15 shadow-arcane scale-[1.02]"
                  : "border-obsidian-800 bg-obsidian-950/60"
              }`}
            >
              {isBumped && (
                <span className="absolute -top-2.5 right-2 rounded-full border border-arcane/60 bg-arcane px-2 py-0.5 text-[10px] font-bold text-white shadow animate-bounce">
                  +{recentlyBumped.amount}
                </span>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                  <Icon className={`h-3.5 w-3.5 ${attr.color}`} aria-hidden="true" />
                  <span>{attr.label}</span>
                </span>
                <span className={`font-display font-bold text-sm ${attr.color}`}>
                  {val}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-obsidian-900">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${attr.barColor}`}
                  style={{ width: `${Math.max(6, percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
