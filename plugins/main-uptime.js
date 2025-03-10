let handler = async (m, { usedPrefix, command }) => {
  let uptime = await process.uptime();
  let imageUrl = 'https://qu.ax/HGPmS.jpeg';  // Reemplaza esta URL con la que quieras usar

  let mensaje = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
🌸  Welcome ! 🌸
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

⛩️【 Mi servidor 】⛩️
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮

🌷 *Fecha:* ${new Date().toLocaleDateString()}
🌸 *Hora actual:* ${time}

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🤍 *Tiempo activa:* ${rTime(uptime)}

🌙 *Estatus:* La bot está funcionando con mucha energía y felicidad.

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮

🖤 *Gracias por estar aquí, ¡espero que tu día sea tan hermoso como el mío!* 🤍
  
💬 Si quieres saber más sobre el estado completo, escribe *${usedPrefix}status*.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`;

  // Enviar la imagen junto con el mensaje
  conn.sendMessage(m.chat, { image: { url: imageUrl }, caption: mensaje }, { quoted: m });
};

handler.help = ['tiempoactivo'];
handler.tags = ['main'];
handler.command = ['tiempoactivo', 'uptime'];

export default handler;

const dd = new Date(new Date() + 3600000);
const time = dd.toLocaleString('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true
});

function rTime(seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " día, " : " días, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " horas, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minuto, " : " minutos, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " segundo" : " segundos") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
