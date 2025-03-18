import db from '../lib/database.js'

let handler = async function (m, { conn }) {
  let totalVerified = 0

  for (let user in global.db.data.users) {
    if (global.db.data.users[user].verified === true) {
      totalVerified++
    }
  }

  let message = `✿❀ 𝗨𝗦𝗨𝗔𝗥𝗜𝗢𝗦 𝗩𝗘𝗥𝗜𝗙𝗜𝗖𝗔𝗗𝗢𝗦 ❀✿\n`
  message += `╭─────────────╮\n`
  message += `✦ Total verificados: *${totalVerified}*\n`
  message += `╰─────────────╯\n`
  message += `Con cariño, Kaneko.`

  await m.reply(message)
}

handler.help = ['usuariosverificados']
handler.tags = ['owner']
handler.command = ['usuariosverificados', 'verificados']

export default handler
