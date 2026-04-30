import { motion } from "framer-motion";
import { Link2, Handshake, Send, PackageCheck, Phone, MessageCircle, Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { FAQS, HOW_IT_WORKS } from "../data/faqs";

const ICONS = { Link2, Handshake, Send, PackageCheck };

export default function Infos() {
  return (
    <div data-testid="infos-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">
      {/* Hero */}
      <div className="text-center mb-12 md:mb-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Comment ça marche</p>
        <h1 className="font-display text-3xl md:text-5xl text-[#FDFBF7] mb-4 leading-tight">
          De ton lien Alibaba à <span className="text-gold-gradient">ton colis livré.</span>
        </h1>
        <p className="text-sm md:text-base text-[#A19D98] max-w-2xl mx-auto leading-relaxed">
          China Express est né d'un constat simple : pourquoi payer 3× plus cher ce qui coûte 3× moins à la source ? On est le pont entre les usines chinoises et ton business en Afrique. Plus d'arnaque, plus de "désolé c'est cassé".
        </p>
      </div>

      {/* Steps */}
      <section className="mb-16 md:mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = ICONS[step.icon];
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                data-testid={`how-step-${step.step}`}
                className="relative rounded-2xl bg-[#141010] border border-white/5 p-6 hover:border-[#D4AF37]/30 transition-all"
              >
                <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center text-[#0A0A0A] font-display font-bold text-lg shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  {step.step}
                </div>
                <Icon size={28} className="text-[#D4AF37] mb-4 mt-2" strokeWidth={1.5} />
                <h3 className="font-display text-xl text-[#FDFBF7] mb-2">{step.title}</h3>
                <p className="text-sm text-[#A19D98] leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Transport comparison */}
      <section className="mb-16 md:mb-24 rounded-2xl bg-gradient-to-br from-[#141010] to-[#0F0C0C] border border-[#D4AF37]/15 p-6 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-2">Modes d'expédition</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#FDFBF7] mb-6">Comparatif transport</h2>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#D4AF37]/15 text-[#A19D98]">
                <th className="text-left py-3 px-3 font-medium uppercase tracking-wider text-[10px]">Type</th>
                <th className="text-left py-3 px-3 font-medium uppercase tracking-wider text-[10px]">Délai</th>
                <th className="text-left py-3 px-3 font-medium uppercase tracking-wider text-[10px]">Tarif</th>
                <th className="text-left py-3 px-3 font-medium uppercase tracking-wider text-[10px]">Idéal pour</th>
              </tr>
            </thead>
            <tbody className="text-[#FDFBF7]">
              <tr className="border-b border-white/5">
                <td className="py-4 px-3 font-display">Maritime</td>
                <td className="py-4 px-3 font-mono">35–50 jours</td>
                <td className="py-4 px-3 font-mono text-[#5DBA67]">1 200 FCFA / kg</td>
                <td className="py-4 px-3 text-[#A19D98]">Gros volumes, meubles, conteneurs</td>
              </tr>
              <tr className="border-b border-white/5 bg-[#D4AF37]/5">
                <td className="py-4 px-3 font-display text-[#D4AF37]">Aérien Standard ★</td>
                <td className="py-4 px-3 font-mono">12–18 jours</td>
                <td className="py-4 px-3 font-mono text-[#D4AF37]">4 800 FCFA / kg</td>
                <td className="py-4 px-3 text-[#A19D98]">Le bon compromis pour la majorité des commandes</td>
              </tr>
              <tr>
                <td className="py-4 px-3 font-display">Aérien Express</td>
                <td className="py-4 px-3 font-mono">5–8 jours</td>
                <td className="py-4 px-3 font-mono text-[#FF6B6B]">7 500 FCFA / kg</td>
                <td className="py-4 px-3 text-[#A19D98]">Échantillons, urgences, petits colis</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-2">FAQ</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#FDFBF7] mb-6">Tes questions, nos réponses.</h2>

        <Accordion type="single" collapsible className="space-y-2" data-testid="faq-accordion">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-white/5 rounded-xl bg-[#141010] hover:border-[#D4AF37]/25 transition-colors data-[state=open]:border-[#D4AF37]/40 data-[state=open]:bg-[#1A1515] px-5"
              data-testid={`faq-item-${i}`}
            >
              <AccordionTrigger className="text-left text-[#FDFBF7] hover:text-[#D4AF37] hover:no-underline py-5 font-display text-base md:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#A19D98] text-sm leading-relaxed pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Contact */}
      <section className="mb-16 rounded-2xl bg-gradient-to-br from-[#C8102E]/15 to-[#0F0C0C] border border-[#C8102E]/30 p-6 md:p-10 text-center">
        <h2 className="font-display text-2xl md:text-3xl text-[#FDFBF7] mb-3">
          Encore une question ?
        </h2>
        <p className="text-sm md:text-base text-[#A19D98] mb-6 max-w-md mx-auto">
          On répond plus vite que la lumière sur WhatsApp. Envoie-nous un lien, une photo, une idée — on s'occupe du reste.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/22606900288"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="infos-whatsapp-cta"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#25D366] to-[#1FAA53] text-white rounded-md font-semibold hover:brightness-110 transition-all text-sm uppercase tracking-wider"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a
            href="tel:+22606900288"
            data-testid="infos-call-cta"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#D4AF37] text-[#D4AF37] rounded-md font-semibold hover:bg-[#D4AF37]/10 transition-all text-sm uppercase tracking-wider"
          >
            <Phone size={16} /> +226 06 90 02 88
          </a>
          <a
            href="tel:+22607336700"
            data-testid="infos-call2-cta"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#D4AF37]/40 text-[#A19D98] rounded-md font-semibold hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all text-sm uppercase tracking-wider"
          >
            <Phone size={16} /> +226 07 33 67 00
          </a>
        </div>
      </section>

      <div className="h-12" />
    </div>
  );
}
