import fetch from 'node-fetch';
import axios from 'axios';

const apis = {
    delirius: 'https://delirius-apiofc.vercel.app/',
    ryzen: 'https://apidl.asepharyana.cloud/',
    rioo: 'https://restapi.apibotwa.biz.id/'
};

export const command = 'play3';
export const description = 'Busca y descarga música desde Spotify.';
export const category = 'Música';

export async function handler({ sock, msg, text }) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "🎶", key: msg.key } });

    if (!text) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: `⚠️ Escribe lo que deseas buscar en Spotify.\nEjemplo: *play3* Marshmello - Alone`
        }, { quoted: msg });
        return;
    }

    try {
        const res = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=1`);
        if (!res.data.data || res.data.data.length === 0) {
            throw new Error('❌ No se encontraron resultados en Spotify.');
        }

        const result = res.data.data[0];
        const img = result.image;
        const url = result.url;
        const info = `⧁ 𝙏𝙄𝙏𝙐𝙇𝙊: ${result.title}
⧁ 𝘼𝙍𝙏𝙄𝙎𝙏𝘼: ${result.artist}
⧁ 𝘿𝙐𝙍𝘼𝘾𝙞́𝙊𝙉: ${result.duration}
⧁ 𝙋𝙐𝘽𝙇𝙞𝘾𝘼𝘿𝙊: ${result.publish}
⧁ 𝙋𝙊𝙋𝙐𝙇𝘼𝙍𝙞𝘿𝘼𝘿: ${result.popularity}
⧁ 𝙀𝙉𝙇𝘼𝘾𝙀: ${url}

🎶 *Kaneko enviando tu música...*`.trim();

        await sock.sendMessage(msg.key.remoteJid, {
            image: { url: img },
            caption: info
        }, { quoted: msg });

        const sendAudio = async (link) => {
            await sock.sendMessage(msg.key.remoteJid, {
                audio: { url: link },
                fileName: `${result.title}.mp3`,
                mimetype: 'audio/mpeg'
            }, { quoted: msg });
        };

        const downloadAttempts = [
            `${apis.delirius}download/spotifydl?url=${encodeURIComponent(url)}`,
            `${apis.delirius}download/spotifydlv3?url=${encodeURIComponent(url)}`,
            `${apis.rioo}api/spotify?url=${encodeURIComponent(url)}`,
            `${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(url)}`
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

        await sock.sendMessage(msg.key.remoteJid, {
            text: '❌ No se pudo descargar el audio.'
        }, { quoted: msg });

    } catch (err) {
        console.error(err);
        await sock.sendMessage(msg.key.remoteJid, {
            text: `❌ Ocurrió un error: ${err.message || err}`
        }, { quoted: msg });
    }
}
