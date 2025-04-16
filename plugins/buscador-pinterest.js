import axios from 'axios';
import baileys from '@whiskeysockets/baileys';

// Función para mezclar un array (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function sendAlbumMessage(jid, medias, options = {}) {
  // ... (el resto de la función sendAlbumMessage permanece igual)
  // (Mantén todo el código original de sendAlbumMessage aquí)
}

const pins = async (judul) => {
  const link = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(judul)}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22applied_unified_filters%22%3Anull%2C%22appliedProductFilters%22%3A%22---%22%2C%22article%22%3Anull%2C%22auto_correction_disabled%22%3Afalse%2C%22corpus%22%3Anull%2C%22customized_rerank_type%22%3Anull%2C%22domains%22%3Anull%2C%22dynamicPageSizeExpGroup%22%3A%22control%22%2C%22filters%22%3Anull%2C%22journey_depth%22%3Anull%2C%22page_size%22%3Anull%2C%22price_max%22%3Anull%2C%22price_min%22%3Anull%2C%22query_pin_sigs%22%3Anull%2C%22query%22%3A%22${encodeURIComponent(judul)}%22%2C%22redux_normalize_feed%22%3Atrue%2C%22request_params%22%3Anull%2C%22rs%22%3A%22typed%22%2C%22scope%22%3A%22pins%22%2C%22selected_one_bar_modules%22%3Anull%2C%22seoDrawerEnabled%22%3Afalse%2C%22source_id%22%3Anull%2C%22source_module_id%22%3Anull%2C%22source_url%22%3A%22%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(judul)}%26rs%3Dtyped%22%2C%22top_pin_id%22%3Anull%2C%22top_pin_ids%22%3Anull%7D%2C%22context%22%3A%7B%7D%7D`;

  const headers = {
    // ... (mantén los mismos headers que en tu código original)
  };

  try {
    const res = await axios.get(link, { headers });
    if (res.data?.resource_response?.data?.results) {
      // Procesar y mezclar resultados
      const uniqueImages = [];
      const urlMap = new Set(); // Para evitar duplicados
      
      // Mezclar los resultados primero
      const shuffledResults = shuffleArray(res.data.resource_response.data.results);
      
      for (const item of shuffledResults) {
        if (item.images) {
          // Priorizar la imagen más grande disponible
          const imageUrl = item.images.orig?.url || 
                          item.images['736x']?.url || 
                          item.images['564x']?.url || 
                          item.images['236x']?.url;
          
          if (imageUrl && !urlMap.has(imageUrl)) {
            urlMap.add(imageUrl);
            uniqueImages.push({
              image_hd_url: imageUrl,
              image_large_url: item.images.orig?.url || null,
              image_medium_url: item.images['564x']?.url || null,
              image_small_url: item.images['236x']?.url || null
            });
          }
        }
      }
      
      return uniqueImages;
    }
    return [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`🍫 Ingresa un texto. Ejemplo: .pinterest Crow`);

  try {
    m.react('🕒');
    const results = await pins(text);
    if (!results || results.length === 0) return conn.reply(m.chat, `No se encontraron resultados para "${text}".`, m);

    const maxImages = Math.min(results.length, 10);
    const medias = [];

    // Seleccionar imágenes aleatorias del conjunto único
    for (let i = 0; i < maxImages; i++) {
      const imageUrl = results[i].image_hd_url || 
                      results[i].image_large_url || 
                      results[i].image_medium_url || 
                      results[i].image_small_url;
      
      if (!imageUrl) continue;

      medias.push({
        type: 'image',
        data: { url: imageUrl }
      });
    }

    if (medias.length < 2) {
      return conn.reply(m.chat, 'No se encontraron suficientes imágenes únicas para crear un álbum.', m);
    }

    await sendAlbumMessage(m.chat, medias, {
      caption: `◜ Pinterest Search ◞\n\n≡ 🔎 \`Búsqueda :\` "${text}"\n≡ 📄 \`Resultados únicos :\` ${medias.length}`,
      quoted: m
    });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, 'Error al obtener imágenes de Pinterest.', m);
  }
};

handler.help = ['pinterest'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];

export default handler;
