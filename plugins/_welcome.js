import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

// Mapa para evitar duplicados
const eventosRecientes = new Map()

export async function before(m, { conn, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return !0

  const tipoEvento = m.messageStubType
  const who = m.messageStubParameters[0]
  const chat = global.db.data.chats[m.chat]
  const taguser = `@${who.split('@')[0]}`

  // Solo manejar entradas y salidas
  if (![WAMessageStubType.GROUP_PARTICIPANT_ADD, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(tipoEvento)) return !0

  // Prevenir duplicados con tiempo de bloqueo de 3s
  const eventoID = `${m.chat}-${tipoEvento}-${who}`
  const ahora = Date.now()
  if (eventosRecientes.has(eventoID) && (ahora - eventosRecientes.get(eventoID)) < 3000) return !0
  eventosRecientes.set(eventoID, ahora)

  // Obtener foto de perfil
  const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
  const img = await (await fetch(pp)).buffer()

  // Enviar bienvenida o despedida
  if (chat.welcome) {
    if (tipoEvento === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const bienvenida = `❀ *Bienvenido* a ${groupMetadata.subject}\n ✰ ${taguser}\n${global.welcom1}\n •(=^●ω●^=)• Disfruta tu estadía!\n> ✐ Usa *#help* para ver los comandos.`
      await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] })
    }

    if (tipoEvento === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const despedida = `❀ *Adiós* de ${groupMetadata.subject}\n ✰ ${taguser}\n${global.welcom2}\n •(=^●ω●^=)• Te esperamos pronto!\n> ✐ Usa *#help* si vuelves!`
      await conn.sendMessage(m.chat, { image: img, caption: despedida, mentions: [who] })
    }
  }
}
