let handler = async (m, { conn, command, usedPrefix }) => {
  let img = './src/catalogo.jpg'
  let staff = `
━━━━━━━━━━━━━━━━━━━━━
      𝓔𝓺𝓾𝓲𝓹𝓸 𝓭𝓮 𝓐𝔂𝓾𝓭𝓪𝓷𝓽𝓮𝓼
━━━━━━━━━━━━━━━━━━━━━

*🗡️ Dueño:* ➣ ${creador}
*🤖 Bot:* ➣ ${botname}
*⚙️ Versión:* ➣ ${vs}
*📚 Librería:* ➣ ${libreria} ${baileys}

━━━━━━━━━━━━━━━━━━━━━

           𝓒𝓻𝓮𝓪𝓭𝓸𝓻:

━━━━━━━[ 𝓒𝓻𝓮𝓪𝓭𝓸𝓻 ]━━━━━━━
*ᰔᩚ ⁱᵃᵐ|𝔇ĕ𝐬†𝓻⊙γ𒆜*
> 🛠️ *Rol* » *Creador*
> 🌐 *GitHub* » https://github.com/The-King-Destroy
━━━━━━━━━━━━━━━━━━━━━

           𝓒𝓸𝓵𝓪𝓫𝓸𝓻𝓪𝓭𝓸𝓻𝓮𝓼:

━━━━━━━━━━━━━━━━━━━━━
*ᰔᩚ 𝓔𝓶𝓶𝓪 𝓥𝓲𝓸𝓵𝓮𝓽𝓼 𝓥𝓮𝓻𝓼𝓲ó𝓷*
> 🛠️ *Rol* » *Developer*
> 🌐 *GitHub* » https://github.com/Elpapiema
━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━
*ᰔᩚ Niño Piña*
> 🛠️ *Rol* » *Developer*
> 🌐 *GitHub* » https://github.com/WillZek
━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━
*✧ ☆꧁༒ĹєǤ𝒆𝐧𝐃༒꧂*  
> 🛠️ *Rol* » *Developer*
> 🌐 *GitHub* » https://github.com/Diomar-s
━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━
*ᰔᩚ I'm Fz' (Tesis)*
> 🛠️ *Rol* » *Developer*
> 🌐 *GitHub* » https://github.com/FzTeis
━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━
*ᰔᩚ Legna*
> 🛠️ *Rol* » *Mini-Dev*
> 🌐 *GitHub* » https://github.com/Legna-chan
━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━
`
  await conn.sendFile(m.chat, img, 'yuki.jpg', staff.trim(), fkontak)
}

handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.register = true
handler.tags = ['main']

export default handler
