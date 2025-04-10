let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return;

    if (user.pickaxedurability >= 100) {
        return conn.reply(m.chat, '⚒️ Tu picota no necesita reparaciones.', m);
    }

    let costIron = 20;  // Cantidad de hierro requerido para reparar
    let costGold = 10;  // Cantidad de oro requerido
    let costYen = 500;  // Costo en yenes si no tiene materiales

    // Primero verificar si tiene materiales
    if (user.iron >= costIron && user.gold >= costGold) {
        // Reparar con materiales
        user.iron -= costIron;
        user.gold -= costGold;
        conn.reply(m.chat, '✅ Tu picota ha sido reparada con éxito usando materiales y ahora tiene *100* de durabilidad.', m);
    } 
    // Si no tiene materiales, verificar si tiene yenes
    else if (user.money >= costYen) {
        // Reparar con yenes
        user.money -= costYen;
        conn.reply(m.chat, `✅ Tu picota ha sido reparada con éxito usando ${costYen} yenes y ahora tiene *100* de durabilidad.`, m);
    }
    // Si no tiene ni materiales ni yenes
    else {
        return conn.reply(m.chat, 
            `❌ No tienes suficientes recursos para reparar la picota.\n` +
            `🔩 *Hierro necesario:* ${costIron}\n` +
            `🏅 *Oro necesario:* ${costGold}\n` +
            `💴 *O necesitas:* ${costYen} yenes`, 
            m);
    }

    user.pickaxedurability = 100; // Restaura la durabilidad a 100
}

handler.help = ['reparar'];
handler.tags = ['economy'];
handler.command = ['reparar', 'fixpickaxe'];
handler.register = true;
handler.group = true;

export default handler;
