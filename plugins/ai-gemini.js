import fetch from 'node-fetch'

const chatHistory = {} // Historial por cada chat

var handler = async (m, { text, usedPrefix, command }) => {
  let chatId = m.chat
  if (!chatHistory[chatId]) chatHistory[chatId] = [] // Crear historial si no existe

  let inputText = text || (m.quoted && m.quoted.sender === conn.user.jid ? m.quoted.text : null)

  if (!inputText) {
    return conn.reply(m.chat, `💬 Ingrese una petición para que Gemini lo responda.`, m)
  }

  try {
    await m.react('⌛')
    conn.sendPresenceUpdate('composing', m.chat)

    // Agregar el mensaje al historial
    chatHistory[chatId].push(`Usuario: ${inputText}`)

    // Enviar el historial como texto completo
    let fullConversation = chatHistory[chatId].join('\n')

    var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(fullConversation)}`)
    var res = await apii.json()

    let botResponse = res.result
    chatHistory[chatId].push(`Bot: ${botResponse}`) // Guardar respuesta

    // Limitar a los últimos 10 mensajes
    if (chatHistory[chatId].length > 10) {
      chatHistory[chatId].shift() // Borra el mensaje más antiguo
    }

    await m.reply(`🤖 ${botResponse}`)
  } catch (e) {
    await m.react('❌')
    await conn.reply(m.chat, `⚠️ Gemini no puede responder a esa pregunta.`, m)
  }
}

handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true

export default handler
