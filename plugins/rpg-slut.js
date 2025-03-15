let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix, args, mentionedJid }) => {
    let users = global.db.data.users
    let senderId = m.sender
    let senderName = conn.getName(senderId)

    let tiempo = 5 * 60
    if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
        let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
        m.reply(`⏳ Debes esperar *${tiempo2}* para usar *#slut* de nuevo.`)
        return
    }
    cooldowns[senderId] = Date.now()

    let senderCoin = users[senderId].coin || 0

    // Verificar si se mencionó a alguien o seleccionar al azar
    let targetUserId = mentionedJid[0] || Object.keys(users).filter(id => id !== senderId)[Math.floor(Math.random() * Object.keys(users).length)]
    if (!targetUserId || !users[targetUserId]) {
        return m.reply("⚠️ No se encontró al usuario mencionado o no hay suficientes usuarios registrados.")
    }

    let targetUserCoin = users[targetUserId].coin || 0
    let targetUserName = conn.getName(targetUserId)

    let minAmount = 15
    let maxAmount = 50
    let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
    let randomOption = Math.floor(Math.random() * 3)

    switch (randomOption) {
        case 0:
            users[senderId].coin += amountTaken
            users[targetUserId].coin = Math.max(0, users[targetUserId].coin - amountTaken)
            conn.sendMessage(m.chat, {
                text: `💰 ¡Se la chupaste a @${targetUserId.split("@")[0]} por *${amountTaken} monedas*! Lo dejaste bien seco.\n\nSe suman *+${amountTaken} monedas* a ${senderName}.`,
                contextInfo: { mentionedJid: [targetUserId] },
            }, { quoted: m })
            break

        case 1:
            let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCoin - minAmount + 1)) + minAmount, senderCoin, maxAmount)
            users[senderId].coin -= amountSubtracted
            conn.reply(m.chat, `❌ No fuiste cuidadoso y le rompiste la verga a tu cliente, se te restaron *-${amountSubtracted} monedas* a ${senderName}.`, m)
            break

        case 2:
            let smallAmountTaken = Math.min(Math.floor(Math.random() * (targetUserCoin / 2 - minAmount + 1)) + minAmount, targetUserCoin, maxAmount)
            users[senderId].coin += smallAmountTaken
            users[targetUserId].coin = Math.max(0, users[targetUserId].coin - smallAmountTaken)
            conn.sendMessage(m.chat, {
                text: `💸 Le diste unos sentones y te pagaron *${smallAmountTaken} monedas* de @${targetUserId.split("@")[0]}, lo dejaste paralítico.\n\nSe suman *+${smallAmountTaken} monedas* a ${senderName}.`,
                contextInfo: { mentionedJid: [targetUserId] },
            }, { quoted: m })
            break
    }

    global.db.write()
}

handler.tags = ['rpg']
handler.help = ['slut']
handler.command = ['slut', 'prostituirse']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
    let minutos = Math.floor(segundos / 60)
    let segundosRestantes = segundos % 60
    return `${minutos} minutos y ${segundosRestantes} segundos`
}
