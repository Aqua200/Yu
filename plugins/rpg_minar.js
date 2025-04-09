const cooldowns = {};

const handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender];
  if (!user) return;

  // Verificar estado del pico
  if (!user.pickaxedurability || user.pickaxedurability <= 0) {
    return conn.reply(m.chat, '⚒️ Tu pico está roto. Repáralo o compra uno nuevo antes de minar.', m);
  }

  // Definir lugares de minería
  const miningLocations = [
    { 
      name: "⛏️ Cueva",
      image: "https://files.catbox.moe/mtsv8m.jpg",
      probability: 25,
      resources: { coin: [10, 50], iron: [5, 20], gold: [2, 10], coal: [10, 50], stone: [300, 800] }
    },
    { 
      name: "🌋 Volcán",
      image: "https://qu.ax/CDdWW.jpeg",
      probability: 25,
      resources: { coin: [30, 90], iron: [15, 40], gold: [10, 50], coal: [30, 100], stone: [700, 4000] }
    },
    { 
      name: "🏚️ Mina abandonada",
      image: "https://qu.ax/tZvvf.jpeg",
      probability: 50,
      resources: { coin: [50, 120], iron: [20, 50], gold: [15, 40], coal: [30, 100], stone: [600, 2000] }
    },
    { 
      name: "🌲 Bosque subterráneo",
      image: "https://qu.ax/FzCtg.jpeg",
      probability: 50,
      resources: { coin: [40, 100], iron: [15, 40], gold: [10, 30], coal: [20, 80], stone: [500, 1500] }
    },
    { 
      name: "🌀 Dimensión oscura",
      image: "https://qu.ax/OLKnB.jpeg",
      probability: 50,
      resources: { coin: [70, 200], iron: [30, 60], gold: [20, 60], coal: [50, 150], stone: [1000, 5000] }
    }
  ];

  // Verificar cooldown
  const cooldownTime = 600000; // 10 minutos
  if (Date.now() - user.lastmining < cooldownTime) {
    const remaining = formatCooldown(user.lastmining + cooldownTime - Date.now());
    return conn.reply(m.chat, `⏳ Debes esperar ${remaining} para minar nuevamente.`, m);
  }

  // Seleccionar ubicación y recursos
  const location = selectByProbability(miningLocations);
  const resources = {
    coin: getRandomInRange(location.resources.coin),
    iron: getRandomInRange(location.resources.iron),
    gold: getRandomInRange(location.resources.gold),
    coal: getRandomInRange(location.resources.coal),
    stone: getRandomInRange(location.resources.stone),
    emerald: getRandomValue([1, 5, 7, 8]),
    diamond: Math.random() < 0.05 ? getRandomValue([1, 2, 3]) : 0
  };

  const experience = Math.floor(Math.random() * 1000);
  const maxDurability = 100;
  const durabilityPercent = (user.pickaxedurability / maxDurability) * 100;
  const randomEvent = getRandomEvent();

  // Mensaje de resultado
  const resultMessage = `
🏔️ *Lugar*: ${location.name}

📈 *Experiencia*: ${experience}
💰 *Monedas*: ${resources.coin}
💎 *Esmeralda*: ${resources.emerald}
🔩 *Hierro*: ${resources.iron}
🏅 *Oro*: ${resources.gold}
🪵 *Carbón*: ${resources.coal}
🪨 *Piedra*: ${resources.stone}
${resources.diamond ? `💎 *Diamante*: ${resources.diamond}` : ''}
⚒️ *Durabilidad del pico*: ${isNaN(durabilityPercent) ? 'Desconocida' : `${durabilityPercent.toFixed(0)}%`}

✨ *Evento*: ${randomEvent.text}
`.trim();

  await conn.sendFile(m.chat, location.image, 'mining.jpg', resultMessage, m);
  await m.react('⛏️');

  // Actualizar datos del usuario
  user.health -= 50;
  user.pickaxedurability -= 30;
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
    user.health += randomEvent.effect.health || 0;
    user.coin += randomEvent.effect.coins || 0;
    user.exp += randomEvent.effect.exp || 0;
  }

  // Advertencia de pico
  if (user.pickaxedurability <= 20 && user.pickaxedurability > 0) {
    conn.reply(m.chat, '⚠️ Tu pico está a punto de romperse. ¡Repáralo pronto!', m);
    await m.react('⚠️');
  }

  if (user.pickaxedurability <= 0) {
    conn.reply(m.chat, '⚒️ Tu pico se ha roto. Necesitas repararlo o comprar uno nuevo.', m);
    await m.react('💥');
  }
};

// Funciones auxiliares (debes tenerlas en tu proyecto)
function formatCooldown(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor((ms % 3600000) / 60000);
  let s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

function getRandomInRange([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomValue(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function selectByProbability(array) {
  const total = array.reduce((sum, item) => sum + item.probability, 0);
  let rand = Math.random() * total;
  for (const item of array) {
    if (rand < item.probability) return item;
    rand -= item.probability;
  }
  return array[array.length - 1];
}

function getRandomEvent() {
  const events = [
    { text: '¡Encontraste un pequeño cofre escondido!', effect: { coins: 100 } },
    { text: '¡Tu pico brilló misteriosamente!', effect: { exp: 300 } },
    { text: '¡Te resbalaste pero aprendiste algo nuevo!', effect: { exp: 150 } },
    { text: 'Nada inusual ocurrió.', effect: {} }
  ];
  return events[Math.floor(Math.random() * events.length)];
}
handler.command = ['minar'];
handler.tags = ['rpg'];
handler.help = ['minar'];
handler.register = true;
export default handler;
