let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return;

    // Valores de oro, hierro y una probabilidad de encontrar diamantes
    let iron = 20;
    let gold = 10;
    let diamond = Math.random() < 0.05 ? 1 : 0;  // 5% de probabilidad de encontrar un diamante

    // Mensaje base con la cantidad de oro y hierro
    let info = `🎉 ¡Felicidades! Has encontrado:\n` +
        `🏅 *Oro*: ${gold}\n` +
        `🔩 *Hierro*: ${iron}\n`;

    // Si se encuentra diamante, agregar un texto especial
    if (diamond > 0) {
        info += `💎 *Diamante*: 1\n` +
            `🎉 ¡Increíble! Has encontrado un diamante raro en Kurogane (黒金の森)!`;
    }

    // Enviar mensaje con imagen del lugar
    await conn.sendFile(m.chat, "https://qu.ax/YOUR_IMAGE_URL", 'kurogane.jpg', info, fkontak);
    await m.react('🌳');

    // Sumar el oro, hierro y diamante a los recursos del usuario
    user.iron += iron;
    user.gold += gold;
    user.diamond += diamond;

    user.lastmiming = new Date() * 1;
}

handler.help = ['kurogane'];
handler.tags = ['economy'];
handler.command = ['kurogane', 'recoger'];
handler.register = true;
handler.group = true;

export default handler;
