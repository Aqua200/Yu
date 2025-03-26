let cooldowns = {}

let handler = async (m, { conn, args, mentionedJid }) => {
    let users = global.db.data.users
    let senderId = m.sender
    let senderName = conn.getName(senderId)

    let tiempo = 5 * 60
    if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
        let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
        return m.reply(`🌸 *Debes esperar ${tiempo2} para volver a usar este comando.*\n\nLos pétalos de cerezo necesitan tiempo para volver a florecer.`)
    }
    cooldowns[senderId] = Date.now()

    let senderCoin = users[senderId]?.coin || 0

    if (!mentionedJid) mentionedJid = []
    if (m.text) {
        const mentionRegex = /@(\d+)/g
        let match
        while ((match = mentionRegex.exec(m.text)) !== null) {
            const possibleMention = match[1] + '@s.whatsapp.net'
            if (!mentionedJid.includes(possibleMention) && users[possibleMention]) {
                mentionedJid.push(possibleMention)
            }
        }
    }

    let targetUserId = null
    if (mentionedJid && mentionedJid.length > 0) {
        const validMentions = mentionedJid.filter(id => id !== senderId && users[id])
        if (validMentions.length > 0) {
            targetUserId = validMentions[0]
        }
    }

    if (!targetUserId) {
        let userKeys = Object.keys(users).filter(id => id !== senderId && users[id])
        if (userKeys.length === 0) {
            return m.reply("⚠️ No hay suficientes usuarios registrados para usar este comando.")
        }
        targetUserId = userKeys[Math.floor(Math.random() * userKeys.length)]
    }

    if (!targetUserId || !users[targetUserId]) {
        return m.reply("⚠️ No se pudo encontrar un usuario válido para este comando.")
    }

    let targetUserCoin = users[targetUserId]?.coin || 0
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
                text: `🌸 Bajo los cerezos, sedujiste a @${targetUserId.split("@")[0]} y recibiste *${amountTaken} monedas* como recompensa por tu encanto.\n\n*+${amountTaken} monedas* para ${senderName}.`,
                contextInfo: { mentionedJid: [targetUserId] },
            }, { quoted: m })
            break

        case 1:
            let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCoin - minAmount + 1)) + minAmount, senderCoin, maxAmount)
            if (isNaN(amountSubtracted) || amountSubtracted <= 0) {
                amountSubtracted = Math.min(minAmount, senderCoin)
            }
            users[senderId].coin -= amountSubtracted
            conn.sendMessage(m.chat, {
                text: `🍂 La brisa de los cerezos no estuvo de tu lado y @${targetUserId.split("@")[0]} descubrió tu engaño.\n*-${amountSubtracted} monedas* perdidas por ${senderName}.`,
                contextInfo: { mentionedJid: [targetUserId] },
            }, { quoted: m })
            break

        case 2:
            let smallAmountTaken = Math.min(Math.floor(Math.random() * (targetUserCoin / 2 - minAmount + 1)) + minAmount, targetUserCoin, maxAmount)
            if (isNaN(smallAmountTaken) || smallAmountTaken <= 0) {
                smallAmountTaken = Math.min(minAmount, targetUserCoin)
            }
            users[senderId].coin += smallAmountTaken
            users[targetUserId].coin = Math.max(0, users[targetUserId].coin - smallAmountTaken)
            conn.sendMessage(m.chat, {
                text: `🌸 Con un dulce susurro entre pétalos, @${targetUserId.split("@")[0]} te entregó *${smallAmountTaken} monedas*.\n\n*+${smallAmountTaken} monedas* para ${senderName}.`,
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
