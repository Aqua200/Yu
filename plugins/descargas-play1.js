// playPlugin.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

module.exports = {
  name: 'MusicPlugin',
  version: '2.0.0',
  author: 'Azura',
  description: 'Plugin para descargar y reproducir música/videos de YouTube',
  dependencies: ['axios', 'fs', 'path', 'stream'],

  initialize: (client) => {
    client.commands.set('play', {
      config: {
        name: "play",
        description: "Descarga música/videos de YouTube",
        usage: "[título o enlace]",
        cooldown: 5,
        aliases: ["play60", "p"]
      },
      handler: async ({ sock, msg, args, text, global }) => {
        if (!text) {
          await sock.sendMessage(msg.key.remoteJid, {
            text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${global.prefix}play* La Factoría - Perdoname`
          }, { quoted: msg });
          return;
        }

        await sock.sendMessage(msg.key.remoteJid, {
          react: { text: '⏳', key: msg.key }
        });

        try {
          // 1. BUSQUEDA
          const searchUrl = `https://api.neoxr.eu/api/video?q=${encodeURIComponent(text)}&apikey=russellxz`;
          const searchRes = await axios.get(searchUrl);
          const videoInfo = searchRes.data;
          
          if (!videoInfo || !videoInfo.data?.url) 
            throw new Error('No se pudo encontrar el video');

          const title = videoInfo.title || 'video';
          const thumbnail = videoInfo.thumbnail;
          const duration = videoInfo.fduration || '0:00';
          const views = videoInfo.views || 'N/A';
          const author = videoInfo.channel || 'Desconocido';
          const videoLink = `https://www.youtube.com/watch?v=${videoInfo.id}`;

          // 2. BANNER
          const captionPreview = `
╔═════════════════╗
║✦ pruebas          ✦
╚═════════════════╝

📀 *𝙄𝗻𝗳𝗼𝗿𝗺𝗮𝗰𝗶ó𝗻 𝗱𝗲𝗹 𝘃í𝗱𝗲𝗼:*  
╭───────────────╮  
├ 🎼 *Título:* ${title}
├ ⏱️ *Duración:* ${duration}
├ 👁️ *Vistas:* ${views}
├ 👤 *Autor:* ${author}
└ 🔗 *Link:* ${videoLink}
╰───────────────╯

📥 *Opciones de Descarga:*  
┣ 🎵 *Audio:* _${global.prefix}play1 ${text}_
┣ 🎵 *Audio HQ:* _${global.prefix}play5 ${text}_
┣ 🎥 *Video:* _${global.prefix}play6 ${text}_
┗ ⚠️ *¿No se reproduce?* Usa _${global.prefix}ff_

⏳ *Procesando tu solicitud...*`;

          await sock.sendMessage(msg.key.remoteJid, {
            image: { url: thumbnail },
            caption: captionPreview
          }, { quoted: msg });

          // 3. DESCARGA
          const qualities = ['720p', '480p', '360p'];
          let videoData = null;
          
          for (let quality of qualities) {
            try {
              const apiUrl = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoLink)}&apikey=russellxz&type=video&quality=${quality}`;
              const response = await axios.get(apiUrl);
              
              if (response.data?.status && response.data?.data?.url) {
                videoData = {
                  url: response.data.data.url,
                  title: response.data.title || title,
                  quality: response.data.data.quality || quality,
                  size: response.data.data.size || 'Desconocido'
                };
                break;
              }
            } catch { continue; }
          }
          
          if (!videoData) throw new Error('No se pudo obtener el video en ninguna calidad');

          const tmpDir = path.join(__dirname, 'tmp');
          if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
          const filename = `${Date.now()}_${videoData.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
          const filePath = path.join(tmpDir, filename);

          const resDownload = await axios.get(videoData.url, {
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          
          await streamPipeline(resDownload.data, fs.createWriteStream(filePath));

          const stats = fs.statSync(filePath);
          if (!stats || stats.size < 100000) {
            fs.unlinkSync(filePath);
            throw new Error('El video descargado está vacío o incompleto');
          }

          await sock.sendMessage(msg.key.remoteJid, {
            video: fs.readFileSync(filePath),
            mimetype: 'video/mp4',
            fileName: `${videoData.title}.mp4`,
            caption: `🎬 ${videoData.title}\n🔹 Calidad: ${videoData.quality}\n🔹 Tamaño: ${videoData.size}\n\n© Azura Music Plugin`,
            gifPlayback: false
          }, { quoted: msg });

          fs.unlinkSync(filePath);
          await sock.sendMessage(msg.key.remoteJid, {
            react: { text: '✅', key: msg.key }
          });

        } catch (err) {
          console.error('Error en plugin play:', err);
          await sock.sendMessage(msg.key.remoteJid, {
            text: `❌ *Error:* ${err.message}\n\nPrueba con otro título o verifica que el video esté disponible.`
          }, { quoted: msg });
          await sock.sendMessage(msg.key.remoteJid, {
            react: { text: '❌', key: msg.key }
          });
        }
      }
    });
  }
};
