import db from '../lib/database.js';

const moneda = '¥'; // Símbolo de yenes
const MAX_USOS = 20; // Número máximo de usos antes de llegar al mínimo
const MIN_PERCENT = 90; // Porcentaje mínimo (90% del precio base)
const RECUPERACION_POR_HORA = 5; // Porcentaje que se recupera por hora

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

    // Inicializar datos del mercado si no existen
    if (!global.db.data.market) {
        global.db.data.market = {
            usos: 0,
            lastUpdate: Date.now(),
            currentModifier: 1.0
        };
    }

    // Calcular recuperación del mercado basado en el tiempo
    const horasDesdeUltimaActualizacion = (Date.now() - global.db.data.market.lastUpdate) / (1000 * 60 * 60);
    const recuperacion = Math.min(horasDesdeUltimaActualizacion * RECUPERACION_POR_HORA, 100);
    
    // Actualizar modificador del mercado
    global.db.data.market.currentModifier = Math.min(
        1.0, // Máximo 100%
        global.db.data.market.currentModifier + (recuperacion / 100)
    );
    global.db.data.market.lastUpdate = Date.now();

    // Función para obtener el modificador actual con fluctuación
    const getCurrentModifier = () => {
        // Base: 100% - (usos * reducción por uso)
        const baseModifier = Math.max(
            MIN_PERCENT / 100, 
            1.0 - (global.db.data.market.usos * 0.005) // 0.5% de reducción por uso
        );
        
        // Aplicar fluctuación aleatoria (±5%)
        const fluctuation = (Math.random() * 0.1) - 0.05;
        return Math.min(1.0, Math.max(MIN_PERCENT / 100, baseModifier + fluctuation));
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
        
        // Incrementar contador de usos del mercado
        global.db.data.market.usos += 1;
        const currentModifier = getCurrentModifier();
        
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
                    `📊 Estado del mercado: ${Math.round(currentModifier * 100)}% (${global.db.data.market.usos} ventas hoy)\n` +
                    `📉 Precios disminuyen con el uso (mínimo ${MIN_PERCENT}%)`
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
            footer: `🏦 Banco Japonés • ${new Date().toLocaleDateString('ja-JP')}`,
            title: 'VENTA DE MATERIALES'
        }, { quoted: m });
    }

    // Mostrar lista de materiales
    if (!args[0]) {
        const currentModifier = getCurrentModifier();
        let list = `🏪 *Tienda de Materiales* 🏪\n\n`;
        list += `📈 Estado del mercado: ${Math.round(currentModifier * 100)}%\n`;
        list += `📊 Ventas hoy: ${global.db.data.market.usos} (máx ${MAX_USOS})\n`;
        list += `📉 Mínimo alcanzable: ${MIN_PERCENT}%\n`;
        list += `💴 Tus yenes: ${formatYen(user.coin)}\n\n`;
        
        for (const [mat, data] of Object.entries(materialPrices)) {
            const price = Math.round(data.basePrice * currentModifier);
            list += `${data.emoji} *${data.name}:* ${formatYen(price)} c/u (Tienes: ${user[mat] || 0})\n`;
        }
        
        list += `\n💡 Usa:\n• ${usedPrefix}vender <material> <cantidad>\n• ${usedPrefix}venderm (vender todo)`;
        list += `\n\n⚠️ Los precios bajan con cada venta (recuperan ${RECUPERACION_POR_HORA}% por hora)`;
        
        return conn.sendMessage(m.chat, {
            text: list,
            footer: '💰 Sistema económico japonés - Mercado variable',
            title: '⛩️ Mercado de Materiales'
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
                footer: '🏮 Venta completada',
                title: 'RECIBO DE VENTA'
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

    // Incrementar contador de usos del mercado
    global.db.data.market.usos += 1;
    const currentModifier = getCurrentModifier();
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
              `🏦 Yenes totales: ${formatYen(user.coin)}\n` +
              `📊 Ventas hoy: ${global.db.data.market.usos} (máx ${MAX_USOS})\n` +
              `📅 ${new Date().toLocaleDateString('ja-JP')}`,
        footer: 'Los precios bajan con cada venta, pero se recuperan con el tiempo',
        title: 'RECIBO DE VENTA'
    }, { quoted: m });
}

handler.help = ['vender <material> <cantidad>', 'venderm (vender todo)'];
handler.tags = ['economy', 'rpg'];
handler.command = ['vender', 'sell', 'venderm'];
handler.group = true;
handler.register = true;

export default handler;
