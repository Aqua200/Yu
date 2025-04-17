import axios from 'axios';
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto
} = (await import("@whiskeysockets/baileys"))["default"];

let handler = async (message, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(message.chat, "⚠️ Por favor, ingresa lo que deseas buscar en Pinterest.", message);
  }

  try {
    // Avisar que se está procesando la solicitud
    await conn.reply(message.chat, "🔍 Buscando imágenes, por favor espera...", message);

    // Realizar consulta a la API de Pinterest
    let response = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(text)}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%7D%7D`);
    
    // Extraer URLs de las imágenes
    let results = response.data.resource_response.data.results;
    let imageUrls = results.map(result => result.images.orig.url);

    if (imageUrls.length === 0) {
      return conn.reply(message.chat, "⚠️ No se encontraron resultados para tu búsqueda.", message);
    }

    // Limitar resultados a las primeras 5 imágenes
    let selectedImages = imageUrls.slice(0, 5);

    // Enviar cada imagen como un mensaje individual
    for (let imageUrl of selectedImages) {
      let imageContent = await generateWAMessageContent({ image: { url: imageUrl } }, { upload: conn.waUploadToServer });
      let messageContent = generateWAMessageFromContent(message.chat, proto.Message.fromObject({ imageMessage: imageContent.imageMessage }));

      await conn.relayMessage(message.chat, messageContent.message, { messageId: messageContent.key.id });
    }

    await conn.reply(message.chat, "✅ Imágenes enviadas con éxito.", message);
  } catch (error) {
    console.error(error);
    await conn.reply(message.chat, "❌ Ocurrió un error al realizar la búsqueda. Por favor, inténtalo más tarde.", message);
  }
};

handler.help = ["pinterest"];
handler.tags = ["descargas"];
handler.command = ['pinterest', 'pin'];

export default handler;
