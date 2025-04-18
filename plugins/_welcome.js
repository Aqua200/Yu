import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;

  const chatId = m.chat;
  const userJid = m.messageStubParameters?.[0];
  const user = userJid?.split('@')[0] || 'Usuario';
  const groupName = groupMetadata.subject || 'Sin nombre';
  
  global.db.data.chats ??= {};
  global.db.data.chats[chatId] ??= {};
  const chat = global.db.data.chats[chatId];

  let groupSize = participants.length;
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_JOIN) groupSize++;
  if ([WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE].includes(m.messageStubType)) groupSize--;

  if (!chat.welcome || !userJid) return;

  const isJoin = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_JOIN;
  const isLeave = [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE].includes(m.messageStubType);
  if (!isJoin && !isLeave) return;

  const message = isJoin
    ? `
*¡BIENVENIDO/A!* 

✧ @${user}  
✧ Al grupo: *${groupName}*  
✧ Miembros: *${groupSize}*  

📜 *Normas:*  
✔ Respeto a todos  
✔ No spam  
✔ Disfruta el grupo  

Usa *#menu* para ver comandos`.trim()
    : `
*Adiós* 

✦ @${user}  
✦ Ha dejado: *${groupName}*  
✦ Miembros restantes: *${groupSize}*  

*¡Esperamos verte de vuelta!*`.trim();

  try {
    await conn.sendMessage(chatId, {
      image: { url: 'https://files.catbox.moe/acf346.jpg' },
      caption: message,
      mentions: [userJid]
    });
  } catch (e) {
    console.error(`Error en ${isJoin ? 'bienvenida' : 'despedida'}:`, e);
    await conn.sendMessage(chatId, {
      text: message,
      mentions: [userJid]
    });
  }
}
