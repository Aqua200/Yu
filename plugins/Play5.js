import fetch from 'node-fetch';
import axios from 'axios';
import yts from 'yt-search';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);
const apis = {
    ocean: 'https://p.oceansaver.in/ajax'
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `⚠️ Escribe el nombre de la canción.
Ejemplo: *${usedPrefix + command} Boza Yaya*`;

    await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } });

    try {
        const search = await yts(text);
        if (!search.videos.length) throw "❌ No se encontraron resultados.";

        const video = search.videos[0];
        const { title, url, thumbnail } = video;

        const res = await axios.get(`${apis.ocean}/download.php?format=mp3&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`);
        if (!res.data.success) throw "❌ No se pudo obtener la info del video.";

        const downloadUrl = await checkProgress(res.data.id);
        if (!downloadUrl) throw "❌ No se pudo completar la descarga.";

        const tmpDir = path.join(process.cwd(), 'tmp');
        await fs.mkdir(tmpDir, { recursive: true });

        const filePath = path.join(tmpDir, `${Date.now()}.mp3`);
        const audioRes = await axios.get(downloadUrl, { responseType: 'stream' });
        await streamPipeline(audioRes.data, fs.createWriteStream(filePath));

        const fileStats = await fs.stat(filePath);
        if (fileStats.size < 1024) { // Menos de 1KB
            await fs.unlink(filePath);
            throw "❌ El archivo descargado es inválido.";
        }

        await conn.sendMessage(m.chat, {
            audio: await fs.readFile(filePath),
            fileName: `${title}.mp3`,
            mimetype: "audio/mpeg",
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: "Tu música está lista 🎵",
                    mediaType: 1,
                    previewType: "PHOTO",
                    thumbnailUrl: thumbnail,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await fs.unlink(filePath);
    } catch (err) {
        console.error(err);
        throw `❌ Error: ${err.message || err}`;
    }
};

const checkProgress = async (id) => {
    let attempts = 0;
    while (attempts < 10) { // Máximo 10 intentos
        const res = await axios.get(`${apis.ocean}/progress.php?id=${id}`);
        if (res.data?.success && res.data.progress === 1000) {
            return res.data.download_url;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
    }
    return null; // Si no se obtiene la URL después de 10 intentos, se cancela
};

handler.help = ['play1'];
handler.command = ['play1'];
handler.tags = ['música'];
handler.register = true;

export default handler;
