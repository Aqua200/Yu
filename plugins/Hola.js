import fs from 'fs';

const handler = async (m, { conn }) => {
  // Ruta del audio
  let audioPath = './media/hola.mp3';

  // Verifica si el archivo existe antes de enviarlo
  if (fs.existsSync(audioPath)) {
    conn.sendMessage(m.chat, { audio: { url: audioPath }, mimetype: 'audio/mp4', ptt: true });
  } else {
    m.reply('⚠️ El archivo de audio no fue encontrado.');
  }
};

// Activar el handler solo cuando el mensaje es "hola"
handler.customPrefix = /^(hola)$/i;
handler.command = new RegExp;

export default handler;
