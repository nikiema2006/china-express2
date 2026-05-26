import { Suspense } from "react";
import CatalogContent from "./CatalogContent";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import { getProducts, CATEGORIES } from "@/services/products";

export const revalidate = 300;

function CatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
      <div className="mb-6 md:mb-10">
        <div className="h-3 w-24 mb-2 bg-gray-200 rounded" />
        <div className="h-12 w-3/4 mb-3 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="h-12 flex-1 bg-gray-200 rounded" />
        <div className="h-12 w-48 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-200 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function Catalog() {
  const products = await getProducts();

  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent initialProducts={products} categories={CATEGORIES} />
    </Suspense>
  );
}
