import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

// Mapa para evitar envíos duplicados en menos de 3 segundos
const lastEvent = new Map()

export async function before(m, { conn, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return !0

  // Solo manejar eventos add o leave
  if (![WAMessageStubType.GROUP_PARTICIPANT_ADD, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(m.messageStubType)) return !0

  const who = m.messageStubParameters[0]
  const taguser = `@${who.split('@')[0]}`
  const chat = global.db.data.chats[m.chat]

  // Evitar duplicados: si hace menos de 3 segundos que se procesó este evento para ese usuario, no repite
  const key = `${m.chat}-${m.messageStubType}-${who}`
  const now = Date.now()
  if (lastEvent.has(key) && (now - lastEvent.get(key)) < 3000) return !0
  lastEvent.set(key, now)

  const pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')
  const img = await (await fetch(pp)).buffer()

  if (chat.welcome) {
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const bienvenida = `❀ *Bienvenido* a ${groupMetadata.subject}\n ✰ ${taguser}\n${global.welcom1}\n •(=^●ω●^=)• Disfruta tu estadía en el grupo!\n> ✐ Usa *#help* para ver la lista de comandos.`
      await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] })
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const despedida = `❀ *Adiós* de ${groupMetadata.subject}\n ✰ ${taguser}\n${global.welcom2}\n •(=^●ω●^=)• Te esperamos pronto!\n> ✐ Usa *#help* para ver la lista de comandos.`
      await conn.sendMessage(m.chat, { image: img, caption: despedida, mentions: [who] })
    }
  }
}
