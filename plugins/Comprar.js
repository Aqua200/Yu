let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return;

    let costYen = 50;  // Costo en yenes para comprar un pico

    if (user.yen < costYen) {
        return conn.reply(m.chat, `❌ No tienes suficientes yenes para comprar el pico.\n💴 *Yenes necesarios:* ${costYen}`, m);
    }

    user.yen -= costYen;
    user.pickaxe = (user.pickaxe || 0) + 1;  // Añade un pico al inventario del usuario (si no tiene uno, lo crea)

    conn.reply(m.chat, `✅ Has comprado un *pico* por *${costYen}* yenes. Ahora tienes *${user.pickaxe}* pico(s).`, m);
}

handler.help = ['comprar'];
handler.tags = ['economy'];
handler.command = ['comprar', 'buypickaxe'];
handler.register = true;
handler.group = true;

export default handler;
