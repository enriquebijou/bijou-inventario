/**
 * Formatea un número con comas en los miles y símbolo de Quetzales
 * Ej: 1234.56 -> "Q1,234.56"
 */
export function formatMoney(value) {
  const num = parseFloat(value) || 0;
  return 'Q' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Formatea un número con comas en los miles (sin símbolo)
 * Ej: 1234 -> "1,234"
 */
export function formatNumber(value) {
  const num = parseInt(value) || 0;
  return num.toLocaleString('en-US');
}
