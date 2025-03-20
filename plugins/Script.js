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
❀ ᥴ᥆mᥲᥒძ᥆s ძᥱ m᥆ძᥱrᥲᥴіóᥒ ᥡ ᥴ᥆ᥒ𝗍r᥆ᥣ ᥲ᥎ᥲᥒzᥲძ᥆ ⍴ᥲrᥲ ᥆ᥕᥒᥱrs.

ᰔᩚ *#addowner • #delowner*
> ✦ Agrega o elimina un número de la lista de owners.
ᰔᩚ *#codigo*
> ✦ Crea un token o código de canjeó de códigos.
ᰔᩚ *#backup • #copia*
> ✦ Crear un respaldo de seguridad de la *db* del Bot.
ᰔᩚ *#bcgc*
> ✦ Envia un mensaje a todos los grupos donde este el Bot.
ᰔᩚ *#cleanfiles*
> ✦ Elimina archivos temporales.
ᰔᩚ *#addcoins • #añadircoin*
> ✦ Añade coins a un usuario.
ᰔᩚ *#userpremium • #addprem*
> ✦ Otorgar premium a un usuario.
ᰔᩚ *#delprem #remove*
> ✦ Quitar premium a un usuario.
ᰔᩚ *#addexp • #añadirxp*
> ✦ Añade XP a un usuario.
ᰔᩚ *#autoadmin*
> ✦ El Bot dara admin automáticamente solo si el Bot es admin.
ᰔᩚ *#listban • #banlist*
> ✦ Lista de usuarios y chats baneados.
ᰔᩚ *#banuser*
> ✦ Banear a un usuario.
ᰔᩚ *#unbanuser*
> ✦ Desbanear a un usuario.
ᰔᩚ *#dsowner • #delai*
> ✦ Elimina archivos innecesarios de sesión.
ᰔᩚ *#cleartmp • #vaciartmp*
> ✦ Elimina archivo innecesarios de la carpeta tmp.
ᰔᩚ *#block • #unblock*
> ✦ Bloquear o desbloquear a un usuario del número del Bot.
ᰔᩚ *#listblock • #blocklist*
> ✦ Ver listado de usuarios bloqueados.
ᰔᩚ *#removecoin • #quitarcoin*
> ✦ Quitar coins a un usuario.
ᰔᩚ *#deletedatauser • #resetuser*
> ✦ Restablecer los datos de un usuario.
ᰔᩚ *#removexp • #quitarxp*
> ✦ Quitar XP a un usuario.
ᰔᩚ *#newgc #creargc*
> ✦ Crea un nuevo grupo desde el número del Bot.
ᰔᩚ *#deletefile*
> ✦ Elimina archivos del Bot
ᰔᩚ *#get • #fetch*
> ✦ Ver el estado de una página web.
ᰔᩚ *#plugin • #getplugin*
> ✦ Extraer un plugin de los archivos del Bot.
ᰔᩚ *#grouplist • #listgroup*
> ✦ Ver listado de grupos en los que está unido el Bot.
ᰔᩚ *#join • #invite*
> ✦ Agregar el Bot a un grupo mediante el enlace de invitación.
ᰔᩚ *#leave • #salir*
> ✦ Sacar el Bot de un grupo.
ᰔᩚ *#let*
> ✦ Envia un mensaje con una duración de 1 hora.
ᰔᩚ *#prefix*
> ✦ Ver o cambiar el prefijo del Bot.
ᰔᩚ *#resetprefix*
> ✦ Restablecer el prefijo del Bot.
ᰔᩚ *#reiniciar • #restart*
> ✦ Reiniciar el servidor del Bot.
ᰔᩚ *#reunion • #meeting*
> ✦ Envia un aviso de reunión a los owners.
ᰔᩚ *#savejs • #savefile*
> ✦ Guarda un archivo en una de las rutas del Bot.
ᰔᩚ *#saveplugin*
> ✦ Guarda un plugin en la carpeta de comandos del Bot.
ᰔᩚ *#setbanner*
> ✦ Cambia la imagen del menu principal del Bot.
ᰔᩚ *#setavatar*
> ✦ Cambia la imagen del catálogo.
ᰔᩚ *#addcmd • #setcmd*
> ✦ Guarda un sticker/imagen como texto o comando.
ᰔᩚ *#delcmd*
> ✦ Elimina el texto/comando del Bot.
ᰔᩚ *#cmdlist • #listcmd*
> ✦ Ver listado de textos/comandos.
ᰔᩚ *#setimage • #setpfp*
> ✦ Cambia la foto del perfil del Bot.
ᰔᩚ *#setmoneda*
> ✦ Cambia la moneda del Bot.
ᰔᩚ *#setname*
> ✦ Cambia el nombre del Bot
ᰔᩚ *#setbio • #setstatus*
> ✦ Cambia la biografía del Bot.
ᰔᩚ *#update*
> ✦ Actualiza el Bot a la versión más reciente de GitHub.

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
