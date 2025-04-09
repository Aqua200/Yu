const cooldowns = {};

const handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender];
  if (!user) return conn.reply(m.chat, '❌ No se encontraron datos de usuario.', m);

  // Verificar estado del pico
  if (!user.pickaxedurability || user.pickaxedurability <= 0) {
    return conn.reply(m.chat, '⚒️ Tu pico está roto. Repáralo o compra uno nuevo antes de minar.', m);
  }

  // Definir lugares de minería con probabilidades ajustadas
  const miningLocations = [
    { 
      name: "⛏️ Cueva",
      image: "https://files.catbox.moe/mtsv8m.jpg",
      probability: 25,
      resources: { 
        coin: [10, 50], 
        iron: [5, 20], 
        gold: [2, 10], 
        coal: [10, 50], 
        stone: [300, 800],
        emerald: { chance: 0.1, range: [1, 3] },
        diamond: { chance: 0.01, range: [1] }
      }
    },
    { 
      name: "🌋 Volcán",
      image: "https://qu.ax/CDdWW.jpeg",
      probability: 25,
      resources: { 
        coin: [30, 90], 
        iron: [15, 40], 
        gold: [10, 50], 
        coal: [30, 100], 
        stone: [700, 4000],
        emerald: { chance: 0.15, range: [1, 5] },
        diamond: { chance: 0.03, range: [1, 2] }
      }
    },
    { 
      name: "🏚️ Mina abandonada",
      image: "https://qu.ax/tZvvf.jpeg",
      probability: 20,
      resources: { 
        coin: [50, 120], 
        iron: [20, 50], 
        gold: [15, 40], 
        coal: [30, 100], 
        stone: [600, 2000],
        emerald: { chance: 0.2, range: [1, 7] },
        diamond: { chance: 0.05, range: [1, 3] }
      }
    },
    { 
      name: "🌲 Bosque subterráneo",
      image: "https://qu.ax/FzCtg.jpeg",
      probability: 15,
      resources: { 
        coin: [40, 100], 
        iron: [15, 40], 
        gold: [10, 30], 
        coal: [20, 80], 
        stone: [500, 1500],
        emerald: { chance: 0.25, range: [1, 5] },
        diamond: { chance: 0.02, range: [1] }
      }
    },
    { 
      name: "🌀 Dimensión oscura",
      image: "https://qu.ax/OLKnB.jpeg",
      probability: 15,
      resources: { 
        coin: [70, 200], 
        iron: [30, 60], 
        gold: [20, 60], 
        coal: [50, 150], 
        stone: [1000, 5000],
        emerald: { chance: 0.3, range: [1, 8] },
        diamond: { chance: 0.1, range: [1, 3] }
      }
    }
  ];

  // Verificar cooldown (10 minutos)
  const cooldownTime = 600000;
  if (user.lastmining && (Date.now() - user.lastmining < cooldownTime)) {
    const remaining = formatTime(user.lastmining + cooldownTime - Date.now());
    return conn.reply(m.chat, `⏳ Debes esperar ${remaining} para minar nuevamente.`, m);
  }

  // Seleccionar ubicación
  const location = weightedRandomSelect(miningLocations);
  
  // Obtener recursos
  const resources = {
    coin: randomInRange(location.resources.coin),
    iron: randomInRange(location.resources.iron),
    gold: randomInRange(location.resources.gold),
    coal: randomInRange(location.resources.coal),
    stone: randomInRange(location.resources.stone),
    emerald: getRandomResource(location.resources.emerald),
    diamond: getRandomResource(location.resources.diamond)
  };

  // Calcular experiencia y durabilidad
  const experience = Math.floor(Math.random() * 1000) + 100;
  const maxDurability = 100;
  const durabilityPercent = Math.max(0, (user.pickaxedurability / maxDurability) * 100);
  
  // Evento aleatorio
  const randomEvent = getRandomEvent();
  
  // Mensaje de resultado mejorado
  const resultMessage = `
🏔️ *LUGAR DE MINERÍA*: ${location.name}

📊 *RECURSOS OBTENIDOS*:
💰 Monedas: ${resources.coin}
🔩 Hierro: ${resources.iron}
🏅 Oro: ${resources.gold}
🪵 Carbón: ${resources.coal}
🪨 Piedra: ${resources.stone}
${resources.emerald > 0 ? `💚 Esmeralda: ${resources.emerald}` : ''}
${resources.diamond > 0 ? `💎 Diamante: ${resources.diamond}` : ''}

📈 *EXPERIENCIA*: +${experience}
⚒️ *DURABILIDAD*: ${durabilityPercent.toFixed(0)}%

✨ *EVENTO*: ${randomEvent.text}
`.trim();

  try {
    await conn.sendFile(m.chat, location.image, 'mining.jpg', resultMessage, m);
    await m.react('⛏️');
    
    // Actualizar datos del usuario
    user.health = Math.max(0, user.health - 30);
    user.pickaxedurability = Math.max(0, user.pickaxedurability - 20);
    user.coin += resources.coin;
    user.iron += resources.iron;
    user.gold += resources.gold;
    user.emerald += resources.emerald;
    user.coal += resources.coal;
    user.stone += resources.stone;
    user.diamond += resources.diamond;
    user.exp += experience;
    user.lastmining = Date.now();

    // Aplicar efectos del evento
    if (randomEvent.effect) {
      if (randomEvent.effect.coins) user.coin += randomEvent.effect.coins;
      if (randomEvent.effect.exp) user.exp += randomEvent.effect.exp;
      if (randomEvent.effect.health) user.health = Math.min(100, user.health + randomEvent.effect.health);
    }

    // Advertencias de durabilidad
    if (user.pickaxedurability <= 20 && user.pickaxedurability > 0) {
      await conn.reply(m.chat, '⚠️ ¡Cuidado! Tu pico está a punto de romperse (Durabilidad < 20%).', m);
      await m.react('⚠️');
    } else if (user.pickaxedurability <= 0) {
      await conn.reply(m.chat, '💥 Tu pico se ha roto. Necesitas repararlo o comprar uno nuevo.', m);
      await m.react('💥');
    }
    
  } catch (error) {
    console.error('Error en el comando minar:', error);
    conn.reply(m.chat, '❌ Ocurrió un error al procesar la minería. Intenta nuevamente.', m);
  }
};

// Funciones auxiliares mejoradas
function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24;
  
  return [
    hours > 0 ? `${hours}h` : '',
    minutes > 0 ? `${minutes}m` : '',
    seconds > 0 ? `${seconds}s` : ''
  ].filter(Boolean).join(' ') || '0s';
}

function randomInRange([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomResource({ chance = 0, range = [0] }) {
  return Math.random() < chance ? randomInRange(range) : 0;
}

function weightedRandomSelect(items) {
  const total = items.reduce((sum, item) => sum + item.probability, 0);
  let random = Math.random() * total;
  
  for (const item of items) {
    if (random < item.probability) return item;
    random -= item.probability;
  }
  
  return items[items.length - 1];
}

function getRandomEvent() {
  const events = [
    { 
      text: '¡Encontraste un cofre con monedas escondido!', 
      effect: { coins: randomInRange([50, 200]) } 
    },
    { 
      text: '¡Tu pico brilló y ganaste experiencia extra!', 
      effect: { exp: randomInRange([100, 500]) } 
    },
    { 
      text: '¡Descansaste en una caverna y recuperaste salud!', 
      effect: { health: randomInRange([10, 30]) } 
    },
    { 
      text: 'Nada especial ocurrió durante esta expedición.', 
      effect: {} 
    },
    { 
      text: '¡Encontraste una veta rica en minerales!', 
      effect: { 
        coins: randomInRange([20, 100]),
        exp: randomInRange([50, 150])
      } 
    }
  ];
  return events[Math.floor(Math.random() * events.length)];
}

handler.command = ['minar', 'mine', 'mining'];
handler.tags = ['rpg', 'game'];
handler.help = ['minar - Inicia una sesión de minería para obtener recursos'];
handler.register = true;
handler.cooldown = 600000; // 10 minutos
export default handler;
