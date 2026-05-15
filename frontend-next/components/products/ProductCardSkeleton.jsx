import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="group block relative overflow-hidden rounded-xl bg-white border border-[#1A1515]/8 shadow-soft">
      {/* Image placeholder */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F0E6]">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        {/* Title lines */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Rating line */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Price placeholders */}
        <div className="flex items-end justify-between pt-1">
          <div className="space-y-0.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-0.5 text-right">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
