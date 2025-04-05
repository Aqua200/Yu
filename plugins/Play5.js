import yts from 'yt-search';
import ytdl from 'ytdl-core';
import { unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile } from 'fs/promises';

const decorator = {
  header: '╭─── ⋆⋅☆⋅⋆ ───⭑',
  body: '│ ✧',
  footer: '╰─── ⋆⋅☆⋅⋆ ───⭑',
  divider: '├─── ⋅☾⋅ ───⭑'
};

const handler = async (m, { conn, text }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `${decorator.header}\n${decorator.body} Ingresa el nombre de la música.\n${decorator.footer}`, m);
    }

    await conn.sendMessage(m.chat, {
      text: `${decorator.header}\n${decorator.body} 🔍 Buscando: "${text}"\n${decorator.footer}`,
      contextInfo: {
        externalAdReply: {
          title: '✨ Buscando Música ✨',
          body: 'YouTube Search...',
          mediaType: 1,
          sourceUrl: 'https://www.youtube.com',
          thumbnail: await (await conn.getFile('https://i.imgur.com/7Q6yzzE.png')).data
        }
      }
    }, { quoted: m });

    const search = await yts(text);
    if (!search.videos.length) {
      return conn.reply(m.chat, `${decorator.header}\n${decorator.body} No se encontraron resultados.\n${decorator.footer}`, m);
    }

    const video = search.videos[0];
    const { title, thumbnail, timestamp, views, ago, url } = video;

    const infoMessage = `${decorator.header}\n` +
      `${decorator.body} 🎵 *${title}*\n` +
      `${decorator.divider}\n` +
      `${decorator.body} 👤 Artista: ${video.author.name || 'Desconocido'}\n` +
      `${decorator.body} 👀 Vistas: ${views}\n` +
      `${decorator.body} ⏱ Duración: ${timestamp}\n` +
      `${decorator.body} 📅 Publicado: ${ago}\n` +
      `${decorator.footer}\n` +
      `${decorator.body} ⏳ Descargando audio, espera un momento...`;

    const thumb = (await conn.getFile(thumbnail)).data;

    await conn.reply(m.chat, infoMessage, m, {
      contextInfo: {
        externalAdReply: {
          title: title.slice(0, 30),
          body: `por ${video.author.name}`,
          mediaType: 1,
          thumbnail: thumb,
          sourceUrl: url,
          renderLargerThumbnail: true
        }
      }
    });

    // Descargar el audio
    const audioStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
    const tempPath = join(tmpdir(), `${video.videoId}.mp3`);

    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    await writeFile(tempPath, Buffer.concat(chunks));

    await conn.sendMessage(m.chat, {
      audio: { url: tempPath },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: video.author.name,
          mediaType: 2,
          thumbnail: thumb,
          sourceUrl: url
        }
      }
    }, { quoted: m });

    await unlink(tempPath); // Borra el archivo temporal

  } catch (error) {
    console.error(error);
    return conn.reply(m.chat, `${decorator.header}\n${decorator.body} Ocurrió un error al buscar o descargar.\n${decorator.footer}`, m);
  }
};

export default handler;
