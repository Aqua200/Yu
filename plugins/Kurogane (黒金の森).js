let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return;

    // Incrementar el contador global de uso del comando
    global.db.data.stats.kuroganeUses = (global.db.data.stats.kuroganeUses || 0) + 1; // Si no existe, lo inicializa en 0

    // Valores de oro, hierro, yenes (1000 a 2000) y probabilidad de encontrar diamante
    let iron = 20;
    let gold = 10;
    let yenes = Math.floor(Math.random() * 1001) + 1000; // entre 1000 y 2000 yenes aleatorios
    let diamond = Math.random() < 0.05 ? 1 : 0;  // 5% de probabilidad de diamante

    // Mensaje base con la cantidad encontrada
    let info = `🎉 ¡Felicidades! Has encontrado en *Kurogane (黒金の森)*:\n\n` +
        `🏅 *Oro*: ${gold}\n` +
        `🔩 *Hierro*: ${iron}\n` +
        `💴 *Yenes*: ${yenes}\n`;

    // Si se encuentra diamante, agregar un texto especial
    if (diamond > 0) {
        info += `💎 *Diamante*: 1\n` +
            `✨ ¡Increíble! Has encontrado un diamante raro en Kurogane (黒金の森)!`;
    }

    // Incluir cuántas veces se ha usado el comando globalmente
    info += `\n🔢 *Usos del comando (todos los usuarios)*: ${global.db.data.stats.kuroganeUses} veces.`;

    // Enviar mensaje con imagen del lugar
    await conn.sendFile(m.chat, "https://qu.ax/GtiGX.jpeg", 'kurogane.jpg', info, fkontak);
    await m.react('🌳');

    // Sumar recursos al usuario
    user.iron += iron;
    user.gold += gold;
    user.yenes += yenes;
    user.diamond += diamond;

    user.lastmiming = new Date() * 1;
}

handler.help = ['kurogane'];
handler.tags = ['economy'];
handler.command = ['kurogane', 'recoger'];
handler.register = true;
handler.group = true;

export default handler;
