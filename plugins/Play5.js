import fetch from 'node-fetch';
import fg from 'senna-fg';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) return m.reply(`🍭 Ingresa un texto para buscar en YouTube\n> *Ejemplo:* ${usedPrefix + command} crow edits`);

    try {
        m.react('🕒');
        
        // Buscar en YouTube
        let api = await (await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(text)}`)).json();
        if (!api.data || !api.data[0]) throw new Error('No se encontraron resultados');
        
        let results = api.data[0];
        let txt = `✨ *Título:* ${results.title}\n⌛ *Duración:* ${results.duration}\n📎 *Link:* ${results.url}\n📆 *Publicado:* ${results.publishedAt}`;

        // Enviar información del video
        await conn.sendMessage(m.chat, { 
            image: { url: results.image }, 
            caption: txt 
        }, { quoted: m });

        // Descargar y enviar el video
        let data = await fg.ytmp4(results.url);
        if (!data.dl_url) throw new Error('No se pudo obtener el enlace de descarga');
        
        await conn.sendMessage(m.chat, { 
            document: { url: data.dl_url }, 
            fileName: `${results.title.replace(/[^\w\s]/gi, '')}.mp4`, 
            caption: wm ? `> ${wm}` : '',
            mimetype: 'video/mp4' 
        }, { quoted: m });
        
        m.react('✅');
    } catch (e) {
        console.error(e);
        m.reply(`❌ Error: ${e.message}`);
        m.react('✖️');
    }
}

handler.help = ['play5 <búsqueda>'];
handler.tags = ['downloader'];
handler.command = /^(play5|pvideo|play2)$/i;
handler.limit = true;
handler.register = true;

export default handler;
