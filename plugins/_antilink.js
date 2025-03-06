let linkRegex = /(https?:\/\/(?:www\.)?(?:t\.me|telegram\.me|whatsapp\.com)\/\S+)|(https?:\/\/chat\.whatsapp\.com\/\S+)|(https?:\/\/whatsapp\.com\/channel\/\S+)/i;

export async function before(m, { isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return false;

    let chat = global.db.data.chats[m.chat];
    let bot = global.db.data.settings[this.user.jid] || {};
    const isGroupLink = linkRegex.exec(m.text);
    const grupo = `https://chat.whatsapp.com`;

    if (isAdmin && chat.antiLink && m.text.includes(grupo)) {
        return conn.reply(m.chat, `🌸 E-eh... el anti-link está activado, pero como eres admin... ¡e-estás a salvo! >//<`, m);
    }

    if (chat.antiLink && isGroupLink && !isAdmin) {
        if (!isBotAdmin) {
            return conn.reply(m.chat, `🥺 U-uhm... no soy admin... n-no puedo hacer nada...`, m);
        }

        const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`;
        if (m.text.includes(linkThisGroup)) return true;

        // **Expulsar al usuario antes de enviar cualquier mensaje**
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

        // **Eliminar el mensaje**
        await conn.sendMessage(m.chat, { delete: m.key });

        // **Enviar advertencia después de la expulsión**
        await conn.reply(m.chat, `😖 L-lo siento... ¡pero los enlaces no están permitidos!\n\n*${await this.getName(m.sender)}* envió un enlace prohibido... a-ahora ya no está aquí...`, m);

        return false;
    }

    return true;
}
