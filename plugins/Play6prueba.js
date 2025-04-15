import yts from 'yt-search';
import fetch from 'node-fetch';

let limit = 320;
let confirmation = {};

// Objeto de mensajes seguro (sin caracteres problemáticos)
const mssg = {
  example: 'Ejemplo de uso',
  title: 'Título',
  aploud: 'Publicado hace',
  duration: 'Duración',
  views: 'Vistas',
  ig: 'Instagram',
  size: 'Tamaño',
  limitdl: 'Límite excedido'
};

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
  if (!text) throw `✳️ ${mssg.example}: ${usedPrefix}${command} Canción ejemplo`;

  let res = await yts(text);
  let vid = res.videos[0];
  if (!vid) throw '✳️ Video no encontrado';

  let { title, thumbnail, timestamp, views, ago, url } = vid;
  let chat = global.db.data.chats[m.chat];

  m.react('🎧');

  // Mensaje seguro sin caracteres especiales
  let playMessage = [
    '≡ *FG MUSIC*',
    '┌──────────────',
    `▢ *${mssg.title}:* ${title}`,
    `▢ *${mssg.aploud}:* ${ago}`,
    `▢ *${mssg.duration}:* ${timestamp}`,
    `▢ *${mssg.views}:* ${views.toLocaleString()}`,
    '└──────────────'
  ].join('\n');

  await conn.sendButton(
    m.chat,
    playMessage,
    mssg.ig,
    thumbnail,
    [
      ['MP3 🎧', `${usedPrefix}fgmp3 ${url}`],
      ['MP4 🎥', `${usedPrefix}fgmp4 ${url}`]
    ],
    m
  );
};

handler.help = ['play6'];
handler.tags = ['dl'];
handler.command = ['play6', 'playvid'];
handler.disabled = false;

export default handler;

// Handler before simplificado
handler.before = async (m) => {
  if (!m.text || m.isBaileys || !(m.sender in confirmation)) return;

  let { timeout, url, chat } = confirmation[m.sender];
  try {
    if (m.text === '1') {
      clearTimeout(timeout);
      let res = await fetch(global.API('fgmods', '/api/downloader/ytmp3', { url }, 'apikey'));
      let data = await res.json();
      await conn.sendFile(
        m.chat,
        data.result.dl_url,
        `${data.result.title}.mp3`,
        `≡ *FG YTDL*\n▢ *${mssg.title}:* ${data.result.title}`,
        m,
        null,
        { mimetype: 'audio/mpeg', asDocument: chat.useDocument }
      );
      m.react('✅');
    }
  } finally {
    delete confirmation[m.sender];
  }
};
