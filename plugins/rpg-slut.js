let cooldowns = {}

let handler = async (m, { conn, args, mentionedJid }) => {
    let users = global.db.data.users
    let senderId = m.sender
    let senderName = conn.getName(senderId)

    // Depurar información de menciones
    console.log('Menciones recibidas:', mentionedJid)
    
    let tiempo = 5 * 60
    if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
        let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
        return m.reply(`⏳ Debes esperar *${tiempo2}* para usar *#slut* de nuevo.`)
    }
    cooldowns[senderId] = Date.now()

    let senderCoin = users[senderId]?.coin || 0

    // Verificar que mentionedJid sea un array válido
    if (!mentionedJid) mentionedJid = []
    
    // Si hay texto que parece una mención pero no está en mentionedJid, intentar extraerlo
    // Este bloque es para capturar menciones que podrían no estar siendo procesadas correctamente
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
    
    console.log('Menciones procesadas:', mentionedJid)

    let targetUserId = null
    
    // Si hay usuarios mencionados válidos, usar el primero que no sea el remitente
    if (mentionedJid && mentionedJid.length > 0) {
        // Filtrar menciones válidas (que existan en la base de datos y no sean el remitente)
        const validMentions = mentionedJid.filter(id => id !== senderId && users[id])
        console.log('Menciones válidas:', validMentions)
        
        if (validMentions.length > 0) {
            targetUserId = validMentions[0]
            console.log('Usuario objetivo seleccionado por mención:', targetUserId)
        }
    }
    
    // Solo si no hay menciones válidas, elegir un usuario aleatorio
    if (!targetUserId) {
        // Filtramos usuarios válidos (que no sean el remitente)
        let userKeys = Object.keys(users).filter(id => id !== senderId && users[id])
        
        if (userKeys.length === 0) {
            return m.reply("⚠️ No hay suficientes usuarios registrados para usar este comando.")
        }
        
        // Elegir un usuario aleatorio
        targetUserId = userKeys[Math.floor(Math.random() * userKeys.length)]
        console.log('Usuario objetivo seleccionado aleatoriamente:', targetUserId)
    }

    // Verificación final
    if (!targetUserId || !users[targetUserId]) {
        return m.reply("⚠️ No se pudo encontrar un usuario válido para este comando.")
    }

    // Información de depuración
    m.reply(`Debug: Usuario mencionado: ${targetUserId.split('@')[0]}`)

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
                text: `💰 ¡Se la chupaste a @${targetUserId.split("@")[0]} por *${amountTaken} monedas*! Lo dejaste bien seco.\n\nSe suman *+${amountTaken} monedas* a ${senderName}.`,
                contextInfo: { mentionedJid: [targetUserId] },
            }, { quoted: m })
            break

        case 1:
            let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCoin - minAmount + 1)) + minAmount, senderCoin, maxAmount)
            
            // Verificar que amountSubtracted sea positivo
            if (isNaN(amountSubtracted) || amountSubtracted <= 0) {
                amountSubtracted = Math.min(minAmount, senderCoin)
            }
            
            users[senderId].coin -= amountSubtracted
            conn.sendMessage(m.chat, {
                text: `❌ No fuiste cuidadoso y le rompiste la verga a @${targetUserId.split("@")[0]}, se te restaron *-${amountSubtracted} monedas* a ${senderName}.`,
                contextInfo: { mentionedJid: [targetUserId] },
            }, { quoted: m })
            break

        case 2:
            let smallAmountTaken = Math.min(Math.floor(Math.random() * (targetUserCoin / 2 - minAmount + 1)) + minAmount, targetUserCoin, maxAmount)
            
            // Verificar que smallAmountTaken sea positivo
            if (isNaN(smallAmountTaken) || smallAmountTaken <= 0) {
                smallAmountTaken = Math.min(minAmount, targetUserCoin)
            }
            
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
