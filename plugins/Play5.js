import fetch from "node-fetch"; 
import yts from 'yt-search';
import axios from "axios";

const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];

// 🌈 Paleta de colores y decoración tipo "Neko" (sin gatos)
const decorator = {
  header: '╭─── ⋆⋅☆⋅⋆ ───⭑',
  body: '│ ✧',
  footer: '╰─── ⋆⋅☆⋅⋆ ───⭑',
  divider: '├─── ⋅☾⋅ ───⭑'
};

const ddownr = { 
  download: async (url, format) => { 
    if (!formatAudio.includes(format)) { 
      throw new Error(`${decorator.body} Formato no soportado. Formatos disponibles: ${formatAudio.join(', ')}`);
    }

    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    try {
      const response = await axios.request(config);
      if (response.data && response.data.success) {
        const { id, title, info } = response.data;
        const { image } = info;
        const downloadUrl = await ddownr.cekProgress(id);

        return {
          id: id,
          image: image,
          title: title,
          downloadUrl: downloadUrl
        };
      } else {
        throw new Error(`${decorator.body} Fallo al obtener los detalles del video.`);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }, 

  cekProgress: async (id) => { 
    const config = { 
      method: 'GET', 
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`, 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      } 
    };

    try {
      while (true) {
        const response = await axios.request(config);
        if (response.data && response.data.success && response.data.progress === 1000) {
          return response.data.download_url;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  } 
};

const handler = async (m, { conn, text, usedPrefix, command }) => { 
  try { 
    if (!text.trim()) { 
      return conn.reply(m.chat, `${decorator.header}\n${decorator.body} Ingresa el nombre de la música.\n${decorator.footer}`, m); 
    }

    // Mostrar mensaje de búsqueda
    await conn.sendMessage(m.chat, { 
      text: `${decorator.header}\n${decorator.body} 🔍 Buscando: "${text}"\n${decorator.footer}`,
      contextInfo: { 
        externalAdReply: {
          title: '✨ Music Searcher ✨',
          body: 'Buscando en YouTube...',
          mediaType: 1,
          sourceUrl: 'https://www.youtube.com',
          thumbnail: await (await conn.getFile('https://i.imgur.com/7Q6yzzE.png')).data
        }
      }
    }, { quoted: m });

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply(`${decorator.header}\n${decorator.body} No se encontraron resultados.\n${decorator.footer}`);
    }

    // Seleccionar el mejor resultado (mayor coincidencia)
    const videoInfo = search.all.sort((a, b) => b.views - a.views)[0];
    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;

    // Formatear la información del video
    const infoMessage = `${decorator.header}\n` +
                       `${decorator.body} 🎵 *${title}*\n` +
                       `${decorator.divider}\n` +
                       `${decorator.body} 👤 Artista: ${author?.name || 'Desconocido'}\n` +
                       `${decorator.body} 👀 Vistas: ${views}\n` +
                       `${decorator.body} ⏱ Duración: ${timestamp}\n` +
                       `${decorator.body} 📅 Publicado: ${ago}\n` +
                       `${decorator.footer}\n` +
                       `${decorator.body} ⏳ Descargando audio, por favor espera...`;

    const thumb = (await conn.getFile(thumbnail))?.data;

    await conn.reply(m.chat, infoMessage, m, {
      contextInfo: {
        externalAdReply: {
          title: title.slice(0, 30),
          body: `por ${author?.name || 'Artista desconocido'}`,
          mediaType: 1,
          thumbnail: thumb,
          sourceUrl: url,
          renderLargerThumbnail: true
        }
      }
    });

    // Descargar el audio en formato MP3 (320kbps)
    const api = await ddownr.download(url, 'mp3');
    const result = api.downloadUrl;

    // Enviar el audio con metadatos
    await conn.sendMessage(m.chat, { 
      audio: { url: result }, 
      mimetype: "audio/mpeg",
      contextInfo: {
        externalAdReply: {
          title: title,
          body: author?.name || '',
          mediaType: 2,
          thumbnail: thumb,
          sourceUrl: url
        }
      }
    }, { quoted: m });

    // Mensaje de confirmación
    await conn.reply(m.chat, `${decorator.header}\n${decorator.body} ✅ Audio descargado correctamente!\n${decorator.body} 🎧 Disfruta de tu música~\n${decorator.footer}`, m);

  } catch (error) { 
    console.error('Error en el handler:', error);
    return m.reply(`${decorator.header}\n${decorator.body} ❌ Error: ${error.message}\n${decorator.footer}`); 
  } 
};

// Configuración del comando
handler.command = ['play', 'music', 'play5'];
handler.help = ['play <nombre de la canción> - Descarga música de YouTube'];
handler.tags = ['downloader', 'music'];
handler.group = true;
handler.register = true;
handler.limit = true; // Limitar para evitar abuso

export default handler;
