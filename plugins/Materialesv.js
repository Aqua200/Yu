import db from '../lib/database.js';

const moneda = '¥'; // Símbolo de yenes (o cambia a tu moneda)

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

    // Modificador de precios (85% a 115%)
    const priceModifier = (Math.random() * 0.3) + 0.85;

    // Función para formatear yenes
    const formatYen = (amount) => {
        return `${moneda}${amount.toLocaleString('ja-JP')}`;
    };

    // Vender todos los materiales
    const sellAllMaterials = () => {
        let totalEarned = 0;
        let soldItems = [];
        let hasMaterials = false;
        
        for (const [mat, data] of Object.entries(materialPrices)) {
            if (user[mat] > 0) {
                hasMaterials = true;
                const price = Math.round(data.basePrice * priceModifier);
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
                    `📊 Precios del día: ${Math.round(priceModifier * 100)}%`
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
        let list = `🏪 *Tienda de Materiales* 🏪\n\n`;
        list += `📈 Fluctuación: ${Math.round(priceModifier * 100)}%\n`;
        list += `💴 Tus yenes: ${formatYen(user.coin)}\n\n`;
        
        for (const [mat, data] of Object.entries(materialPrices)) {
            const price = Math.round(data.basePrice * priceModifier);
            list += `${data.emoji} *${data.name}:* ${formatYen(price)} c/u (Tienes: ${user[mat] || 0})\n`;
        }
        
        list += `\n💡 Usa:\n• ${usedPrefix}vender <material> <cantidad>\n• ${usedPrefix}venderm (vender todo)`;
        
        return conn.sendMessage(m.chat, {
            text: list,
            footer: '💰 Sistema económico japonés',
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

    const price = Math.round(matInfo.basePrice * priceModifier);
    const total = price * amount;
    
    user[matKey] -= amount;
    user.coin += total;

    await conn.sendMessage(m.chat, {
        text: `🎌 *Venta Exitosa* 🎌\n\n` +
              `${matInfo.emoji} *${matInfo.name}*\n` +
              `📦 Vendiste: ${amount} unidades\n` +
              `💴 Precio unitario: ${formatYen(price)}\n` +
              `💰 Total obtenido: *${formatYen(total)}*\n\n` +
              `🏦 Yenes totales: ${formatYen(user.coin)}\n` +
              `📅 ${new Date().toLocaleDateString('ja-JP')}`,
        footer: 'Arigatou gozaimasu!',
        title: 'RECIBO DE VENTA'
    }, { quoted: m });
}

handler.help = ['vender <material> <cantidad>', 'venderm (vender todo)'];
handler.tags = ['economy', 'rpg'];
handler.command = ['vender', 'sell', 'venderm'];
handler.group = true;
handler.register = true;

export default handler;
