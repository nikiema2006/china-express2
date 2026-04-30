// Mock tracking data
export const TRACKING_STATUSES = [
  { id: "preparation", label: "En préparation", description: "Commande reçue, vérification fournisseur en cours.", icon: "Package" },
  { id: "shipped", label: "Expédié de Chine", description: "Le colis a quitté l'entrepôt de Shenzhen.", icon: "Warehouse" },
  { id: "transit", label: "En transit", description: "Acheminement vers l'Afrique.", icon: "Plane" },
  { id: "customs", label: "Dédouanement", description: "Formalités douanières à Ouagadougou.", icon: "FileCheck" },
  { id: "delivered", label: "Livré", description: "Colis remis au destinataire.", icon: "CheckCircle2" },
];

export const MOCK_TRACKINGS = {
  "CE2026A1": {
    code: "CE2026A1",
    product: "Lot écouteurs Pro X9 (50 unités)",
    weight: "9 kg",
    transport: "Aérien Standard",
    origin: "Shenzhen, Chine",
    destination: "Ouagadougou, Burkina Faso",
    estimatedDelivery: "12 mars 2026",
    currentStep: 2, // index 0-based of TRACKING_STATUSES
    history: [
      { step: 0, date: "28/02/2026 09:14", note: "Commande validée." },
      { step: 1, date: "03/03/2026 18:42", note: "Expédié — vol CZ8472." },
      { step: 2, date: "07/03/2026 04:30", note: "Hub Addis-Abeba — en route Ouaga." },
    ],
  },
  "CE2026B7": {
    code: "CE2026B7",
    product: "Container partiel — Tissus Wax (200kg)",
    weight: "200 kg",
    transport: "Maritime",
    origin: "Port de Shanghai",
    destination: "Port de Lomé → Ouagadougou",
    estimatedDelivery: "15 avril 2026",
    currentStep: 1,
    history: [
      { step: 0, date: "20/02/2026 11:00", note: "Commande consolidée." },
      { step: 1, date: "01/03/2026 06:00", note: "Embarqué sur le navire MAERSK SHANGHAI." },
    ],
  },
  "CE2026D3": {
    code: "CE2026D3",
    product: "Montres connectées S9 (30 unités)",
    weight: "7 kg",
    transport: "Aérien Express",
    origin: "Shenzhen, Chine",
    destination: "Ouagadougou, Burkina Faso",
    estimatedDelivery: "Livré",
    currentStep: 4,
    history: [
      { step: 0, date: "18/02/2026 10:00", note: "Commande validée." },
      { step: 1, date: "19/02/2026 22:00", note: "Décollage Shenzhen." },
      { step: 2, date: "21/02/2026 14:30", note: "Arrivée Ouagadougou." },
      { step: 3, date: "22/02/2026 09:15", note: "Dédouanement effectué." },
      { step: 4, date: "22/02/2026 16:40", note: "Livré au client." },
    ],
  },
};
