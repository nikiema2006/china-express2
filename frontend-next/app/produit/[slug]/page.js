import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { getProductBySlug, getRelatedProducts } from "@/services/products";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  try {
    const product = await getProductBySlug(slug);
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    return {
      title: `${product.name} · China Express`,
      description: product.description,
      keywords: [product.name, product.category, "importation chine afrique", "chinois produits"],
      openGraph: {
        title: `${product.name} · China Express`,
        description: product.description,
        url: `${siteUrl}/produit/${slug}`,
        siteName: "China Express",
        images: [
          {
            url: product.images[0],
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} · China Express`,
        description: product.description,
        images: [product.images[0]],
      },
    };
  } catch (error) {
    return {
      title: "Produit non trouvé",
      description: "Ce produit n'est pas disponible.",
    };
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    const relatedProducts = await getRelatedProducts(product.id, product.category, 4);

    return <ProductDetailClient product={product} related={relatedProducts} />;
  } catch (error) {
    notFound();
  }
}
