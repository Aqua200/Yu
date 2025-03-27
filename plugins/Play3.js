import fetch from 'node-fetch';
import axios from 'axios';

const apis = {
    delirius: 'https://delirius-apiofc.vercel.app/',
    ryzen: 'https://apidl.asepharyana.cloud/',
    rioo: 'https://restapi.apibotwa.biz.id/'
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `⚠️ Escribe lo que deseas buscar en Spotify.\nEjemplo: *${usedPrefix + command}* Marshmello - Alone`;

    await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } });

    try {
        const res = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=1`);
        if (!res.data.data || res.data.data.length === 0) throw "❌ No se encontraron resultados en Spotify.";

        const result = res.data.data[0];
        const info = `「✦」𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊́𝙉 𝘿𝙀 𝙇𝘼 𝙈𝙐́𝙎𝙄𝘾𝘼\n\n> ✦ 𝙏𝙄́𝙏𝙐𝙇𝙊 » *${result.title}*\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ✦ 𝘼𝙍𝙏𝙄𝙎𝙏𝘼 » *${result.artist}*\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ⴵ 𝘿𝙐𝙍𝘼𝘾𝙄𝙊́𝙉 » *${result.duration}*\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ✐ 𝙋𝙐𝘽𝙇𝙄𝘾𝘼𝘿𝙊 » *${result.publish}*\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> 🜸 𝙀𝙉𝙇𝘼𝘾𝙀 » ${result.url}\n\n🎶 *Kaneko enviando tu música...*`;

        await conn.sendMessage(m.chat, {
            image: { url: result.image },
            caption: info
        }, { quoted: m });

        const sendAudio = async (link) => {
            await conn.sendMessage(m.chat, {
                audio: { url: link },
                fileName: `${result.title}.mp3`,
                mimetype: 'audio/mpeg'
            }, { quoted: m });
        };

        const downloadAttempts = [
            `${apis.delirius}download/spotifydl?url=${encodeURIComponent(result.url)}`,
            `${apis.delirius}download/spotifydlv3?url=${encodeURIComponent(result.url)}`,
            `${apis.rioo}api/spotify?url=${encodeURIComponent(result.url)}`,
            `${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(result.url)}`
        ];

        for (const attempt of downloadAttempts) {
            try {
                const res = await fetch(attempt);
                const json = await res.json();
                if (json.data?.url || json.data?.response || json.link) {
                    return await sendAudio(json.data?.url || json.data?.response || json.link);
                }
            } catch (error) {
                console.warn(`Fallo en intento: ${attempt}`);
            }
        }

        throw "❌ No se pudo descargar el audio.";

    } catch (err) {
        console.error(err);
        throw `❌ Ocurrió un error: ${err.message || err}`;
    }
};

handler.help = ['play3'];
handler.command = ['play3'];
handler.tags = ['música'];
handler.register = true;

export default handler;
