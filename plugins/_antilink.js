const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const otherDomains = [
  /whatsapp\.com\/dl/,
  /wa\.me\/join/,
  /whatsapp\.com\/channel/,
  /invite\.whatsapp\.com/
];

export async function before(m, {conn, isAdmin, isBotAdmin}) {
  if (m.isBaileys && m.fromMe) return true;
  if (!m.isGroup) return false;
  
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[this.user.jid] || {};
  const user = `@${m.sender.split`@`[0]}`;
  
  // Si no está activo el antiLink, salir
  if (!chat.antiLink) return false;
  
  // Detección de enlaces
  const isGroupLink = linkRegex.test(m.text);
  const isOtherWhatsappLink = otherDomains.some(regex => regex.test(m.text));
  const containsLink = isGroupLink || isOtherWhatsappLink;
  
  // Si no contiene enlace, salir
  if (!containsLink) return false;
  
  // Verificar si es el link del grupo actual (permitirlo)
  if (isBotAdmin) {
    const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`;
    if (m.text.includes(linkThisGroup)) return false;
  }
  
  // Si es admin, advertir pero no eliminar
  if (isAdmin) {
    await this.sendMessage(m.chat, {
      text: `*『✦』@${m.sender.split`@`[0]} eres admin, pero recuerda que los enlaces están restringidos en este grupo.*`,
      mentions: [m.sender]
    }, {quoted: m});
    return true;
  }
  
  // Proceder con la eliminación para usuarios no admin
  await this.sendMessage(m.chat, {
    text: `*『✦』Enlace de WhatsApp detectado!*\n*Usuario:* ${user}\n*Acción:* Eliminando...`,
    mentions: [m.sender]
  }, {quoted: m});
  
  // Eliminar el mensaje
  try {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat, 
        fromMe: false, 
        id: m.key.id, 
        participant: m.key.participant
      }
    });
  } catch (e) {
    console.error("Error al borrar mensaje:", e);
  }
  
  // Eliminar al usuario si es posible
  if (isBotAdmin && bot.restrict) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    } catch (e) {
      console.error("Error al eliminar usuario:", e);
      await this.sendMessage(m.chat, {
        text: `*『✦』No pude eliminar a ${user}. ¿Tengo los permisos necesarios?*`,
        mentions: [m.sender]
      });
    }
  } else if (!bot.restrict) {
    await this.sendMessage(m.chat, {
      text: `*『✦』Modo restrictivo desactivado (${user} debería ser eliminado pero la restricción está off).*`,
      mentions: [m.sender]
    });
  }
  
  return true;
}
