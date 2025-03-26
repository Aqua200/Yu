let users = {};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [eleccion, cantidad] = text.split(' ');
    if (!eleccion || !cantidad) {
        return m.reply(`${emoji} La brisa de la temporada de cerezos sopla suavemente...\nPor favor, elige cara o cruz y una cantidad de ${moneda} para apostar.\nEjemplo: *${usedPrefix + command} cara 50*`);
    }

    eleccion = eleccion.toLowerCase();
    cantidad = parseInt(cantidad);
    if (eleccion !== 'cara' && eleccion !== 'cruz') {
        return m.reply(`${emoji2} Bajo los pétalos de sakura, elige sabiamente: cara o cruz.\nEjemplo: *${usedPrefix + command} cara 50*`);
    }

    if (isNaN(cantidad) || cantidad <= 0) {
        return m.reply(`${emoji2} La cantidad no es válida. Apuesta una cantidad de ${moneda} mientras los cerezos florecen.\nEjemplo: *${usedPrefix + command} cara 50*`);
    }

    let userId = m.sender;
    if (!users[userId]) users[userId] = { coin: 100 };
    let user = global.db.data.users[m.sender];
    if (user.coin < cantidad) {
        return m.reply(`${emoji2} Entre los pétalos cayendo... no tienes suficientes ${moneda} para apostar. Actualmente tienes ${user.coin} ${moneda}.`);
    }

    let resultado = Math.random() < 0.5 ? 'cara' : 'cruz';
    let mensaje = `🌸 La moneda ha sido lanzada bajo el cielo de cerezos...\n\n`
    if (resultado === eleccion) {
        user.coin += cantidad;
        mensaje += `La moneda cayó en *${resultado}* y la suerte floreció para ti.\n¡Has ganado *${cantidad} ${moneda}*!`;
    } else {
        user.coin -= cantidad;
        mensaje += `La moneda cayó en *${resultado}* y los pétalos se alejaron de tu suerte.\nHas perdido *${cantidad} ${moneda}*.`;
    }

    mensaje += `\n\n✨ Que la fortuna siga acompañándote mientras los cerezos estén en flor. 🌸`

    await conn.reply(m.chat, mensaje, m);
};

handler.help = ['cf'];
handler.tags = ['economy'];
handler.command = ['cf', 'suerte', 'caracruz'];
handler.group = true;
handler.register = true;

export default handler;
