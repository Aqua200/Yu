let handler = async (m, { conn, command, usedPrefix }) => {
  // Reemplazar la ruta de la imagen por una URL
  let img = 'https://ejemplo.com/imagen.jpg'; // Coloca aquí tu URL de imagen

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

           colaboradores:

━━━━━━━[ colaboradores ]━━━━━━━
ᥫ᭡ *no hay *
> ✰ *Rol* » *Developer*
> ✦ *GitHub* » 
━━━━━━━━━━━━━━━━━━━━━

          agradecimientos:

━━━━━━━[ Agradecimiento ]━━━━━━━
ᥫ᭡ *ᰔᩚ ⁱᵃᵐ|𝔇ĕ𝐬†𝓻⊙γ𒆜*
> ✰ *Rol* » *creador*
> ✦ *GitHub* » https://github.com/The-King-Destroy
━━━━━━━━━━━━━━━━━━━━━

quieres formar parte del staff? solo necesitas creatividad 
poco conocimiento y asegurar que le echaras ganas
`
  await conn.sendFile(m.chat, img, 'imagen.jpg', staff.trim(), fkontak)
}

handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.register = true
handler.tags = ['main']

export default handler
