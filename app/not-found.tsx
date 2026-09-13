import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export const metadata = {
  title: "404 — Void Uncharted | ASCEND",
  description: "The realm you seek does not exist or has been reclaimed by the void.",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-obsidian-950 px-6 text-center bg-arcane-radial bg-rpg-grid">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[550px] -translate-x-1/2 rounded-full bg-arcane/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-obsidian-750 bg-obsidian-900/90 text-arcane-light shadow-arcane-sm mb-6">
          <Logo size={32} variant="accent" />
        </div>

        <span className="font-mono text-xs font-bold uppercase tracking-widest text-arcane-light mb-2">
          ERROR 404 • VOID DETECTED
        </span>

        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-wide text-white">
          REALM UNCHARTED
        </h1>

        <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
          The sanctuary or trial coordinates you seek have dissolved into the cosmic ether.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-arcane hover:bg-arcane-dark py-3 px-5 text-xs font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98]"
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            <span>RETURN TO COMMAND NEXUS</span>
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-obsidian-750 bg-obsidian-900/80 hover:bg-obsidian-850 py-3 px-5 text-xs font-display font-bold tracking-wider text-neutral-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>PORTAL HOME</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
