let handler = async (m, { conn, command, usedPrefix }) => {
  // Reemplazar la ruta de la imagen por una URL
  let img = 'https://qu.ax/kjnVx.jpeg'; // Coloca aquí tu URL de imagen

  let staff = `
━━━━━━━━━━━━━━━━━━━━━
       equipo de ayudante 
━━━━━━━━━━━━━━━━━━━━━

✧ *Dueño:* ➣ ${creador}
✧ *Bot:* ➣ ${botname}
✧ *Versión:* ➣ ${vs}
✧ *Librería:* ➣ ${libreria} ${baileys}

━━━━━━━━━━━━━━━━━━━━━

   creador de la bot:

━━━━━━━[ creador ]━━━━━━━
ᥫ᭡ *Neykoor💜*
> ✰ *Rol* » *Creador*
> ✦ *GitHub* » por el momento no esta disponible 
━━━━━━━━━━━━━━━━━━━━━

          agradecimientos:

━━━━━━━[ Agradecimiento ]━━━━━━━
ᥫ᭡ *ᰔᩚ ⁱᵃᵐ|𝔇ĕ𝐬†𝓻⊙γ𒆜*
> ✰ *Rol* » *creador*
> ✦ *GitHub* » https://github.com/The-King-Destroy
━━━━━━━━━━━━━━━━━━━━━
`
  await conn.sendFile(m.chat, img, 'imagen.jpg', staff.trim(), fkontak)
}

handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.register = true
handler.tags = ['main']

export default handler
