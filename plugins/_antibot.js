export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return;
    
    let chat = global.db.data.chats[m.chat];
    let delet = m.key.participant;
    let bang = m.key.id;
    let bot = global.db.data.settings[this.user.jid] || {};
    
    if (m.fromMe) return true;

    // Detecta IDs de bot
    if (m.id.startsWith('3EB0') && m.id.length === 22) {
        if (chat.antiBot) {
            let nekoDecor = `〘 ~🤍 〙\n\n` + 
                            `🌸 𝙎𝙤𝙮 *${botname}*, 𝙡𝙖 𝙗𝙤𝙩 𝙢á𝙨 𝙘𝙪𝙠𝙞~ 🖤\n` + 
                            `🚫 𝙀𝙨𝙩𝙚 𝙜𝙧𝙪𝙥𝙤 𝙣𝙤 𝙩𝙚 𝙣𝙚𝙘𝙚𝙨𝙞𝙩𝙖, 𝙖𝙙𝙞𝙤𝙨𝙞𝙩𝙤 𝙗𝙤𝙩-𝙨𝙚𝙣𝙥𝙖𝙞! ✨`;

            if (isBotAdmin) {
                await conn.sendMessage(m.chat, { text: nekoDecor });
                await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }});
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            }
        }
    }
}
