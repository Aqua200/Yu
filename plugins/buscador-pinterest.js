import axios from 'axios';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(jid, medias, options = {}) {
  if (typeof jid !== "string") {
    throw new TypeError(`jid must be string, received: ${jid} (${jid?.constructor?.name})`);
  }

  for (const media of medias) {
    if (!media.type || (media.type !== "image" && media.type !== "video")) {
      throw new TypeError(`media.type must be "image" or "video", received: ${media.type} (${media.type?.constructor?.name})`);
    }
    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) {
      throw new TypeError(`media.data must be object with url or buffer, received: ${media.data} (${media.data?.constructor?.name})`);
    }
  }

  if (medias.length < 2) {
    throw new RangeError("Minimum 2 media");
  }

  const caption = options.text || options.caption || "";
  const delay = !isNaN(options.delay) ? options.delay : 500;
  delete options.text;
  delete options.caption;
  delete options.delay;

  const album = baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: {
        expectedImageCount: medias.filter(media => media.type === "image").length,
        expectedVideoCount: medias.filter(media => media.type === "video").length,
        ...(options.quoted
          ? {
              contextInfo: {
                remoteJid: options.quoted.key.remoteJid,
                fromMe: options.quoted.key.fromMe,
                stanzaId: options.quoted.key.id,
                participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                quotedMessage: options.quoted.message,
              },
            }
          : {}),
      },
    },
    {}
  );

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    const img = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    );
    img.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key },
    };
    await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id });
    await baileys.delay(delay);
  }

  return album;
}

const fetchPinterest = async (query) => {
  const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%7D%2C%22context%22%3A%7B%7D%7D`;
  
  const headers = {
    'authority': 'www.pinterest.com',
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'referer': `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'x-app-version': 'a4ef0a3',
    'x-pinterest-appstate': 'active',
    'x-pinterest-source-url': `/search/pins/?q=${encodeURIComponent(query)}`,
    'x-requested-with': 'XMLHttpRequest'
  };

  try {
    const response = await axios.get(url, { 
      headers,
      transformResponse: [(data) => {
        try {
          return JSON.parse(data);
        } catch (e) {
          // Si falla el parseo, verifica si es un error de texto plano
          if (typeof data === 'string' && data.includes('error')) {
            throw new Error('Pinterest returned an error: ' + data);
          }
          throw e;
        }
      }]
    });

    if (!response.data?.resource_response?.data?.results) {
      throw new Error('Invalid Pinterest API response structure');
    }

    return response.data.resource_response.data.results
      .filter(item => item?.images?.orig?.url)
      .map(item => ({
        image_large_url: item.images.orig.url,
        image_medium_url: item.images['564x']?.url,
        image_small_url: item.images['236x']?.url
      }));
  } catch (error) {
    console.error('Pinterest API Error:', error.message);
    throw new Error('Failed to fetch Pinterest results. Please try again later.');
  }
};

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`🔍 *Uso:* .pinterest <búsqueda>\nEjemplo: .pinterest paisajes`);

  try {
    await m.react('🕒');
    
    const results = await fetchPinterest(text);
    
    if (!results.length) {
      await m.react('❌');
      return conn.reply(m.chat, `⚠️ No se encontraron resultados para "${text}"`, m);
    }

    const medias = results.slice(0, 5).map(result => ({
      type: 'image',
      data: { url: result.image_large_url }
    }));

    if (medias.length === 1) {
      await conn.sendMessage(m.chat, {
        image: { url: medias[0].data.url },
        caption: `🔍 *Resultados de Pinterest*\n\n• Búsqueda: *${text}*\n• Mostrando 1 de ${results.length} resultados`
      }, { quoted: m });
    } else {
      await sendAlbumMessage(m.chat, medias, {
        caption: `🔍 *Resultados de Pinterest*\n\n• Búsqueda: *${text}*\n• Mostrando ${medias.length} de ${results.length} resultados`,
        quoted: m
      });
    }

    await m.react('✅');
  } catch (error) {
    console.error('Handler Error:', error);
    await m.react('❌');
    await conn.reply(m.chat, `❌ Error al buscar: ${error.message}`, m);
  }
};

handler.help = ['pinterest <búsqueda>'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];
handler.desc = 'Busca imágenes en Pinterest';

export default handler;
