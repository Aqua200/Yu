import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup || !m.messageStubParameters || !m.messageStubParameters[0]) return;

  try {
    const who = m.messageStubParameters[0];
    const taguser = `@${who.split('@')[0]}`;
    const chat = global.db.data.chats[m.chat] || {};
    const groupName = groupMetadata.subject;

    let pp = 'https://files.catbox.moe/xr2m6u.jpg'; // Imagen por defecto
    try {
      pp = await conn.profilePictureUrl(who, 'image');
    } catch (error) {
      console.error('Error al obtener imagen de perfil:', error);
    }

    let img = null;
    try {
      const res = await fetch(pp);
      if (res.ok) img = await res.buffer();
    } catch {
      img = await fetch('https://files.catbox.moe/xr2m6u.jpg').then(res => res.buffer());
    }

    const welcomeMessage = `❀ *Bienvenida a* ${groupName}\n✰ ${taguser}\n${global.welcomeImage || ''}\n •(=^●ω●^=)• ¡Disfruta tu estadía!\n> ✐ Usa *#help* para ver los comandos.`;
    const goodbyeMessage = `❀ *Adiós de* ${groupName}\n✰ ${taguser}\n${global.goodbyeImage || ''}\n •(=^●ω●^=)• ¡Vuelve pronto!\n> ✐ Usa *#help* para ver los comandos.`;

    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_PARTICIPANT_ADD:
        if (chat.welcome) {
          await conn.sendMessage(m.chat, { image: img, caption: welcomeMessage, mentions: [who] });
        }
        break;

      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
        if (chat.welcome) {
          await conn.sendMessage(m.chat, { image: img, caption: goodbyeMessage, mentions: [who] });
        }
        break;
    }
  } catch (error) {
    console.error('Error en el sistema de bienvenida/despedida:', error);
  }
}
