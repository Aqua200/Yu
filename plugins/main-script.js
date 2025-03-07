let handler = async (m, { conn }) => {
  let numeroFijo = "+57 1234567890" // Cambia este número por el que quieres usar

  let txt = `*乂  J A D I B O T 乂*\n\n`
  txt += `✩  *Número para conectar* : ${numeroFijo}\n`
  txt += `✩  Usa este número en WhatsApp MD para conectarte como *Jadibot*.\n`
  txt += `✩  No compartas este número con desconocidos.\n`

  await conn.sendMessage(m.chat, { text: txt })
}

handler.help = ['jadi']
handler.tags = ['jadibot']
handler.command = ['jadi']
handler.owner = true // Solo el owner puede usarlo

export default handler 
