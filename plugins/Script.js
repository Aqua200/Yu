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
│ https://whatsapp.com/channel/0029VazHywx0rGiUAYluYB24
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

✐ 𝗢𝘄𝗻𝗲𝗿:
❀ ᥴ᥆mᥲᥒძ᥆s ძᥱ m᥆ძᥱrᥲᥴіóᥒ ᥡ ᥴ᥆ᥒ𝗍r᥆ᥣ ᥲ᥎ᥲᥒzᥲз᥆ ⍴ᥲrᥲ ᥆ᥕᥒᥱrs.

✿ 𝗖𝗼𝗺𝗮𝗻𝗱𝗼𝘀 𝗱𝗲 *𝗦𝗰𝗿𝗶𝗽𝘁*:
✐💎→ ᴘᴀʀᴀ ᴄʀᴇᴀʀ ᴜɴ sᴜʙ-ʙᴏᴛ ᴄᴏɴ ᴛᴜ ɴᴜᴍᴇʀᴏ ᴜᴛɪʟɪᴢᴀ *#qr* o *#code*

*Script* ⊹

✐ Comandos para registrar tu propio bot.
✦ *#botinfo • #infobot*
→ Obtener informacion del bot
✦ *#join* + [Invitacion]
→ Unir al bot a un grupo
✦ *#leave • #salir*
→ Salir de un grupo
✦ *#logout*
→ Cerrar sesion del bot
✦ *#qr • #code*
→ Crear un Sub-Bot con un codigo QR/Code
✦ *#qrpremium • #codepremium* + [Token]
→ Crear un sub-bot premium
✦ *#qrtemporal • #codetemporal*
→ Crear un Sub-Bot temporal con un codigo QR/Code
✦ *#setbanner • #setmenubanner*
→ Cambiar el banner del menu
✦ *#setbotcurrency* + [nombre]
→ Cambiar la moneda del bot
✦ *#setname • #setbotname* + [nombre corto] / [nombre largo]
→ Cambiar el nombre del bot
✦ *#setpfp • #setimage*
→ Cambiar la imagen de perfil
✦ *#setstatus* + [estado]
→ Cambiar el estado del bot
✦ *#setusername* + [nombre]
→ Cambiar el nombre de usuario

》───「 𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦 𝗠𝗔𝗜𝗡 」───《

...

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
