import { totalmem, freemem } from 'os'
import osu from 'node-os-utils'
import { performance } from 'perf_hooks'
import { sizeFormatter } from 'human-readable'
import speed from 'performance-now' // Asegúrate de que esta línea esté aquí
import { spawn, exec, execSync } from 'child_process'

const format = sizeFormatter({ std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B` })

var handler = async (m, { conn, args }) => {
    await m.react('🤍')

    let timestamp = speed() // Aquí se usa la función speed que ahora está importada
    let latensi = speed() - timestamp
    let _muptime = process.uptime() * 1000
    let muptime = clockString(_muptime)

    let chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
    let groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce).map(v => v[0])

    let url = args.length > 0 ? args.join(' ') : '' 

    let hora = new Date().getHours()
    let nombreUsuario = conn.getName(m.sender) || "querido usuario"
    let saludo = hora < 11 ? `🌸 Buenos días, ${nombreUsuario}` : hora < 12 ? `🌅 Buenas tardes, ${nombreUsuario}` : `🌙 Buenas noches, ${nombreUsuario} : hora < 6 ?`

    let cpu = await osu.cpu.usage()
    let cpuTexto = `💾 *CPU:* ${cpu.toFixed(2)}%`
    
    let versionBot = "2B v2.0"

    let texto = `
╭───────────────❀
│ ${saludo} 💖
│ 🤖 *Versión:* ${versionBot}
╰───────────────❀

╭━━━✦ ✦━━━╮
┃ 🚀 *Velocidad:*  
┃ ⏱️ ${latensi.toFixed(4)} ms
╰━━━✦ ✦━━━╮

╭━━━✦ ✦━━━╮
┃ ⏳ *Actividad:*  
┃ ⌛ ${muptime}
╰━━━✦ ✦━━━╯

╭━━━✦ ✦━━━╮
┃ 💌 *Chats:*  
┃ 💬 ${chats.length} Chats privados  
┃ 🏡 ${groups.length} Grupos  
╰━━━✦ ✦━━━╯

╭━━━✦ ✦━━━╮
┃ 💻 *Servidor:*  
┃ 🖥️ RAM: ${format(totalmem() - freemem())} / ${format(totalmem())}
┃ ${cpuTexto}
╰━━━✦ ✦━━━╯

${url ? `📡 *Enlace:* ${url}` : ''}
`.trim()

    await conn.sendFile(m.chat, "https://files.catbox.moe/mfzdh9.jpeg", '2B.jpg', texto, null)
}

handler.help = ['ping']
handler.tags = ['bot']
handler.command = ['ping', 'speed']

handler.register = true

export default handler

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
