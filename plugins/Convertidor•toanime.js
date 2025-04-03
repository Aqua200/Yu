import uploadImage from '../lib/uploadImage.js';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';
  
  if (!/image/g.test(mime)) throw '🛑 *Responda a una imagen*';
  m.reply('☄️ *Convirtiendo la imagen en anime, espere un momento...*');
  
  const data = await q.download?.();
  const image = await uploadImage(data);
  console.log('Imagen subida:', image);  // Depuración

  try {
    const anime = `https://api.lolhuman.xyz/api/imagetoanime?apikey=${lolkeysapi}&img=${image}`;
    const response = await fetch(anime);
    console.log('Respuesta API lolhuman:', response);  // Depuración
    await conn.sendFile(m.chat, response.url, 'error.jpg', null, m);
  } catch (i) {
    try {
      const anime2 = `https://api.zahwazein.xyz/photoeditor/jadianime?url=${image}&apikey=${keysxxx}`;
      const response2 = await fetch(anime2);
      console.log('Respuesta API zahwazein:', response2);  // Depuración
      await conn.sendFile(m.chat, response2.url, 'error.jpg', null, m);
    } catch (a) {
      try {
        const anime3 = `https://api.caliph.biz.id/api/animeai?img=${image}&apikey=caliphkey`;
        const response3 = await fetch(anime3);
        console.log('Respuesta API caliph:', response3);  // Depuración
        await conn.sendFile(m.chat, response3.url, 'error.jpg', null, m);
      } catch (e) {
        console.log('Error general:', e);  // Depuración
        throw '🛑 *Ocurrió un error*';
      }
    }
  }
};

// Registrar el comando correctamente
handler.help = ['toanime', 'jadianime'];  // Asegúrate de que el comando esté en esta lista
handler.tags = ['tools'];
handler.command = ['jadianime', 'toanime'];  // Asegúrate de que coincidan con los comandos de tu bot
export default handler;
