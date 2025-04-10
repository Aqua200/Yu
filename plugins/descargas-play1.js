import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `🎌 *Ingrese el nombre de un video de YouTube*\n\nEjemplo, !${command} New West - Those Eyes`, m, fake);
  
  try {
    m.react(rwait);
    const search = await yts(text);
    
    if (!search.all || search.all.length === 0) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }
    
    const videoInfo = search.all[0];
    if (!videoInfo) {
      return m.reply('No se pudo obtener información del video.');
    }
    
    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;
    if (!title || !thumbnail || !timestamp || !views || !ago || !url || !author) {
      return m.reply('La información del archivo no se pudo generar.');
    }
    
    const canal = author.name ? author.name : 'Desconocido';
    let additionalText = '';
    if (command === 'play') {
      additionalText = 'audio';
    } else if (command === 'play2') {
      additionalText = 'video';
    }
    
    const infoMessage = `*∘ Título*
${title || 'Desconocido'}

*∘ Duración* 
${timestamp || 'Desconocido'}

*∘ Vistas*
${views}

*∘ Canal*
${canal}

*∘ Enlace*
${url || 'Desconocido'}

*Enviando ${additionalText}*
⏰ Espere un momento`;
    
    const thumb = (await conn.getFile(thumbnail))?.data;
    await conn.sendMessage(m.chat, { 
      text: infoMessage, 
      contextInfo: { 
        externalAdReply: { 
          title: title, 
          body: wm, 
          thumbnail: thumb, 
          mediaType: 1, 
          showAdAttribution: true, 
          renderLargerThumbnail: true 
        } 
      } 
    }, { quoted: m });
    
    if (command === 'play') {
      try {
        // Usando Akuari API para audio (MP3)
        const apiResponse = await axios.get(`https://api.akuari.my.id/downloader/youtube?link=${url}`);
        const audioUrl = apiResponse.data.mp3[1]?.url; // Ajusta según la estructura de respuesta
        
        if (!audioUrl) throw new Error('No se pudo obtener el enlace de audio.');
        
        await conn.sendMessage(m.chat, { 
          audio: { url: audioUrl }, 
          fileName: `${title}.mp3`, 
          mimetype: 'audio/mpeg' 
        }, { quoted: m });
        
      } catch (e) {
        console.error('Error al enviar el audio:', e.message);
        return conn.reply(m.chat, 'No se pudo enviar el audio, intente nuevamente más tarde.', m);
      }
    } else if (command === 'play2') {
      try {
        // Usando Akuari API para video (MP4)
        const apiResponse = await axios.get(`https://api.akuari.my.id/downloader/youtube?link=${url}`);
        const videoUrl = apiResponse.data.mp4[1]?.url; // Ajusta según la estructura de respuesta
        
        if (!videoUrl) throw new Error('No se pudo obtener el enlace de video.');
        
        await conn.sendMessage(m.chat, { 
          video: { url: videoUrl }, 
          fileName: `${title}.mp4`, 
          mimetype: 'video/mp4', 
          caption: wm, 
          thumbnail: thumb 
        }, { quoted: m });
        
      } catch (e) {
        console.error('Error al enviar el video:', e.message);
        return conn.reply(m.chat, 'No se pudo enviar el video, intente nuevamente más tarde.', m);
      }
    } else {
      return conn.reply(m.chat, 'Comando no válido.', m);
    }
  } catch (error) {
    return m.reply(`❌ Ocurrió un error: ${error.message}`);
  }
};

handler.help = ['play', 'play2'];
handler.tags = ['descargas'];
handler.command = /^play2?$/i;

export default handler;
