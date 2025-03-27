var handler = async (m, { conn }) => {
    if (!m.mentionedJid[0] && !m.quoted) {
        return conn.reply(m.chat, '⚠️ Debes mencionar a un usuario para expulsarlo.', m);
    }

    let user = m.mentionedJid[0] || m.quoted.sender;
    let groupInfo = await conn.groupMetadata(m.chat);
    let ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    let ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    if ([conn.user.jid, ownerGroup, ownerBot].includes(user)) {
        return conn.reply(m.chat, '⚠️ No puedes eliminar a este usuario.', m);
    }

    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    } catch (e) {
        return conn.reply(m.chat, '❌ No se pudo eliminar al usuario. Asegúrate de que el bot es administrador.', m);
    }
};

handler.help = ['kick'];
handler.tags = ['grupo'];
handler.command = ['kick', 'echar', 'sacar', 'ban'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
