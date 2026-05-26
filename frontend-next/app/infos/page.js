import { getFAQs, getHowItWorks } from "@/services/content";
import InfosClient from "./InfosClient";

export const revalidate = 86400;

export const metadata = {
  title: "Comment ça marche",
  description: "Guide d'importation Chine → Afrique. Découvrez comment China Express vous aide à importer facilement depuis la Chine.",
  openGraph: {
    title: "Comment ça marche · China Express",
    description: "Guide d'importation Chine → Afrique.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comment ça marche · China Express",
    description: "Guide d'importation Chine → Afrique.",
  },
};

export default async function InfosPage() {
  const [faqs, howItWorks] = await Promise.all([getFAQs(), getHowItWorks()]);
  return <InfosClient initialFaqs={faqs} initialHowItWorks={howItWorks} />;
}
