// Definir la lista de sub-owners
const subOwners = ['+58 412-5014674', '+58 412-1234567', '+1 (849) 861-3998'];  // Lista de sub-bots

let handler = async (m, { conn, sender }) => {

  // Verificar si el usuario es un sub-bot (solo los sub-owners)
  if (!subOwners.includes(sender)) {
    return m.reply("No tienes permiso para cambiar el banner.");
  }

  // Si el mensaje tiene una imagen citada
  if (m.quoted && /image/.test(m.quoted.mimetype)) {
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

  // Si el mensaje contiene un link
  } else if (m.text && m.text.match(/https?:\/\/.*\.(jpg|jpeg|png|gif)/)) {
    let link = m.text.match(/https?:\/\/.*\.(jpg|jpeg|png|gif)/)[0];
    global.banner = link;
    m.reply(`${emoji} Banner actualizado con el link proporcionado: ${link}`);
  } else {
    m.reply(`${emoji} Por favor, responde a una imagen o envía un link válido de una imagen con el comando *setbanner2* para actualizar la foto del menú.`);
  }
};

const isImageValid = (buffer) => {
  const magicBytes = buffer.slice(0, 4).toString('hex');

  if (magicBytes === 'ffd8ffe0' || magicBytes === 'ffd8ffe1' || magicBytes === 'ffd8ffe2') {
    return true;
  }

  if (magicBytes === '89504e47') {
    return true;
  }

  if (magicBytes === '47494638') {
    return true;
  }

  return false; 
};

handler.help = ['setbanner2'];
handler.tags = ['tools'];
handler.command = ['setbanner2'];  // El comando sigue siendo .setbanner2
// Removemos handler.rowner = true ya que estamos manejando los permisos manualmente

export default handler;

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

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
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  return await response.text();
}
