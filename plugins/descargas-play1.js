import fetch from "node-fetch"; import yts from 'yt-search'; import axios from "axios";

const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav']; const formatVideo = ['360', '480', '720', '1080', '1440', '4k'];

const ddownr = { download: async (url, format) => { if (!formatAudio.includes(format) && !formatVideo.includes(format)) { throw new Error('Formato no soportado, verifica la lista de formatos disponibles.'); }

try {
  const { data } = await axios.get(`https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (data && data.success) {
    return await ddownr.cekProgress(data.id);
  }
  throw new Error('Fallo al obtener los detalles del video.');
} catch (error) {
  console.error('Error:', error);
  throw error;
}

}, cekProgress: async (id) => { try { while (true) { const { data } = await axios.get(https://p.oceansaver.in/ajax/progress.php?id=${id}, { headers: { 'User-Agent': 'Mozilla/5.0' } }); if (data && data.success && data.progress === 1000) { return data.download_url; } await new Promise(resolve => setTimeout(resolve, 5000)); } } catch (error) { console.error('Error:', error); throw error; } } };

const handler = async (m, { conn, text, usedPrefix, command }) => { try { if (!text.trim()) return conn.reply(m.chat, 🩵 Ingresa el nombre de la música para descargar., m); await conn.reply(m.chat, '💜 Procesando solicitud, espera un momento...', m);

const search = await yts(text);
if (!search.all.length) return m.reply('No se encontraron resultados.');

const video = search.all[0];
const { title, thumbnail, timestamp, views, ago, url } = video;
const infoMessage = `*🎶 Título:* ${title}\n*⏳ Duración:* ${timestamp}\n*👀 Vistas:* ${formatViews(views)}\n*📅 Publicado:* ${ago}\n*🔗 Enlace:* ${url}`;
await conn.reply(m.chat, infoMessage, m);

if (command === 'play') {
  const result = await ddownr.download(url, 'mp3');
  await conn.sendMessage(m.chat, { audio: { url: result }, mimetype: "audio/mpeg" }, { quoted: m });
  return m.reply("✅ Música descargada con éxito.");
} else if (command === 'ytmp4') {
  let sources = [
    `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
    `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${url}`
  ];
  
  for (let source of sources) {
    try {
      const res = await fetch(source);
      const json = await res.json();
      let downloadUrl = json.data?.dl || json.result?.download?.url;
      if (downloadUrl) {
        await conn.sendMessage(m.chat, {
          video: { url: downloadUrl },
          fileName: `${title}.mp4`,
          mimetype: 'video/mp4',
          caption: "🎥 Video descargado con éxito."
        }, { quoted: m });
        return;
      }
    } catch (e) {
      console.error(`Error con la fuente ${source}:`, e.message);
    }
  }
  return m.reply("⚠️ No se encontró un enlace de descarga válido.");
}

} catch (error) { return m.reply(⚠️ Error: ${error.message}); } };

handler.command = ['play', 'ytmp4']; handler.tags = ['downloader']; handler.group = true;

export default handler;

function formatViews(views) { return views >= 1000 ? (views / 1000).toFixed(1) + 'k' : views.toString(); }

                                     
