import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  // Verificamos que el tipo de mensaje sea el adecuado para bienvenida
  if (m.messageStubType !== WAMessageStubType.GROUP_PARTICIPANT_ADD) return true;

  let who = m.messageStubParameters[0];
  let taguser = `@${who.split('@')[0]}`;
  let chat = global.db.data.chats[m.chat];

  // Verificamos que la bienvenida esté habilitada
  if (!chat.welcome) {
    console.log("Bienvenida deshabilitada en el chat.");
    return true;
  }

  // Obtenemos la imagen de perfil del usuario que se unió
  let pp;
  try {
    pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image');
  } catch (err) {
    console.log('Error al obtener imagen de perfil, usando imagen por defecto');
    pp = 'https://files.catbox.moe/xr2m6u.jpg';  // Imagen por defecto
  }

  let img;
  try {
    img = await (await fetch(pp)).buffer();
  } catch (err) {
    console.log('Error al obtener la imagen desde la URL:', err);
    img = null;  // Si hay error, no se enviará imagen
  }

  let totalMiembros = participants.length;
  console.log(`Total de miembros después de agregar: ${totalMiembros}`);

  // Mensaje de bienvenida
  let bienvenida = `╭━━━━━━♡・❀・♡━━━━━━╮
✦  𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝𝐨 ~!  
✰ ${taguser}  

${global.welcom1}

✦  Ahora somos *${totalMiembros} miembros* en *${groupMetadata.subject}*  

> ✐ Usa *#help* para ver mis comandos  
╰━━━━━━♡・❀・♡━━━━━━╯`;

  // Enviamos el mensaje de bienvenida con imagen (si existe)
  try {
    await conn.sendMessage(m.chat, { image: img || undefined, caption: bienvenida, mentions: [who] });
    console.log('Mensaje de bienvenida enviado correctamente');
  } catch (err) {
    console.log('Error al enviar el mensaje de bienvenida:', err);
  }

  return true;
}
