const cooldowns = {};

const handler = async (m, { conn }) => {
    const user = global.db.data.users[m.sender];
    if (!user) return;

    // Verificar estado de la picota
    if (!user.pickaxedurability || user.pickaxedurability <= 0) {
        return conn.reply(m.chat, '🔨 *¡Pico roto!*\n\n⚒️ Tu pico está completamente roto. Repáralo con *!reparar* o compra uno nuevo antes de minar.', m);
    }

    // Lugares de minería con sus propiedades
    const miningLocations = [
        { 
            name: "🏔️ *Cueva Profunda*", 
            image: "https://files.catbox.moe/mtsv8m.jpg", 
            probability: 25, 
            resources: { 
                coin: [10, 50], 
                iron: [5, 20], 
                gold: [2, 10], 
                coal: [10, 50], 
                stone: [300, 800] 
            } 
        },
        { 
            name: "🌋 *Volcán Ardiente*", 
            image: "https://qu.ax/CDdWW.jpeg", 
            probability: 25, 
            resources: { 
                coin: [30, 90], 
                iron: [15, 40], 
                gold: [10, 50], 
                coal: [30, 100], 
                stone: [700, 4000] 
            } 
        },
        { 
            name: "🏚️ *Mina Abandonada*", 
            image: "https://qu.ax/tZvvf.jpeg", 
            probability: 50, 
            resources: { 
                coin: [50, 120], 
                iron: [20, 50], 
                gold: [15, 40], 
                coal: [30, 100], 
                stone: [600, 2000] 
            } 
        },
        { 
            name: "🌲 *Bosque Subterráneo*", 
            image: "https://qu.ax/FzCtg.jpeg", 
            probability: 50, 
            resources: { 
                coin: [40, 100], 
                iron: [15, 40], 
                gold: [10, 30], 
                coal: [20, 80], 
                stone: [500, 1500] 
            } 
        },
        { 
            name: "🌀 *Dimensión Oscura*", 
            image: "https://qu.ax/OLKnB.jpeg", 
            probability: 50, 
            resources: { 
                coin: [70, 200], 
                iron: [30, 60], 
                gold: [20, 60], 
                coal: [50, 150], 
                stone: [1000, 5000] 
            } 
        }
    ];

    // Verificar cooldown
    const cooldownTime = user.lastmining + 600000;
    if (Date.now() - user.lastmining < 600000) {
        const remaining = formatCooldown(cooldownTime - Date.now());
        return conn.reply(m.chat, `⏳ *¡Espera un poco!*\n\nDebes esperar *${remaining}* para minar nuevamente.\n\n💡 Recuerda que el cooldown es de 10 minutos.`, m);
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

    // Calcular experiencia y durabilidad
    const experience = Math.floor(Math.random() * 1000);
    const maxDurability = 100;
    const durabilityPercentage = (user.pickaxedurability / maxDurability) * 100;

    // Evento aleatorio
    const randomEvent = getRandomEvent();
    
    // Construir mensaje de resultados
    let resultMessage = `✨ *${location.name}* ✨\n\n` +
        `📊 *Resultados de minería*\n` +
        `▸ 🔹 *Experiencia*: ${experience} XP\n` +
        `▸ 💰 *Monedas*: ${resources.coin}\n` +
        `▸ 💚 *Esmeralda*: ${resources.emerald}\n` +
        `▸ 🔩 *Hierro*: ${resources.iron}\n` +
        `▸ 🏅 *Oro*: ${resources.gold}\n` +
        `▸ ⚫ *Carbón*: ${resources.coal}\n` +
        `▸ 🪨 *Piedra*: ${resources.stone}\n` +
        `${resources.diamond ? `▸ 💎 *Diamante*: ${resources.diamond}\n` : ''}\n` +
        `⚒️ *Estado del pico*: ${isNaN(durabilityPercentage) ? 'Desconocido' : `${durabilityPercentage.toFixed(0)}%`}\n\n` +
        `🎲 *Evento especial*: ${randomEvent.text}\n\n` +
        `💡 *Consejo*: Repara tu pico con *!reparar* cuando esté bajo al 20%`;

    // Enviar resultados
    await conn.sendFile(m.chat, location.image, 'mining.jpg', resultMessage, m);
    await m.react('⛏️');

    // Actualizar estadísticas del usuario
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
    user.health += randomEvent.effect.health || 0;
    user.coin += randomEvent.effect.coins || 0;
    user.exp += randomEvent.effect.exp || 0;

    // Verificar estado del pico
    if (user.pickaxedurability <= 20 && user.pickaxedurability > 0) {
        conn.reply(m.chat, '⚠️ *¡Atención!*\n\nTu pico está a punto de romperse (${user.pickaxedurability}% de durabilidad).\nUsa *!reparar* para arreglarlo.', m);
        await m.react('⚠️');
    }

    if (user.pickaxedurability <= 0) {
        conn.reply(m.chat, '❌ *¡Pico destruido!*\n\nTu pico se ha roto completamente.\nUsa el comando *!reparar* para arreglarlo o compra uno nuevo.', m);
    }
}

// Función para obtener un valor aleatorio dentro de un rango
function getRandomInRange([min, max]) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para seleccionar un valor aleatorio de un array
function getRandomValue(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Función para seleccionar ubicación basada en probabilidad
function selectByProbability(items) {
    const totalProbability = items.reduce((sum, item) => sum + item.probability, 0);
    const randomValue = Math.random() * totalProbability;
    let cumulativeProbability = 0;

    for (const item of items) {
        cumulativeProbability += item.probability;
        if (randomValue < cumulativeProbability) return item;
    }
}

// Función para formatear el tiempo de cooldown
function formatCooldown(milliseconds) {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);

    return `${minutes.toString().padStart(2, '0')} minutos y ${seconds.toString().padStart(2, '0')} segundos`;
}

// Función para generar eventos aleatorios
function getRandomEvent() {
    const positiveEvents = [
        { text: "🎉 ¡Has encontrado un tesoro escondido! +100 monedas", effect: { coins: 100 } },
        { text: "✨ ¡Una veta de minerales raros! +50 monedas y 10 XP", effect: { coins: 50, exp: 10 } },
        { text: "💪 ¡Encontraste una poción de salud! +20 de salud", effect: { health: 20 } },
        { text: "🛠️ ¡Materiales de refuerzo para tu pico! +20 XP", effect: { exp: 20 } },
        { text: "🌟 ¡Cofre del tesoro legendario! +150 monedas y 25 XP", effect: { coins: 150, exp: 25 } }
    ];

    const negativeEvents = [
        { text: "💥 ¡Un derrumbe te ha golpeado! -20 de salud", effect: { health: -20 } },
        { text: "⚡ ¡Una descarga eléctrica en la mina! -30 de salud", effect: { health: -30 } },
        { text: "🔥 ¡El calor te agotó! -10 XP", effect: { exp: -10 } },
        { text: "⚠️ ¡Un enemigo te atacó! -40 de salud", effect: { health: -40 } },
        { text: "⛔ ¡Perdiste tiempo por un camino equivocado! -15 XP", effect: { exp: -15 } }
    ];

    const isPositive = Math.random() < 0.5;
    const events = isPositive ? positiveEvents : negativeEvents;
    return events[Math.floor(Math.random() * events.length)];
}

handler.help = ['minar'];
handler.tags = ['economy'];
handler.command = ['minar', 'miming', 'mine'];
handler.register = true;
handler.group = true;

export default handler;
