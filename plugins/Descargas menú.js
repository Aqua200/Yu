import { promises } from 'fs' import { join } from 'path'

const defaultMenu = { before: ` ꒷꒦꒷꒷꒦꒷꒦꒷꒷꒦꒷꒦꒷꒦꒷꒷꒦꒷꒷꒦꒷꒷꒦꒷꒦꒷꒦꒷꒦꒷

“ hello %name, Cómo se encuentra el día de hoy? ”

╭──⬣「 Info User 」⬣ │  ≡◦ 🍭 Nombre ∙ %name │  ≡◦ 🍬 Dulces ∙ %limit │  ≡◦ 💫 XP ∙ %totalexp │  ≡◦ 🐢 Nivel ∙ %level ╰──⬣ %readmore ꒷꒦꒷꒷꒦꒷꒦꒷꒷꒦꒷꒦꒷꒦꒷꒷꒦꒷꒷꒦꒷꒷꒦꒷꒦꒷꒦꒷꒦꒷

\t\t\tL I S T A  -  M E N Ú S `.trimStart(), sections: [ { title: 'Info 📚', commands: ['menu', 'ayuda', 'estado'] }, { title: 'Juegos 🎮', commands: ['rpg', 'cazar', 'duende'] }, { title: 'Descargas 📥', commands: ['ytmp3', 'ytmp4', 'facebook'] }, { title: 'Herramientas 🔧', commands: ['calc', 'traducir', 'horario'] } ] }

let handler = async (m, { conn, text }) => { let name = await conn.getName(m.sender) let section = defaultMenu.sections.find(s => s.title.toLowerCase().includes(text.toLowerCase()))

let menuText = defaultMenu.before.replace(/%name/g, name)

if (section) { menuText += \n╭──⬣「 *${section.title}* 」⬣\n; for (let cmd of section.commands) { menuText += │  ≡◦ *${cmd}*\n; } menuText += '╰──⬣\n'; } else { for (let sec of defaultMenu.sections) { menuText += \n╭──⬣「 *${sec.title}* 」⬣\n; for (let cmd of sec.commands) { menuText += │  ≡◦ *${cmd}*\n; } menuText += '╰──⬣\n'; } }

let imageUrl = 'https://files.catbox.moe/k3tn8r.jpeg' await conn.sendFile(m.chat, imageUrl, 'thumbnail.jpg', menuText.trim(), m) }

handler.help = ['menu'] handler.tags = ['main'] handler.command = ['descargas'] export default handler

  
