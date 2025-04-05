import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*Ejemplo:* ${usedPrefix + command} canción o artista`;
    
    try {
        // Realizar búsqueda en YouTube
        const search = await yts(text);
        if (!search.all || search.all.length === 0) throw 'No se encontraron resultados para tu búsqueda';
        
        const isVideo = command.includes('vid');
        const videoInfo = search.videos[0]; // Usamos videos en lugar de all para mayor precisión
        
        if (!videoInfo) throw 'No se encontró el video solicitado';
        
        const body = `🎵 *YouTube Play* 🎵

📌 *Título:* ${videoInfo.title}
👀 *Vistas:* ${videoInfo.views}
⏳ *Duración:* ${videoInfo.timestamp}
📅 *Subido:* ${videoInfo.ago}
🔗 *Enlace:* ${videoInfo.url}

⏳ *Preparando tu ${isVideo ? 'video' : 'audio'}...*`;
        
        // Enviar información del video
        await conn.sendMessage(m.chat, {
            image: { url: videoInfo.thumbnail },
            caption: body
        }, { quoted: m });
        
        await m.react('🔍');
        
        // Descargar el contenido
        const mediaData = await dl_vid(videoInfo.url);
        if (!mediaData?.data) throw 'Error al obtener el contenido';
        
        // Enviar el archivo multimedia
        await conn.sendMessage(m.chat, {
            [isVideo ? 'video' : 'audio']: {
                url: isVideo ? mediaData.data.mp4 : mediaData.data.mp3
            },
            mimetype: isVideo ? 'video/mp4' : 'audio/mpeg',
            caption: `🎬 ${videoInfo.title}`
        }, { quoted: m });
        
        await m.react('✅');
        
    } catch (error) {
        console.error('Error en el handler:', error);
        await m.reply(`❌ Error: ${error.message || error}`);
        await m.react('❌');
    }
}

handler.command = ['play5', 'playvid5'];
handler.help = ['play5 <búsqueda> - Descarga audio de YouTube', 'playvid5 <búsqueda> - Descarga video de YouTube'];
handler.tags = ['downloader'];
export default handler;

async function dl_vid(url) {
    try {
        const response = await fetch('https://shinoa.us.kg/api/download/ytdl', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: url })
        });

        if (!response.ok) {
            throw new Error(`API respondió con estado ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en dl_vid:', error);
        throw new Error('Falló la descarga del video');
    }
}
