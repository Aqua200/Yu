import { promises } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, __dirname }) => {
  try {
    let { exp, limit, level } = global.db.data.users[m.sender]
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let muptime = clockString(_uptime)

    // Primer mensaje con la opción de "Leer más"
    let menuText = `
*𝐇𝐨𝐥𝐚! 𝐒𝐨𝐲 ✦2B✦ (𝐁𝐨𝐭-𝐅𝐞𝐦)*

╭─┈↷
│ ✐ 𝓓𝓮𝓼𝓮𝓪𝓻𝓻𝓸𝓵𝓵𝓮𝓭 𝓹𝓸𝓻 Neykoor 💜
│ ✐ ꒷ꕤ💎 ᴄᴀɴᴀʟ ᴏғɪᴄɪᴀʟ:
│ https://whatsapp.com/channel/0029VazHywx0rGiUAYluYB24
╰─────────────────

》───「 𝗟𝗲𝗲𝗿 𝗺𝗮́s 」───《
✐ Pulsa *#vermenu* para ver más detalles y comandos del bot.

»⊹˚୨ *2B* ⊹
`.trim()

    // Aquí puedes poner la URL de la imagen
    let pp = 'https://example.com/miniurl.jpg' // Reemplaza con tu URL de imagen
    await conn.sendFile(m.chat, pp, 'thumbnail.jpg', menuText, m)

  } catch (e) {
    conn.reply(m.chat, 'Lo sentimos, ocurrió un error mostrando el menú.', m)
    throw e
  }
}

let handler2 = async (m, { conn }) => {
  try {
    let { exp, limit, level } = global.db.data.users[m.sender]
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let muptime = clockString(_uptime)

    // Menú completo cuando el usuario usa el comando #vermenu
    let fullMenu = `
*𝐇𝐨𝐥𝐚! 𝐒𝐨𝐲 ✦2B✦ (𝐁𝐨𝐭-𝐅𝐞𝐦)*

╭─┈↷
│ ✐ 𝓓𝓮𝓼𝓮𝓪𝓻𝓻𝓸𝓵𝓵𝓮𝓭 𝓹𝓸𝓻 Neykoor 💜
│ ✐ ꒷ꕤ💎 ᴄᴀɴᴀʟ ᴏғɪᴄɪᴀʟ:
│ https://whatsapp.com/channel/0029VazHywx0rGiUAYluYB24
╰─────────────────

》───「 *𝗟𝗲𝗲𝗿 𝗺𝗮́s* 」───《
✐ Aquí está el menú completo con todos los comandos y más detalles:

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

✐ 𝗢𝘄𝗻𝗲𝗿:
❀ ᥴ᥆mᥲᥒძ᥆s ...

(Continuar con todo el menú)
`.trim()

    await conn.reply(m.chat, fullMenu, m)

  } catch (e) {
    conn.reply(m.chat, 'Lo sentimos, ocurrió un error mostrando el menú completo.', m)
    throw e
  }
}

// Se asigna el comando para mostrar el primer mensaje
handler.help = ['ownermenu']
handler.tags = ['main']
handler.command = ['ownermenu']

// Se asigna el comando para mostrar el menú completo
handler2.help = ['vermenu']
handler2.tags = ['main']
handler2.command = ['vermenu']

handler.register = true
export default [handler, handler2]

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
    }
