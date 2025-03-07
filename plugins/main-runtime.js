let handler = async (m, { usedPrefix, command }) => {
  let uptime = await process.uptime();
  let imageUrl = 'https://example.com/your-image.jpg';  // Reemplaza esta URL con la que quieras usar

  let runtime = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
🌸  𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓬𝓱𝓮𝓻𝓮! 🌸
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

⛩️【 𝓢𝓽𝓪𝓽𝓾𝓼 𝓬𝓸𝓶𝓹𝓵𝓮𝓽𝓸 】⛩️
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮

🌷 **Fecha:** ${new Date().toLocaleDateString()}
🌸 **Hora actual:** ${time}

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

💖 **Tiempo activo:** ${rTime(uptime)}

🌙 **Estatus:** El bot está funcionando con mucha energía y felicidad.

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮

🎀 *Gracias por estar aquí, ¡espero que tu día sea hermoso!* 🎀
  
💬 Si quieres saber más sobre el estado, escribe *${usedPrefix}status*.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`;

  // Enviar la imagen junto con el mensaje
  conn.reply(m.chat, { image: { url: imageUrl }, caption: runtime }, m);
};

handler.help = ['runtime'];
handler.tags = ['main'];
handler.command = ['runtime', 'uptime'];

export default handler;

const dd = new Date(new Date + 3600000);
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
  var dDisplay = d > 0 ? d + (d == 1 ? " día, " : " Días, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " Horas, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minuto, " : " Minutos, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " segundo" : " Segundos") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
