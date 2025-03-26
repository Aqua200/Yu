let cooldowns = {}

let handler = async (m, { conn, isPrems }) => {
  let user = global.db.data.users[m.sender]
  let tiempo = 5 * 60

  // Verificar cooldown
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    const tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `${emoji3} Debes esperar *${tiempo2}* para usar *#w* de nuevo.`, m)
    return
  }

  // Elegir aleatoriamente un lugar de "Kurogane"
  const lugares = ['Bosque', 'Mazmorra', 'Zona de descanso']
  const lugarElegido = pickRandom(lugares)

  // Recompensas basadas en el lugar elegido
  let recompensa = 0
  switch(lugarElegido) {
    case 'Bosque':
      recompensa = Math.floor(Math.random() * 300) + 100
      break
    case 'Mazmorra':
      recompensa = Math.floor(Math.random() * 500) + 200
      break
    case 'Zona de descanso':
      recompensa = Math.floor(Math.random() * 200) + 50
      break
  }

  cooldowns[m.sender] = Date.now()
  await conn.reply(m.chat, `Te diriges al *${lugarElegido}* y encuentras *${toNum(recompensa)}* ${moneda} 💸.`, m)
  user.coin += recompensa
}

handler.help = ['trabajar']
handler.tags = ['economy']
handler.command = ['kurogane']
handler.group = true
handler.register = true

export default handler

function toNum(number) {
  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(1) + 'k'
  } else if (number >= 1000000) {
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
