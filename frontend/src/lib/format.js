// Format helpers for XOF (FCFA) and percentages

export const formatXOF = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const rounded = Math.round(Number(value));
  // Format with French locale (espace insécable comme séparateur)
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(rounded) + " FCFA";
};

export const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(Number(value)));
};

export const formatPct = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${(Number(value) * 100).toFixed(1)} %`;
};
