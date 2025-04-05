import Jimp from 'jimp';

let handler = async (m, { conn }) => {
  if (!m.quoted) return conn.reply(m.chat, `⚠️ Responde a una imagen para cambiar la foto de perfil.`, m);
  if (!m.mentionedJid?.[0]) return conn.reply(m.chat, `⚠️ Menciona al número al que deseas cambiarle la foto de perfil.`, m);

  const target = m.mentionedJid[0];

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
handler.tags = ['tools']; // Opcionalmente cambia de 'owner' a 'tools' o 'admin'
handler.command = ['setsubpfp'];
// handler.rowner = true; // <<< Eliminado para que sea público

export default handler;
