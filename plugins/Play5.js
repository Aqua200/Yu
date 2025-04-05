import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Ejemplo: ${usedPrefix + command} canción o artista`;
    
    try {
        const search = await yts(text);
        if (!search.all || search.all.length === 0) throw 'No se encontraron resultados';
        
        const isVideo = command.includes('vid');
        const videoInfo = search.all[0];
        const urls = videoInfo.url;
        
        const body = `\`YouTube Play - 2B Prue\`

➢ *Título:* ${videoInfo.title}
➢ *Vistas:* ${videoInfo.views}
➢ *Duración:* ${videoInfo.timestamp}
➢ *Subido:* ${videoInfo.ago}
➢ *Url:* ${urls}

🌸 *Su ${isVideo ? 'Video' : 'Audio'} se está enviando, espere un momento...*`;
        
        await conn.sendMessage(m.chat, { 
            image: { url: videoInfo.thumbnail }, 
            caption: body
        }, { quoted: m });
        
        m.react('✅');

        const res = await dl_vid(urls);
        const type = isVideo ? 'video' : 'audio';
        const mediaUrl = isVideo ? res.data.mp4 : res.data.mp3;
        
        await conn.sendMessage(m.chat, { 
            [type]: { url: mediaUrl }, 
            mimetype: isVideo ? "video/mp4" : "audio/mpeg",
            caption: `🎵 ${videoInfo.title}`
        }, { quoted: m });
        
    } catch (error) {
        console.error(error);
        m.reply('❌ Ocurrió un error al procesar tu solicitud');
        m.react('❌');
    }
}

handler.command = ['play5', 'playvid5'];
handler.help = ['play5 <búsqueda>', 'playvid5 <búsqueda>'];
handler.tags = ['downloader'];
export default handler;

async function dl_vid(url) {
    const response = await fetch('https://shinoa.us.kg/api/download/ytdl', {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'api_key': 'free',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: url })
    });

    if (!response.ok) throw new Error(`Error en la API: ${response.status}`);
    return await response.json();
}
