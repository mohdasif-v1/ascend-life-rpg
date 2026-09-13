"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Compass, Scroll, LogOut } from "lucide-react";
import LogoutButton from "./LogoutButton";
import Logo from "./Logo";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: Compass },
    { name: "Armory", href: "/armory", icon: Shield },
    { name: "Chronicle", href: "/chronicle", icon: Scroll },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-obsidian-800 bg-obsidian-950/90 backdrop-blur-md px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane rounded-lg py-1 px-1.5 -ml-1.5 transition hover:opacity-90"
          >
            <Logo size={28} variant="accent" />
            <span className="font-display font-black text-xl tracking-wider text-white">
              ASCEND
            </span>
          </Link>

          {/* Navigation Links with real Lucide icons */}
          <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane ${
                    isActive
                      ? "border border-arcane/40 bg-arcane/15 text-arcane-light shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-obsidian-850"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{link.name}</span>
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
