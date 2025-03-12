let buyPickaxeHandler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return;

    let costYen = 50;  // Costo en yenes para comprar un pico
    if (user.pickaxe === 1) {
        return conn.reply(m.chat, '❌ Ya tienes una picota.', m);
    }

    if (user.yen < costYen) {
        return conn.reply(m.chat, `❌ No tienes suficientes yenes para comprar el pico.\n💴 *Yenes necesarios:* ${costYen}`, m);
    }

    user.yen -= costYen;
    user.pickaxe = 1;  // Compra la picota
    conn.reply(m.chat, `✅ Has comprado un *pico* por *${costYen}* yenes. Ahora tienes *${user.pickaxe}* pico(s).`, m);
};

buyPickaxeHandler.help = ['comprarpicota'];
buyPickaxeHandler.tags = ['economy'];
buyPickaxeHandler.command = ['comprarpicota'];
buyPickaxeHandler.register = true;
buyPickaxeHandler.group = true;

export default buyPickaxeHandler;
