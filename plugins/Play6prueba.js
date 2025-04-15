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

  async play6(url, options = { format: 'mp4', quality: '720' }) {
    try {
      const videoId = this.extractVideoId(url);
      if (!videoId) throw new Error('❌ URL de YouTube no válida');

      const { format, quality } = options;
      const isAudio = format === 'mp3';

      const csrfToken = await this.getCsrfToken();
      const captchaSolution = await this.solveCaptchaIfNeeded();

      const conversionId = await this.requestConversion(
        videoId, 
        isAudio ? 'highestaudio' : quality, 
        csrfToken, 
        captchaSolution, 
        format
      );

      const result = await this.getDownloadLink(conversionId, videoId);

      return {
        ...result,
        format: format.toUpperCase(),
        type: isAudio ? 'audio' : 'video',
        quality: isAudio ? 'bestaudio' : quality
      };

    } catch (error) {
      console.error('Error en play6:', error.message);
      throw new Error(`🚫 Error al procesar: ${error.message}`);
    }
  }

  // ... (otros métodos permanecen igual)
}

const youtubeDownloader = new YouTubeDownloader();

const handler = {
  help: ['ytdl', 'play6'],
  command: /^(play6|yt(mp3|mp4))$/i,
  tags: ['música', 'descargas'],
  register: true,

  async execute(m, conn, args) {
    try {
      const url = args[0];
      if (!url) return m.reply('🔴 Por favor ingresa una URL de YouTube');

      const format = m.text.includes('ytmp3') ? 'mp3' : 'mp4';
      const quality = format === 'mp3' ? '' : '720';

      m.reply('⏳ Procesando tu solicitud...');

      const result = await youtubeDownloader.play6(url, { format, quality });

      const response = `
🎵 *Título:* ${result.title}
🕒 *Duración:* ${result.duration}
👤 *Subido por:* ${result.uploader}
🔗 *Enlace de descarga:* ${result.download}
      `.trim();

      conn.sendFile(m.chat, result.thumbnail, 'thumb.jpg', response, m);
      conn.sendFile(m.chat, result.download, `${result.title}.${format}`, '', m);

    } catch (error) {
      m.reply(`❌ Error: ${error.message}`);
    }
  }
};

export default handler;
