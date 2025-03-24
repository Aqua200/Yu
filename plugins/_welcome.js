import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn }) {
  if (!m.messageStubType || !m.isGroup) return true

  let who = m.messageStubParameters[0]
  let taguser = `@${who.split('@')[0]}`
  let chat = global.db.data.chats[m.chat]
  let defaultImage = 'https://files.catbox.moe/xr2m6u.jpg'

  if (chat.welcome) {
    // Obtener metadata actualizada para tener el número exacto de participantes
    let updatedGroupMetadata = await conn.groupMetadata(m.chat)
    let cantidad = updatedGroupMetadata.participants.length

    let img
    try {
      let pp = await conn.profilePictureUrl(who, 'image')
      img = await (await fetch(pp)).buffer()
    } catch {
      img = await (await fetch(defaultImage)).buffer()
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      let bienvenida = `
╭─▸ 𖥻 Bienvenida a *${updatedGroupMetadata.subject}*  
│ Nombre: ${taguser}  
│  
│ ${global.welcom1}  
│  
│ Actualmente somos *${cantidad}* integrantes  
╰─────────────▸  
Comandos disponibles: *#help*`
      await conn.sendMessage(m.chat, { image: img, caption: bienvenida.trim(), mentions: [who] })

    } else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      // En la despedida ya el usuario salió, así que restamos uno
      let despedida = `
╭─▸ 𖥻 Despedida de *${updatedGroupMetadata.subject}*  
│ Usuario: ${taguser}  
│  
│ ${global.welcom2}  
│  
│ Se fue uno, ahora somos *${cantidad}*  
╰─────────────▸  
Comandos disponibles: *#help*`
      await conn.sendMessage(m.chat, { image: img, caption: despedida.trim(), mentions: [who] })
    }
  }

  return true
}
