import { totalmem, freemem, cpus, platform, hostname } from 'os';
import { performance } from 'perf_hooks';
import { sizeFormatter } from 'human-readable';

const format = sizeFormatter({
  std: "JEDEC", // 'SI' (default) | 'IEC' | 'JEDEC'
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

const handler = async (m, { conn }) => {
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats);
  const gruposEn = chats.filter(([id]) => id.endsWith('@g.us')); // grupos.filter(v => !v.read_only)
  const usado = process.memoryUsage();
  const cpusInfo = cpus().map(cpu => {
    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
    return cpu;
  });

  const cpu = cpusInfo.reduce(
    (last, cpu, _, { length }) => {
      last.total += cpu.total;
      last.speed += cpu.speed / length;
      last.times.user += cpu.times.user;
      last.times.nice += cpu.times.nice;
      last.times.sys += cpu.times.sys;
      last.times.idle += cpu.times.idle;
      last.times.irq += cpu.times.irq;
      return last;
    },
    {
      speed: 0,
      total: 0,
      times: {
        user: 0,
        nice: 0,
        sys: 0,
        idle: 0,
        irq: 0,
      },
    }
  );

  const uptimeSeconds = process.uptime();  // Obtiene el tiempo de ejecución del proceso en segundos
  const muptime = clockString(uptimeSeconds * 1000); // Convertimos segundos a milisegundos

  const old = performance.now();
  const neww = performance.now();
  const velocidad = neww - old;

  const modeloCpu = cpus()[0]?.model || 'Desconocido';  // Si no se puede obtener el modelo, se usa 'Desconocido'
  const plataforma = platform();
  const servidor = hostname();

  const d = new Date(new Date + 3600000);
  const locale = 'es';
  const semana = d.toLocaleDateString(locale, { weekday: 'long' });
  const fechas = d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const tiempos = d.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  });

  await m.reply('_Probando velocidad..._');

  const texto = `*ᴘ ɪ ɴ ɢ*
  ${Math.round(neww - old)} ms
  ${velocidad} ms

  *ᴛɪᴇᴍᴘᴏ ᴅᴇ ᴇxɪsᴛᴇɴᴄɪᴀ* 
  ${muptime}

  *ᴄʜᴀᴛs*
  • *${gruposEn.length}* Chats de grupo
  • *${gruposEn.length}* Grupos unidos
  • *${gruposEn.length - gruposEn.length}* Grupos abandonados
  • *${chats.length - gruposEn.length}* Chats personales
  • *${chats.length}* Chats totales

  *sᴇʀᴠɪᴄɪᴏ*
  *🛑 ʀᴀᴍ:* ${format(totalmem() - freemem())} / ${format(totalmem())}
  *🔵 ʀᴀᴍ ᴀʙɪᴇʀᴛᴀ:* ${format(freemem())}
  *🔴 ᴄᴘᴜ ᴛɪᴘᴏ:* ${modeloCpu}
  *🔭 ᴘʟᴀᴛғᴏʀᴍᴀ:* ${plataforma}
  *🧿 sᴇʀᴠᴇʀ:* ${servidor}
  *💻 ᴏs:* ${plataforma}
  *⏰ ᴛɪᴇᴍᴘᴏ ᴅᴇ sᴇʀᴠɪᴄɪᴏ:* ${tiempos}

  _Uso de memoria en NodeJS_
  ${
    "```" +
    Object.keys(usado)
      .map(
        (key, _, arr) =>
          `${key.padEnd(Math.max(...arr.map((v) => v.length)), " ")}: ${format(
            usado[key]
          )}`
      )
      .join("\n") +
    "```"
  }

  ${
    cpusInfo[0]
      ? `_Uso total de CPU_
  ${cpusInfo[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times)
          .map(
            (type) =>
              `- *${(type + "*").padEnd(6)}: ${(
                (100 * cpu.times[type]) /
                cpu.total
              ).toFixed(2)}%`
          )
          .join("\n")}

  _Uso de núcleos de CPU (${cpusInfo.length} núcleos)_
  ${cpusInfo
    .map(
      (cpu, i) =>
        `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(
          cpu.times
        )
          .map(
            (type) =>
              `- *${(type + "*").padEnd(6)}: ${(
                (100 * cpu.times[type]) /
                cpu.total
              ).toFixed(2)}%`
          )
          .join("\n")}`
    )
    .join("\n\n")}`
      : ""
  }
  `;

  conn.relayMessage(m.chat, {
    extendedTextMessage: {
      text: texto,
      contextInfo: {
        externalAdReply: {
          title: `${cpus()[0]?.model}`,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: 'https://telegra.ph/file/ec8cf04e3a2890d3dce9c.jpg',
          sourceUrl: ''
        }
      },
      mentions: [m.sender]
    }
  }, {});
};

handler.help = ['ping', 'speed'];
handler.tags = ['info'];
handler.command = /^(ping|speed|pong|ingfo)$/i;

export default handler;

function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, 'D ', h, 'H ', m, 'M ', s, 'S '].map(v => v.toString().padStart(2, 0)).join('');
}
