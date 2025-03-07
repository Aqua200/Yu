let handler = async (m, { conn }) => {
  let urlFija = "https://qu.ax/RsBya.jpeg" // Cambia esta URL por la que deseas usar

  let txt = `*乂  J A D I B O T 乂*\n\n`
  txt += `✩  *Conéctate aquí* : ${urlFija}\n`
  txt += `✩  Usa esta URL en tu navegador para conectarte como *Jadibot*.\n`
  txt += `✩  No compartas este enlace con desconocidos.\n`

  await conn.sendMessage(m.chat, { text: txt })
}

handler.help = ['jadi']
handler.tags = ['jadibot']
handler.command = ['jadi']
handler.owner = true // Solo el owner puede usarlo

export default handler
