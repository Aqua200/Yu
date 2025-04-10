// plugins/teibol.js

import { rangoTeibol } from './_rango-teibol.js'

let cooldowns = {}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let tiempo = 5 * 60 // 5 minutos
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    const tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `✨ Debes esperar *${tiempo2}* para volver al *teibol* otra vez.`, m)
    return
  }
  let rsl = Math.floor(Math.random() * 500)
  cooldowns[m.sender] = Date.now()
  await conn.reply(m.chat, `\n${pickRandom(teibol)} *${toNum(rsl)}* ( *${rsl}* ) 💸\n\n🏅 Rango actual: ${rangoTeibol(user.coin)}`, m)
  user.coin += rsl
}

handler.help = ['teibol']
handler.tags = ['economy']
handler.command = ['teibol', 'strip', 'bailar']
handler.group = true
handler.register = true

export default handler

function toNum(number) {
  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(1) + 'k'
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M'
  } else if (number <= -1000 && number > -1000000) {
    return (number / 1000).toFixed(1) + 'k'
  } else if (number <= -1000000) {
    return (number / 1000000).toFixed(1) + 'M'
  } else {
    return number.toString()
  }
}

function segundosAHMS(segundos) {
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

const teibol = [
  "Bailaste en el escenario y ganaste",
  "Diste un show privado y recibiste propina de",
  "Los clientes quedaron fascinados con tu baile, te pagaron",
  "Participaste en un concurso de baile y ganaste",
  "Fuiste contratada para un evento VIP y recibiste",
  "Te aplaudieron tanto que te llovieron billetes por",
  "Un cliente enamorado te regaló",
  "Bailaste en la barra y conseguiste",
  "Hiciste un show especial de medianoche y ganaste",
  "Diste clases de baile sensual y cobraste",
  "Modelaste lencería en el club y te pagaron",
  "Hiciste un truco nuevo en el tubo y ganaste",
  "Tu sensualidad conquistó al público y recibiste",
  "Tu actuación especial de San Valentín te dejó",
  "Un cliente famoso te dejó una propina de",
  "Bailaste en la zona VIP y ganaste",
]
