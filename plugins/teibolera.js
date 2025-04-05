let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)

  // Tiempo de espera reducido (3 minutos) para más ganancias
  let tiempo = 3 * 60
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    m.reply(`⏳ ${senderName}, el *Club VIP* está lleno... Vuelve en *${tiempo2}* para otro show.`)
    return
  }
  cooldowns[m.sender] = Date.now()

  // Montos aumentados (en yenes ¥)
  let minAmount = 5000 // ¥ (equivalente a ~$50 USD)
  let maxAmount = 30000 // ¥ (equivalente a ~$300 USD)
  let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount

  // Sistema de "Suerte" basado en reputación (gana hasta 3x más)
  let userRep = users[senderId].rep || 1
  let luckMultiplier = 1 + (Math.random() * userRep * 0.3) // Hasta 3x con reputación alta
  let finalAmount = Math.floor(amountTaken * luckMultiplier)

  // Cliente VIP (20% de probabilidad)
  let isVipClient = Math.random() < 0.2
  if (isVipClient) finalAmount *= 2

  // Tipos de shows premium
  let randomOption = Math.floor(Math.random() * 5)
  switch (randomOption) {
    case 0: // Show en el pole
      users[senderId].money += finalAmount
      conn.reply(m.chat,
        `💎 *POLE DANCE VIP* 💎\n` +
        `▸ Movimientos profesionales\n` +
        `▸ ${isVipClient ? '✨ CLIENTE MILLONARIO ✨' : ''}\n` +
        `▸ Ganaste: *¥${finalAmount.toLocaleString()}*\n` +
        `${luckMultiplier > 1.5 ? `🏆 BONUS: x${luckMultiplier.toFixed(1)} (Reputación)` : ''}`, m)
      break

    case 1: // Privado con champán
      let bonusChampagne = Math.floor(finalAmount * 1.5)
      users[senderId].money += bonusChampagne
      conn.reply(m.chat,
        `🍾 *PRIVADO CON CHAMPÁN* 🥂\n` +
        `▸ Botella de Dom Pérignon\n` +
        `▸ Propina extra: *¥${(bonusChampagne - finalAmount).toLocaleString()}*\n` +
        `▸ Total: *¥${bonusChampagne.toLocaleString()}*`, m)
      break

    case 2: // Show grupal
      let groupEarnings = finalAmount * 3
      users[senderId].money += groupEarnings
      conn.reply(m.chat,
        `👯‍♀️ *SHOW GRUPAL* 💃\n` +
        `▸ 5 clientes embobados\n` +
        `▸ Lluvia de billetes: *¥${groupEarnings.toLocaleString()}*`, m)
      break

    case 3: // Contrato exclusivo (¡Máximas ganancias!)
      let contractMoney = finalAmount * 5
      users[senderId].money += contractMoney
      conn.reply(m.chat,
        `📜 *CONTRATO EXCLUSIVO* 💵\n` +
        `▸ 1 semana de shows privados\n` +
        `▸ Adelanto: *¥${contractMoney.toLocaleString()}*\n` +
        `🚨 ¡NUEVO RÉCORD!`, m)
      break

    case 4: // Mal día (solo 10% de probabilidad de perder)
      if (Math.random() < 0.1) {
        let smallPenalty = Math.floor(finalAmount * 0.2)
        users[senderId].money -= smallPenalty
        conn.reply(m.chat,
          `🌧️ *DÍA TRISTE* 😢\n` +
          `▸ Solo 2 clientes\n` +
          `▸ Multa por llegar tarde: *-¥${smallPenalty.toLocaleString()}*`, m)
      } else {
        // En vez de perder, gana normal
        users[senderId].money += finalAmount
        conn.reply(m.chat,
          `💃 *SHOW ESTÁNDAR* 💵\n` +
          `▸ Ganancia mínima: *¥${finalAmount.toLocaleString()}*`, m)
      }
      break
  }

  // Aumentar reputación cada 5 shows
  if (!users[senderId].showCount) users[senderId].showCount = 0
  users[senderId].showCount++
  if (users[senderId].showCount % 5 === 0) {
    users[senderId].rep = (users[senderId].rep || 0) + 1
    conn.sendMessage(m.chat, {
      text: `🌟 *¡NUEVO NIVEL!* 🌟\n▸ Reputación: ${users[senderId].rep}\n▸ Ahora ganas más yenes en cada show!`
    }, { quoted: m })
  }

  global.db.write()
}

handler.tags = ['rpg']
handler.help = ['teibol']
handler.command = ['teibol', 'clubvip', '夜の仕事'] // "夜の仕事" = "Trabajo nocturno" en japonés
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
  let minutos = Math.floor(segundos / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minuto${minutos !== 1 ? 's' : ''} y ${segundosRestantes} segundo${segundosRestantes !== 1 ? 's' : ''}`
}
