let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) throw '⚠️ No se encontraron tus datos';

    // Verificar si el pico ya está reparado
    if (user.pickaxedurability >= 100) {
        return conn.reply(m.chat, '⚒️ Tu pico ya está al máximo de durabilidad (100).', m);
    }

    // Costos
    const costIron = 20;
    const costGold = 10;
    const costYen = 500;

    // Intentar reparar con materiales primero
    if (user.iron >= costIron && user.gold >= costGold) {
        user.iron -= costIron;
        user.gold -= costGold;
        user.pickaxedurability = 100;
        return conn.reply(m.chat, 
            `✅ *Pico reparado con materiales:*\n` +
            `🔩 -${costIron} hierro | 🏅 -${costGold} oro\n` +
            `⚒️ Durabilidad: 100/100`, m);
    } 
    // Si no tiene materiales, intentar con yenes
    else if (user.money >= costYen) {
        user.money -= costYen;
        user.pickaxedurability = 100;
        return conn.reply(m.chat, 
            `✅ *Pico reparado con yenes:*\n` +
            `💴 -${costYen} yenes\n` +
            `⚒️ Durabilidad: 100/100`, m);
    }
    // Si no tiene nada
    else {
        return conn.reply(m.chat, 
            `❌ *No tienes recursos suficientes*\n` +
            `Para reparar necesitas:\n` +
            `🔩 ${costIron} hierro + 🏅 ${costGold} oro\n` +
            `*O*\n` +
            `💴 ${costYen} yenes\n\n` +
            `Actualmente tienes:\n` +
            `🔩 ${user.iron}/${costIron} hierro | 🏅 ${user.gold}/${costGold} oro\n` +
            `💴 ${user.money}/${costYen} yenes`, m);
    }
}

handler.help = ['reparar'];
handler.tags = ['economy'];
handler.command = ['reparar', 'fixpickaxe'];
handler.register = true;
handler.group = true;

export default handler;
