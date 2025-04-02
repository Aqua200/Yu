import fetch from 'node-fetch'

const chatHistory = {} // Almacena el historial por chat

var handler = async (m, { text, usedPrefix, command }) => {
  let chatId = m.chat
  if (!chatHistory[chatId]) chatHistory[chatId] = [] // Crea historial si no existe

  let inputText = text || (m.quoted && m.quoted.sender === conn.user.jid ? m.quoted.text : null)

  if (!inputText) {
    return conn.reply(m.chat, `💬 Ingrese una petición para que Gemini lo responda.`, m)
  }

  try {
    await m.react('⌛')
    conn.sendPresenceUpdate('composing', m.chat)

    // Agregar mensaje del usuario al historial
    chatHistory[chatId].push(`Usuario: ${inputText}`)

    // Formar la conversación como contexto
    let fullConversation = chatHistory[chatId].slice(-10).join('\n') // Últimos 10 mensajes

    var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(fullConversation)}`)
    var res = await apii.json()

    let botResponse = res.result
    chatHistory[chatId].push(`Bot: ${botResponse}`) // Guardar respuesta en historial

    // Limitar a los últimos 10 mensajes para no saturar
    if (chatHistory[chatId].length > 10) {
      chatHistory[chatId].shift() // Elimina el mensaje más viejo
    }

    await m.reply(botResponse)

    // Activar modo conversación: el bot responderá a cualquier mensaje sin prefijo
    handler.conversationMode = true  
  } catch (e) {
    await m.react('❌')
    await conn.reply(m.chat, `⚠️ Gemini no puede responder a esa pregunta.`, m)
  }
}

// Hacer que el bot responda sin necesidad de prefijo después de iniciar la conversación
var chatResponder = async (m) => {
  let chatId = m.chat

  if (handler.conversationMode && chatHistory[chatId]) {
    let inputText = m.text
    if (!inputText) return

    try {
      await m.react('⌛')
      conn.sendPresenceUpdate('composing', m.chat)

      // Agregar el nuevo mensaje al historial
      chatHistory[chatId].push(`Usuario: ${inputText}`)
      let fullConversation = chatHistory[chatId].slice(-10).join('\n')

      var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(fullConversation)}`)
      var res = await apii.json()

      let botResponse = res.result
      chatHistory[chatId].push(`Bot: ${botResponse}`)

      // Limitar historial
      if (chatHistory[chatId].length > 10) {
        chatHistory[chatId].shift()
      }

      await m.reply(botResponse)
    } catch (e) {
      await m.react('❌')
    }
  }
}

// Asigna el nuevo manejador para respuestas sin prefijo
handler.before = chatResponder
handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true

export default handler
