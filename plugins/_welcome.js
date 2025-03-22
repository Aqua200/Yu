import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  // Verifica que sea un grupo y que haya un tipo de mensaje válido
  if (!m.messageStubType || !m.isGroup) return true;

  // Obtiene la imagen de perfil del miembro que envió el mensaje o usa una predeterminada
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://i.ibb.co/2jKKcrs/file.jpg');
  let img = await (await fetch(pp)).buffer();

  // Obtiene los datos del grupo desde la base de datos
  let chat = global.db.data.chats[m.chat];

  // Asegúrate de que la bienvenida esté habilitada en la configuración del chat
  if (chat.bienvenida) {

    // Maneja los diferentes tipos de stub message (cuando alguien se une, sale o es expulsado)
    if (m.messageStubType == 27) {
      // Tipo de mensaje: bienvenida
      let bienvenida = `┌─★ *2B* \n│「 Bienvenido 」\n└┬★ 「 @${m.messageStubParameters[0].split`@`[0]} 」\n   │✑  Bienvenido a\n   │✑  ${groupMetadata.subject}\n   └───────────────┈ ⳹`;
      await conn.sendMessage(m.chat, { text: bienvenida, mentions: [m.messageStubParameters[0]] });
    }

    if (m.messageStubType == 28 || m.messageStubType == 32) {
      // Tipo de mensaje: despedida (cuando alguien sale o es expulsado)
      let bye = `┌─★ *2B* \n│「 ADIOS 👋 」\n└┬★ 「 @${m.messageStubParameters[0].split`@`[0]} 」\n   │✑  Se fue\n   │✑ Jamás te quisimos aquí\n   └───────────────┈ ⳹`;
      await conn.sendMessage(m.chat, { text: bye, mentions: [m.messageStubParameters[0]] });
    }
  }
}
