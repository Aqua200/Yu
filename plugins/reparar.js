let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return;

    if (user.pickaxedurability >= 100) {
        return conn.reply(m.chat, '⚒️ Tu picota no necesita reparaciones.', m);
    }

    let costIron = 20;  // Cantidad de hierro requerido para reparar
    let costGold = 10;  // Cantidad de oro requerido
    let costYen = 500;  // Costo en yenes si no tiene materiales

    // Verificar si tiene materiales o suficiente dinero
    const hasMaterials = user.iron >= costIron && user.gold >= costGold;
    const hasYen = user.money >= costYen;

    if (!hasMaterials && !hasYen) {
        return conn.reply(m.chat, 
            `❌ No tienes suficientes recursos para reparar la picota.\n` +
            `🔩 *Hierro necesario:* ${costIron}\n` +
            `🏅 *Oro necesario:* ${costGold}\n` +
            `💴 *O puedes pagar:* ${costYen} yenes`, 
            m);
    }

    if (hasMaterials) {
        // Reparar con materiales
        user.iron -= costIron;
        user.gold -= costGold;
    } else {
        // Reparar con yenes
        user.money -= costYen;
    }

    user.pickaxedurability = 100; // Restaura la durabilidad a 100

    const paymentMethod = hasMaterials ? "materiales" : `${costYen} yenes`;
    conn.reply(m.chat, `✅ Tu picota ha sido reparada con éxito usando ${paymentMethod} y ahora tiene *100* de durabilidad.`, m);
}

handler.help = ['reparar'];
handler.tags = ['economy'];
handler.command = ['reparar', 'fixpickaxe'];
handler.register = true;
handler.group = true;

export default handler;
