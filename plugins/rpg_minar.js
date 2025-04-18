const handler = async (m, { conn }) => {
    const user = global.db.data.users[m.sender];
    if (!user) return conn.reply(m.chat, '❌ No estás registrado en la base de datos.', m);

    // Verificar estado de la picota con mensaje más descriptivo
    if (!user.pickaxedurability || user.pickaxedurability <= 0) {
        return conn.reply(m.chat, '🔨 *¡Pico inutilizable!*\n\n⚒️ Tu pico está roto (0% de durabilidad).\n💡 Usa *!reparar* para arreglarlo o *!tienda* para comprar uno nuevo.', m);
    }

    // Cooldown mejorado con progreso visual
    const cooldownTime = 600000; // 10 minutos
    const lastMining = user.lastmining || 0;
    const remainingTime = cooldownTime - (Date.now() - lastMining);
    
    if (remainingTime > 0) {
        const progressBar = createProgressBar(cooldownTime, remainingTime);
        const remaining = formatCooldown(remainingTime);
        return conn.reply(m.chat, 
            `⏳ *¡Espera para minar!*\n\n` +
            `${progressBar}\n` +
            `⏱️ Tiempo restante: *${remaining}*\n\n` +
            `💡 El cooldown es de 10 minutos. Puedes ver tu progreso con *!cdminar*`, m);
    }

    // Sistema de ubicaciones mejorado
    const miningLocations = [
        { 
            name: "🏔️ Cueva Profunda", 
            emoji: "🏔️",
            image: "https://files.catbox.moe/f91rfm.jpg",
            difficulty: "Fácil",
            probability: 25,
            resources: { 
                coin: [10, 50], 
                iron: [5, 20], 
                gold: [2, 10], 
                coal: [10, 50], 
                stone: [300, 800],
                bonus: { emerald: 0.3, diamond: 0.05 }
            }
        },
        { 
            name: "🌋 Volcán Ardiente", 
            emoji: "🌋",
            image: "https://files.catbox.moe/dtdono.jpg",
            difficulty: "Medio",
            probability: 25,
            resources: { 
                coin: [30, 90], 
                iron: [15, 40], 
                gold: [10, 50], 
                coal: [30, 100], 
                stone: [700, 4000],
                bonus: { emerald: 0.4, diamond: 0.08 }
            }
        },
        { 
            name: "🏚️ Mina Abandonada", 
            emoji: "🏚️",
            image: "https://files.catbox.moe/vhcmlx.jpg",
            difficulty: "Medio",
            probability: 50,
            resources: { 
                coin: [50, 120], 
                iron: [20, 50], 
                gold: [15, 40], 
                coal: [30, 100], 
                stone: [600, 2000],
                bonus: { emerald: 0.5, diamond: 0.1 }
            }
        },
        { 
            name: "🌲 Bosque Subterráneo", 
            emoji: "🌲",
            image: "https://files.catbox.moe/1z8dsm.jpg",
            difficulty: "Fácil",
            probability: 50,
            resources: { 
                coin: [40, 100], 
                iron: [15, 40], 
                gold: [10, 30], 
                coal: [20, 80], 
                stone: [500, 1500],
                bonus: { emerald: 0.35, diamond: 0.07 }
            }
        },
        { 
            name: "🌀 Dimensión Oscura", 
            emoji: "🌀",
            image: "https://files.catbox.moe/cyp3tp.jpg",
            difficulty: "Difícil",
            probability: 50,
            resources: { 
                coin: [70, 200], 
                iron: [30, 60], 
                gold: [20, 60], 
                coal: [50, 150], 
                stone: [1000, 5000],
                bonus: { emerald: 0.6, diamond: 0.15 }
            }
        }
    ];

    // Selección de ubicación con probabilidades ajustadas
    const location = selectByProbability(miningLocations);
    
    // Cálculo de recursos con bonificación por pico
    const pickaxeBonus = user.pickaxe ? (user.pickaxe.tier * 0.15) + 1 : 1;
    const resources = calculateResources(location, pickaxeBonus);

    // Experiencia basada en dificultad
    const expMultipliers = { "Fácil": 1, "Medio": 1.5, "Difícil": 2 };
    const baseExp = Math.floor(Math.random() * 100) + 50;
    const experience = Math.floor(baseExp * expMultipliers[location.difficulty] * pickaxeBonus);

    // Durabilidad y eventos
    const durabilityLoss = calculateDurabilityLoss(location.difficulty);
    const randomEvent = getRandomEvent();
    const newDurability = Math.max(0, user.pickaxedurability - durabilityLoss);
    const durabilityPercentage = Math.floor((newDurability / 100) * 100);

    // Construir mensaje mejorado
    const resultMessage = buildResultMessage(location, resources, experience, durabilityPercentage, randomEvent);

    // Enviar resultados
    await conn.sendFile(m.chat, location.image, 'mining.jpg', resultMessage, m);
    await m.react('⛏️');

    // Actualizar datos del usuario
    updateUserData(user, resources, experience, newDurability, randomEvent);

    // Notificaciones sobre el estado del pico
    handlePickaxeNotifications(conn, m, newDurability, durabilityPercentage);
}

// Funciones auxiliares mejoradas
function calculateResources(location, bonusMultiplier) {
    const resources = {
        coin: Math.floor(getRandomInRange(location.resources.coin) * bonusMultiplier),
        iron: Math.floor(getRandomInRange(location.resources.iron) * bonusMultiplier),
        gold: Math.floor(getRandomInRange(location.resources.gold) * bonusMultiplier),
        coal: Math.floor(getRandomInRange(location.resources.coal) * bonusMultiplier),
        stone: Math.floor(getRandomInRange(location.resources.stone) * bonusMultiplier),
        emerald: Math.random() < location.resources.bonus.emerald ? 
               Math.floor(getRandomValue([1, 2, 3, 5, 7]) * bonusMultiplier) : 0,
        diamond: Math.random() < location.resources.bonus.diamond ? 
                Math.floor(getRandomValue([1, 2, 3]) * bonusMultiplier) : 0
    };
    return resources;
}

function calculateDurabilityLoss(difficulty) {
    const baseLoss = 30;
    const difficultyFactors = { "Fácil": 0.8, "Medio": 1, "Difícil": 1.3 };
    return Math.floor(baseLoss * difficultyFactors[difficulty]);
}

function buildResultMessage(location, resources, exp, durability, event) {
    let message = `✨ *${location.name}* (${location.difficulty}) ${location.emoji}\n\n`;
    message += `📊 *Resultados de minería*\n`;
    message += `▸ 🌟 *Experiencia*: ${exp} XP\n`;
    message += `▸ 💰 *Monedas*: ${resources.coin}\n`;
    message += resources.emerald > 0 ? `▸ 💚 *Esmeraldas*: ${resources.emerald}\n` : '';
    message += `▸ 🔩 *Hierro*: ${resources.iron}\n`;
    message += `▸ 🏅 *Oro*: ${resources.gold}\n`;
    message += `▸ ⚫ *Carbón*: ${resources.coal}\n`;
    message += `▸ 🪨 *Piedra*: ${resources.stone}\n`;
    message += resources.diamond > 0 ? `▸ 💎 *Diamantes*: ${resources.diamond}\n` : '';
    message += `\n⚒️ *Estado del pico*: ${durability}%\n\n`;
    message += `🎲 *Evento especial*: ${event.text}\n\n`;
    message += `💡 *Consejo*: Picos de mayor nivel (${user.pickaxe ? `actual: ${user.pickaxe.tier}` : 'ninguno'}) dan mejores recompensas!`;
    
    return message;
}

function updateUserData(user, resources, exp, newDurability, event) {
    user.pickaxedurability = newDurability;
    user.coin += resources.coin + (event.effect.coins || 0);
    user.iron += resources.iron;
    user.gold += resources.gold;
    user.emerald += resources.emerald;
    user.coal += resources.coal;
    user.stone += resources.stone;
    user.diamond += resources.diamond;
    user.exp += exp + (event.effect.exp || 0);
    user.lastmining = Date.now();
    
    if (event.effect.reduceCooldown) {
        user.lastmining -= 180000; // Reduce 3 minutos del cooldown
    }
}

function handlePickaxeNotifications(conn, m, durability, percentage) {
    if (durability <= 0) {
        conn.reply(m.chat, 
            '🔨 *¡Pico destruido!*\n\n' +
            'Tu pico se ha roto completamente.\n' +
            'Usa *!reparar* para arreglarlo o *!tienda* para comprar uno mejor.', m);
    } else if (percentage <= 20) {
        conn.reply(m.chat, 
            `⚠️ *¡Atención!*\n\n` +
            `Tu pico está a punto de romperse (${percentage}% de durabilidad).\n` +
            `Usa *!reparar* para arreglarlo antes de que sea demasiado tarde.`, m);
    }
}

function createProgressBar(total, remaining) {
    const progress = Math.floor(((total - remaining) / total) * 10);
    return `[${'█'.repeat(progress)}${'░'.repeat(10 - progress)}]`;
}

// Funciones existentes (optimizadas)
function getRandomInRange([min, max]) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomValue(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function selectByProbability(items) {
    const total = items.reduce((sum, item) => sum + item.probability, 0);
    let random = Math.random() * total;
    return items.find(item => (random -= item.probability) < 0) || items[0];
}

function formatCooldown(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

// Eventos mejorados
function getRandomEvent() {
    const events = [
        { text: "🎉 ¡Tesoro escondido! +100 monedas", effect: { coins: 100 } },
        { text: "✨ ¡Veta de minerales raros! +50 monedas y 10 XP", effect: { coins: 50, exp: 10 } },
        { text: "💪 ¡Poción de energía! +20 XP", effect: { exp: 20 } },
        { text: "🛠️ ¡Materiales de refuerzo! +20 XP", effect: { exp: 20 } },
        { text: "🌟 ¡Tesoro legendario! +150 monedas y 25 XP", effect: { coins: 150, exp: 25 } },
        { text: "⏳ ¡Trabajo rápido! Cooldown reducido 3 minutos", effect: { reduceCooldown: true } },
        { text: "🔍 ¡Atajo encontrado! +30 XP", effect: { exp: 30 } },
        { text: "💼 ¡Contrato completado! +80 monedas", effect: { coins: 80 } },
        { text: "⚡ ¡Energía mineral! Durabilidad reducida solo 15%", effect: { reduceDurabilityLoss: true } }
    ];
    return events[Math.floor(Math.random() * events.length)];
}

handler.help = ['minar'];
handler.tags = ['economy'];
handler.command = ['minar', 'miming', 'mine'];
handler.register = true;
handler.group = true;

export default handler;
