import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
const streamPipeline = promisify(pipeline);

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${usedPrefix}${command}* La Factoría - Perdoname`, m);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        // Primero intentamos con la API principal
        let apiUrl = `https://api.neoxr.eu/api/ytplay?query=${encodeURIComponent(text)}&apikey=russellxz`;
        let response = await axios.get(apiUrl, { timeout: 10000 });
        
        // Si falla, probamos con una API alternativa
        if (!response.data?.status || !response.data?.data?.audio) {
            apiUrl = `https://api.lolhuman.xyz/api/ytplay2?apikey=tu_api_key&query=${encodeURIComponent(text)}`;
            response = await axios.get(apiUrl, { timeout: 10000 });
        }

        if (!response.data?.status || !response.data?.result?.audio || !response.data?.data?.audio) {
            // Último intento con otra API
            apiUrl = `https://api.dhamzxploit.my.id/api/ytplay?query=${encodeURIComponent(text)}`;
            response = await axios.get(apiUrl, { timeout: 10000 });
            
            if (!response.data?.result) {
                throw new Error('No se pudo obtener el audio de ninguna fuente');
            }
        }

        const audioData = response.data?.result || response.data?.data || {
            url: response.data.result.audio,
            title: response.data.result.title || text,
            thumbnail: response.data.result.thumbnail || 'https://i.ibb.co/df4Q7tV/audio-default.jpg',
            duration: response.data.result.duration || '0:00',
            id: response.data.result.id || ''
        };

        const audioLink = `https://www.youtube.com/watch?v=${audioData.id}`;

        const captionPreview = `
╔═════════════════╗
║✦  𝗕𝗼𝘁 ✦
╚═════════════════╝

🎵 *Información del audio:*  
╭────────────────╮  
├ 🎵 *Título:* ${audioData.title}
├ ⏱️ *Duración:* ${audioData.duration}
├ 📌 *Calidad:* Alta
└ 🔗 *Enlace:* ${audioLink}
╰────────────────╯

📥 *Otras opciones:*  
┣ 🎵 *Audio normal:* ${usedPrefix}play1 ${text}
┣ 🎥 *Versión video:* ${usedPrefix}play6 ${text}
┗ 🔍 *Buscar otra:* ${usedPrefix}play5 [nuevo nombre]

⏳ *Procesado*`, { quoted: m });

        await conn.sendMessage(m.chat, { 
            image: { url: audioData.thumbnail }, 
            caption: captionPreview 
        });

        // Descarga directa sin almacenamiento temporal
        const audioStream = await axios.get(audioData.url, {
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 30000
        });

        await conn.sendMessage(m.chat, {
            audio: audioStream.data,
            mimetype: 'audio/mpeg',
            fileName: `${audioData.title}.mp3`,
            caption: '🎵 Audio listo para disfrutar\n\n©  Bot'
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('Error en play5:', err);
        
        const errorMsg = `❌ *Error al obtener el audio*:\n\n`
            + `1. Revisa el nombre de la canción\n`
            + `2. Intenta con *${usedPrefix}play1 ${text}* (calidad estándar)\n`
            + `3. Prueba otro nombre o artista\n\n`
            + `*Ejemplo:* ${usedPrefix}play5 Cali y El Dandee - Porfa`;

        await conn.reply(m.chat, errorMsg, m);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['play5 <búsqueda>'];
handler.tags = ['downloader'];
handler.command = ['play5', 'musica', 'audiohq', 'musicahq'];
handler.limit = true;
handler.register = true;

export default handler;
