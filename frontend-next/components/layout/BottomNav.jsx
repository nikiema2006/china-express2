"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Grid3X3, Package2, Info } from "lucide-react";

const TABS = [
  { to: "/", label: "Accueil", icon: Home, end: true, testid: "tab-home" },
  { to: "/catalogue", label: "Catalogue", icon: Grid3X3, testid: "tab-catalog" },
  { to: "/tracking", label: "Tracking", icon: Package2, testid: "tab-tracking" },
  { to: "/infos", label: "Infos", icon: Info, testid: "tab-infos" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      data-testid="bottom-nav"
      className="md:hidden fixed bottom-safe left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/90 backdrop-blur-2xl border border-[#1A1515]/8 shadow-elev">
        {TABS.map(({ to, label, icon: Icon, end, testid }) => {
          const isActive = end ? pathname === to : pathname.startsWith(to) && to !== "/";
          return (
            <Link key={to} href={to} data-testid={testid} className="relative">
              <div
                className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full transition-colors duration-200 ${
                  isActive ? "text-white" : "text-[#5C5854] hover:text-[#1A1515]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C8102E] to-[#A60D26] glow-red"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.7} className="relative z-10" />
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={{ duration: 0.18, delay: 0.08 }}
                    className="relative z-10 text-xs font-semibold tracking-tight whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
