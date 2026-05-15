"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Search } from "lucide-react";

const LOGO = "https://customer-assets.emergentagent.com/job_china-africa-trade-1/artifacts/gm0lbsx0_logochinaexpress-removebg-preview.png";

const NAV_LINKS = [
  { to: "/", label: "Accueil", end: true },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/tracking", label: "Suivre un colis" },
  { to: "/infos", label: "Comment ça marche" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 glass-strong border-b border-[#B8941E]/15"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" data-testid="brand-logo" className="flex items-center gap-3 group">
          <img
            src={LOGO}
            alt="China Express"
            className="h-10 md:h-12 w-auto transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-lg md:text-xl text-[#1A1515] tracking-tight">
              China <span className="text-gold-gradient font-semibold">Express</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854]">
              中国速运 · Shenzhen → Ouaga
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
          {NAV_LINKS.map(({ to, label, end }) => {
            const isActive = end ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                href={to}
                className={`text-sm tracking-wide transition-colors relative ${
                  isActive
                    ? "text-[#B8941E]"
                    : "text-[#5C5854] hover:text-[#1A1515]"
                }`}
              >
                <span className="relative">
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B8941E] to-transparent" />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <a
          href="tel:+22606900288"
          data-testid="header-phone-cta"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#B8941E]/40 text-[#B8941E] hover:bg-[#B8941E]/10 transition-all text-sm font-medium"
        >
          <Phone size={14} strokeWidth={2} />
          +226 06 90 02 88
        </a>

        <button
          data-testid="header-mobile-search"
          aria-label="Rechercher"
          className="md:hidden p-2 text-[#5C5854] hover:text-[#B8941E] transition-colors"
        >
          <Search size={22} strokeWidth={1.7} />
        </button>
      </div>
    </header>
  );
}
