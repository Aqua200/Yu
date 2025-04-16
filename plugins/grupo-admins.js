const handler = async (m, {conn, participants, groupMetadata, args}) => {
  try {
    // Get group profile picture or use default
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => null) || './src/catalogo.jpg';
    
    // Filter group admins
    const groupAdmins = participants.filter((p) => p.admin);
    
    // Create admin list
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
    
    // Determine group owner
    const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split('-')[0] + '@s.whatsapp.net';
    
    // Process message
    const pesan = args.length ? args.join(' ') : 'Sin mensaje';
    const oi = `» ${pesan}`;
    
    // Create message text
    const text = `『✦』Admins del grupo:\n\n${listAdmin}\n\n${emoji || '✨'} Mensaje: ${oi}\n\n『✦』Evita usar este comando con otras intenciones o seras *eliminado* o *baneado* del Bot.`.trim();
    
    // Send message with mention
    await conn.sendFile(m.chat, pp, 'error.jpg', text, m, false, {
      mentions: [...groupAdmins.map((v) => v.id), owner]
    });
    
  } catch (error) {
    console.error('Error in admins command:', error);
    await conn.reply(m.chat, 'Ocurrió un error al procesar el comando.', m);
  }
};

handler.help = ['admins <texto>'];
handler.tags = ['grupo'];
// regex detect A word without case sensitive
handler.customPrefix = /a|@/i;
handler.command = /^@?admins$/i;
handler.group = true;
export default handler;
