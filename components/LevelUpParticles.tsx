"use client";

import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  tx: number;
  ty: number;
  color: string;
  size: number;
}

const COLORS = ["#6366f1", "#a855f7", "#38bdf8", "#fbbf24", "#34d399"];

export default function LevelUpParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 24 lightweight radial burst particles
    const items: Particle[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * (2 * Math.PI);
      const distance = 80 + Math.random() * 90;
      items.push({
        id: i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        color: COLORS[i % COLORS.length],
        size: 5 + (i % 3) * 2,
      });
    }
    setParticles(items);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-20"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-asc-particle"
          style={
            {
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
