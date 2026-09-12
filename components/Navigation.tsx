"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { name: "Quests", href: "/dashboard" },
    { name: "Armory", href: "/armory" },
    { name: "Chronicle", href: "/chronicle" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-[#0a0a0c]/80 backdrop-blur-md px-4 py-3.5 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="text-xl font-extrabold tracking-tight text-white">
              ASCEND
            </span>
            <span className="hidden sm:inline-block rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
              LIFE RPG
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? "border border-indigo-500/30 bg-indigo-500/15 text-indigo-300 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
