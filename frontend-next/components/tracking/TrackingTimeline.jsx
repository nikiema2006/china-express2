"use client";

import { motion } from "framer-motion";
import { Check, Circle, Package, Warehouse, Plane, FileCheck, CheckCircle2 } from "lucide-react";

const ICONS = { Package, Warehouse, Plane, FileCheck, CheckCircle2 };

export default function TrackingTimeline({ steps, currentStep, updatedAt }) {
  if (!steps || steps.length === 0) return null;

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div data-testid="tracking-timeline" className="space-y-1">
      {steps.map((step, i) => {
        const isCompleted = i < currentStepIndex;
        const isActive = i === currentStepIndex;
        const Icon = ICONS[step.icon] || Circle;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-4"
            data-testid={`timeline-step-${step.id}`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-[#B8941E] border-[#B8941E] text-[#1A1515] shadow-[0_0_18px_rgba(212,175,55,0.5)]"
                    : isActive
                    ? "bg-[#C8102E] border-[#C8102E] text-white shadow-[0_0_18px_rgba(200,16,46,0.5)] animate-pulse"
                    : "bg-[#F5F0E6] border-[#E5DCC9] text-[#8A857F]"
                }`}
              >
                {isCompleted ? <Check size={18} strokeWidth={2.5} /> : <Icon size={18} strokeWidth={1.7} />}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-px flex-1 min-h-[44px] my-1 ${
                    isCompleted ? "bg-[#B8941E]" : "bg-[#E5DCC9]"
                  }`}
                />
              )}
            </div>

            <div className="pb-6 flex-1">
              <p
                className={`font-display text-base md:text-lg ${
                  isCompleted || isActive ? "text-[#1A1515]" : "text-[#8A857F]"
                }`}
              >
                {step.label}
              </p>
              <p className="text-sm text-[#5C5854] mt-0.5 leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        );
      })}

      {updatedAt && (
        <p className="text-xs text-[#8A857F] mt-2 pl-15">
          Dernière mise à jour : {new Date(updatedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
