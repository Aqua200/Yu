import db from '../lib/database.js'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    if (who == conn.user.jid) return m.react('✖️')
    if (!(who in global.db.data.users)) return m.reply(`${emoji} El usuario no se encuentra en mi base de datos*`)
  
    let user = global.db.data.users[who]
    let total = (user.coin || 0) + (user.bank || 0);

    const texto = `ᥫ᭡ Informacion -  Economia ❀
 
ᰔᩚ Usuario » *${conn.getName(who)}*   
⛀ Dinero » *${user.coin} ${moneda}*
⚿ Banco » *${user.bank} ${moneda}*
⛁ Total » *${total} ${moneda}*

> *Para proteger tu dinero, ¡depósitalo en el banco usando #deposit!*`;

    // Enviar mensaje con imagen pero sin descarga automática
    await conn.sendMessage(m.chat, {
        image: { url: "https://files.catbox.moe/wzheg1.jpg" }, // Reemplaza con tu URL
        caption: texto,
        contextInfo: {
            externalAdReply: {
                title: '💰 Balance Económico 💰',
                body: `Usuario: ${conn.getName(who)}`,
                thumbnail: null // Esto evita que se muestre miniaturas adicionales
            }
        }
    }, { quoted: m })
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank'] 
handler.register = true 
handler.group = true 

export default handler
