module.exports = {
  name: 'MusicPlugin',
  version: '2.0.0',
  author: 'Azura',
  description: 'Plugin para descargar y reproducir música/videos de YouTube',
  dependencies: ['axios', 'fs', 'path', 'stream'],

  initialize: (client) => {
    // Aquí registramos el comando `.play` correctamente
    client.commands.set('play', {
      config: {
        name: "play",
        description: "Descarga música/videos de YouTube",
        usage: "[título o enlace]",
        cooldown: 5,
        aliases: ["play60", "p"]  // Añadido un alias corto para invocar el comando
      },
      handler: async ({ sock, msg, args, text, global }) => {
        // Verificamos si el texto está presente
        if (!text) {
          await sock.sendMessage(msg.key.remoteJid, {
            text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${global.prefix}play* La Factoría - Perdoname`
          }, { quoted: msg });
          return;
        }

        // Agregamos una reacción de proceso
        await sock.sendMessage(msg.key.remoteJid, {
          react: { text: '⏳', key: msg.key }
        });

        try {
          // 1. Realizamos la búsqueda de video utilizando la API de Neoxr
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

          // 2. Mostrar el banner con la información del video
          const captionPreview = `
╔═════════════════╗
║✦ 𝙈𝙪𝙨𝙞𝙘 𝙋𝙡𝙪𝙜𝙞𝙣 ✦
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

          // Enviar la imagen de portada y la información del video
          await sock.sendMessage(msg.key.remoteJid, {
            image: { url: thumbnail },
            caption: captionPreview
          }, { quoted: msg });

          // 3. Intentamos obtener el video con distintas calidades
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

          // Si no se pudo obtener el video, mostramos un error
          if (!videoData) throw new Error('No se pudo obtener el video en ninguna calidad');

          // 4. Descargar el video
          const tmpDir = path.join(__dirname, 'tmp');
          if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
          const filename = `${Date.now()}_${videoData.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
          const filePath = path.join(tmpDir, filename);

          const resDownload = await axios.get(videoData.url, {
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          // Descargar el video y guardarlo en el archivo temporal
          await streamPipeline(resDownload.data, fs.createWriteStream(filePath));

          const stats = fs.statSync(filePath);
          if (!stats || stats.size < 100000) {
            fs.unlinkSync(filePath);
            throw new Error('El video descargado está vacío o incompleto');
          }

          // Enviar el video al usuario
          await sock.sendMessage(msg.key.remoteJid, {
            video: fs.readFileSync(filePath),
            mimetype: 'video/mp4',
            fileName: `${videoData.title}.mp4`,
            caption: `🎬 ${videoData.title}\n🔹 Calidad: ${videoData.quality}\n🔹 Tamaño: ${videoData.size}\n\n© Azura Music Plugin`,
            gifPlayback: false
          }, { quoted: msg });

          // Borrar el archivo después de enviarlo
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
