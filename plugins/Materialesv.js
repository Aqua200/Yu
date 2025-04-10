import db from '../lib/database.js';

const moneda = '¥'; // Símbolo de yenes
const MIN_PERCENT = 90; // Precio mínimo (90% del base)
const MAX_PERCENT = 115; // Precio máximo (115% del base)
const DECREMENTO_POR_VENTA = 0.3; // 0.3% menos por venta
const RECUPERACION_POR_HORA = 0.5; // 0.5% más por hora
const FLUCTUACION_DIARIA = 5; // 5% de variación aleatoria diaria

let handler = async (m, { conn, usedPrefix, args, command }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return conn.reply(m.chat, '⚠️ No tienes un perfil creado. Usa *.registrar* primero.', m);

    // Precios base en yenes
    const materialPrices = {
        stone: { basePrice: 8, emoji: '🪨', name: 'Piedra' },
        coal: { basePrice: 25, emoji: '⚫', name: 'Carbón' },
        iron: { basePrice: 50, emoji: '🔩', name: 'Hierro' },
        gold: { basePrice: 120, emoji: '🏅', name: 'Oro' },
        emerald: { basePrice: 250, emoji: '💚', name: 'Esmeralda' },
        diamond: { basePrice: 800, emoji: '💎', name: 'Diamante' }
    };

    // Inicializar datos del mercado global si no existen
    if (!global.db.data.market) {
        global.db.data.market = {
            modifier: 1.0, // 100%
            lastUpdate: Date.now(),
            dailyFluctuation: (Math.random() * FLUCTUACION_DIARIA * 2) - FLUCTUACION_DIARIA,
            lastDailyReset: new Date().setHours(0, 0, 0, 0)
        };
    }

    // Verificar si es un nuevo día para resetear fluctuación diaria
    const now = new Date();
    const today = now.setHours(0, 0, 0, 0);
    if (global.db.data.market.lastDailyReset !== today) {
        global.db.data.market.dailyFluctuation = (Math.random() * FLUCTUACION_DIARIA * 2) - FLUCTUACION_DIARIA;
        global.db.data.market.lastDailyReset = today;
    }

    // Calcular recuperación del mercado basado en el tiempo
    const horasDesdeUltimaActualizacion = (Date.now() - global.db.data.market.lastUpdate) / (1000 * 60 * 60);
    const recuperacion = horasDesdeUltimaActualizacion * RECUPERACION_POR_HORA;
    
    // Actualizar modificador del mercado (con recuperación)
    global.db.data.market.modifier = Math.min(
        MAX_PERCENT / 100,
        global.db.data.market.modifier + (recuperacion / 100)
    );
    global.db.data.market.lastUpdate = Date.now();

    // Función para obtener el modificador actual
    const getCurrentModifier = (isSale = false) => {
        // Aplicar decremento si es una venta
        if (isSale) {
            global.db.data.market.modifier = Math.max(
                MIN_PERCENT / 100,
                global.db.data.market.modifier - (DECREMENTO_POR_VENTA / 100)
            );
        }
        
        // Aplicar fluctuación diaria (+/-5%)
        const withDaily = global.db.data.market.modifier * 
                        (1 + global.db.data.market.dailyFluctuation / 100);
        
        // Aplicar pequeña fluctuación aleatoria (+/-2%)
        const withRandom = withDaily * ((Math.random() * 0.04) + 0.98);
        
        return Math.min(MAX_PERCENT / 100, Math.max(MIN_PERCENT / 100, withRandom));
    };

    // Función para formatear yenes
    const formatYen = (amount) => {
        return `${moneda}${amount.toLocaleString('ja-JP')}`;
    };

    // Vender todos los materiales
    const sellAllMaterials = () => {
        let totalEarned = 0;
        let soldItems = [];
        let hasMaterials = false;
        
        const currentModifier = getCurrentModifier(true); // true = es una venta
        
        for (const [mat, data] of Object.entries(materialPrices)) {
            if (user[mat] > 0) {
                hasMaterials = true;
                const price = Math.round(data.basePrice * currentModifier);
                const earned = user[mat] * price;
                totalEarned += earned;
                soldItems.push(`▸ ${data.emoji} ${data.name}: ${user[mat]} → ${formatYen(earned)}`);
                user[mat] = 0;
            }
        }
        
        if (!hasMaterials) return { success: false };
        
        user.coin += totalEarned;
        return {
            success: true,
            totalEarned,
            soldItems,
            message: `💰 *Venta Completa* 💰\n\n` +
                    `Has obtenido: *${formatYen(totalEarned)}*\n\n` +
                    `📦 Materiales vendidos:\n${soldItems.join('\n')}\n\n` +
                    `💴 Total en yenes: ${formatYen(user.coin)}\n` +
                    `📊 Estado del mercado global: ${Math.round(currentModifier * 100)}%\n` +
                    `📉 Precios actuales: ${Math.round(currentModifier * 100)}% (bajan ${DECREMENTO_POR_VENTA}% por venta)\n` +
                    `🔄 Recuperación: +${RECUPERACION_POR_HORA}% por hora`
        };
    };

    // Comando .venderm
    if (command === 'venderm') {
        const result = sellAllMaterials();
        if (!result.success) {
            return conn.reply(m.chat, `No tienes materiales para vender.`, m);
        }
        return conn.sendMessage(m.chat, { 
            text: result.message,
            footer: `🏦 Mercado Global • ${new Date().toLocaleDateString('ja-JP')}`,
            title: 'VENTA DE MATERIALES'
        }, { quoted: m });
    }

    // Mostrar lista de materiales
    if (!args[0]) {
        const currentModifier = getCurrentModifier();
        let list = `🏪 *Tienda de Materiales Global* 🏪\n\n`;
        list += `📈 Estado del mercado: ${Math.round(currentModifier * 100)}%\n`;
        list += `📊 Fluctuación diaria: ${global.db.data.market.dailyFluctuation > 0 ? '+' : ''}${global.db.data.market.dailyFluctuation.toFixed(1)}%\n`;
        list += `📉 Mínimo/Máximo: ${MIN_PERCENT}%/${MAX_PERCENT}%\n`;
        list += `💴 Tus yenes: ${formatYen(user.coin)}\n\n`;
        
        for (const [mat, data] of Object.entries(materialPrices)) {
            const price = Math.round(data.basePrice * currentModifier);
            list += `${data.emoji} *${data.name}:* ${formatYen(price)} c/u (Tienes: ${user[mat] || 0})\n`;
        }
        
        list += `\n💡 Usa:\n• ${usedPrefix}vender <material> <cantidad>\n• ${usedPrefix}venderm (vender todo)`;
        list += `\n\n⚠️ Los precios bajan ${DECREMENTO_POR_VENTA}% por cada venta (recuperan ${RECUPERACION_POR_HORA}% por hora)`;
        
        return conn.sendMessage(m.chat, {
            text: list,
            footer: '💰 Sistema económico global - Precios compartidos',
            title: '⛩️ Mercado Global de Materiales'
        }, { quoted: m });
    }

    // Procesar venta específica
    const material = args[0].toLowerCase();
    const amount = args[1] ? parseInt(args[1]) : 1;
    
    const materialData = Object.entries(materialPrices).find(([key, val]) => 
        key.includes(material) || val.name.toLowerCase().includes(material));
    
    if (!materialData) {
        if (['todo', 'all'].includes(material)) {
            const result = sellAllMaterials();
            if (!result.success) {
                return conn.reply(m.chat, 'No tienes materiales para vender.', m);
            }
            return conn.sendMessage(m.chat, {
                text: result.message,
                footer: '🏮 Venta completada - Afecta a todos los jugadores',
                title: 'RECIBO DE VENTA GLOBAL'
            }, { quoted: m });
        }
        return conn.reply(m.chat, `Material no válido. Usa *${usedPrefix}vender* para ver la lista.`, m);
    }

    const [matKey, matInfo] = materialData;
    
    if (isNaN(amount) || amount < 1) {
        return conn.reply(m.chat, `Cantidad inválida. Ejemplo: *${usedPrefix}vender ${matKey} 5*`, m);
    }
    
    if (user[matKey] < amount) {
        return conn.reply(m.chat, `No tienes suficiente ${matInfo.name}. Solo tienes ${user[matKey]}`, m);
    }

    // Obtener precio actual (y aplicar decremento global)
    const currentModifier = getCurrentModifier(true);
    const price = Math.round(matInfo.basePrice * currentModifier);
    const total = price * amount;
    
    user[matKey] -= amount;
    user.coin += total;

    await conn.sendMessage(m.chat, {
        text: `🎌 *Venta Exitosa* 🎌\n\n` +
              `${matInfo.emoji} *${matInfo.name}*\n` +
              `📦 Vendiste: ${amount} unidades\n` +
              `💴 Precio unitario: ${formatYen(price)} (${Math.round(currentModifier * 100)}%)\n` +
              `💰 Total obtenido: *${formatYen(total)}*\n\n` +
              `🌍 *Afectaste el mercado global*:\n` +
              `📉 Precios bajaron a ${Math.round(currentModifier * 100)}% (-${DECREMENTO_POR_VENTA}%)\n` +
              `🏦 Yenes totales: ${formatYen(user.coin)}\n` +
              `📅 ${new Date().toLocaleDateString('ja-JP')}`,
        footer: 'Los precios se recuperan gradualmente con el tiempo',
        title: 'RECIBO DE VENTA GLOBAL'
    }, { quoted: m });
}

handler.help = ['vender <material> <cantidad>', 'venderm (vender todo)'];
handler.tags = ['economy', 'rpg'];
handler.command = ['vender', 'sell', 'venderm'];
handler.group = true;
handler.register = true;

export default handler;
