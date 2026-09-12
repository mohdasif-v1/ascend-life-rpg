import React from "react";
import { IUserAttributes } from "@/models/User";

interface AttributeBarProps {
  attributes: IUserAttributes;
  recentlyBumped?: {
    attribute: string;
    amount: number;
  } | null;
}

const ATTRIBUTE_CONFIG: {
  key: keyof IUserAttributes;
  label: string;
  icon: string;
  color: string;
  barColor: string;
}[] = [
  {
    key: "strength",
    label: "Strength",
    icon: "⚔️",
    color: "text-rose-400",
    barColor: "bg-rose-500",
  },
  {
    key: "intellect",
    label: "Intellect",
    icon: "🧠",
    color: "text-sky-400",
    barColor: "bg-sky-500",
  },
  {
    key: "vitality",
    label: "Vitality",
    icon: "💚",
    color: "text-emerald-400",
    barColor: "bg-emerald-500",
  },
  {
    key: "focus",
    label: "Focus",
    icon: "🎯",
    color: "text-amber-400",
    barColor: "bg-amber-500",
  },
  {
    key: "discipline",
    label: "Discipline",
    icon: "🛡️",
    color: "text-purple-400",
    barColor: "bg-purple-500",
  },
];

export default function AttributeBar({
  attributes,
  recentlyBumped,
}: AttributeBarProps) {
  const maxDisplay = 100;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
          Attributes
        </h3>
        <span className="text-xs font-mono text-neutral-500">Core Matrix</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {ATTRIBUTE_CONFIG.map((attr) => {
          const val = attributes[attr.key] || 0;
          const percentage = Math.min(100, Math.round((val / maxDisplay) * 100));
          const isBumped = recentlyBumped?.attribute === attr.key;

          return (
            <div
              key={attr.key}
              className={`relative flex flex-col rounded-xl border p-3.5 transition-all duration-500 ${
                isBumped
                  ? "border-indigo-500/70 bg-indigo-950/20 shadow-lg shadow-indigo-500/10 scale-[1.02]"
                  : "border-neutral-800/80 bg-neutral-950/50"
              }`}
            >
              {/* Attribute bump tag */}
              {isBumped && (
                <span className="absolute -top-2.5 right-2 rounded-full border border-indigo-500/50 bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow animate-bounce">
                  +{recentlyBumped.amount}
                </span>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
                  <span>{attr.icon}</span>
                  <span>{attr.label}</span>
                </span>
                <span className={`font-mono text-xs font-bold ${attr.color}`}>
                  {val}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-900">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${attr.barColor}`}
                  style={{ width: `${Math.max(5, percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
