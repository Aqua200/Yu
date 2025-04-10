import yts from 'yt-search';

// Definir estas variables si no están definidas en otro lugar
const emoji = '🎵';
const rwait = '⏳';
const done = '✅';
const dev = 'TuNombre';
const fkontak = {}; // Define esto adecuadamente

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `${emoji} Por favor ingresa la música que deseas descargar.`;

  try {
    const isVideo = /vid|2|mp4|v$/.test(command);
    const search = await yts(text);

    if (!search.all || search.all.length === 0) {
      throw "No se encontraron resultados para tu búsqueda.";
    }

    const videoInfo = search.all[0];
    const body = `「✦」ძᥱsᥴᥲrgᥲᥒძ᥆ *<${videoInfo.title}>*\n\n> ✦ ᥴᥲᥒᥲᥣ » *${videoInfo.author.name || 'Desconocido'}*\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ✰ ᥎іs𝗍ᥲs » *${videoInfo.views}*\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ⴵ ძᥙrᥲᥴі᥆ᥒ » *${videoInfo.timestamp}*\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ✐ ⍴ᥙᑲᥣіᥴᥲძ᥆ » *${videoInfo.ago}*\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> 🜸 ᥣіᥒk » ${videoInfo.url}\n`;

    if (command === 'play' || command === 'play2' || command === 'playvid') {
      await conn.sendMessage(m.chat, {
        image: { url: videoInfo.thumbnail },
        caption: body,
        footer: dev,
        buttons: [
          {
            buttonId: `${usedPrefix}yta ${videoInfo.url}`,
            buttonText: { displayText: 'ᯓᡣ𐭩 ᥲᥙძі᥆' },
          },
          {
            buttonId: `${usedPrefix}ytv ${videoInfo.url}`,
            buttonText: { displayText: 'ᯓᡣ𐭩 ᥎іძᥱ᥆' },
          },
        ],
        viewOnce: true,
        headerType: 4,
      }, { quoted: fkontak });
      m.react('🕒');

    } else if (command === 'yta' || command === 'ytmp3') {
      m.react(rwait);
      let audio;
      const apis = [
        `https://api.alyachan.dev/api/youtube?url=${videoInfo.url}&type=mp3&apikey=Gata-Dios`,
        `https://delirius-apiofc.vercel.app/download/ytmp3?url=${videoInfo.url}`,
        `https://api.vreden.my.id/api/ytmp3?url=${videoInfo.url}`
      ];

      for (const api of apis) {
        try {
          const res = await fetch(api);
          if (res.ok) {
            audio = await res.json();
            if (audio.data?.url) break;
          }
        } catch (e) {
          console.error(`Error con API ${api}:`, e);
        }
      }

      if (!audio?.data?.url) throw "No se pudo obtener el audio de ninguna API.";
      await conn.sendFile(m.chat, audio.data.url, `${videoInfo.title}.mp3`, null, m, null, { mimetype: "audio/mpeg" });
      m.react(done);

    } else if (command === 'ytv' || command === 'ytmp4') {
      m.react(rwait);
      let video;
      const apis = [
        `https://api.alyachan.dev/api/youtube?url=${videoInfo.url}&type=mp4&apikey=Gata-Dios`,
        `https://delirius-apiofc.vercel.app/download/ytmp4?url=${videoInfo.url}`,
        `https://api.vreden.my.id/api/ytmp4?url=${videoInfo.url}`
      ];

      for (const api of apis) {
        try {
          const res = await fetch(api);
          if (res.ok) {
            video = await res.json();
            if (video.data?.url) break;
          }
        } catch (e) {
          console.error(`Error con API ${api}:`, e);
        }
      }

      if (!video?.data?.url) throw "No se pudo obtener el video de ninguna API.";
      await conn.sendMessage(m.chat, {
        video: { url: video.data.url },
        caption: `*${videoInfo.title}*`,
        mimetype: "video/mp4"
      }, { quoted: m });
      m.react(done);

    } else {
      throw "Comando no reconocido.";
    }
  } catch (error) {
    console.error(error);
    m.reply(`❌ Error: ${error.message || error}`);
  }
};

handler.help = ['play', 'playvid', 'ytv', 'ytmp4', 'yta', 'play2', 'ytmp3'];
handler.command = ['play', 'playvid', 'ytv', 'ytmp4', 'yta', 'play2', 'ytmp3'];
handler.tags = ['dl'];
handler.register = true;

export default handler;
