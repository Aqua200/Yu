const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `❀ Por favor, ingresa el nombre de la música a descargar.`, m);
    }

    // Buscar en YouTube
    const search = await yts(text);
    if (!search?.all || search.all.length === 0) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }

    const videoInfo = search.all[0];
    const { title, thumbnail, timestamp, views, ago, url } = videoInfo;
    
    // Crear mensaje de información
    const infoMessage = ` *˙Ⱉ˙ฅ* 

*「✦」Descargando* ${title}

 *✦ Canal* » ${videoInfo.author?.name || 'Desconocido'}
*❥ Vistas* » ${views}
*∞ Duración* » ${timestamp}
*✭ Publicación* » ${ago}
*➳ Link* » ${url}\n`;

    try {
      const thumb = (await conn.getFile(thumbnail))?.data;
      
      const JT = {
        contextInfo: {
          externalAdReply: {
            title: 'Kirito Bot MD',
            body: 'Descargando contenido',
            mediaType: 1,
            previewType: 0,
            mediaUrl: url,
            sourceUrl: url,
            thumbnail: thumb,
            renderLargerThumbnail: true,
          },
        },
      };

      await conn.reply(m.chat, infoMessage, m, JT);

      // Procesar según el comando
      if (command === 'play5') {
        // Primero intentamos con la primera API
        try {
          const apiResponse = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=audio&quality=128kbps&apikey=GataDios`);
          const json = await apiResponse.json();
          
          if (json?.data?.url) {
            await conn.sendMessage(m.chat, { 
              audio: { url: json.data.url }, 
              mimetype: "audio/mpeg" 
            }, { quoted: m });
            return;
          }
        } catch (apiError) {
          console.error('Error con api.neoxr.eu:', apiError);
          // Continuar con el siguiente método si falla
        }

        // Si la primera API falla, intentamos con oceansaver
        try {
          const result = await ddownr.download(url, 'mp3');
          if (result?.downloadUrl) {
            await conn.sendMessage(m.chat, { 
              audio: { url: result.downloadUrl }, 
              mimetype: "audio/mpeg" 
            }, { quoted: m });
          } else {
            throw new Error('No se pudo obtener el enlace de descarga');
          }
        } catch (downloadError) {
          console.error('Error con oceansaver:', downloadError);
          throw new Error('Fallaron todos los métodos de descarga');
        }
      }
    } catch (error) {
      console.error('Error en el proceso principal:', error);
      return m.reply(`⚠︎ Ocurrió un error al procesar tu solicitud: ${error.message}`);
    }
  } catch (error) {
    console.error('Error global:', error);
    return m.reply(`⚠︎ Ocurrió un error inesperado: ${error.message}`);
  }
};

handler.command = handler.help = ['play5'];
handler.tags = ['downloader'];
handler.group = true;

export default handler;
