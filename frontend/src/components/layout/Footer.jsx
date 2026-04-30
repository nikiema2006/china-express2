import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";

const LOGO = "https://customer-assets.emergentagent.com/job_china-africa-trade-1/artifacts/gm0lbsx0_logochinaexpress-removebg-preview.png";

export default function Footer() {
  return (
    <footer
      data-testid="site-footer"
      className="hidden md:block relative border-t border-[#D4AF37]/15 bg-[#0A0A0A] mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="China Express" className="h-12 w-auto" />
            <div>
              <p className="font-display text-xl">
                China <span className="text-gold-gradient font-semibold">Express</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#A19D98]">中国速运</p>
            </div>
          </div>
          <p className="text-sm text-[#A19D98] leading-relaxed">
            Le pont entre les usines chinoises et ton business en Afrique. De Shenzhen à Ouaga, sans stress.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-4">Pages</p>
          <ul className="space-y-2 text-sm text-[#A19D98]">
            <li><a href="/" className="hover:text-[#FDFBF7]">Accueil</a></li>
            <li><a href="/catalogue" className="hover:text-[#FDFBF7]">Catalogue</a></li>
            <li><a href="/tracking" className="hover:text-[#FDFBF7]">Suivre un colis</a></li>
            <li><a href="/infos" className="hover:text-[#FDFBF7]">Comment ça marche</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-[#A19D98]">
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-[#D4AF37]" />
              <a href="tel:+22606900288" className="hover:text-[#FDFBF7]">+226 06 90 02 88</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-[#D4AF37]" />
              <a href="tel:+22607336700" className="hover:text-[#FDFBF7]">+226 07 33 67 00</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle size={14} className="text-[#D4AF37]" />
              <a href="https://wa.me/22606900288" className="hover:text-[#FDFBF7]">WhatsApp business</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-[#D4AF37]" />
              <span>Ouagadougou, Burkina Faso</span>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-4">Notre promesse</p>
          <p className="text-sm text-[#A19D98] leading-relaxed">
            Un phénix qui porte tes colis. Un partenaire qui porte ton business.
          </p>
          <p className="text-sm text-[#FDFBF7] mt-3 font-display italic">
            « L'Afrique se fournit en Chine. »
          </p>
        </div>
      </div>

      <div className="border-t border-[#D4AF37]/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#75716C]">
          <p>© 2026 China Express. Tous droits réservés.</p>
          <p className="font-mono tracking-wider">中国速运 · Shenzhen → Ouagadougou</p>
        </div>
      </div>
    </footer>
  );
}
