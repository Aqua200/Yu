let cooldowns = {}

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    let tiempo = 5 * 60 // 5 minutos de cooldown
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
        const tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
        conn.reply(m.chat, `${emoji3} Debes esperar *${tiempo2}* para usar *#kurogane* de nuevo.`, m)
        return
    }

    // Generar cantidad de yenes de 1000 a 2000 aleatoriamente
    let yenes = Math.floor(Math.random() * 1001) + 1000; // entre 1000 y 2000 yenes

    // Incrementar el contador global de uso del comando
    global.db.data.stats.kuroganeUses = (global.db.data.stats.kuroganeUses || 0) + 1;

    // Mensaje base con la cantidad de yenes ganados
    let info = `🎉 ¡Felicidades! Has encontrado en *Kurogane (黒金の森)*:\n\n` +
        `💴 *Yenes*: ${yenes} yenes`;

    // Mostrar cuántas veces se ha usado el comando globalmente
    info += `\n🔢 *Usos del comando (todos los usuarios)*: ${global.db.data.stats.kuroganeUses} veces.`;

    // Enviar mensaje con imagen del lugar
    await conn.sendFile(m.chat, "https://qu.ax/GtiGX.jpeg", 'kurogane.jpg', info, fkontak);
    await m.react('🌳');

    // Sumar los yenes al usuario
    user.yenes += yenes;

    // Guardar el tiempo de último uso del comando
    cooldowns[m.sender] = Date.now();
}

handler.help = ['kurogane']
handler.tags = ['economy']
handler.command = ['kurogane', 'recoger']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
    let minutos = Math.floor((segundos % 3600) / 60)
    let segundosRestantes = segundos % 60
    return `${minutos} minutos y ${segundosRestantes} segundos`
}
