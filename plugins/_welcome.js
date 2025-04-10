import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;
  
  try {
    let pp = 'https://files.catbox.moe/xr2m6u.jpg'; // Imagen por defecto
    try {
      pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => pp);
      // Limitar tiempo de espera para la imagen
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 segundos máximo
      
      const imgResponse = await fetch(pp, { signal: controller.signal });
      clearTimeout(timeout);
      if (!imgResponse.ok) throw new Error('Failed to fetch image');
    } catch (e) {
      console.error('Error al obtener imagen:', e);
    }

    let chat = global.db.data.chats[m.chat];
    let groupSize = participants.length;
    
    if (m.messageStubType == 27) {
      groupSize++;
    } else if (m.messageStubType == 28 || m.messageStubType == 32) {
      groupSize--;
    }

    if (chat.welcome) {
      const userMention = `@${m.messageStubParameters[0].split('@')[0]}`;
      
      if (m.messageStubType == 27) {
        const bienvenida = `❀ *Bienvenido* a ${groupMetadata.subject}\n✰ ${userMention}\n${global.welcom1}\n✦ Ahora somos ${groupSize} Miembros.\n•(=^●ω●^=)• Disfruta tu estadía en el grupo!\n> ✐ Puedes usar *#help* para ver la lista de comandos.`;
        
        // Enviar con manejo de errores y reintentos
        await sendWithRetry(conn, m.chat, bienvenida, img, 'ゲ◜៹ New Member ៹◞ゲ');
      } 
      else if (m.messageStubType == 28 || m.messageStubType == 32) {
        const bye = `❀ *Adiós* de ${groupMetadata.subject}\n✰ ${userMention}\n${global.welcom2}\n✦ Ahora somos ${groupSize} Miembros.\n•(=^●ω●^=)• Te esperamos pronto!\n> ✐ Puedes usar *#help* para ver la lista de comandos.`;
        
        await sendWithRetry(conn, m.chat, bye, img, 'ゲ◜៹ Bye Member ៹◞ゲ');
      }
    }
  } catch (error) {
    console.error('Error en el plugin de bienvenida:', error);
  }
}

// Función auxiliar para reintentos
async function sendWithRetry(conn, chatId, text, img, title, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await conn.sendMini(chatId, title, dev, text, img, img, redes, fkontak);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}
