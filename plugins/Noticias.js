/* 
- noticiasglobal By neykoor 
- Envía noticias a todos los grupos sin menciones
*/

const handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) throw 'Este comando solo es para el owner.';

  if (!text) throw 'Ingresa el mensaje de la noticia.';

  const grupos = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats)
    .map(([jid]) => jid);

  m.reply(`Enviando noticia a ${grupos.length} grupos...`);

  const mensaje = `*『 NOTICIA GLOBAL 』*\n\n${text}\n\n╰⸼ ┄ ͙۪  ⎯ 𝅄  *${global.botname}*  𝅄  ⎯ ┄⸼`;

  for (const grupo of grupos) {
    await conn.sendMessage(grupo, { text: mensaje }).catch(() => {});
  }

  m.reply('✅ Noticia enviada a todos los grupos.');
};

handler.help = ['noticia <mensaje>'];
handler.tags = ['owner'];
handler.command = ['noticia', 'noticiasglobal'];
handler.owner = true;

export default handler;
