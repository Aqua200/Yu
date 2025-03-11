import db from '../lib/database.js' // Asegúrate de que tu bot tenga una base de datos compatible

let handler = async (m, { command, text }) => {
    db.data.ajuste = db.data.ajuste || "⚠️ No hay ningún ajuste configurado."

    if (text) {
        db.data.ajuste = text
        m.reply('✅ Ajuste actualizado correctamente.')
    } else {
        let aviso = `╭──────────────────╮\n` +
                    `┃  🌸 *AJUSTE ACTUAL* 🌸 ┃\n` +
                    `╰──────────────────╯\n\n` +
                    `💬 *Mensaje:* ${db.data.ajuste}`
        m.reply(aviso)
    }
}

handler.help = ['ajuste']
handler.tags = ['main']
handler.command = ['ajuste']
export default handler
