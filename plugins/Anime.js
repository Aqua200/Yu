import axios from "axios";
import * as cheerio from "cheerio";

// Función para descargar episodios
async function download(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const $ = cheerio.load(data);
    
    // Extraer título
    let title = $('title').text().trim();
    const match = title.match(/^(.+?)\s*(?:Sub Español|Latino)/i);
    if (match) title = match[1].trim();
    
    const result = { title };
    const types = {};
    
    // Extraer tipos de enlaces (Sub, Latino, etc)
    $('.border-line.border-b').each((i, section) => {
      const langType = $(section).find('span').first().text().trim();
      if (langType) types[langType] = true;
    });
    
    // Procesar iframes
    const iframes = $('iframe').toArray();
    Object.keys(types).forEach((type, i) => {
      if (iframes[i]) {
        let iframe = $(iframes[i]).attr('src');
        if (iframe) {
          if (iframe.includes('pixeldrain.com/u/')) {
            const id = iframe.split('/u/')[1].split('?')[0];
            iframe = `https://pixeldrain.com/api/file/${id}`;
          }
          result[type] = iframe;
        }
      }
    });
    
    return result;
  } catch (err) {
    console.error('Download error:', err);
    return { error: 'Failed to fetch or parse page', details: err.message };
  }
}

// Función para obtener detalles del anime
async function detail(url) {
  const base = "https://animeav1.com";
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const $ = cheerio.load(data);

    // Extraer información básica
    const info = {
      creator: "I'm Fz ~",
      title: $('h1').first().text().trim(),
      altTitle: $('h2').first().text().trim(),
      description: $('.entry p').first().text().trim(),
      rating: $('.ic-star-solid .text-2xl').first().text().trim() || 'N/A',
      votes: $('.ic-star-solid .text-xs span').first().text().trim() || '0',
      cover: $('figure img[alt*="Poster"]').attr('src'),
      backdrop: $('figure img[alt*="Backdrop"]').attr('src'),
      genres: [],
      episodes: [],
      total: 0
    };

    // Extraer géneros
    $('a.btn[href*="catalogo?genre="]').each((_, el) => {
      const genre = $(el).text().trim();
      if (genre) info.genres.push(genre);
    });

    // Extraer episodios
    $('article.group\\/item').each((_, el) => {
      const ep = {
        ep: $(el).find('.text-lead').first().text().trim(),
        img: $(el).find('img').attr('src'),
        link: base + $(el).find('a').attr('href')
      };
      if (ep.link) info.episodes.push(ep);
    });

    info.total = info.episodes.length;
    return info;

  } catch (err) {
    console.error('Detail error:', err);
    return { error: 'Failed to fetch anime details', details: err.message };
  }
}

// Función para buscar animes
async function search(query) {
  const base = "https://animeav1.com";
  try {
    const { data } = await axios.get(`${base}/catalogo?search=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(data);
    const results = [];

    $("article").each((_, el) => {
      const title = $(el).find("h3").text().trim();
      const link = $(el).find("a").attr("href");
      const img = $(el).find("img").attr("src");

      if (title && link) {
        results.push({
          title,
          link: base + link,
          img: img || ''
        });
      }
    });

    return results.length > 0 ? results : { error: 'No results found' };

  } catch (err) {
    console.error('Search error:', err);
    return { error: 'Search failed', details: err.message };
  }
}

// Handler para el comando
const handler = {
  help: ['anime <nombre> - Busca información de anime'],
  tags: ['anime'],
  command: /^anime$/i,
  run: async (m, { args }) => {
    try {
      if (!args[0]) return m.reply(handler.help[0]);
      
      const query = args.join(' ');
      const results = await search(query);
      
      if (results.error) return m.reply(results.error);
      
      // Aquí implementarías la lógica para mostrar los resultados
      // Por ejemplo, enviar el primer resultado o una lista
      const firstResult = results[0];
      m.reply(`Resultado: ${firstResult.title}\n${firstResult.link}`);
      
    } catch (err) {
      console.error('Handler error:', err);
      m.reply('Ocurrió un error al procesar tu solicitud');
    }
  }
};

export { download, detail, search };
export default handler;
