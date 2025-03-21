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

✿ 𝗖𝗼𝗺𝗮𝗻𝗱𝗼𝘀 𝗱𝗲 *𝗦𝗰𝗿𝗶𝗽𝘁*:

✐💎→ ᴘᴀʀᴀ ᴄʀᴇᴀʀ ᴜɴ sᴜʙ-ʙᴏᴛ ᴄᴏɴ ᴛᴜ ɴᴜᴍᴇʀᴏ ᴜᴛɪʟɪᴢᴀ *#qr* o *#code*
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
✦ *#addowner • #delowner* 
→ Agrega o elimina un número de la lista de owners.
✦ *#codigo*
→ Crea un token o código de canjeó de códigos.
✦ *#backup • #copia*
→ Crear un respaldo de seguridad de la *db* del Bot.
✦ *#bcgc*
→ Envia un mensaje a todos los grupos donde este el Bot.
✦ *#cleanfiles*
→ Elimina archivos temporales.
✦ *#addcoins • #añadircoin*
→ Añade coins a un usuario.
✦ *#userpremium • #addprem*
→ Otorgar premium a un usuario.
✦ *#delprem #remove*
→ Quitar premium a un usuario.
✦ *#addexp • #añadirxp*
→ Añade XP a un usuario.
✦ *#autoadmin*
→ El Bot dara admin automáticamente solo si el Bot es admin.
✦ *#listban • #banlist*
→ Lista de usuarios y chats baneados.
✦ *#banuser*
→ Banear a un usuario.
✦ *#unbanuser*
→ Desbanear a un usuario.
✦ *#dsowner • #delai*
→ Elimina archivos innecesarios de sesión.
✦ *#cleartmp • #vaciartmp*
→ Elimina archivo innecesarios de la carpeta tmp.
✦ *#block • #unblock*
→ Bloquear o desbloquear a un usuario del número del Bot.
✦ *#listblock • #blocklist*
→ Ver listado de usuarios bloqueados.
✦ *#removecoin • #quitarcoin*
→ Quitar coins a un usuario.
✦ *#deletedatauser • #resetuser*
→ Restablecer los datos de un usuario.
✦ *#removexp • #quitarxp*
→ Quitar XP a un usuario.
✦ *#newgc #creargc*
→Crea un nuevo grupo desde el número del Bot.
✦ *#deletefile*
→ Elimina archivos del Bot
✦ *#get • #fetch*
→ Ver el estado de una página web.
✦ *#plugin • #getplugin*
→ Extraer un plugin de los archivos del Bot.
✦ *#grouplist • #listgroup*
→ Ver listado de grupos en los que está unido el Bot.
✦ *#let*
→ Envia un mensaje con una duración de 1 hora.
✦ *#prefix*
→ Ver o cambiar el prefijo del Bot.
✦ *#resetprefix*
→ Restablecer el prefijo del Bot.
✦ *#reiniciar • #restart*
→ Reiniciar el servidor del Bot.
✦ *#reunion • #meeting*
→ Envia un aviso de reunión a los owners.
✦ *#savejs • #savefile*
→ Guarda un archivo en una de las rutas del Bot.
✦ *#saveplugin*
→ Guarda un plugin en la carpeta de comandos del Bot.
✦ *#setavatar*
→ Cambia la imagen del catálogo.
✦ *#addcmd • #setcmd*
→ Guarda un sticker/imagen como texto o comando.
✦ *#delcmd*
→ Elimina el texto/comando del Bot.
✦ *#cmdlist • #listcmd*
→ Ver listado de textos/comandos.
✦ *#setbio • #setstatus*
→ Cambia la biografía del Bot.
✦ *#update*
→ Actualiza el Bot a la versión más reciente de GitHub.


»⊹˚୨ *2B* ⊹
`.trim()

    let pp = 'https://files.catbox.moe/58o60y.jpg' // Cambia por tu imagen
    await conn.sendFile(m.chat, pp, 'thumbnail.jpg', menuText, m)

  } catch (e) {
    conn.reply(m.chat, 'Lo sentimos, ocurrió un error mostrando el menú.', m)
    throw e
  }
}

handler.help = ['menu script']
handler.tags = ['main']
handler.command = ['menu script']
handler.register = true
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
