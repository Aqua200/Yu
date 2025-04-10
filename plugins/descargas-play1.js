import axios from 'axios';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { join } from 'path';
import { pipeline } from 'stream/promises';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) throw `✦ Ingresa el título o enlace de un video de YouTube.`;

  try {
    const apiURL = `https://aemt.me/youtube/playmp3?q=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiURL);

    if (!data.status || !data.audio) throw new Error('❌ No se pudo obtener el audio');

    const filename = path.join(tmpdir(), `${Date.now()}.mp3`);
    const audioStream = await axios({
      method: 'get',
      url: data.audio,
      responseType: 'stream'
    });

    await pipeline(audioStream.data, writeFile(filename));

    await conn.sendFile(m.chat, filename, 'audio.mp3', null, m, true, { mimetype: 'audio/mpeg' });
  } catch (e) {
    console.error(e);
    throw '❌ *Error:* No se pudo obtener el audio';
  }
};

handler.help = ['play'];
handler.tags = ['música'];
handler.command = ['play'];
handler.register = true;

export default handler;
