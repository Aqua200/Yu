const handler = async (m, { conn }) => {
    const user = global.db.data.users[m.sender];
    if (!user) return;

    // Verificar estado de la picota
    if (!user.pickaxedurability || user.pickaxedurability <= 0) {
        return conn.reply(m.chat, '🔨 *¡Pico roto!*\n\n⚒️ Tu pico está completamente roto. Repáralo con *!reparar* o compra uno nuevo antes de minar.', m);
    }

    // Verificar cooldown (10 minutos)
    const cooldownTime = 600000; // 10 minutos en milisegundos
    if (Date.now() - user.lastmining < cooldownTime) {
        const remaining = formatCooldown(cooldownTime - (Date.now() - user.lastmining));
        return conn.reply(m.chat, `⏳ *¡Espera un poco!*\n\nDebes esperar *${remaining}* para minar nuevamente.\n\n💡 Recuerda que el cooldown es de 10 minutos.`, m);
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

    // Seleccionar ubicación y recursos
    const location = selectByProbability(miningLocations);
    const resources = {
        coin: getRandomInRange(location.resources.coin),
        iron: getRandomInRange(location.resources.iron),
        gold: getRandomInRange(location.resources.gold),
        coal: getRandomInRange(location.resources.coal),
        stone: getRandomInRange(location.resources.stone),
        emerald: Math.random() < 0.3 ? getRandomValue([1, 5, 7, 8]) : 0,
        diamond: Math.random() < 0.05 ? getRandomValue([1, 2, 3]) : 0
    };

    // Calcular experiencia y durabilidad
    const experience = Math.floor(Math.random() * 1000);
    const maxDurability = 100;
    const durabilityPercentage = (user.pickaxedurability / maxDurability) * 100;

    // Evento aleatorio (sin efectos negativos de salud)
    const randomEvent = getRandomEvent();
    
    // Construir mensaje de resultados
    let resultMessage = `✨ *${location.name}* ✨\n\n` +
        `📊 *Resultados de minería*\n` +
        `▸ 🔹 *Experiencia*: ${experience} XP\n` +
        `▸ 💰 *Monedas*: ${resources.coin}\n` +
        `${resources.emerald > 0 ? `▸ 💚 *Esmeralda*: ${resources.emerald}\n` : ''}` +
        `▸ 🔩 *Hierro*: ${resources.iron}\n` +
        `▸ 🏅 *Oro*: ${resources.gold}\n` +
        `▸ ⚫ *Carbón*: ${resources.coal}\n` +
        `▸ 🪨 *Piedra*: ${resources.stone}\n` +
        `${resources.diamond > 0 ? `▸ 💎 *Diamante*: ${resources.diamond}\n` : ''}` +
        `\n⚒️ *Estado del pico*: ${isNaN(durabilityPercentage) ? 'Desconocido' : `${durabilityPercentage.toFixed(0)}%`}\n\n` +
        `🎲 *Evento especial*: ${randomEvent.text}\n\n` +
        `💡 *Consejo*: Repara tu pico con *!reparar* cuando esté bajo al 20%`;

    // Enviar resultados
    await conn.sendFile(m.chat, location.image, 'mining.jpg', resultMessage, m);
    await m.react('⛏️');

    // Actualizar estadísticas del usuario (sin quitar salud)
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

    // Aplicar efectos del evento (sin quitar salud)
    user.coin += randomEvent.effect.coins || 0;
    user.exp += randomEvent.effect.exp || 0;

    // Verificar estado del pico
    if (user.pickaxedurability <= 20 && user.pickaxedurability > 0) {
        conn.reply(m.chat, `⚠️ *¡Atención!*\n\nTu pico está a punto de romperse (${Math.floor(durabilityPercentage)}% de durabilidad).\nUsa *!reparar* para arreglarlo.`, m);
        await m.react('⚠️');
    }

    if (user.pickaxedurability <= 0) {
        conn.reply(m.chat, '❌ *¡Pico destruido!*\n\nTu pico se ha roto completamente.\nUsa el comando *!reparar* para arreglarlo o compra uno nuevo.', m);
    }
}

// Funciones auxiliares (sin cambios)
function getRandomInRange([min, max]) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomValue(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function selectByProbability(items) {
    const totalProbability = items.reduce((sum, item) => sum + item.probability, 0);
    const randomValue = Math.random() * totalProbability;
    let cumulativeProbability = 0;

    for (const item of items) {
        cumulativeProbability += item.probability;
        if (randomValue < cumulativeProbability) return item;
    }
}

function formatCooldown(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes} minuto${minutes !== 1 ? 's' : ''} y ${seconds} segundo${seconds !== 1 ? 's' : ''}`;
}

// Eventos modificados para no quitar salud
function getRandomEvent() {
    const events = [
        { text: "🎉 ¡Has encontrado un tesoro escondido! +100 monedas", effect: { coins: 100 } },
        { text: "✨ ¡Una veta de minerales raros! +50 monedas y 10 XP", effect: { coins: 50, exp: 10 } },
        { text: "💪 ¡Encontraste una poción de energía! +20 XP", effect: { exp: 20 } },
        { text: "🛠️ ¡Materiales de refuerzo para tu pico! +20 XP", effect: { exp: 20 } },
        { text: "🌟 ¡Cofre del tesoro legendario! +150 monedas y 25 XP", effect: { coins: 150, exp: 25 } },
        { text: "⏳ ¡Trabajaste más rápido de lo normal! Cooldown reducido", effect: { reduceCooldown: true } },
        { text: "🔍 ¡Encontraste un atajo en la mina! +30 XP", effect: { exp: 30 } },
        { text: "💼 ¡Contrato de minería completado! +80 monedas", effect: { coins: 80 } }
    ];
    return events[Math.floor(Math.random() * events.length)];
}

handler.help = ['minar'];
handler.tags = ['economy'];
handler.command = ['minar', 'miming', 'mine'];
handler.register = true;
handler.group = true;

export default handler;
