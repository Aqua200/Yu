import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
const streamPipeline = promisify(pipeline);

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        await conn.reply(m.chat, `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${usedPrefix}${command}* La Factoría - Perdoname`, m);
        return;
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        // Búsqueda del audio usando la API
        const apiUrl = `https://api.neoxr.eu/api/ytplay?query=${encodeURIComponent(text)}&apikey=russellxz`;
        const response = await axios.get(apiUrl);
        
        if (!response.data?.status || !response.data?.data?.audio) {
            throw new Error('No se pudo obtener el audio');
        }

        const audioData = {
            url: response.data.data.audio,
            title: response.data.data.title || 'audio',
            thumbnail: response.data.data.thumbnail,
            duration: response.data.data.duration || '0:00',
            id: response.data.data.id || ''
        };

        const audioLink = `https://www.youtube.com/watch?v=${audioData.id}`;

        const captionPreview = `
╔═════════════════╗
║✦ 𝗕𝗼𝘁 ✦
╚═════════════════╝

🎵 *𝙄𝗻𝗳𝗼 𝗱𝗲𝗹 𝗮𝘂𝗱𝗶𝗼:*  
╭───────────────╮  
├ 🎵 *Título:* ${audioData.title}
├ ⏱️ *Duración:* ${audioData.duration}
└ 🔗 *Link:* ${audioLink}
╰───────────────╯

📥 *Opciones de Descarga:*  
┣ 🎵 *Audio HQ:* _${usedPrefix}play5 ${text}_
┣ 🎵 *Audio LQ:* _${usedPrefix}play1 ${text}_
┣ 🎥 *Video:* _${usedPrefix}play6 ${text}_
┗ ⚠️ *¿No se reproduce?* Usa _${usedPrefix}ff_

⏳ *Procesado por tu bot favorita*
═════════════════════  
        𖥔  Bot 𖥔
═════════════════════`;

        await conn.sendMessage(m.chat, {
            image: { url: audioData.thumbnail },
            caption: captionPreview
        }, { quoted: m });

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
        const filename = `${Date.now()}_audio.mp3`;
        const filePath = path.join(tmpDir, filename);

        // Descargar el audio
        const res = await axios.get(audioData.url, {
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        await streamPipeline(res.data, fs.createWriteStream(filePath));

        // Verificar tamaño del 📂 
        const stats = fs.statSync(filePath);
        if (!stats || stats.size < 100000) {
            fs.unlinkSync(filePath);
            throw new Error('El audio descargado está vacío o incompleto');
        }

        const finalText = `🎵 Aquí tiene su audio en alta calidad.\n\nDisfrútelo y continúe explorando el mundo digital.\n\n© Bot`;

        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(filePath),
            mimetype: 'audio/mpeg',
            fileName: `${audioData.title}.mp3`,
            caption: finalText
        }, { quoted: m });

        fs.unlinkSync(filePath);

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (err) {
        console.error('Error en play5:', err);
        await conn.reply(m.chat, `❌ *Error:* ${err.message}\n\nPrueba con otro nombre o usa *${usedPrefix}play1* para versión de menor calidad`, m);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['play5 <búsqueda>'];
handler.tags = ['downloader'];
handler.command = ['play5', 'musica', 'audiohq'];

export default handler;
