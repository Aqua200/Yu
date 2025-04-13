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

const pins = async (judul) => {
  const link = `https://www.pinterest.com/resource/BaseSearchResource/get/?data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(judul)}%22%2C%22scope%22%3A%22pins%22%7D%2C%22context%22%3A%7B%7D%7D`;
  
  const headers = {
    'accept': 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'referer': 'https://www.pinterest.com/',
  };

  try {
    const res = await axios.get(link, { headers });
    
    // Verificar si la respuesta es válida
    if (typeof res.data === 'string' && res.data.includes('error')) {
      throw new Error('Respuesta inválida de Pinterest');
    }

    if (res.data?.resource_response?.data?.results) {
      return res.data.resource_response.data.results.map(item => {
        if (item.images) {
          return {
            image_large_url: item.images.orig?.url || null,
            image_medium_url: item.images['564x']?.url || null,
            image_small_url: item.images['236x']?.url || null
          };
        }
        return null;
      }).filter(img => img !== null && img.image_large_url);
    }
    return [];
  } catch (error) {
    console.error('Error al buscar en Pinterest:', error.message);
    return [];
  }
};

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`🔍 Por favor ingresa un término de búsqueda. Ejemplo: .pinterest gatos`);

  try {
    await m.react('🕒');
    const results = await pins(text);
    
    if (!results || results.length === 0) {
      return conn.reply(m.chat, `❌ No se encontraron resultados para "${text}"`, m);
    }

    const maxImages = Math.min(results.length, 5);
    const medias = [];

    for (let i = 0; i < maxImages; i++) {
      if (results[i].image_large_url) {
        medias.push({
          type: 'image',
          data: { url: results[i].image_large_url }
        });
      }
    }

    if (medias.length < 2) {
      // Si no hay suficientes imágenes para un álbum, envía una sola
      await conn.sendMessage(m.chat, {
        image: { url: medias[0].data.url },
        caption: `🔍 Resultados de Pinterest\n\nBúsqueda: "${text}"\nMostrando 1 de ${results.length} resultados`
      }, { quoted: m });
    } else {
      // Envía el álbum
      await sendAlbumMessage(m.chat, medias, {
        caption: `🔍 Resultados de Pinterest\n\nBúsqueda: "${text}"\nMostrando ${maxImages} de ${results.length} resultados`,
        quoted: m
      });
    }

    await m.react('✅');
  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, '❌ Ocurrió un error al buscar en Pinterest', m);
    await m.react('❌');
  }
};

handler.help = ['pinterest <búsqueda>'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];
handler.desc = 'Busca imágenes en Pinterest';

export default handler;
