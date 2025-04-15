import yts from 'yt-search';
import fetch from 'node-fetch';

let limit = 320;
let confirmation = {};

// Definición de mensajes
const mssg = {
    example: '✳️ Ejemplo de uso',
    title: '📌 Título',
    aploud: '📆 Publicado hace',
    duration: '⌚ Duración',
    views: '👀 Vistas',
    ig: 'Sígueme en Instagram',
    size: '⚖️ Tamaño',
    limitdl: '⚠️ El archivo supera el límite de descarga'
};

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
    if (!text) throw `✳️ ${mssg.example} *${usedPrefix + command}* Lil Peep hate my life`;

    let res = await yts(text);
    let vid = res.videos[0];
    if (!vid) throw `✳️ Vídeo/Audio no encontrado`;

    let { title, description, thumbnail, videoId, timestamp, views, ago, url } = vid;
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let chat = global.db.data.chats[m.chat];

    m.react('🎧');

    let playMessage = `
≡ *FG MUSIC*
┌──────────────
▢ ${mssg.title}: ${vid.title}
▢ ${mssg.aploud}: ${vid.ago}
▢ ${mssg.duration}: ${vid.timestamp}
▢ ${mssg.views}: ${vid.views.toLocaleString()}
└──────────────`;

    // Verificación de business eliminada (si no es necesaria)
    conn.sendButton(m.chat, playMessage, mssg.ig, thumbnail, [
        ['🎶 MP3', `${usedPrefix}fgmp3 ${url}`],
        ['🎥 MP4', `${usedPrefix}fgmp4 ${url}`]
    ], m);
};

handler.help = ['play6'];
handler.tags = ['dl'];
handler.command = ['play6', 'playvid'];
handler.disabled = false;

export default handler;

handler.before = async m => {
    if (m.isBaileys) return;
    if (!(m.sender in confirmation)) return;

    let { sender, timeout, url, chat } = confirmation[m.sender];
    if (m.text.trim() === '1') {
        clearTimeout(timeout);
        delete confirmation[m.sender];

        let res = await fetch(global.API('fgmods', '/api/downloader/ytmp3', { url: url }, 'apikey'));
        let data = await res.json();

        let { title, dl_url, thumb, size, sizeB, duration } = data.result;
        conn.sendFile(m.chat, dl_url, title + '.mp3', `≡ *FG YTDL*\n\n▢ ${mssg.title}: ${title}`, m, false, { mimetype: 'audio/mpeg', asDocument: chat.useDocument });
        m.react('✅');
    } else if (m.text.trim() === '2') {
        clearTimeout(timeout);
        delete confirmation[m.sender];

        let res = await fetch(global.API('fgmods', '/api/downloader/ytmp4', { url: url }, 'apikey'));
        let data = await res.json();

        let { title, dl_url, thumb, size, sizeB, duration } = data.result;
        let isLimit = limit * 1024 < sizeB;

        await conn.loadingMsg(m.chat, '📥 Descargando', `${isLimit ? `≡ *FG YTDL*\n\n▢ ${mssg.size}: ${size}\n\n▢ _${mssg.limitdl}_ *+${limit} MB*` : '✅ Descarga completada'}`, ["▬▭▭▭▭▭", "▬▬▭▭▭▭", "▬▬▬▭▭▭", "▬▬▬▬▭▭", "▬▬▬▬▬▭", "▬▬▬▬▬▬"], m);

        if (!isLimit) conn.sendFile(m.chat, dl_url, title + '.mp4', `≡ *FG YTDL*\n${mssg.title}: ${title}\n${mssg.size}: ${size}`, m, false, { asDocument: chat.useDocument });
        m.react('✅');
    }
};
