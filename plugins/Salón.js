let handler = async (m, { conn }) => {
    let salonDeLaFama = [
        { nombre: 'ツ Kenji', yenes: 125000 },
        { nombre: 'Miku~chan', yenes: 95000 },
        { nombre: 'Akira-San', yenes: 78500 },
        { nombre: 'Kaori', yenes: 65000 },
        { nombre: 'Takeshi', yenes: 50000 },
    ]

    let mensaje = `
🌸  ﾟ✧  𝑺𝒂𝒍𝒐́𝒏 𝒅𝒆 𝑳𝒂 𝑭𝒂𝒎𝒂  ✧ﾟ🌸

${salonDeLaFama.map((jugador, i) => `
${i + 1}️⃣  *${jugador.nombre}*
        ➥  💴 *Yenes ganados:* ${jugador.yenes.toLocaleString()}  
`).join('\n')}

╰━━━⊰ 𝐋𝐚 𝐡𝐢𝐬𝐭𝐨𝐫𝐢𝐚 𝐬𝐞 𝐞𝐬𝐜𝐫𝐢𝐛𝐞 𝐚𝐪𝐮𝐢́!  ⊱━━━╯
`.trim()

    conn.reply(m.chat, mensaje, m)
}

handler.help = ['salonfama'];
handler.tags = ['rpg'];
handler.command = ['salonfama', 'salóndeLaFama', 'fama'];

export default handler;
