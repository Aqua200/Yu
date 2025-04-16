/*
• @David-Chian
- https://github.com/David-Chian
*/

import fetch from 'node-fetch';
import { generateWAMessageFromContent, generateWAMessage, delay as baileysDelay } from '@whiskeysockets/baileys';

async function sendAlbumMessage(conn, jid, medias, options = {}) {
    if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`);
    if (!Array.isArray(medias) || medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para un álbum");

    const caption = options.text || options.caption || "";
    const delay = !isNaN(options.delay) ? options.delay : 500;
    delete options.text;
    delete options.caption;
    delete options.delay;

    const album = generateWAMessageFromContent(
        jid,
        { 
            messageContextInfo: {}, 
            albumMessage: { 
                title: caption,
                description: '',
                previewType: 0,
                count: medias.length 
            } 
        },
        {}
    );

    await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

    for (let i = 0; i < medias.length; i++) {
        const { type, data } = medias[i];
        const img = await generateWAMessage(
            jid,
            { 
                [type]: data, 
                mimetype: 'image/jpeg',
                caption: i === 0 ? caption : '',
                ...options 
            },
            { upload: conn.waUploadToServer }
        );
        
        img.message.messageContextInfo = {
            messageAssociation: { 
                associationType: 1, 
                parentMessageKey: album.key 
            },
        };
        
        await conn.relayMessage(jid, img.message, { messageId: img.key.id });
        await baileysDelay(delay);
    }
    return album;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `📌 *Uso Correcto:* ${usedPrefix + command} *Megumin*`, m);

    await m.react('⏳');
    await conn.sendMessage(m.chat, { 
        text: '📤 *Descargando imágenes de Pinterest...*', 
        contextInfo: { 
            externalAdReply: { 
                title: global.packname, 
                body: global.wm, 
                thumbnail: global.icons, 
                mediaType: 1, 
                showAdAttribution: true 
            } 
        } 
    });

    try {
        const apiUrl = `https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!Array.isArray(data) || data.length < 2) {
            await m.react('❌');
            return conn.reply(m.chat, '❌ No se encontraron suficientes imágenes para un álbum.', m);
        }

        const images = data.slice(0, 10).map(img => ({ 
            type: "imageMessage", 
            data: { 
                url: img.image_large_url,
                mimetype: 'image/jpeg' 
            } 
        }));

        const caption = `🔎 *Resultados para:* ${text}`;
        await sendAlbumMessage(conn, m.chat, images, { caption, quoted: m });
        await m.react('✅');
    } catch (error) {
        console.error('Error en Pinterest API:', error);
        await m.react('❌');
        conn.reply(m.chat, '⚠️ Error al buscar imágenes. Intenta más tarde.', m);
    }
};

handler.help = ["pinterest <búsqueda>"];
handler.tags = ["downloader"];
handler.command = ["pinterest", "pin", "pins"];
handler.diamond = false;
handler.limit = true;
handler.register = true;

export default handler;
