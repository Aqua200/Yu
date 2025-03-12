const toxicRegex = /\b(puto|puta|rata|estupido|imbecil|rctmre|mrd|verga|vrga|maricon)\b/i;

export async function before(m, {isAdmin, isBotAdmin, isOwner}) {
  const datas = global;
  // Ya no necesitamos el idioma ni el archivo de traducción, así que eliminamos estas líneas.
  
  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) {
    return !1;
  }

  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[mconn.conn.user.jid] || {};
  const isToxic = toxicRegex.exec(m.text);

  if (isToxic && chat.antiToxic && !isOwner && !isAdmin) {
    user.warn += 1;
    if (!(user.warn >= 5)) await m.reply(`¡Advertencia! @${m.sender.split`@`[0]} has usado una palabra ofensiva: "${isToxic}". Te quedan ${5 - user.warn} advertencias.`, false, {mentions: [m.sender]});
  }

  if (user.warn >= 5) {
    user.warn = 0;
    await m.reply(`@${m.sender.split('@')[0]}, has sido baneado por superar el límite de advertencias.`, false, {mentions: [m.sender]});
    user.banned = true;
    await mconn.conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    // await this.updateBlockStatus(m.sender, 'block')
  }
  return !1;
}
