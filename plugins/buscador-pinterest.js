import axios from 'axios';
import { generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `🔍 *Por favor, ingresa lo que deseas buscar en Pinterest.*\n\nEjemplo: ${usedPrefix + command} paisajes`, m);
  }

  try {
    await m.react('🔄');
    await conn.reply(m.chat, '🔍 Buscando imágenes en Pinterest, por favor espera...', m);

    // Función para generar mensaje con imagen
    const generateImageMessage = async (imageUrl) => {
      const { imageMessage } = await generateWAMessageContent(
        { image: { url: imageUrl } },
        { upload: conn.waUploadToServer }
      );
      return imageMessage;
    };

    // Headers personalizados para evitar bloqueos
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://www.pinterest.com/',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9'
    };

    // Realizar la búsqueda con parámetros y headers
    const { data } = await axios.get('https://www.pinterest.com/resource/BaseSearchResource/get/', {
      params: {
        source_url: `/search/pins/?q=${encodeURIComponent(text)}`,
        data: JSON.stringify({
          options: {
            isPrefetch: false,
            query: text,
            scope: 'pins',
            no_fetch_context_on_resource: false
          },
          context: {}
        }),
        _: Date.now()
      },
      headers
    });

    // Procesar resultados
    const results = data?.resource_response?.data?.results || [];
    if (!results.length) throw 'No se encontraron resultados';

    // Obtener URLs de imágenes y mezclarlas
    const imageUrls = results
      .map(pin => pin.images?.orig?.url)
      .filter(url => url)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    if (!imageUrls.length) throw 'No se encontraron imágenes válidas';

    // Preparar mensajes para el carrusel
    const carouselCards = [];
    for (let i = 0; i < imageUrls.length; i++) {
      carouselCards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `Imagen ${i + 1}`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: '🔍 Pinterest Search'
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: '',
          hasMediaAttachment: true,
          imageMessage: await generateImageMessage(imageUrls[i])
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [{
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'Ver en Pinterest 🔗',
              url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(text)}`
            })
          }]
        })
      });
    }

    // Crear mensaje con carrusel
    const message = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `🔍 Resultados de búsqueda: ${text}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: '📌 Pinterest Search Bot'
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: carouselCards
            })
          })
        }
      }
    }, { quoted: m });

    await m.react('✅');
    await conn.relayMessage(m.chat, message.message, { messageId: message.key.id });

  } catch (error) {
    console.error('Error en Pinterest search:', error);
    await m.react('❌');
    conn.reply(m.chat, `❌ Ocurrió un error al buscar en Pinterest. Intenta nuevamente más tarde.\n${error.message}`, m);
  }
};

handler.help = ['pinterest <búsqueda>'];
handler.tags = ['internet'];
handler.command = /^(pinterest|pin)$/i;
handler.register = true;
handler.limit = true;

export default handler;
