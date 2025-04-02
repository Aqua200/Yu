import fetch from 'node-fetch'

const chatHistory = {}

var handler = async (m, { text, usedPrefix, command, conn }) => {
  let chatId = m.chat
  if (!chatHistory[chatId]) chatHistory[chatId] = []

  let inputText = text || (m.quoted && m.quoted.sender === conn.user.jid ? m.quoted.text : null)

  if (!inputText) {
    return conn.reply(m.chat, `💬 Escribe algo para que pueda responder.`, m)
  }

  try {
    await m.react('⌛')
    conn.sendPresenceUpdate('composing', m.chat)

    chatHistory[chatId].push({ role: 'user', content: inputText })

    let fullConversation = chatHistory[chatId]
      .slice(-10)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    let apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(fullConversation)}`)
    let res = await apii.json()

    // **Validar si la API devuelve una respuesta correcta**
    if (!res || !res.result) {
      throw new Error("La API no devolvió una respuesta válida.")
    }

    let botResponse = res.result
    chatHistory[chatId].push({ role: 'bot', content: botResponse })

    if (chatHistory[chatId].length > 10) chatHistory[chatId].shift()

    await m.reply(botResponse)
    handler.conversationMode = true  
  } catch (e) {
    console.error("[ERROR API GEMINI]:", e)
    await m.react('❌')
    await conn.reply(m.chat, `⚠️ No pude obtener una respuesta en este momento. Inténtalo de nuevo más tarde.`, m)
  }
}

var chatResponder = async (m, { conn }) => {
  let chatId = m.chat

  if (!handler.conversationMode || !chatHistory[chatId]) return
  if (m.sender === conn.user.jid) return 

  if (m.isGroup && !m.mentionedJid.includes(conn.user.jid) && (!m.quoted || m.quoted.sender !== conn.user.jid)) {
    return
  }

  let inputText = m.text
  if (!inputText) return

  try {
    await m.react('⌛')
    conn.sendPresenceUpdate('composing', m.chat)

    chatHistory[chatId].push({ role: 'user', content: inputText })
    
    let fullConversation = chatHistory[chatId]
      .slice(-10)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    let apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(fullConversation)}`)
    let res = await apii.json()

    if (!res || !res.result) {
      throw new Error("La API no devolvió una respuesta válida.")
    }

    let botResponse = res.result
    chatHistory[chatId].push({ role: 'bot', content: botResponse })

    if (chatHistory[chatId].length > 10) chatHistory[chatId].shift()

    await m.reply(botResponse)
  } catch (e) {
    console.error("[ERROR API GEMINI]:", e)
    await m.react('❌')
  }
}

handler.before = chatResponder
handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true

export default handler
