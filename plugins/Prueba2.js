import Jimp from 'jimp';

let handler = async (m, { conn, isROwner, isOwner }) => {
  // Verificar si el usuario es propietario o subpropietario
  if (!isROwner && !isOwner) 
    return conn.reply(m.chat, `${emoji} Este comando es solo para el owner o subowner.`, m);

  if (!m.quoted) 
    return conn.reply(m.chat, `${emoji} Por favor, responde a una imagen para cambiar la foto de perfil.`, m);

  try {
    const media = await m.quoted.download();
    if (!media) 
      return conn.reply(m.chat, `${emoji2} No se pudo obtener la imagen.`, m);

    const image = await Jimp.read(media);
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Si el usuario es propietario o subpropietario, cambia la foto de perfil
    await conn.updateProfilePicture(conn.user.jid, buffer);

    return conn.reply(m.chat, `${emoji} Foto de perfil cambiada con éxito.`, m);
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `${msm} Ocurrió un error al intentar cambiar la foto de perfil.`, m);
  }
};

handler.help = ['setpfp2']; // Cambié aquí el comando a 'setpfp2'
handler.tags = ['owner'];
handler.command = ['setpfp2']; // Ahora se invoca con 'setpfp2'
handler.rowner = true; // Permite que los subbots también cambien la foto de perfil

export default handler;
