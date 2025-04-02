let handler = async (m, { conn }) => {
  let name = await conn.getName(m.sender)
  
  // Reaccionar al mensaje con el emoji de música primero
  await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } })

  // Texto del menú
  let menuText = `
¡Hola *${name}*! ¿Qué deseas escuchar este dia??

╭──⬣「 *Herramientas* 」⬣
│
│  ≡◦ *Comando 1*
│ ✦ .play
│  ≡◦ *Comando 2*
│
│  ≡◦ *Comando 3*
│
│ 🩵 Nota de mi owner:
│ si unos de mis comando no funciona 
│   reporta ejemplo 
│              .reportar play
╰──⬣
  `

  // URL de la imagen
  let imageUrl = 'https://files.catbox.moe/k3tn8r.jpeg'
  
  // Enviar mensaje con imagen y texto del menú
  await conn.sendFile(m.chat, imageUrl, 'thumbnail.jpg', menuText.trim(), m)
}

handler.help = ['musica']
handler.tags = ['main']
handler.command = ['musica']

export default handler
