import {WAMessageStubType} from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, {conn, participants, groupMetadata}) {
  if (!m.messageStubType || !m.isGroup) return !0;
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')
  let img = await (await fetch(`${pp}`)).buffer()
  let chat = global.db.data.chats[m.chat]

  if (chat.bienvenida && m.messageStubType == 27) {
    let bienvenida = `\n ᪥ *Bienvenido* a\n ᪥ *${groupMetadata.subject}* \n \n ᪥ @${m.messageStubParameters[0].split`@`[0]}\n> ✎𝑷𝒖𝒆𝒅𝒆𝒔 𝒖𝒔𝒂𝒓 #𝒎𝒆𝒏𝒖/#𝒉𝒆𝒍𝒑 𝒑𝒂𝒓𝒂 𝒗𝒆𝒓 𝒍𝒂 𝒍𝒊𝒔𝒕𝒂 𝒅𝒆 𝒄𝒐𝒎𝒂𝒏𝒅𝒐𝒔\n> Link 2B:https://whatsapp.com/channel/0029VazHywx0rGiUAYluYB24`
    
await conn.sendAi(m.chat, botname, textbot, bienvenida, img, img, estilo)
  }
  
  if (chat.bienvenida && m.messageStubType == 28) {
    let bye = `\n᪥ *Adiós* de\n*${groupMetadata.subject}*\n \n♡ @${m.messageStubParameters[0].split`@`[0]}\n(づ ◕‿◕ )づ Esperamos verte pronto!\n\n> ✎𝑷𝒖𝒆𝒅𝒆𝒔 𝒖𝒔𝒂𝒓 #𝒎𝒆𝒏𝒖/#𝒉𝒆𝒍𝒑 𝒑𝒂𝒓𝒂 𝒗𝒆𝒓 𝒍𝒂 𝒍𝒊𝒔𝒕𝒂 𝒅𝒆 𝒄𝒐𝒎𝒂𝒏𝒅𝒐𝒔\n> Link 2B:https://whatsapp.com/channel/0029VazHywx0rGiUAYluYB24`
await conn.sendAi(m.chat, botname, textbot, bye, img, img, estilo)
  }
  
  if (chat.bienvenida && m.messageStubType == 32) {
    let kick = `\n᪥ *Hasta pronto*\n᪥ *${groupMetadata.subject}*\n\n♡ @${m.messageStubParameters[0].split`@`[0]}\n(づ ◕‿◕ )づ Esperamos verte pronto!\n\n> ✎𝑷𝒖𝒆𝒅𝒆𝒔 𝒖𝒔𝒂𝒓 #𝒎𝒆𝒏𝒖/#𝒉𝒆𝒍𝒑 𝒑𝒂𝒓𝒂 𝒗𝒆𝒓 𝒍𝒂 𝒍𝒊𝒔𝒕𝒂 𝒅𝒆 𝒄𝒐𝒎𝒂𝒏𝒅𝒐𝒔\n> Link 2B:https://whatsapp.com/channel/0029VazHywx0rGiUAYluYB24`
await conn.sendAi(m.chat, botname, textbot, kick, img, img, estilo)
}}
