import fetch from 'node-fetch'

const chatHistory = {} // Guarda el historial por cada chat

var handler = async (m, { text, usedPrefix, command, conn }) => {
  let chatId = m.chat

  // Si no hay historial, crearlo
  if (!chatHistory[chatId]) chatHistory[chatId] = []

  let inputText = text || (m.quoted && m.quoted.sender === conn.user.jid ? m.quoted.text : null)

  if (!inputText) {
    return conn.reply(m.chat, `💬 Ingrese una pregunta para que Gemini lo responda.`, m)
  }

  try {
    await m.react('⌛')
    conn.sendPresenceUpdate('composing', m.chat)

    // Guardar mensaje del usuario en el historial
    chatHistory[chatId].push({ role: 'user', content: inputText })

    // Construir el historial para dar contexto
    let fullConversation = chatHistory[chatId]
      .slice(-10) // Solo toma los últimos 10 mensajes
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(fullConversation)}`)
    var res = await apii.json()

    let botResponse = res.result
    chatHistory[chatId].push({ role: 'bot', content: botResponse }) // Guardar respuesta en historial

    // Limitar a los últimos 10 mensajes
    if (chatHistory[chatId].length > 10) chatHistory[chatId].shift()

    await m.reply(botResponse)

    // Activar conversación para que el bot responda sin prefijo
    handler.conversationMode = true  
  } catch (e) {
    await m.react('❌')
    await conn.reply(m.chat, `⚠️ No puedo responder a esa pregunta.`, m)
  }
}

// **Manejador para continuar la conversación sin prefijo**
var chatResponder = async (m, { conn }) => {
  let chatId = m.chat

  if (!handler.conversationMode || !chatHistory[chatId]) return // Si la conversación no está activa, ignorar

  if (m.sender === conn.user.jid) return // Evita que el bot se auto-responda

  // **En grupos**, solo responde si lo mencionan o le responden a un mensaje suyo
  if (m.isGroup && !m.mentionedJid.includes(conn.user.jid) && (!m.quoted || m.quoted.sender !== conn.user.jid)) {
    return
  }

  let inputText = m.text
  if (!inputText) return

  try {
    await m.react('⌛')
    conn.sendPresenceUpdate('composing', m.chat)

    // Guardar mensaje del usuario
    chatHistory[chatId].push({ role: 'user', content: inputText })
    
    let fullConversation = chatHistory[chatId]
      .slice(-10) // Últimos 10 mensajes
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

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

// **Configurar el manejador para detectar respuestas sin prefijo**
handler.before = chatResponder
handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true

export default handler
