import fetch from 'node-fetch';
import axios from 'axios';

const apis = {
    oceandl: 'https://p.oceansaver.in/ajax/'
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `⚠️ Escribe lo que deseas buscar en YouTube.
Ejemplo: *${usedPrefix + command}* La Factoria - Perdoname`;

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        const search = await fetch(`https://ytsearch-api.example.com/search?q=${encodeURIComponent(text)}&limit=1`);
        const searchData = await search.json();
        if (!searchData || searchData.length === 0) throw "❌ No se encontraron resultados en YouTube.";

        const video = searchData[0];
        const info = `「✦」𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊́𝙉 𝘿𝙀 𝙇𝘼 𝙈𝙐́𝙎𝙄𝘾𝘼\n\n> ✦ 𝙏𝙄́𝙏𝙐𝙇𝙊 » *${video.title}*\n> ✦ 𝘼𝙍𝙏𝙄𝙎𝙏𝘼 » *${video.author}*\n> ⏱️ 𝘿𝙐𝙍𝘼𝘾𝙄𝙊́𝙉 » *${video.timestamp}*\n> 👁️ 𝙑𝙄𝙎𝙏𝘼𝙎 » *${video.views.toLocaleString()}*\n> 🔗 𝙀𝙉𝙇𝘼𝘾𝙀 » ${video.url}\n\n⏳ *Procesando tu música...*`;

        await conn.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption: info
        }, { quoted: m });

        const downloadUrl = `${apis.oceandl}download.php?format=mp3&url=${encodeURIComponent(video.url)}`;
        const downloadRes = await fetch(downloadUrl);
        const downloadData = await downloadRes.json();

        if (!downloadData.success) throw "❌ No se pudo descargar el audio.";

        await conn.sendMessage(m.chat, {
            audio: { url: downloadData.download_url },
            fileName: `${video.title}.mp3`,
            mimetype: 'audio/mpeg'
        }, { quoted: m });
    } catch (err) {
        console.error(err);
        throw `❌ Ocurrió un error: ${err.message || err}`;
    }
};

handler.help = ['play5'];
handler.command = ['play5'];
handler.tags = ['música'];
handler.register = true;

export default handler;
