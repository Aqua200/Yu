let linkRegex = /https?:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
let linkRegex1 = /https?:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants }) {
  if (!m.isGroup) return;
  if (isAdmin || isOwner || m.fromMe || isROwner) return;

  const text = m.text || m.message?.extendedTextMessage?.text || m.body || '';
  let chat = global.db.data.chats[m.chat];
  let delet = m.key.participant;
  let bang = m.key.id;
  const user = `@${m.sender.split`@`[0]}`;
  const groupAdmins = participants.filter(p => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `*» ${i + 1}. @${v.id.split('@')[0]}*`).join('\n');
  const isGroupLink = linkRegex.exec(text) || linkRegex1.exec(text);
  const grupo = `https://chat.whatsapp.com`;

  if (isAdmin && chat.antiLink && text.includes(grupo)) 
    return m.reply('🍡↛El antilink está activo pero te salvaste por ser admin_°.');

  if (chat.antiLink && isGroupLink && !isAdmin) {
    if (isBotAdmin) {
      const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
      if (text.includes(linkThisGroup)) return !0;
    }
    await conn.sendMessage(m.chat, { text: `*「 ENLACE DETECTADO 」*\n\n🍨➳${user} rompiste las reglas del grupo y serás eliminado...`, mentions: [m.sender] }, { quoted: m });
    if (!isBotAdmin) return conn.sendMessage(m.chat, { text: `💐↛El antilink está activo pero no puedo eliminarte porque no soy admin.`, mentions: [...groupAdmins.map(v => v.id)] }, { quoted: m });
    if (isBotAdmin) {
      await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    }
  }
  return !0;
}
