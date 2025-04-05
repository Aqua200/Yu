import Jimp from 'jimp';

let handler = async (m, { conn }) => {
  if (!m.quoted) return conn.reply(m.chat, `⚠️ Responde a una imagen para cambiar la foto de perfil.`, m);
  if (!m.mentionedJid?.[0]) return conn.reply(m.chat, `⚠️ Menciona al número al que deseas cambiarle la foto de perfil.`, m);

  const target = m.mentionedJid[0];

  // Lista de números permitidos (puedes modificarla o cargarla desde otro lado si lo deseas)
  const allowed = ['584125014674@s.whatsapp.net']; // Ejemplo: tu número como único autorizado

  if (!allowed.includes(m.sender)) {
    return conn.reply(m.chat, `❌ No tienes permiso para usar este comando.`, m);
  }

  try {
    const media = await m.quoted.download();
    if (!media) return conn.reply(m.chat, `❌ No se pudo obtener la imagen.`, m);

    const image = await Jimp.read(media);
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    await conn.updateProfilePicture(target, buffer);
    return conn.reply(m.chat, `✅ Foto de perfil cambiada con éxito para el usuario mencionado.`, m);
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `❌ Ocurrió un error al intentar cambiar la foto de perfil.`, m);
  }
};

handler.help = ['setsubpfp @user'];
handler.tags = ['owner'];
handler.command = ['setsubpfp'];
handler.rowner = true;

export default handler;
