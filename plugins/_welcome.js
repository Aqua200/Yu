import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, participants, groupMetadata }) {
  // Validaciones iniciales
  if (!m.messageStubType || !m.isGroup) return;
  if (!global.db.data.chats) global.db.data.chats = {};
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  
  const chat = global.db.data.chats[m.chat];
  let groupSize = participants.length;
  
  // Actualizar conteo de miembros
  switch (m.messageStubType) {
    case WAMessageStubType.GROUP_PARTICIPANT_JOIN:
      groupSize++;
      break;
    case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
    case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
      groupSize--;
      break;
  }

  // Mensaje de BIENVENIDA (con imagen)
  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_JOIN) {
    const user = m.messageStubParameters[0]?.split('@')[0] || 'Usuario';
    const welcomeMsg = `
 *¡BIENVENIDO/A!* 

    ✧ @${user}  
    ✧ Al grupo: *${groupMetadata.subject || 'Sin nombre'}*  
    ✧ Miembros: *${groupSize}*  

📜 *Normas:*  
   ✔ Respeto a todos  
   ✔ No spam  
   ✔ Disfruta el grupo  

 Usa *#menu* para ver comandos
    `.trim();
    
    try {
      await conn.sendMessage(m.chat, {
        image: { url: 'https://files.catbox.moe/acf346.jpg' }, // Imagen de bienvenida
        caption: welcomeMsg,
        mentions: [m.messageStubParameters[0]]
      });
    } catch (e) {
      console.error('Error en bienvenida:', e);
      await conn.sendMessage(m.chat, {
        text: welcomeMsg,
        mentions: [m.messageStubParameters[0]]
      });
    }
  }

  // Mensaje de DESPEDIDA (con imagen)
  if (chat.welcome && (
      m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || 
      m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE
  )) {
    const user = m.messageStubParameters[0]?.split('@')[0] || 'Usuario';
    const leaveMsg = `
 *Adios* 

   ✦ @${user}  
   ✦ Ha dejado: *${groupMetadata.subject || 'el grupo'}*  
   ✦ Miembros restantes: *${groupSize}*  

 *¡Esperamos verte de vuelta!*
    `.trim();
    
    try {
      await conn.sendMessage(m.chat, {
        image: { url: 'https://files.catbox.moe/acf346.jpg' }, // Imagen de despedida
        caption: leaveMsg,
        mentions: [m.messageStubParameters[0]]
      });
    } catch (e) {
      console.error('Error en despedida:', e);
      await conn.sendMessage(m.chat, {
        text: leaveMsg,
        mentions: [m.messageStubParameters[0]]
      });
    }
  }
}
