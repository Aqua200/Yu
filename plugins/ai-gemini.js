import fetch from 'node-fetch'

var handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `${emoji} Ingrese una petición para que Gemini lo responda.`, m)
  }

  try {
    await m.react(rwait)
    conn.sendPresenceUpdate('composing', m.chat)

    // Verificar si el mensaje es respuesta a uno del bot
    if (m.quoted && m.quoted.sender === conn.user.jid) {
      text = m.quoted.text // Usa el mensaje original citado
    }

    var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(text)}`)
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
