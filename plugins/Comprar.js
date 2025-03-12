let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return;

    let costYen = 50;  // Costo en yenes para comprar un pico
    if (!user.pickaxe) user.pickaxe = 0; // Si no tiene una picota, la inicializa

    if (user.pickaxe === 0) {
        if (user.yen < costYen) {
            return conn.reply(m.chat, `❌ No tienes suficientes yenes para comprar el pico.\n💴 *Yenes necesarios:* ${costYen}`, m);
        }
        user.yen -= costYen;
        user.pickaxe = 1;  // Compra la picota
        user.pickaxedurability = 100; // Durabilidad inicial de la picota
        conn.reply(m.chat, `✅ Has comprado un *pico* por *${costYen}* yenes. Ahora tienes *${user.pickaxe}* pico(s).`, m);
    }

    // Verificación de durabilidad de la picota
    if (!user.pickaxedurability || user.pickaxedurability <= 0) {
        return conn.reply(m.chat, '⚒️ Tu picota está rota. Repara o compra una nueva antes de seguir minando.', m);
    }

    // El resto de tu código sigue igual...

    user.pickaxedurability -= 30;  // Reducción en la durabilidad después de minar
    if (user.pickaxedurability <= 20 && user.pickaxedurability > 0) {
        conn.reply(m.chat, '⚠️ Tu picota está a punto de romperse. Repara o compra una nueva.', m);
        await m.react('⚠️');
    }

    if (user.pickaxedurability <= 0) {
        conn.reply(m.chat, '❌ Tu picota se ha roto. Usa el comando *reparar* para arreglarla.', m);
    }
}
