// Definir la lista de sub-owners (formato internacional sin espacios ni caracteres especiales)
const subOwners = [
  '584125014674',    // +58 412-5014674
  '584121234567',    // +58 412-1234567
  '18498613998'      // +1 (849) 861-3998 (formateado correctamente)
];

let handler = async (m, { conn, sender }) => {
  // Normalizar el número del remitente para comparación
  const senderNumber = sender.replace(/[^0-9]/g, '');

  // Verificar si el usuario es un sub-bot
  if (!subOwners.includes(senderNumber)) {
    return m.reply("❌ No tienes permiso para cambiar el banner.");
  }

  // Si el mensaje tiene una imagen citada
  if (m.quoted && /image/.test(m.quoted.mimetype)) {
    try {
      const media = await m.quoted.download();
      let link = await catbox(media);

      if (!isImageValid(media)) {
        return m.reply("⚠️ El archivo enviado no es una imagen válida.");
      }

      global.banner = link;
      await conn.sendFile(m.chat, media, 'banner.jpg', '✅ Banner actualizado correctamente', m);

    } catch (error) {
      console.error(error);
      m.reply("🔴 Ocurrió un error al intentar cambiar el banner.");
    }

  // Si el mensaje contiene un link de imagen
  } else if (m.text && m.text.match(/https?:\/\/.*\.(jpg|jpeg|png|gif)/i)) {
    let link = m.text.match(/https?:\/\/.*\.(jpg|jpeg|png|gif)/i)[0];
    global.banner = link;
    m.reply(`✅ Banner actualizado con el link:\n${link}`);
  } else {
    m.reply(`ℹ️ Por favor, responde a una imagen o envía un link de imagen con el comando *setbanner2*`);
  }
};

// Función para validar imágenes
const isImageValid = (buffer) => {
  const magicBytes = buffer.slice(0, 4).toString('hex');
  const validFormats = ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', '89504e47', '47494638'];
  return validFormats.includes(magicBytes);
};

handler.help = ['setbanner2'];
handler.tags = ['tools'];
handler.command = ['setbanner2'];

export default handler;

// Funciones auxiliares (catbox y formatBytes permanecen igual)
async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomBytes + "." + ext);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  return await response.text();
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}
