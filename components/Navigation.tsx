"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Compass, Scroll, Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";
import Logo from "./Logo";

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: Compass },
    { name: "Armory", href: "/armory", icon: Shield },
    { name: "Chronicle", href: "/chronicle", icon: Scroll },
  ];

  // Close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key and focus trap when drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        toggleButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-obsidian-800 bg-obsidian-950/90 backdrop-blur-md px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane rounded-lg py-1 px-1.5 -ml-1.5 transition hover:opacity-90 min-h-[44px] min-w-[44px]"
            aria-label="ASCEND Command Nexus Home"
          >
            <Logo size={28} variant="accent" />
            <span className="font-display font-black text-xl tracking-wider text-white">
              ASCEND
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Desktop Navigation" className="hidden md:flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane min-h-[38px] ${
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

        {/* Desktop Logout & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <LogoutButton />
          </div>

          <button
            ref={toggleButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-obsidian-750 bg-obsidian-900 text-neutral-300 hover:text-white hover:bg-obsidian-850 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="md:hidden mt-3 border-t border-obsidian-800/80 pt-3 pb-2 space-y-2 animate-asc-modal"
        >
          <nav aria-label="Mobile Navigation Links" className="flex flex-col space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane min-h-[44px] ${
                    isActive
                      ? "border border-arcane/40 bg-arcane/20 text-arcane-light shadow-sm"
                      : "text-neutral-300 hover:bg-obsidian-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 text-arcane-light" aria-hidden="true" />
                  <span className="font-display font-semibold tracking-wide">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-obsidian-850 flex justify-end">
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  );
}

