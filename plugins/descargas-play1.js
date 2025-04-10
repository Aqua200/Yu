import axios from 'axios';
import fs from 'fs';
import path from 'path';
import yts from 'yt-search';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);

const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];

const ddownr = {
    download: async (url, format) => {
        if (!formatAudio.includes(format)) {
            throw new Error('Formato no soportado.');
        }
        const config = {
            method: 'GET',
            url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        };
        const response = await axios.request(config);
        if (response.data && response.data.success) {
            const { id, title, info } = response.data;
            const downloadUrl = await ddownr.cekProgress(id);
            return { title, downloadUrl, thumbnail: info.image };
        } else {
            throw new Error('No se pudo obtener la info del video.');
        }
    },
    cekProgress: async (id) => {
        const config = {
            method: 'GET',
            url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        };
        while (true) {
            const response = await axios.request(config);
            if (response.data?.success && response.data.progress === 1000) {
                return response.data.download_url;
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

const handler = async (m, { conn, text }) => {
    if (!text) {
        await conn.sendMessage(m.chat, {
            text: `⚠️ Escribe el nombre de la canción.\nEjemplo: *${global.prefix}play Boza Yaya*`
        }, { quoted: m });
        return;
    }

    await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } });

    try {
        const search = await yts(text);
        if (!search.videos || search.videos.length === 0) {
            throw new Error('No se encontraron resultados.');
        }

        const video = search.videos[0];
        const { title, url, thumbnail } = video;
        const { downloadUrl } = await ddownr.download(url, 'mp3');

        const tmpDir = path.join('./tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
        const rawPath = path.join(tmpDir, `${Date.now()}_raw.mp3`);
        const finalPath = path.join(tmpDir, `${Date.now()}_compressed.mp3`);

        const audioRes = await axios.get(downloadUrl, {
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        await streamPipeline(audioRes.data, fs.createWriteStream(rawPath));

        await new Promise((resolve, reject) => {
            ffmpeg(rawPath)
                .audioBitrate('128k')
                .format('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(finalPath);
        });

        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(finalPath),
            fileName: `${title}.mp3`,
            mimetype: "audio/mpeg",
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: "2B Beta",
                    mediaType: 1,
                    previewType: "PHOTO",
                    thumbnailUrl: thumbnail,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        fs.unlinkSync(rawPath);
        fs.unlinkSync(finalPath);

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, {
            text: "⚠️ Hubo un pequeño error :("
        }, { quoted: m });
    }
};

handler.command = ['play'];
handler.help = ['play'].map(v => v + ' <texto>');
handler.tags = ['downloader'];

export default handler;
