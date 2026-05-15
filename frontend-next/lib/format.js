export function formatXOF(amount) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function formatPct(value) {
  if (value == null || isNaN(value)) return '0%';
  return `${Number(value).toFixed(0)}%`;
}
