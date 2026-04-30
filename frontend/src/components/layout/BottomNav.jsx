import { Link, NavLink } from "react-router-dom";
import { Home, Grid3X3, Package2, Info } from "lucide-react";

const TABS = [
  { to: "/", label: "Accueil", icon: Home, end: true, testid: "tab-home" },
  { to: "/catalogue", label: "Catalogue", icon: Grid3X3, testid: "tab-catalog" },
  { to: "/tracking", label: "Tracking", icon: Package2, testid: "tab-tracking" },
  { to: "/infos", label: "Infos", icon: Info, testid: "tab-infos" },
];

export default function BottomNav() {
  return (
    <nav
      data-testid="bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[68px] glass-strong border-t border-[#D4AF37]/20 flex justify-around items-center pb-safe"
    >
      {TABS.map(({ to, label, icon: Icon, end, testid }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          data-testid={testid}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1 transition-all duration-200 ${
              isActive ? "text-[#D4AF37]" : "text-[#A19D98] hover:text-[#FDFBF7]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.6}
                className={isActive ? "drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" : ""}
              />
              <span className="text-[10px] uppercase tracking-[0.15em] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
