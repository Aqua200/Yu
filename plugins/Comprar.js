let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return;

    let costDiamonds = 1;  // Cantidad de diamantes necesarios para comprar una picota

    if (user.diamonds < costDiamonds) {
        return conn.reply(m.chat, `❌ No tienes suficientes diamantes para comprar una picota.\n💎 *Diamantes necesarios:* ${costDiamonds}`, m);
    }

    // Si el usuario no tiene picota, se le asigna una nueva picota con durabilidad máxima
    if (!user.pickaxe) {
        user.pickaxe = true;  // El usuario ahora tiene una picota
        user.pickaxedurability = 100;  // Durabilidad inicial de la picota
    }

    user.diamonds -= costDiamonds;  // Restar los diamantes

    conn.reply(m.chat, `✅ Has comprado una picota con éxito.\n🔧 *Durabilidad de la picota:* 100`, m);
}

handler.help = ['comprarpicota'];
handler.tags = ['economy'];
handler.command = ['comprarpicota', 'buyaxe'];
handler.register = true;
handler.group = true;

export default handler;
