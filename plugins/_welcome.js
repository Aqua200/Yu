import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  // Verifica si el mensaje es un stub (evento de grupo) o si hay menciones
  if ((!m.messageStubType || !m.messageStubParameters) && !m.mentionedJid) return;

  try {
    const who = (m.messageStubParameters && m.messageStubParameters[0]) || (m.mentionedJid ? m.mentionedJid[0] : null);
    if (!who) return; // Si no hay usuario identificado, salir

    const taguser = `@${who.split('@')[0]}`;
    const chat = global.db.data.chats[m.chat] || {};
    const groupName = groupMetadata.subject;

    // Obtiene la imagen de perfil o usa una por defecto
    let pp = 'https://files.catbox.moe/xr2m6u.jpg';
    try {
      pp = await conn.profilePictureUrl(who, 'image');
    } catch (error) {
      console.error(`No se pudo obtener la imagen de ${who}:`, error);
    }

    let img = null;
    try {
      const res = await fetch(pp);
      if (res.ok) img = await res.buffer();
    } catch {
      img = await fetch('https://files.catbox.moe/xr2m6u.jpg').then(res => res.buffer());
    }

    // Mensajes personalizados
    const welcomeMessage = `❀ *Bienvenid@ a* ${groupName}\n✰ ${taguser}\n •(=^●ω●^=)• ¡Disfruta!\n> ✐ Usa *#help* para ver los comandos.`;
    const goodbyeMessage = `❀ *Adiós de* ${groupName}\n✰ ${taguser}\n •(=^●ω●^=)• ¡Vuelve pronto!\n> ✐ Usa *#help* para ver los comandos.`;

    // Enviar el mensaje dependiendo del evento
    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_PARTICIPANT_ADD:
        if (chat.welcome) {
          if (img) {
            await conn.sendMessage(m.chat, { image: img, caption: welcomeMessage, mentions: [who] });
          } else {
            await conn.sendMessage(m.chat, { text: `¡Bienvenid@ ${taguser} a ${groupName}!` });
          }
        }
        break;

      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
        if (chat.welcome) {
          if (img) {
            await conn.sendMessage(m.chat, { image: img, caption: goodbyeMessage, mentions: [who] });
          } else {
            await conn.sendMessage(m.chat, { text: `¡${taguser} ha salido de ${groupName}!` });
          }
        }
        break;
    }
  } catch (error) {
    console.error('Error en el sistema de bienvenida/despedida:', error);
  }
}
