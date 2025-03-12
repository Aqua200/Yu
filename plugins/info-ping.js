import { totalmem, freemem, cpus, platform, hostname } from 'os';
import { performance } from 'perf_hooks';
import { sizeFormatter } from 'human-readable';
import speed from 'performance-now';

const format = sizeFormatter({ std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B` });

const handler = async (m, { conn }) => {
    let timestamp = speed();
    let latensi = speed() - timestamp;

    let _muptime = process.uptime() * 1000;
    let muptime = clockString(_muptime);

    let chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats);
    let gruposEn = chats.filter(([id]) => id.endsWith('@g.us'));

    const cpusInfo = cpus().map(cpu => {
        cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
        return cpu;
    });

    const cpu = cpusInfo.reduce((last, cpu, _, { length }) => {
        last.total += cpu.total;
        last.speed += cpu.speed / length;
        last.times.user += cpu.times.user;
        last.times.nice += cpu.times.nice;
        last.times.sys += cpu.times.sys;
        last.times.idle += cpu.times.idle;
        last.times.irq += cpu.times.irq;
        return last;
    }, {
        speed: 0,
        total: 0,
        times: {
            user: 0,
            nice: 0,
            sys: 0,
            idle: 0,
            irq: 0,
        },
    });

    const modeloCpu = cpus()[0]?.model || 'Desconocido';
    const plataforma = platform();
    const servidor = hostname();

    const texto = `*🚀 Velocidad*
• ${latensi.toFixed(4)} ms

*⏰ Actividad*
• ${muptime}

*💌 Chats*
• ${chats.length} *Chats privados*
• ${gruposEn.length} *Grupos*

*💻 Servidor*
• *Ram:* ${format(totalmem() - freemem())} / ${format(totalmem())}
• *CPU Tipo:* ${modeloCpu}
• *Plataforma:* ${plataforma}
• *Servidor:* ${servidor}
    
_Uso de CPU_ 
${cpusInfo[0]
        ? `${cpusInfo[0].model.trim()} (${cpu.speed} MHz)\n${Object.keys(cpu.times)
            .map(type => `- *${(type + "*").padEnd(6)}: ${((100 * cpu.times[type]) / cpu.total).toFixed(2)}%`)
            .join("\n")}`
        : ''}

_Uso de memoria en NodeJS_
${"```" + Object.keys(process.memoryUsage())
    .map(key => `${key.padEnd(20)}: ${format(process.memoryUsage()[key])}`)
    .join("\n") + "```"}`.trim();

    await conn.sendMessage(m.chat, { text: texto });
}

handler.help = ['ping', 'speed'];
handler.tags = ['bot'];
handler.command = /^(ping|speed|pong|ingfo)$/i;

handler.register = true;

export default handler;

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}
