import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

// Mapa global para evitar que un mismo evento se dispare varias veces en menos de 5 segundos
const eventBlocker = new Map()

export async function before(m, { conn, groupMetadata }) {
  // Si no es grupo o no hay evento, salir
  if (!m.isGroup || !m.messageStubType) return !0

  // Solo manejar add y leave para evitar duplicados
  if (![WAMessageStubType.GROUP_PARTICIPANT_ADD, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(m.messageStubType)) return !0

  const who = m.messageStubParameters[0]
  const chat = global.db.data.chats[m.chat]
  const taguser = `@${who.split('@')[0]}`
  const key = `${m.chat}:${m.messageStubType}:${who}`

  // Evitar duplicados: si hace menos de 5 segundos que se disparó el mismo evento, cancelar
  const lastTime = eventBlocker.get(key)
  if (lastTime && (Date.now() - lastTime < 5000)) return
  eventBlocker.set(key, Date.now())

  // Obtener foto de perfil o fallback
  let pp
  try {
    pp = await conn.profilePictureUrl(who, 'image')
  } catch {
    pp = 'https://files.catbox.moe/xr2m6u.jpg'
  }
  const img = await (await fetch(pp)).buffer()

  // Solo enviar si la bienvenida/despedida está activada
  if (chat.welcome) {
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const bienvenida = `
╭─❖ ❍ Bienvenido ❍ ❖─╮
✧ ${taguser}
╰─❖ Grupo: ${groupMetadata.subject}
${global.welcom1}
•(=^●ω●^=)• Disfruta tu estadía
> Usa *#help* para ver comandos.
`.trim()
      await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] })
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const despedida = `
╭─❖ ❍ Despedida ❍ ❖─╮
✧ ${taguser}
╰─❖ Grupo: ${groupMetadata.subject}
${global.welcom2}
•(=^●ω●^=)• Te esperamos pronto
> Usa *#help* cuando regreses.
`.trim()
      await conn.sendMessage(m.chat, { image: img, caption: despedida, mentions: [who] })
    }
  }
}
