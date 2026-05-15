import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
      {/* Back link placeholder */}
      <div className="mb-6">
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Top section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Images section */}
        <div>
          {/* Main image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#1A1515]/8 mb-3">
            <Skeleton className="w-full h-full rounded-none" />
          </div>
          {/* Thumbnail images */}
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-1 aspect-square rounded-lg overflow-hidden border border-[#1A1515]/8">
                <Skeleton className="w-full h-full rounded-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Info section */}
        <div className="space-y-6">
          {/* Category and title */}
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          </div>

          {/* Rating placeholder */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3.5 w-3.5" />
            ))}
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Description placeholders */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Pricing blocks */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#FFFFFF] border border-[#1A1515]/8 p-5 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#B8941E]/10 to-transparent border border-[#B8941E]/30 p-5 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-[#F5F0E6] border border-[#1A1515]/8 p-3 space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-full sm:w-40" />
          </div>
        </div>
      </div>

      {/* Profit calculator section placeholder */}
      <div className="mb-16">
        <div className="mb-5 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="rounded-xl bg-[#FFFFFF] border border-[#1A1515]/8 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      {/* Related products section placeholder */}
      <section className="mb-16">
        <Skeleton className="h-8 w-64 mb-5" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-[#1A1515]/8 shadow-soft overflow-hidden">
              <div className="aspect-[4/5] bg-[#F5F0E6]">
                <Skeleton className="w-full h-full rounded-none" />
              </div>
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-32" />
                <div className="flex justify-between pt-1">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-12" />
    </div>
  );
}
