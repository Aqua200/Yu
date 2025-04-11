import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;
  
  let chat = global.db.data.chats[m.chat]
  let groupSize = participants.length
  
  if (m.messageStubType == 27) {
    groupSize++;
  } else if (m.messageStubType == 28 || m.messageStubType == 32) {
    groupSize--;
  }

  if (chat.welcome && m.messageStubType == 27) {
    let user = m.messageStubParameters[0].split('@')[0]
    let bienvenida = `
✦═════════════✦  
   🤍 *BIENVENIDO(A)* 🤍  
✦═════════════✦  

   ✧ @${user}  
   ✧ Al grupo: *${groupMetadata.subject}*  
   ✧ Miembros: *${groupSize}*  

   💜 *¡Disfruta tu estadía!*  
   📜 *Normas:* Respeto y buen humor.  

✦═════════════✦  
   🔹 Usa *#menu* para ver comandos  
✦═════════════✦  
    `
    await conn.sendMessage(m.chat, { 
      text: bienvenida, 
      mentions: [m.messageStubParameters[0]] 
    })
  }
  
  if (chat.welcome && (m.messageStubType == 28 || m.messageStubType == 32)) {
    let user = m.messageStubParameters[0].split('@')[0]
    let despedida = `
✦═════════════✦  
   🖤 *ADIÓS* 🖤  
✦═════════════✦  

   ✧ @${user}  
   ✧ Ha dejado: *${groupMetadata.subject}*  
   ✧ Miembros restantes: *${groupSize}*  

   🌟 *¡Te esperamos de vuelta!*  

✦═════════════✦  
   🔸 Gracias por tu participación  
✦═════════════✦  
    `
    await conn.sendMessage(m.chat, { 
      text: despedida, 
      mentions: [m.messageStubParameters[0]] 
    })
  }
}
