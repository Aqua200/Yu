import axios from 'axios';
import baileys from '@whiskeysockets/baileys';

const { 
  generateWAMessageContent, 
  generateWAMessageFromContent, 
  proto 
} = baileys;

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, '⚠️ Por favor, ingresa lo que deseas buscar en Pinterest.', m);
  }

  await m.react(rwait);
  conn.reply(m.chat, '⏳ Descargando su imagen, espere un momento...', m);

  // Función para crear imageMessage
  async function getImageMessage(url) {
    const { imageMessage } = await generateWAMessageContent({ image: { url } }, { upload: conn.waUploadToServer });
    return imageMessage;
  }

  // Shuffle
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Petición a Pinterest (esto solo es un placeholder, Pinterest ya no tiene API pública)
  let res = await axios.get(`https://api.lolhuman.xyz/api/pinterest?apikey=TuApiKey&q=${encodeURIComponent(text)}`);
  let results = res.data.result || [];

  if (!results.length) return conn.reply(m.chat, '❌ No se encontraron resultados.', m);

  shuffle(results);
  let images = results.slice(0, 5);

  let cards = [];
  let count = 1;

  for (let img of images) {
    cards.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({ text: `Imagen - ${count++}` }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: dev }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: '',
        hasMediaAttachment: true,
        imageMessage: await getImageMessage(img)
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [{
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "Ver en Pinterest 🔗",
            Url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(text)}`,
            merchant_url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(text)}`
          })
        }]
      })
    });
  }

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({ text: `🔍 Resultado de: ${text}` }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: "⪛✰ Pinterest - Busquedas ✰⪜" }),
          header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
        })
      }
    }
  }, { quoted: m });

  await m.react(done);
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.help = ["pinterest"];
handler.tags = ["descargas"];
handler.command = ['pinterest', 'pin'];
handler.group = true;
handler.register = true;

export default handler;
