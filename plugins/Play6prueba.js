import axios from 'axios';
import FormData from 'form-data';
import WebSocket from 'ws';
import cheerio from 'cheerio';
import crypto from 'crypto';

class YouTubeDownloader {
  constructor() {
    this.baseUrl = 'https://amp4.cc';
    this.headers = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    this.cookies = {};
  }

  // ... (otros métodos se mantienen igual)

  async searchVideo(query) {
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      const $ = cheerio.load(response.data);
      
      // Extraer el primer resultado de búsqueda
      const videoId = $('a#video-title').first().attr('href')?.split('v=')[1];
      if (!videoId) throw new Error('No se encontraron resultados');
      
      return `https://youtu.be/${videoId}`;
    } catch (error) {
      throw new Error(`Error en la búsqueda: ${error.message}`);
    }
  }
}

const youtubeDownloader = new YouTubeDownloader();

const handler = async (m, { conn, args }) => {
  try {
    const input = args.join(' ');
    if (!input) return m.reply('*🔴 Ingresa un nombre de canción o URL de YouTube*');
    
    let url;
    // Detectar si es URL o búsqueda
    if (input.match(/(https?:\/\/[^\s]+)/)) {
      url = input.match(/(https?:\/\/[^\s]+)/)[0];
    } else {
      m.reply('*🔎 Buscando la canción...*');
      url = await youtubeDownloader.searchVideo(input);
    }

    // Resto del código igual...
    const isAudio = input.toLowerCase().includes('mp3');
    // ... (continuar con el proceso de descarga)

  } catch (error) {
    m.reply(`*❌ Error:* ${error.message}`);
    console.error(error);
  }
};

handler.help = ['play6 <nombre/url>'];
handler.command = ['play6'];
handler.tags = ['música'];
handler.register = true;

export default handler;
