let cooldowns = {}

let handler = async (m, { conn, text, command }) => {
    let users = global.db.data.users
    let senderId = m.sender
    let senderName = conn.getName(senderId)

    let tiempo = 5 * 60
    if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
        let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
        return m.reply(`⏳ Debes esperar *${tiempo2}* para usar *#slut* de nuevo.`)
    }
    cooldowns[senderId] = Date.now()

    let mentionedUser = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null
    let targetUserId = mentionedUser || Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
    
    while (targetUserId === senderId) {
        targetUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
    }

    let targetName = conn.getName(targetUserId)

    conn.sendMessage(m.chat, {
        text: `👅 ${targetName} se la chupó a ${senderName}.`,
        contextInfo: {
            mentionedJid: [targetUserId, senderId]
        }
    }, { quoted: m })

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
