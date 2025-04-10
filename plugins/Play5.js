import fetch from 'node-fetch';
import axios from 'axios';

const apis = {
    delirius: 'https://delirius-apiofc.vercel.app/',
    ryzen: 'https://apidl.asepharyana.cloud/',
    rioo: 'https://restapi.apibotwa.biz.id/'
};

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } });

        if (!text) {
            return conn.sendMessage(m.chat, {
                text: `⚠️ Escribe lo que deseas buscar en Spotify.\nEjemplo: *${usedPrefix + command}* Marshmello - Alone`
            }, { quoted: m });
        }

        // Buscar en Spotify
        const res = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=1`);
        
        if (!res.data.data || res.data.data.length === 0) {
            throw '❌ No se encontraron resultados en Spotify.';
        }

        const result = res.data.data[0];
        const img = result.image;
        const url = result.url;
        
        // Información del track
        const info = `⧁ 𝙏𝙄𝙏𝙐𝙇𝙊: ${result.title}
⧁ 𝘼𝙍𝙏𝙄𝙎𝙏𝘼: ${result.artist}
⧁ 𝘿𝙐𝙍𝘼𝘾𝙄𝙊́𝙉: ${result.duration}
⧁ �𝙐𝘽𝙇𝙄𝘾𝘼𝘿𝙊: ${result.publish}
⧁ 𝙋𝙊𝙋𝙐𝙇𝘼𝙍𝙄𝘿𝘼𝘿: ${result.popularity}
⧁ 𝙀𝙉𝙇𝘼𝘾𝙀: ${url}

🎶 *Enviando tu música...*`.trim();

        await conn.sendMessage(m.chat, {
            image: { url: img },
            caption: info
        }, { quoted: m });

        // Función para enviar audio
        const sendAudio = async (link) => {
            const audioRes = await fetch(link);
            const audioBuffer = await audioRes.arrayBuffer();
            
            await conn.sendMessage(m.chat, {
                audio: Buffer.from(audioBuffer),
                fileName: `${result.title}.mp3`,
                mimetype: 'audio/mpeg'
            }, { quoted: m });
        };

        // Intentar diferentes endpoints de descarga
        const endpoints = [
            `${apis.delirius}download/spotifydl?url=${encodeURIComponent(url)}`,
            `${apis.delirius}download/spotifydlv3?url=${encodeURIComponent(url)}`,
            `${apis.rioo}api/spotify?url=${encodeURIComponent(url)}`,
            `${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(url)}`
        ];

        let success = false;
        for (const endpoint of endpoints) {
            try {
                const dlRes = await fetch(endpoint);
                const json = await dlRes.json();
                
                if (json.data?.url) {
                    await sendAudio(json.data.url);
                    success = true;
                    break;
                } else if (json.data?.response) {
                    await sendAudio(json.data.response);
                    success = true;
                    break;
                } else if (json.link) {
                    await sendAudio(json.link);
                    success = true;
                    break;
                }
            } catch (e) {
                console.error(`Error en endpoint ${endpoint}:`, e);
                continue;
            }
        }

        if (!success) {
            throw '❌ No se pudo descargar el audio desde ningún servidor disponible.';
        }

    } catch (error) {
        console.error(error);
        conn.sendMessage(m.chat, {
            text: `❌ Ocurrió un error: ${error.message || error}`
        }, { quoted: m });
    }
};

handler.help = ['play5 <búsqueda>'];
handler.tags = ['downloader'];
handler.command = ['play5', 'musica', 'audiohq', 'musicahq'];
handler.limit = true;
handler.register = true;

export default handler;
