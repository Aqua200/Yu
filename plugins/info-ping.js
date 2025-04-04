import os from 'os' import osu from 'node-os-utils' import { performance } from 'perf_hooks' import { sizeFormatter } from 'human-readable' import speed from 'performance-now'

const format = sizeFormatter({ std: 'JEDEC', decimalPlaces: 2 })

const handler = async (m, { conn, args }) => { await m.react('🤍')

let start = speed()
let latensi = (speed() - start).toFixed(4)
let muptime = clockString(process.uptime() * 1000)

let { privateChats, groupChats } = Object.values(conn.chats).reduce((acc, chat) => {
    if (chat.isChats) {
        chat.jid.endsWith('@g.us') && !chat.metadata?.read_only && !chat.metadata?.announce
            ? acc.groupChats++
            : acc.privateChats++
    }
    return acc
}, { privateChats: 0, groupChats: 0 })

let url = args.length ? args.join(' ') : ''
let hora = new Date().getHours()
let nombreUsuario = conn.getName(m.sender) || "querido usuario"
let saludo = hora < 12 ? `🌸 Buenos días, ${nombreUsuario} ☀️` : hora < 18 ? `🌅 Buenas tardes, ${nombreUsuario} 🌤️` : `🌙 Buenas noches, ${nombreUsuario} 🌌`

let cpu = await osu.cpu.usage()
let ramUso = format(os.totalmem() - os.freemem())
let ramTotal = format(os.totalmem())
let almacenamiento = format(os.freemem())
let temperaturaCpu = await osu.cpu.temperature()  // Temperatura de la CPU
let espacioDisco = format(os.freemem())  // Espacio libre en disco (esto puede cambiarse según tu sistema)

let mensaje = `

╭───────────────❀ │ ${saludo} 💖 │ 🤖 Versión: 2B v2.0 ╰───────────────❀

╭━━━✦ ✦━━━╮ ┃ 🚀 Velocidad: ${latensi} ms ╰━━━✦ ✦━━━╯

╭━━━✦ ✦━━━╮ ┃ ⏳ Actividad: ${muptime} ╰━━━✦ ✦━━━╯

╭━━━✦ ✦━━━╮ ┃ 💌 Chats: ${privateChats} privados, ${groupChats} grupos ╰━━━✦ ✦━━━╯

╭━━━✦ ✦━━━╮ ┃ 💻 Servidor: RAM: ${ramUso} / ${ramTotal}, CPU: ${cpu.toFixed(2)}% ┃ 💾 Almacenamiento libre: ${almacenamiento} ┃ 🌡️ Temperatura CPU: ${temperaturaCpu}°C ┃ 💽 Espacio Disco: ${espacioDisco} ╰━━━✦ ✦━━━╯

${url ? 📡 *Enlace:* ${url} : ''}

¡Recuerda que siempre estoy aquí para ayudarte! 💪".trim()

await conn.sendFile(m.chat, "https://files.catbox.moe/mfzdh9.jpeg", '2B.jpg', mensaje, null)

}

handler.help = ['ping'] handler.tags = ['bot'] handler.command = ['ping', 'speed'] handler.register = true

export default handler

function clockString(ms) { let h = Math.floor(ms / 3600000).toString().padStart(2, '0') let m = (Math.floor(ms / 60000) % 60).toString().padStart(2, '0') let s = (Math.floor(ms / 1000) % 60).toString().padStart(2, '0') return ${h}:${m}:${s} }

