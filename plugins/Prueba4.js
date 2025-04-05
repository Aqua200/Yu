import fs from 'fs';  
import path from 'path';  
import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  // Número autorizado (formato internacional con +)
  const allowedNumber = "+18498613998";
  
  // Verificar si el remitente es el número permitido
  if (m.sender.replace(/[^0-9]/g, '') !== allowedNumber.replace(/[^0-9]/g, '')) {
    return m.reply("❌ *No tienes permiso para usar este comando.*");
  }

  if (!m.quoted || !/image/.test(m.quoted.mimetype)) {
    return m.reply(`${emoji} Por favor, responde a una imagen con el comando *setbanner2* para actualizar la foto del menú.`);
  }

  try {
    const media = await m.quoted.download();
    let link = await catbox(media);
    
    if (!isImageValid(media)) {
      return m.reply(`${emoji2} El archivo enviado no es una imagen válida.`);
    }

    global.banner = `${link}`;  
    await conn.sendFile(m.chat, media, 'banner.jpg', `${emoji} Banner actualizado.`, m);

  } catch (error) {
    console.error(error);
    m.reply(`${msm} Hubo un error al intentar cambiar el banner.`);
  }
};

// Resto del código (isImageValid, catbox, etc.) sigue igual...
handler.help = ['setbanner2'];
handler.tags = ['tools'];
handler.command = ['setbanner2'];

export default handler;
