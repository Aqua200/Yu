import yts from 'yt-search';
import fetch from 'node-fetch';
let limit = 320;
let confirmation = {};

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
▢ 📌 *${mssg.title}:* ${vid.title}
▢ 📆 *${mssg.aploud}:* ${vid.ago}
▢ ⌚ *${mssg.duration}:* ${vid.timestamp}
▢ 👀 *${mssg.views}:* ${vid.views.toLocaleString()}
└──────────────`;

if(business){
    conn.sendFile(m.chat, thumbnail, "error.jpg", `${playMessage}\n\nEscribe:\n1️⃣ para recibir el archivo como MP3.\n2️⃣ para recibir el archivo como MP4.`, m);

    // 
    confirmation[m.sender] = {
        sender: m.sender,
        to: who,
        url: url,
        chat: chat, 
        timeout: setTimeout(() => {
            delete confirmation[m.sender];

            //conn.reply(m.chat, `⏳ Tiempo de respuesta agotado. Vuelve a intentarlo.`, m);
        }, 60000), // 1 minuto de espera
    };
} else {
    conn.sendButton(m.chat, playMessage, mssg.ig, thumbnail, [
        ['🎶 MP3', `${usedPrefix}fgmp3 ${url}`],
        ['🎥 MP4', `${usedPrefix}fgmp4 ${url}`]
      ], m)
}


}
handler.help = ['play6'];
handler.tags = ['dl'];
handler.command = ['play6','playvid'];
handler.disabled = false;

export default handler;
handler.before = async m => {
    if (m.isBaileys) return; // Ignorar mensajes del bot
    if (!(m.sender in confirmation)) return; // Solo continuar si hay confirmación pendiente

    let { sender, timeout, url, chat } = confirmation[m.sender]; // Desestructuración que incluye la url y chat
    if (m.text.trim() === '1') {
        clearTimeout(timeout);
        delete confirmation[m.sender];

        let res = await fetch(global.API('fgmods', '/api/downloader/ytmp3', { url: url }, 'apikey'));
        let data = await res.json();

        let { title, dl_url, thumb, size, sizeB, duration } = data.result;
        conn.sendFile(m.chat, dl_url, title + '.mp3', `≡  *FG YTDL*\n\n▢ *📌 ${mssg.title}* : ${title}`, m, false, { mimetype: 'audio/mpeg', asDocument: chat.useDocument });
        m.react('✅');
    } else if (m.text.trim() === '2') {
        clearTimeout(timeout);
        delete confirmation[m.sender];

        let res = await fetch(global.API('fgmods', '/api/downloader/ytmp4', { url: url }, 'apikey'));
        let data = await res.json();

        let { title, dl_url, thumb, size, sizeB, duration } = data.result;
        let isLimit = limit * 1024 < sizeB;

        await conn.loadingMsg(m.chat, '📥 Descargando', ` ${isLimit ? `≡  *FG YTDL*\n\n▢ *⚖️${mssg.size}*: ${size}\n\n▢ _${mssg.limitdl}_ *+${limit} MB*` : '✅ Descarga Completada' }`, ["▬▭▭▭▭▭", "▬▬▭▭▭▭", "▬▬▬▭▭▭", "▬▬▬▬▭▭", "▬▬▬▬▬▭", "▬▬▬▬▬▬"], m);

        if (!isLimit) conn.sendFile(m.chat, dl_url, title + '.mp4', `≡  *FG YTDL*\n*📌${mssg.title}:* ${title}\n*⚖️${mssg.size}:* ${size}`, m, false, { asDocument: chat.useDocument });
        m.react('✅');
    }

}
