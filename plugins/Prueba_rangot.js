// plugins/_rango-teibol.js

export function rangoTeibol(coin) {
  if (coin >= 1000000) return '✨ Reina del Teibol'
  if (coin >= 500000) return '💎 Diva del Escenario'
  if (coin >= 100000) return '🔥 Estrella Emergente'
  if (coin >= 50000) return '🌟 Bailarina Profesional'
  if (coin >= 10000) return '🎀 Novata Brillante'
  return '👠 Principiante'
}
