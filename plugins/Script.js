import { promises } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, __dirname }) => {
  try {
    let { exp, limit, level } = global.db.data.users[m.sender]
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let muptime = clockString(_uptime)

    // Aquí escribe a mano el menú como tú quieras:
    let menuText = `
*𝐇𝐨𝐥𝐚! 𝐒𝐨𝐲 ✦2B✦ (𝐁𝐨𝐭-𝐅𝐞𝐦)*
╭─┈↷
│ ✐ 𝓓𝓮𝓼𝓮𝓪𝓻𝓻𝓸𝓵𝓵𝓮𝓭 𝓹𝓸𝓻 Neykoor 💜
│ ✐ ꒷ꕤ💎 ᴄᴀɴᴀʟ ᴏғɪᴄɪᴀʟ:
│ https://whatsapp.com/channel/0029VaGWwUfB4hdVxH1MDu43
╰─────────────────

》───「 𝗧𝗨 𝗣𝗘𝗥𝗙𝗜𝗟 」───《
➥ Nombre: *${name}*
➥ Nivel: *${level}*
➥ XP: *${exp}*
➥ Dulces: *${limit}*
➥ Tiempo activo: *${muptime}*

》───「 𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦 」───《

✐ 𝗜𝗻𝗳𝗼:
✦ #infobot — Información del bot  
✦ #ping — Ver velocidad de respuesta  
✦ #grupos — Ver mis grupos oficiales  

✐ 𝗗𝗲𝘀𝗰𝗮𝗿𝗴𝗮𝘀:
✦ #play [nombre] — Descargar música  
✦ #ytmp3 [url] — Descargar audio YouTube  
✦ #ytmp4 [url] — Descargar video YouTube  

✐ 𝗝𝘂𝗲𝗴𝗼𝘀:
✦ #piedrapapeltijera  
✦ #adivinanza  

✐ 𝗥𝗣𝗚:
✦ #cazar — Cazar duendes y ganar yenes  
✦ #tienda — Ver tienda RPG  

✐ 𝗢𝘄𝗻𝗲𝗿:
✦ #update — Actualizar bot  
✦ #restart — Reiniciar bot  

» ⊹˚୨ •(=^ェ^=)• ⊹˚୨ *Anika Dm* ⊹
`.trim()

    // Aquí puedes poner la URL de la imagen
    let pp = 'https://example.com/miniurl.jpg' // Reemplaza con tu URL de imagen
    await conn.sendFile(m.chat, pp, 'thumbnail.jpg', menuText, m)

  } catch (e) {
    conn.reply(m.chat, 'Lo sentimos, ocurrió un error mostrando el menú.', m)
    throw e
  }
}

handler.help = ['ownermenu'] // Cambié el comando aquí
handler.tags = ['main']
handler.command = ['ownermenu'] // Cambié el comando aquí
handler.register = true
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
