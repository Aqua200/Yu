import fetch from 'node-fetch'

const chatHistory = {} // Objeto para almacenar el historial de cada chat

var handler = async (m, { text, usedPrefix, command }) => {
  let chatId = m.chat
  if (!chatHistory[chatId]) chatHistory[chatId] = [] // Si no hay historial, se crea

  let inputText = text || (m.quoted && m.quoted.sender === conn.user.jid ? m.quoted.text : null)

  if (!inputText) {
    return conn.reply(m.chat, `${emoji} Ingrese una petición para que Gemini lo responda.`, m)
  }

  try {
    await m.react(rwait)
    conn.sendPresenceUpdate('composing', m.chat)

    // Agregar el nuevo mensaje al historial
    chatHistory[chatId].push({ role: 'user', content: inputText })

    var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(JSON.stringify(chatHistory[chatId]))}`)
    var res = await apii.json()

    let botResponse = res.result
    chatHistory[chatId].push({ role: 'bot', content: botResponse }) // Guardar respuesta en historial

    await m.reply(botResponse)
  } catch (e) {
    await m.react('❌')
    await conn.reply(m.chat, `${msm} Gemini no puede responder a esa pregunta.`, m)
  }
}

handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true

export default handler
