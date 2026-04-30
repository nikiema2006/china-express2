import { Link, NavLink } from "react-router-dom";
import { Phone, Search } from "lucide-react";

const LOGO = "https://customer-assets.emergentagent.com/job_china-africa-trade-1/artifacts/gm0lbsx0_logochinaexpress-removebg-preview.png";

const NAV_LINKS = [
  { to: "/", label: "Accueil", end: true },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/tracking", label: "Suivre un colis" },
  { to: "/infos", label: "Comment ça marche" },
];

export default function Header() {
  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 glass-strong border-b border-[#D4AF37]/15"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo + Brand */}
        <Link to="/" data-testid="brand-logo" className="flex items-center gap-3 group">
          <img
            src={LOGO}
            alt="China Express"
            className="h-10 md:h-12 w-auto transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-lg md:text-xl text-[#FDFBF7] tracking-tight">
              China <span className="text-gold-gradient font-semibold">Express</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A19D98]">
              中国速运 · Shenzhen → Ouaga
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors relative ${
                  isActive
                    ? "text-[#D4AF37]"
                    : "text-[#A19D98] hover:text-[#FDFBF7]"
                }`
              }
            >
              {({ isActive }) => (
                <span className="relative">
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Phone CTA */}
        <a
          href="tel:+22606900288"
          data-testid="header-phone-cta"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all text-sm font-medium"
        >
          <Phone size={14} strokeWidth={2} />
          +226 06 90 02 88
        </a>

        {/* Mobile right slot — search icon */}
        <button
          data-testid="header-mobile-search"
          aria-label="Rechercher"
          className="md:hidden p-2 text-[#A19D98] hover:text-[#D4AF37] transition-colors"
        >
          <Search size={22} strokeWidth={1.7} />
        </button>
      </div>
    </header>
  );
}
