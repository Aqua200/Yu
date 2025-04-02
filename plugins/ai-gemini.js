import fetch from 'node-fetch'

const chatHistory = {} // Almacena el historial por chat

var handler = async (m, { text, usedPrefix, command, conn }) => {
  let chatId = m.chat

  // Asegurar que el historial exista
  if (!chatHistory[chatId]) chatHistory[chatId] = []

  let inputText = text || (m.quoted && m.quoted.sender === conn.user.jid ? m.quoted.text : null)

  if (!inputText) {
    return conn.reply(m.chat, `💬 Ingrese una petición para que Gemini lo responda.`, m)
  }

  try {
    await m.react('⌛')
    conn.sendPresenceUpdate('composing', m.chat)

    // Agregar mensaje del usuario al historial
    chatHistory[chatId].push({ role: 'user', content: inputText })

    // Enviar el historial como contexto (máximo 10 mensajes)
    let fullConversation = chatHistory[chatId].slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n')

    var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(fullConversation)}`)
    var res = await apii.json()

    let botResponse = res.result
    chatHistory[chatId].push({ role: 'bot', content: botResponse }) // Guardar respuesta

    // Limitar a los últimos 10 mensajes
    if (chatHistory[chatId].length > 10) chatHistory[chatId].shift()

    await m.reply(botResponse)

    // Activar conversación
    handler.conversationMode = true  
  } catch (e) {
    await m.react('❌')
    await conn.reply(m.chat, `⚠️ Gemini no puede responder a esa pregunta.`, m)
  }
}

// Responder mensajes sin prefijo, pero evitando que el bot se auto-responda
var chatResponder = async (m, { conn }) => {
  let chatId = m.chat

  if (handler.conversationMode && chatHistory[chatId]) {
    if (m.isGroup && !m.mentionedJid.includes(conn.user.jid)) return // Solo responde si lo mencionan en grupos
    if (m.sender === conn.user.jid) return // Evita que el bot se responda a sí mismo

    let inputText = m.text
    if (!inputText) return

    try {
      await m.react('⌛')
      conn.sendPresenceUpdate('composing', m.chat)

      // Agregar mensaje del usuario
      chatHistory[chatId].push({ role: 'user', content: inputText })
      let fullConversation = chatHistory[chatId].slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n')

      var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(fullConversation)}`)
      var res = await apii.json()

      let botResponse = res.result
      chatHistory[chatId].push({ role: 'bot', content: botResponse }) // Guardar respuesta

      // Limitar historial
      if (chatHistory[chatId].length > 10) chatHistory[chatId].shift()

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
