import fetch from 'node-fetch';
import axios from 'axios';
import yts from 'yt-search';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);
const apis = {
    ocean: 'https://p.oceansaver.in/ajax'
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `⚠️ Escribe el nombre de la canción.\nEjemplo: *${usedPrefix + command} Boza Yaya*`;

    await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } });

    try {
        const search = await yts(text);
        if (!search.videos.length) throw "❌ No se encontraron resultados.";
        
        const video = search.videos[0];
        const { title, url, thumbnail } = video;

        const res = await axios.get(`${apis.ocean}/download.php?format=mp3&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`);
        if (!res.data.success) throw "❌ No se pudo obtener la info del video.";
        
        const downloadUrl = await checkProgress(res.data.id);
        
        // Directorio temporal seguro en Termux
        const tmpDir = '/data/data/com.termux/files/home/tmp';
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const filePath = path.join(tmpDir, `${Date.now()}.mp3`);
        const audioRes = await axios.get(downloadUrl, { responseType: 'stream' });

        const writer = fs.createWriteStream(filePath, { highWaterMark: 64 * 1024 }); // 64 KB
        await streamPipeline(audioRes.data, writer);

        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(filePath),
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

        fs.unlinkSync(filePath); // Borrar archivo temporal
    } catch (err) {
        console.error(err);
        throw `❌ Error: ${err.message || err}`;
    }
};

const checkProgress = async (id) => {
    while (true) {
        try {
            const res = await axios.get(`${apis.ocean}/progress.php?id=${id}`);
            if (res.data?.success && res.data.progress === 1000) {
                return res.data.download_url;
            }
            await new Promise(resolve => setTimeout(resolve, 1500)); // Espera 1.5 segundos
        } catch (e) {
            console.error('Error en checkProgress:', e);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
};

handler.help = ['play4'];
handler.command = ['play4'];
handler.tags = ['música'];
handler.register = true;

export default handler;
