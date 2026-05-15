import { Skeleton } from "@/components/ui/skeleton";

export default function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden h-[78vh] min-h-[540px] md:h-[88vh] md:min-h-[620px] bg-[#FDFBF7]">
      {/* Background image placeholder */}
      <div className="absolute inset-0">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/0 to-[#FDFBF7]/0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl space-y-6 md:space-y-8">
          {/* Tagline placeholder */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#B8941E]/30">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Title placeholders */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-full md:w-4/5" />
            <Skeleton className="h-12 w-3/5" />
          </div>

          {/* Description placeholders */}
          <div className="space-y-2 max-w-xl">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Price placeholders */}
          <div className="flex items-end gap-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="hidden sm:block w-px h-12 bg-[#B8941E]/20" />
            <div className="hidden sm:block space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>

          {/* CTA button placeholders */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>

      {/* Slide indicators placeholder */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 flex gap-2 z-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className={`h-1 rounded-full ${i === 0 ? "w-10" : "w-5"}`} />
        ))}
      </div>
    </section>
  );
}
