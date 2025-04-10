import fetch from 'node-fetch';
import axios from 'axios';

/*═══════『 APIS 』═══════*/
const apis = {
    delirius: 'https://delirius-apiofc.vercel.app/',
    ryzen: 'https://apidl.asepharyana.cloud/',
    rioo: 'https://restapi.apibotwa.biz.id/'
};
/*═══════════════════════*/

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
    try {
        // ✦ Reacción rápida ✦
        await conn.sendMessage(m.chat, { react: { text: "🎵", key: m.key } });

        // ✦ Validar entrada ✦
        if (!text) {
            return conn.sendMessage(m.chat, {
                text: `✧ Por favor escribe lo que deseas buscar en Spotify.\n\n➥ Ejemplo:\n➥ *${usedPrefix + command}* Alan Walker - Faded`
            }, { quoted: m });
        }

        // ✦ Búsqueda en Spotify ✦
        const res = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=1`);
        
        if (!res.data.data || res.data.data.length === 0) {
            throw '✖ No se encontraron resultados en Spotify.';
        }

        const result = res.data.data[0];
        const img = result.image;
        const url = result.url;
        
        // ✦ Información estilizada ✦
        const info = `
╔═════『 𝙈𝙐𝙎𝙄𝘾𝘼 』═════╗
┃ ✦ 𝗧𝗶𝘁𝘂𝗹𝗼: ${result.title}
┃ ✦ 𝗔𝗿𝘁𝗶𝘀𝘁𝗮: ${result.artist}
┃ ✦ 𝗗𝘂𝗿𝗮𝗰𝗶𝗼𝗻: ${result.duration}
┃ ✦ 𝗣𝘂𝗯𝗹𝗶𝗰𝗮𝗱𝗼: ${result.publish}
┃ ✦ 𝗣𝗼𝗽𝘂𝗹𝗮𝗿𝗶𝗱𝗮𝗱: ${result.popularity}
┃ ✦ 𝗘𝗻𝗹𝗮𝗰𝗲: ${url}
╚══════════════════╝

⌛ *Preparando tu música...*`.trim();

        await conn.sendMessage(m.chat, {
            image: { url: img },
            caption: info
        }, { quoted: m });

        // ✦ Función de envío de audio ✦
        const sendAudio = async (link) => {
            const audioRes = await fetch(link);
            const audioBuffer = await audioRes.arrayBuffer();
            
            await conn.sendMessage(m.chat, {
                audio: Buffer.from(audioBuffer),
                fileName: `${result.title}.mp3`,
                mimetype: 'audio/mpeg'
            }, { quoted: m });
        };

        // ✦ Intentar descarga en múltiples servidores ✦
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
                console.error(`⚠️ Error en el servidor ${endpoint}:`, e);
                continue;
            }
        }

        if (!success) {
            throw '✖ No fue posible descargar el audio en este momento.';
        }

    } catch (error) {
        console.error(error);
        conn.sendMessage(m.chat, { text: `⚠️ Error: ${error}` }, { quoted: m });
    }
};
handler.help = ['play5'];
handler.command = ['play5'];
handler.tags = ['música'];
handler.register = true;

export default handler;
