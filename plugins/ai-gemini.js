import fetch from 'node-fetch'

var handler = async (m, { text, usedPrefix, command }) => {
  let inputText = text // Guarda el texto original
  
  // Si el mensaje es una respuesta a uno del bot, usa el texto citado
  if (m.quoted && m.quoted.sender === conn.user.jid) {
    inputText = m.quoted.text
  }

  if (!inputText) {
    return conn.reply(m.chat, `${emoji} Ingrese una petición para que Gemini lo responda.`, m)
  }

  try {
    await m.react(rwait)
    conn.sendPresenceUpdate('composing', m.chat)

    var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(inputText)}`)
    var res = await apii.json()

    await m.reply(res.result)
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
