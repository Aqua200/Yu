import { promises } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, __dirname }) => {
  try {
    let { exp, limit, level } = global.db.data.users[m.sender]
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let muptime = clockString(_uptime)

    let leerMas = '\u200e'.repeat(850) // Esto genera el "leer más" en WhatsApp

    let menuText = `
*𝐇𝐨𝐥𝐚! 𝐒𝐨𝐲 ✦2B✦ (𝐁𝐨𝐭-𝐅𝐞𝐦)*
╭─┈↷
│ ✐ 𝓓𝓮𝓼𝓮𝓪𝓻𝓻𝓸𝓵𝓵𝓮𝓭 𝓹𝓸𝓻 Neykoor 💜
│ ➥ Tiempo activa: *${muptime}*
│ ✐ ꒷ꕤ💎 ᴄᴀɴᴀʟ ᴏғɪᴄɪᴀʟ:
│ https://whatsapp.com/channel/0029VazHywx0rGiUAYluYB24
╰─────────────────
${leerMas}
》───「 𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦 」───《

✿ 𝗖𝗼𝗺𝗮𝗻𝗱𝗼𝘀 𝗱𝗲 *Rpg*:
 

»⊹˚୨ *2B* ⊹
`.trim()

    let pp = 'https://files.catbox.moe/58o60y.jpg' // Cambia por tu imagen
    await conn.sendFile(m.chat, pp, 'thumbnail.jpg', menuText, m)

  } catch (e) {
    conn.reply(m.chat, 'Lo sentimos, ocurrió un error mostrando el menú.', m)
    throw e
  }
}

handler.help = ['menuscript', 'dev'] // Añadí 'dev'
handler.tags = ['main']
handler.command = ['menuscript', 'dev'] // Añadí 'dev'
handler.register = true
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
