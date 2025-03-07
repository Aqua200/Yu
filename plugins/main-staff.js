let handler = async (m, { conn, command, usedPrefix }) => {
  // Definir las variables con los símbolos
  const symbol1 = 'ᥫ᭡';  // ᥫ᭡
  const symbol2 = '✰';    // ✰
  const symbol3 = '✦';    // ✦
  const symbol4 = '⚘';    // ⚘
  const symbol5 = '❖';    // ❖
  const symbol6 = '✧';    // ✧

  let img = './src/catalogo.jpg'
  let staff = `
━━━━━━━━━━━━━━━━━━━━━
      𝓔𝓺𝓾𝓲𝓹𝓸 𝓭𝓮 𝓐𝓎𝓾𝓭𝓪𝓷𝓽𝓮𝓼
━━━━━━━━━━━━━━━━━━━━━

${symbol6} *Dueño:* ➣ ${creador}
${symbol6} *Bot:* ➣ ${botname}
${symbol6} *Versión:* ➣ ${vs}
${symbol6} *Librería:* ➣ ${libreria} ${baileys}

━━━━━━━━━━━━━━━━━━━━━

           𝓒𝓻𝓮𝓪𝓭𝓸𝓻:

━━━━━━━[ 𝓒𝓻𝓮𝓪𝓭𝓸𝓻 ]━━━━━━━
${symbol1} *ᰔᩚ ⁱᵃᵐ|𝔇ĕ𝐬†𝓻⊙γ𒆜*
> ${symbol2} *Rol* » *Creador*
> ${symbol3} *GitHub* » https://github.com/The-King-Destroy
━━━━━━━━━━━━━━━━━━━━━

           𝓒𝓸𝓵𝓪𝓫𝓸𝓻𝓪𝓭𝓸𝓻𝓮𝓼:

━━━━━━━━━━━━━━━━━━━━━
${symbol1} *ᰔᩚ 𝓔𝓶𝓶𝓪 𝓥𝓲𝓸𝓵𝓮𝓽𝓼 𝓥𝓮𝓻𝓼𝓲ó𝓷*
> ${symbol2} *Rol* » *Developer*
> ${symbol3} *GitHub* » https://github.com/Elpapiema
━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━
${symbol1} *ᰔᩚ Niño Piña*
> ${symbol2} *Rol* » *Developer*
> ${symbol3} *GitHub* » https://github.com/WillZek
━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━
${symbol1} *✧ ☆꧁༒ĹєǤ𝒆𝐧𝐃༒꧂*  
> ${symbol2} *Rol* » *Developer*
> ${symbol3} *GitHub* » https://github.com/Diomar-s
━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━
${symbol1} *ᰔᩚ I'm Fz' (Tesis)*
> ${symbol2} *Rol* » *Developer*
> ${symbol3} *GitHub* » https://github.com/FzTeis
━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━
${symbol1} *ᰔᩚ Legna*
> ${symbol2} *Rol* » *Mini-Dev*
> ${symbol3} *GitHub* » https://github.com/Legna-chan
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
