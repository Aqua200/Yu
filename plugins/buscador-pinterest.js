import axios from 'axios';

let handler = async (m, { text, conn }) => {
  if (!text) throw 'Por favor, escribe algo para buscar en Pinterest.';

  const options = {
    method: 'GET',
    url: 'https://pinterest-downloader-download-images-videos.p.rapidapi.com/search/',
    params: { query: text },
    headers: {
      'X-RapidAPI-Key': '382dabd3d6mshd68c9faeeed703ap19a463jsn682194bf6d90',
      'X-RapidAPI-Host': 'pinterest-downloader-download-images-videos.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const results = response.data?.data;

    if (!results || results.length === 0) {
      return m.reply('No se encontraron resultados.');
    }

    const item = results[Math.floor(Math.random() * results.length)];
    await conn.sendFile(m.chat, item.url, 'pinterest.jpg', `Resultado para: *${text}*`, m);
  } catch (error) {
    console.error('Error al buscar en Pinterest:', error);
    m.reply('Ocurrió un error al buscar en Pinterest. Intenta más tarde.');
  }
};

handler.command = ['pinterest'];
handler.help = ['pinterest <búsqueda>'];
handler.tags = ['internet'];

export default handler;
