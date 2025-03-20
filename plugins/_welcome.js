import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;

  let who = m.messageStubParameters[0]
  let taguser = `@${who.split('@')[0]}`
  let chat = global.db.data.chats[m.chat]
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')
  let img = await (await fetch(pp)).buffer()
  let totalMiembros = participants.length

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    let bienvenida = `╭━━━━━━♡・❀・♡━━━━━━╮
✦  𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝𝐨 ~!  
✰ ${taguser}  

${global.welcom1}

✦  Ahora somos *${totalMiembros} miembros* en *${groupMetadata.subject}*  

> ✐ Usa *#help* para ver mis comandos  
╰━━━━━━♡・❀・♡━━━━━━╯`
    await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] })
  }

  if (chat.welcome && (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE)) {
    let despedida = `╭━━━━━━♡・❀・♡━━━━━━╮
✦  𝐇𝐚𝐬𝐭𝐚 𝐩𝐫𝐨𝐧𝐭𝐨 ~!  
✰ ${taguser}  

${global.welcom2}

✦  Ahora somos *${totalMiembros} miembros* en *${groupMetadata.subject}*  

> ✐ Usa *#help* para ver mis comandos  
╰━━━━━━♡・❀・♡━━━━━━╯`
    await conn.sendMessage(m.chat, { image: img, caption: despedida, mentions: [who] })
  }
}
