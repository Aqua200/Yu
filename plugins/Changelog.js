let handler = async (m, { conn }) => {
    let changelog = `
⌜  ✦ 𝐂𝐇𝐀𝐍𝐆𝐄𝐋𝐎𝐆 ✦  ⌟

❀~  [ ✅ ] (El problema con el comando HD ha sido resuelto exitosamente.)
❀~  [ 🔄 ] No hay novedades ()
❀~  [ 🔄 ] No hay novedades()
❀~  [ 🔄 ] No hay novedades()
❀~  [ 🔄 ] No hay novedades()
❀~  [ ✅ ] No hay novedades()
❀~  [ ✅ ] No hay novedades()
❀~  [ 🔄 ] No hay novedades()

⌜ 𝐬𝐢𝐞𝐦𝐩𝐫𝐞 𝐦𝐞𝐣𝐨𝐫𝐚𝐧𝐝𝐨!  ⌟
    `.trim();

    conn.reply(m.chat, changelog, m);
}

handler.help = ['changelog'];
handler.tags = ['info'];
handler.command = ['changelog'];

export default handler;
