import db from '../lib/database.js'

let handler = async function (m, { conn }) {
  let totalRegistered = 0

  for (let user in global.db.data.users) {
    if (global.db.data.users[user].registered === true) {
      totalRegistered++
    }
  }

  let message = `✿❀ 𝗨𝗦𝗨𝗔𝗥𝗜𝗢𝗦 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗔𝗗𝗢𝗦 ❀✿\n`
  message += `╭─────────────╮\n`
  message += `✦ Total registrados: *${totalRegistered}*\n`
  message += `╰─────────────╯\n`
  message += `Con cariño, 2B.`

  await m.reply(message)
}

handler.help = ['usuariosregistrados']
handler.tags = ['owner']
handler.command = ['usuariosregistrados', 'registrados']

export default handler
