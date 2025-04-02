let handler = async (m, { conn }) => {
  let name = await conn.getName(m.sender)
  
  // Texto del menú
  let menuText = `
¡Hola *${name}*! ¿Qué deseas escuchar ahora?

╭──⬣「 *Herramientas* 」⬣
│  ≡◦ *Comando 1*
│  ≡◦ *Comando 2*
│  ≡◦ *Comando 3*
╰──⬣
  `

  // URL de la imagen
  let imageUrl = 'https://files.catbox.moe/k3tn8r.jpeg'
  
  // Enviar mensaje con imagen y texto del menú
  await conn.sendFile(m.chat, imageUrl, 'thumbnail.jpg', menuText.trim(), m)

  // Reaccionar al mensaje con un emoji de música usando sendMessage
  await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } })
}

handler.help = ['musica']
handler.tags = ['main']
handler.command = ['musica']

export default handler
