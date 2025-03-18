import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true

  const chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return true

  const who = m.messageStubParameters[0]
  const taguser = `@${who.split('@')[0]}`
  let pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
  const img = await (await fetch(pp)).buffer()

  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const bienvenida = `❀ *Bienvenido* a ${groupMetadata.subject}\n✰ ${taguser}\n${global.welcom1}\n •(=^●ω●^=)• ¡Disfruta tu estadía!\n> ✐ Usa *#help* para comandos.`
    await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] })
  }

  if ([WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE].includes(m.messageStubType)) {
    const despedida = `❀ *Adiós* de ${groupMetadata.subject}\n✰ ${taguser}\n${global.welcom2}\n •(=^●ω●^=)• ¡Te esperamos pronto!\n> ✐ Usa *#help* para comandos.`
    await conn.sendMessage(m.chat, { image: img, caption: despedida, mentions: [who] })
  }
}
