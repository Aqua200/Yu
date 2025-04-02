import fetch from 'node-fetch'

const chatHistory = {} // Almacena el historial de cada chat

var handler = async (m, { text, usedPrefix, command }) => {
  let chatId = m.chat
  if (!chatHistory[chatId]) chatHistory[chatId] = [] // Si no hay historial, se crea

  let inputText = text || (m.quoted && m.quoted.sender === conn.user.jid ? m.quoted.text : null)

  if (!inputText) {
    return conn.reply(m.chat, `💬 Ingrese una petición para que Gemini lo responda.`, m)
  }

  try {
    await m.react('⌛')
    conn.sendPresenceUpdate('composing', m.chat)

    // Agregar el nuevo mensaje al historial
    chatHistory[chatId].push(`Usuario: ${inputText}`)

    // Limitar el historial para evitar respuestas muy largas
    if (chatHistory[chatId].length > 10) {
      chatHistory[chatId].shift() // Elimina el mensaje más antiguo
    }

    let fullConversation = chatHistory[chatId].join('\n')

    var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(fullConversation)}`)
    var res = await apii.json()

    let botResponse = res.result
    chatHistory[chatId].push(`Bot: ${botResponse}`) // Guardar respuesta en historial

    await m.reply(botResponse)
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
