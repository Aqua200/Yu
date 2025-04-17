import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) throw `✳️ *Ejemplo de uso:*\n${usedPrefix + command} gatos\n${usedPrefix + command} https://www.pinterest.com/pin/123456/`;

  try {
    // Si es un enlace de Pinterest
    if (text.match(/https?:\/\/[a-z]+\.pinterest\.com\/pin\/\d+/i)) {
      m.react('⏳');
      const pinData = await downloadPin(text);
      
      if (pinData.isVideo) {
        await conn.sendMessage(m.chat, {
          video: { url: pinData.url },
          caption: `📌 *${pinData.title || 'Video de Pinterest'}*`
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, {
          image: { url: pinData.url },
          caption: `📌 *${pinData.title || 'Imagen de Pinterest'}*`
        }, { quoted: m });
      }
      m.react('✅');

    } else { // Búsqueda
      m.react('🔍');
      const results = await searchPins(text);
      if (!results.length) throw '❌ No se encontraron resultados';

      // Enviar hasta 5 imágenes
      for (let i = 0; i < Math.min(results.length, 5); i++) {
        await conn.sendMessage(m.chat, {
          image: { url: results[i].image_large_url },
          caption: `📍 Resultado ${i + 1} de *"${text}"*`
        }, { quoted: m });
      }
      m.react('👍');
    }
  } catch (error) {
    console.error(error);
    m.reply('❌ Error al procesar la solicitud. Detalles: ' + error.message);
    m.react('❌');
  }
};

handler.help = ['pinterest <búsqueda|enlace>'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['download'];
handler.diamond = false;

export default handler;

// Función para descargar pins individuales
async function downloadPin(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);

    // Extraer JSON con los datos
    const jsonData = JSON.parse($('script[type="application/ld+json"]').html() || '{}');
    const videoScript = $('script[data-test-id="video-snippet"]').html();

    if (videoScript) {
      const videoData = JSON.parse(videoScript);
      return {
        title: videoData.name,
        url: videoData.contentUrl,
        isVideo: true
      };
    }

    return {
      title: jsonData.name || 'Sin título',
      url: jsonData.image?.url || $('meta[property="og:image"]').attr('content'),
      isVideo: false
    };
  } catch (err) {
    throw new Error('Error al descargar el pin: ' + err.message);
  }
}

// Función para buscar pins
async function searchPins(query) {
  const apiUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/?data=%7B"options"%3A%7B"query"%3A"${encodeURIComponent(query)}"%2C"scope"%3A"pins"%7D%7D`;

  const { data } = await axios.get(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://www.pinterest.com/'
    }
  });

  return data.resource_response.data.results.map(item => ({
    image_large_url: item.images?.orig?.url,
    image_medium_url: item.images?.['564x']?.url,
    image_small_url: item.images?.['236x']?.url
  })).filter(img => img.image_large_url);
}
