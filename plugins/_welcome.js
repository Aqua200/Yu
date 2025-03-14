import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if ((!m.messageStubType || !m.messageStubParameters) && !m.mentionedJid) return;

  try {
    // Obtener la lista actualizada de participantes en el grupo
    const updatedGroup = await conn.groupMetadata(m.chat);
    const updatedParticipants = updatedGroup.participants.map(p => p.id);

    const who = (m.messageStubParameters && m.messageStubParameters[0]) || (m.mentionedJid ? m.mentionedJid[0] : null);
    if (!who) return;

    const taguser = `@${who.split('@')[0]}`;
    const chat = global.db.data.chats[m.chat] || {};
    const groupName = groupMetadata.subject;
    
    // Verificar si el bot es admin
    const botIsAdmin = updatedParticipants.some(p => p === conn.user.jid && p.admin);
    const canSendImage = botIsAdmin && chat.welcome;

    // Obtener la imagen de perfil del usuario o usar una por defecto
    let pp = 'https://files.catbox.moe/xr2m6u.jpg';
    try {
      pp = await conn.profilePictureUrl(who, 'image');
    } catch {
      console.error(`No se pudo obtener la imagen de ${who}, usando imagen por defecto.`);
    }

    let img = null;
    try {
      const res = await fetch(pp);
      if (res.ok) img = await res.buffer();
    } catch {
      img = await fetch('https://files.catbox.moe/xr2m6u.jpg').then(res => res.buffer());
    }

    // Mensajes de bienvenida y despedida
    const welcomeMessage = `❀ *Bienvenid@ a* ${groupName}\n✰ ${taguser}\n•(=^●ω●^=)• ¡Disfruta!\n> ✐ Usa *#help* para ver los comandos.`;
    const goodbyeMessage = `❀ *Adiós de* ${groupName}\n✰ ${taguser}\n•(=^●ω●^=)• ¡Vuelve pronto!\n> ✐ Usa *#help* para ver los comandos.`;

    // Detectar evento de bienvenida/salida de forma más confiable
    const eventType = m.messageStubType || (m.mentionedJid ? 'GROUP_PARTICIPANT_ADD' : null);

    // Verificar si el usuario estaba antes en la lista y ahora no (para salidas)
    const userWasHere = participants.some(p => p.id === who);
    const userIsNowHere = updatedParticipants.includes(who);

    if (!eventType) return;

    // Manejo de eventos con detección más precisa
    if ((eventType === WAMessageStubType.GROUP_PARTICIPANT_ADD || eventType === 'GROUP_PARTICIPANT_ADD' || (!userWasHere && userIsNowHere)) && chat.welcome) {
      if (canSendImage && img) {
        await conn.sendMessage(m.chat, { image: img, caption: welcomeMessage, mentions: [who] });
      } else {
        await conn.sendMessage(m.chat, { text: `¡Bienvenid@ ${taguser} a ${groupName}!` });
      }
    } else if (
      (eventType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || eventType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || (userWasHere && !userIsNowHere)) &&
      chat.welcome
    ) {
      if (canSendImage && img) {
        await conn.sendMessage(m.chat, { image: img, caption: goodbyeMessage, mentions: [who] });
      } else {
        await conn.sendMessage(m.chat, { text: `¡${taguser} ha salido de ${groupName}!` });
      }
    }
  } catch (error) {
    console.error('Error en el sistema de bienvenida/despedida:', error);
  }
}
