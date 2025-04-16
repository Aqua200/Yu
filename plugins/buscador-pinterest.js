/*
• @David-Chian
- https://github.com/David-Chian
*/

import fetch from 'node-fetch';
import { generateWAMessageFromContent, generateWAMessage, delay } from '@whiskeysockets/baileys';

async function sendAlbumMessage(conn, jid, medias, options = {}) {
    if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`);
    if (!Array.isArray(medias) || medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para un álbum");

    const caption = options.text || options.caption || "";
    const msgDelay = !isNaN(options.delay) ? options.delay : 500;
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
                expectedMediaCount: medias.length 
            } 
        },
        { upload: conn.waUploadToServer }
    );

    await conn.relayMessage(jid, album.message, { messageId: album.key.id });

    for (let i = 0; i < medias.length; i++) {
        const media = medias[i];
        const msg = await generateWAMessage(
            jid,
            { 
                [media.type]: await conn.getFile(media.url), 
                caption: i === 0 ? caption : undefined,
                mimetype: media.mimetype 
            },
            { upload: conn.waUploadToServer }
        );
        
        msg.message.messageContextInfo = {
            deviceListMetadata: {},
            messageAssociation: { 
                associationType: 1, 
                parentMessageKey: album.key 
            },
        };
        
        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
        await delay(msgDelay);
    }
    return album;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*📌 Ejemplo de uso:* ${usedPrefix + command} Megumin`;

    await m.react('⏳');
    await conn.sendMessage(m.chat, {
        text: '📌 *Descargando imágenes de Pinterest...*',
        contextInfo: {
            externalAdReply: {
                title: global.packname,
                body: global.wm,
                thumbnailUrl: global.icons,
                sourceUrl: global.channel,
                mediaType: 1,
                showAdAttribution: true
            }
        }
    }, { quoted: m });

    try {
        const apiUrl = `https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`;
        const { data } = await fetch(apiUrl).then(res => res.json());

        if (!Array.isArray(data) || data.length < 2) {
            await m.react('❌');
            return conn.reply(m.chat, '❌ No se encontraron suficientes imágenes para crear un álbum.', m);
        }

        const images = data.slice(0, 3).map(img => ({
            type: 'image',
            url: img.image_large_url,
            mimetype: 'image/jpeg'
        }));

        await sendAlbumMessage(conn, m.chat, images, {
            caption: `📌 *Resultados para:* ${text}`,
            quoted: m
        });
        await m.react('✅');
    } catch (error) {
        console.error('Error en comando pinterest:', error);
        await m.react('❌');
        await conn.reply(m.chat, '⚠️ Ocurrió un error al procesar tu solicitud.', m);
    }
};

handler.help = ["pinterest"];
handler.tags = ["descargas"];
handler.coin = 1;
handler.group = true;
handler.register = true
handler.command = ['pinterest', 'pin'];

export default handler;
