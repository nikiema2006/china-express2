"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link2, Handshake, Send, PackageCheck, Phone, MessageCircle, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getFAQs, getHowItWorks } from "@/services/content";

const ICONS = { Link2, Handshake, Send, PackageCheck };

export default function InfosClient({ initialFaqs, initialHowItWorks }) {
  const faqs = initialFaqs || [];
  const howItWorks = initialHowItWorks || [];

  return (
    <div data-testid="infos-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">
      <div className="text-center mb-12 md:mb-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-3">Comment ça marche</p>
        <h1 className="font-display text-3xl md:text-5xl text-[#1A1515] mb-4 leading-tight">
          De ton lien Alibaba à <span className="text-gold-gradient">ton colis livré.</span>
        </h1>
        <p className="text-sm md:text-base text-[#5C5854] max-w-2xl mx-auto leading-relaxed">
          China Express est né d&apos;un constat simple : pourquoi payer 3× plus cher ce qui coûte 3× moins à la source ? On est le pont entre les usines chinoises et ton business en Afrique. Plus d&apos;arnaque, plus de &quot;désolé c&apos;est cassé&quot;.
        </p>
      </div>

      <section className="mb-16 md:mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {howItWorks.map((step, i) => {
            const Icon = ICONS[step.icon];
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                data-testid={`how-step-${step.step}`}
                className="relative rounded-2xl bg-[#FFFFFF] border border-[#1A1515]/8 p-6 hover:border-[#B8941E]/30 transition-all"
              >
                <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-gradient-to-br from-[#B8941E] to-[#8C6E15] flex items-center justify-center text-[#FDFBF7] font-display font-bold text-lg shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  {step.step}
                </div>
                <Icon size={28} className="text-[#B8941E] mb-4 mt-2" strokeWidth={1.5} />
                <h3 className="font-display text-xl text-[#1A1515] mb-2">{step.title}</h3>
                <p className="text-sm text-[#5C5854] leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mb-16 md:mb-24 rounded-2xl bg-gradient-to-br from-[#FFFFFF] to-[#F9F4EA] border border-[#B8941E]/15 p-6 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-2">Modes d&apos;expédition</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1A1515] mb-6">Comparatif transport</h2>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#B8941E]/15 text-[#5C5854]">
                <th className="text-left py-3 px-3 font-medium uppercase tracking-wider text-[10px]">Type</th>
                <th className="text-left py-3 px-3 font-medium uppercase tracking-wider text-[10px]">Délai</th>
                <th className="text-left py-3 px-3 font-medium uppercase tracking-wider text-[10px]">Tarif</th>
                <th className="text-left py-3 px-3 font-medium uppercase tracking-wider text-[10px]">Idéal pour</th>
              </tr>
            </thead>
            <tbody className="text-[#1A1515]">
              <tr className="border-b border-[#1A1515]/8">
                <td className="py-4 px-3 font-display">Maritime</td>
                <td className="py-4 px-3 font-mono">45–60 jours</td>
                <td className="py-4 px-3 font-mono text-[#1F6B23]">235 000 FCFA/CBM</td>
                <td className="py-4 px-3 text-[#5C5854]">Gros volumes, meubles, conteneurs</td>
              </tr>
              <tr className="border-b border-[#1A1515]/8 bg-[#B8941E]/5">
                <td className="py-4 px-3 font-display text-[#B8941E]">Aérien Standard ★</td>
                <td className="py-4 px-3 font-mono">12–18 jours</td>
                <td className="py-4 px-3 font-mono text-[#B8941E]">10 000–12 000 FCFA/kg</td>
                <td className="py-4 px-3 text-[#5C5854]">Le bon compromis pour la majorité des commandes et petits colis</td>
              </tr>
              <tr>
                <td className="py-4 px-3 font-display">Aérien Express</td>
                <td className="py-4 px-3 font-mono">5–8 jours</td>
                <td className="py-4 px-3 font-mono text-[#A8141B]">14 000 FCFA/kg</td>
                <td className="py-4 px-3 text-[#5C5854]">Échantillons, urgences, petits colis</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-16">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-2">FAQ</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1A1515] mb-6">Tes questions, nos réponses.</h2>

        <Accordion type="single" collapsible className="space-y-2" data-testid="faq-accordion">
          {faqs.map((item, index) => (
            <AccordionItem
              key={item.id}
              value={`faq-${item.id}`}
              className="border border-[#1A1515]/8 rounded-xl bg-[#FFFFFF] hover:border-[#B8941E]/25 transition-colors data-[state=open]:border-[#B8941E]/40 data-[state=open]:bg-[#F5F0E6] px-5"
              data-testid={`faq-item-${index}`}
            >
              <AccordionTrigger className="text-left text-[#1A1515] hover:text-[#B8941E] hover:no-underline py-5 font-display text-base md:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#5C5854] text-sm leading-relaxed pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mb-16 rounded-2xl bg-gradient-to-br from-[#C8102E]/15 to-[#F9F4EA] border border-[#C8102E]/30 p-6 md:p-10 text-center">
        <h2 className="font-display text-2xl md:text-3xl text-[#1A1515] mb-3">
          Encore une question ?
        </h2>
        <p className="text-sm md:text-base text-[#5C5854] mb-6 max-w-md mx-auto">
          On répond plus vite que la lumière sur WhatsApp. Envoie-nous un lien, une photo, une idée — on s&apos;occupe du reste.
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
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#B8941E] text-[#B8941E] rounded-md font-semibold hover:bg-[#B8941E]/10 transition-all text-sm uppercase tracking-wider"
          >
            <Phone size={16} /> +226 06 90 02 88
          </a>
          <a
            href="tel:+22607336700"
            data-testid="infos-call2-cta"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#B8941E]/40 text-[#5C5854] rounded-md font-semibold hover:text-[#B8941E] hover:border-[#B8941E] transition-all text-sm uppercase tracking-wider"
          >
            <Phone size={16} /> +226 07 33 67 00
          </a>
        </div>
      </section>

      <div className="h-12" />
    </div>
  );
}
