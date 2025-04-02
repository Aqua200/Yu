const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const otherWhatsappLinks = [
  /whatsapp\.com\/dl/,
  /wa\.me\/join/,
  /whatsapp\.com\/channel/,
  /invite\.whatsapp\.com/,
  /whatsapp\.com\/invite/
];

export async function before(m, {conn, isAdmin, isBotAdmin}) {
  try {
    // Ignorar si es mensaje del propio bot o no es grupo
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return false;

    const chat = global.db.data.chats[m.chat];
    const botSettings = global.db.data.settings[this.user.jid] || {};
    const user = `@${m.sender.split('@')[0]}`;

    // Verificar si el antilink está activo
    if (!chat.antiLink) return false;

    // Verificar si el mensaje contiene algún enlace de WhatsApp
    const containsAnyLink = () => {
      if (!m.text) return false;
      const text = m.text.toLowerCase();
      
      // Verificar enlaces estándar
      if (linkRegex.test(text)) return true;
      
      // Verificar otros formatos de enlaces
      return otherWhatsappLinks.some(regex => regex.test(text));
    };

    // Si no contiene enlaces, salir
    if (!containsAnyLink()) return false;

    // Si es el enlace del grupo actual, permitirlo
    if (isBotAdmin) {
      const groupCode = await this.groupInviteCode(m.chat).catch(() => null);
      if (groupCode && m.text.includes(groupCode)) return false;
    }

    // Si es administrador, solo advertir
    if (isAdmin) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ *ADVERTENCIA PARA ADMIN* ⚠️\n${user} has enviado un enlace de grupo.\nRecuerda que está desactivado el antilink para admins.`,
        mentions: [m.sender]
      }, {quoted: m});
      return true;
    }

    // -- Acciones para usuarios normales --
    // 1. Notificar eliminación
    await conn.sendMessage(m.chat, {
      text: `🚫 *ENLACE DETECTADO* 🚫\n${user} ha enviado un enlace de WhatsApp.\nSerá eliminado del grupo.`,
      mentions: [m.sender]
    }, {quoted: m});

    // 2. Eliminar el mensaje (si el bot es admin)
    if (isBotAdmin) {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      }).catch(e => console.log('Error al borrar mensaje:', e));
    }

    // 3. Eliminar al usuario (si está activa la restricción)
    if (isBotAdmin && botSettings.restrict) {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        .catch(async e => {
          console.log('Error al eliminar usuario:', e);
          await conn.sendMessage(m.chat, {
            text: `❌ No pude eliminar a ${user}. ¿Tengo permisos suficientes?`,
            mentions: [m.sender]
          });
        });
    }

    return true;

  } catch (error) {
    console.error('Error en el handler antilink:', error);
    return false;
  }
                                 }
