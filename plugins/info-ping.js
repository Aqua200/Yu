import { totalmem, freemem } from 'os'
import osu from 'node-os-utils'
import { performance } from 'perf_hooks'
import { sizeFormatter } from 'human-readable'
import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

const format = sizeFormatter({ std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B` })

var handler = async (m, { conn, args }) => {
    let timestamp = speed()
    let latensi = speed() - timestamp

    let _muptime = process.uptime() * 1000
    let muptime = clockString(_muptime)

    let chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
    let groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce).map(v => v[0])

    let url = args.length > 0 ? args.join(' ') : '' 

    // Obtener la hora actual
    let hora = new Date().getHours()
    let saludo = hora < 12 ? "🌸 𝐵𝑢𝑒𝑛𝑜𝑠 𝑑í𝑎𝑠" : hora < 18 ? "🌅 𝐵𝑢𝑒𝑛𝑎𝑠 𝑡𝑎𝑟𝑑𝑒𝑠" : "🌙 𝐵𝑢𝑒𝑛𝑎𝑠 𝑛𝑜𝑐ℎ𝑒𝑠"

    let texto = `
❀──✦・𝒩𝒾𝓋𝑒𝓁 𝒹𝑒 𝓅𝑜𝓉𝑒𝓃𝒸𝒾𝒶・✦──❀

${saludo} 𝑀𝒾 𝓁𝒾𝓃𝒹𝑜 𝓊𝓈𝓊𝒶𝓇𝒾𝑜 💖

╭── ⋆⋅☆⋅⋆ ──╮
🌟 *𝑉𝑒𝓁𝑜𝒸𝒾𝒹𝒶𝒹:* 
⏱️ ${latensi.toFixed(4)} ms
╰── ⋆⋅☆⋅⋆ ──╯

╭── ⋆⋅☆⋅⋆ ──╮
📌 *𝒜𝒸𝓉𝒾𝓋𝒾𝒹𝒶𝒹:* 
⏳ ${muptime}
╰── ⋆⋅☆⋅⋆ ──╯

╭── ⋆⋅☆⋅⋆ ──╮
📩 *𝒞𝒽𝒶𝓉𝓈:*  
👥 ${chats.length} Chats privados  
🏘️ ${groups.length} Grupos  
╰── ⋆⋅☆⋅⋆ ──╯

╭── ⋆⋅☆⋅⋆ ──╮
💻 *𝒮𝑒𝓇𝓋𝒾𝒹𝑜𝓇:*  
🖥️ 𝑅𝒶𝓂: ${format(totalmem() - freemem())} / ${format(totalmem())}
╰── ⋆⋅☆⋅⋆ ──╯

${url ? `📡 *𝐸𝓃𝓁𝒶𝒸𝑒:* ${url}` : ''}
`.trim()

    await conn.sendFile(m.chat, "https://files.catbox.moe/mfzdh9.jpeg", '2B.jpg', texto, null)
    await m.react('🤍')
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
