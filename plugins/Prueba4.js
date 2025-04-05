import Jimp from 'jimp';

let handler = async (m, { conn, isROwner, isOwner }) => {
  if (!isROwner && !isOwner) 
    return conn.reply(m.chat, 'Este comando es solo para el owner o subowner.', m);

  if (!m.quoted) 
    return conn.reply(m.chat, 'Por favor, responde a una imagen para cambiar la foto de perfil.', m);

  try {
    const media = await m.quoted.download();
    if (!media) 
      return conn.reply(m.chat, 'No se pudo obtener la imagen.', m);

    const image = await Jimp.read(media);
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Usamos m.sender para cambiar la foto de perfil del subpropietario
    const userNumber = m.sender;
    await conn.updateProfilePicture(userNumber, buffer);

    return conn.reply(m.chat, 'Foto de perfil cambiada con éxito.', m);
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, 'Ocurrió un error al intentar cambiar la foto de perfil.', m);
  }
};

handler.help = ['setsubpfp'];
handler.tags = ['owner'];
handler.command = ['setsubpfp']; // ahora es .setsubpfp
handler.owner = true; // permite owner y subowner

export default handler;
