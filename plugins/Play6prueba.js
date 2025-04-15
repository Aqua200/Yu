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

  extractVideoId(url) {
    const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regex);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async getCsrfToken() {
    const response = await axios.get(this.baseUrl, {
      headers: this.headers
    });
    this.updateCookies(response);
    const $ = cheerio.load(response.data);
    return $('meta[name="csrf-token"]').attr('content');
  }

  updateCookies(response) {
    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      setCookies.forEach(cookie => {
        const [keyValue] = cookie.split(';');
        const [key, value] = keyValue.split('=');
        this.cookies[key] = value;
      });
    }
  }

  async solveCaptchaIfNeeded() {
    try {
      const response = await axios.get(`${this.baseUrl}/captcha`, {
        headers: this.getRequestHeaders()
      });
      if (response.data) {
        return this.solveCaptcha(response.data);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  solveCaptcha(challenge) {
    const { algorithm, challenge: challengeData, salt, maxnumber, signature } = challenge;
    
    for (let i = 0; i <= maxnumber; i++) {
      const hash = crypto.createHash(algorithm.toLowerCase())
                       .update(salt + i)
                       .digest('hex');
      if (hash === challengeData) {
        return Buffer.from(JSON.stringify({
          algorithm,
          challenge: challengeData,
          number: i,
          salt,
          signature,
          took: Date.now()
        })).toString('base64');
      }
    }
    throw new Error('No se pudo resolver el captcha');
  }

  getRequestHeaders() {
    return {
      ...this.headers,
      Cookie: Object.entries(this.cookies)
                   .map(([key, value]) => `${key}=${value}`)
                   .join('; ')
    };
  }

  async requestConversion(videoId, quality, csrfToken, altcha, format = 'mp4') {
    const form = new FormData();
    form.append('url', `https://youtu.be/${videoId}`);
    form.append('format', format);
    form.append('quality', quality);
    form.append('service', 'youtube');
    form.append('_token', csrfToken);
    if (altcha) form.append('altcha', altcha);

    const response = await axios.post(`${this.baseUrl}/convertVideo`, form, {
      headers: {
        ...this.getRequestHeaders(),
        ...form.getHeaders()
      }
    });
    
    if (!response.data.message) {
      throw new Error('No se recibió ID de conversión');
    }
    return response.data.message;
  }

  async getDownloadLink(conversionId, videoId) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`wss://amp4.cc/ws`, {
        headers: { ...this.headers, Origin: this.baseUrl }
      });

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Tiempo de espera agotado'));
      }, 30000);

      let fileInfo = {};

      ws.on('open', () => ws.send(conversionId));
      ws.on('message', (data) => {
        try {
          const res = JSON.parse(data);
          if (res.event === 'query' || res.event === 'queue') {
            fileInfo = {
              title: res.title || 'Sin título',
              uploader: res.uploader || 'Desconocido',
              duration: res.duration || '00:00',
              thumbnail: res.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
            };
          } else if (res.event === 'file' && res.done) {
            clearTimeout(timeout);
            ws.close();
            resolve({
              ...fileInfo,
              download: `${this.baseUrl}/dl/${res.worker}/${conversionId}/${encodeURIComponent(res.file)}`
            });
          }
        } catch (e) {
          clearTimeout(timeout);
          reject(e);
        }
      });

      ws.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }
}

const youtubeDownloader = new YouTubeDownloader();

const handler = async (m, { conn, args }) => {
  try {
    const input = args.join(' ');
    if (!input) return m.reply('*🔴 Ingresa una URL de YouTube*');
    
    // Extraer URL (puede estar en cualquier posición del mensaje)
    const urlMatch = input.match(/(https?:\/\/[^\s]+)/);
    if (!urlMatch) return m.reply('*❌ URL no válida*');
    const url = urlMatch[0];

    // Determinar si es audio o video
    const isAudio = input.toLowerCase().includes('mp3');
    const quality = isAudio ? 'highestaudio' : '720';

    m.reply('*⏳ Procesando tu solicitud...*');

    const result = await youtubeDownloader.play6(url, { 
      format: isAudio ? 'mp3' : 'mp4',
      quality
    });

    await conn.sendMessage(m.chat, {
      image: { url: result.thumbnail },
      caption: `*${result.title}*\n\n` +
               `🕒 *Duración:* ${result.duration}\n` +
               `👤 *Autor:* ${result.uploader}\n` +
               `⚡ *Formato:* ${isAudio ? 'MP3' : 'MP4'}\n\n` +
               `⬇️ *Descargando...*`
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      document: { url: result.download },
      fileName: `${result.title}.${isAudio ? 'mp3' : 'mp4'}`,
      mimetype: isAudio ? 'audio/mpeg' : 'video/mp4'
    }, { quoted: m });

  } catch (error) {
    m.reply(`*❌ Error:* ${error.message}`);
    console.error(error);
  }
};

handler.help = ['play6'];
handler.command = ['play6'];
handler.tags = ['música'];
handler.register = true;

export default handler;
