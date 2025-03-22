import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true

  let who = m.messageStubParameters[0]
  let taguser = `@${who.split('@')[0]}`
  let chat = global.db.data.chats[m.chat]
  let defaultImage = 'https://files.catbox.moe/xr2m6u.jpg'

  if (chat.welcome) {
    let img
    try {
      let pp = await conn.profilePictureUrl(who, 'image')
      img = await (await fetch(pp)).buffer()
    } catch {
      img = await (await fetch(defaultImage)).buffer()
    }

    let cantidad = participants.length

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      let bienvenida = `
╭─▸ 𖥻 Bienvenida a *${groupMetadata.subject}*  
│ Nombre: ${taguser}  
│  
│ ${global.welcom1}  
│  
│ Actualmente somos *${cantidad}* integrantes  
╰─────────────▸  
Comandos disponibles: *#help*`
      await conn.sendMessage(m.chat, { image: img, caption: bienvenida.trim(), mentions: [who] })
    } else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      let despedida = `
╭─▸ 𖥻 Despedida de *${groupMetadata.subject}*  
│ Usuario: ${taguser}  
│  
│ ${global.welcom2}  
│  
│ Se fue uno, ahora somos *${cantidad - 1}*  
╰─────────────▸  
Comandos disponibles: *#help*`
      await conn.sendMessage(m.chat, { image: img, caption: despedida.trim(), mentions: [who] })
    }
  }

  return true
}
