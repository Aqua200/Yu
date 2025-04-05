import Jimp from 'jimp';

let handler = async (m, { conn, args }) => {
  if (!m.quoted || !/image/.test(m.quoted.mimetype)) {
    return conn.reply(m.chat, 'Responde a una imagen para cambiar la foto de perfil.', m);
  }

  if (!args[0]) {
    return conn.reply(m.chat, 'Escribe el número del sub bot (ej: 51912345678).', m);
  }

  let number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

  try {
    const media = await m.quoted.download();
    if (!media) return conn.reply(m.chat, 'No se pudo descargar la imagen.', m);

    const image = await Jimp.read(media);
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Intenta cambiar la imagen
    await conn.updateProfilePicture(number, buffer);
    return conn.reply(m.chat, `Foto de perfil cambiada con éxito para el sub bot ${args[0]}.`, m);
  } catch (e) {
    console.error('[ERROR CAMBIAR FOTO PERFIL]', e);
    if (e?.message?.includes('401') || e?.message?.includes('not authorized')) {
      return conn.reply(m.chat, 'Este número no está vinculado o no tiene sesión activa como sub bot.', m);
    }
    return conn.reply(m.chat, 'Ocurrió un error al intentar cambiar la foto de perfil.', m);
  }
};

handler.help = ['setsubpfp <número>'];
handler.tags = ['owner'];
handler.command = ['setsubpfp'];
handler.rowner = true;

export default handler;
