let cooldowns = {}
let moneda = '¥' // Emoji de moneda (puedes cambiarlo)

let handler = async (m, { conn, isPrems }) => {
  let user = global.db.data.users[m.sender]
  let tiempo = 15 * 60 // 5 minutos de cooldown base

  // ==================== [ MEJORA #4: ENERGÍA ] ====================
  user.energia = user.energia || 10 // Energía máxima: 10
  if (user.energia <= 0) {
    return conn.reply(m.chat, 
      `🌙✨ 𓆩 𝑲𝒖𝒓𝒐𝒈𝒂𝒏𝒆 𓆪 ✨🌙\n\n` +
      `⚠️ *¡Sin energía!*\n` +
      `Descansa y vuelve mañana.`, 
    m)
  }

  // ==================== [ COOLDOWN ] ====================
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    const tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    return conn.reply(m.chat, 
      `🌙✨ 𓆩 𝑲𝒖𝒓𝒐𝒈𝒂𝒏𝒆 𓆪 ✨🌙\n\n` +
      `⚠️ Espera *${tiempoRestante}* para explorar de nuevo.`, 
    m)
  }

  // ==================== [ EVENTO DE COLABORACIÓN (100%) ] ====================
  const personajesColaboracion = [
    {
      nombre: 'Rudy Greyrat',
      imagen: 'https://files.catbox.moe/78uoi5.jpg', // URL de la imagen de Rudeus
      situaciones: [
        { descripcion: 'La familia Greyrat ha sido teletransportada a Kurogane. Ayúdales a orientarse y obtendrás su apoyo.', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 },
        { descripcion: 'Rudeus te ayuda a encontrar un objeto mágico raro. Recibes una recompensa por tu ayuda.', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 },
        { descripcion: 'Rudeus comparte sus conocimientos mágicos contigo. ¡Estás más cerca de dominar un hechizo poderoso!', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 }
      ]
    },
    {
      nombre: 'Paul Greyrat',
      imagen: 'https://files.catbox.moe/q3xgzm.jpg', // URL de la imagen de Paul
      situaciones: [
        { descripcion: 'Paul Greyrat llega a Kurogane con una misión. Ayúdalo a volver a su mundo y recibirás una recompensa significativa.', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 },
        { descripcion: 'El entrenamiento de Paul es intenso, pero si lo sigues, te dará su bendición y una recompensa.', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 }
      ]
    },
    {
      nombre: 'Zenith Greyrat',
      imagen: 'https://files.catbox.moe/2zkp0g.jpg', // URL de la imagen de Zenith
      situaciones: [
        { descripcion: 'Zenith Greyrat es teletransportada a Kurogane. Ayúdala con sus tareas y obtendrás un generoso pago.', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 },
        { descripcion: 'Zenith cocina para ti una deliciosa comida. Es una receta secreta que te llena de energía.', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 }
      ]
    },
    {
      nombre: 'Lilia Greyrat',
      imagen: 'https://files.catbox.moe/h27smp.jpg', // URL de la imagen de Lilia
      situaciones: [
        { descripcion: 'Lilia Greyrat, sorprendida por el entorno, te pide ayuda para entender cómo funcionan las cosas en Kurogane. Como agradecimiento, te da una recompensa.', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 },
        { descripcion: 'Lilia te pide que la acompañes en una misión secreta. Si tienes éxito, serás recompensado generosamente.', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 }
      ]
    },
    {
      nombre: 'Roxy Migurdia',
      imagen: 'https://files.catbox.moe/9su3lk.jpg', // URL de la imagen de Roxy
      situaciones: [
        { descripcion: 'Roxy está buscando un antiguo artefacto mágico. Ayúdala a encontrarlo y obtendrás una recompensa.', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 },
        { descripcion: 'Roxy te ofrece enseñarte un hechizo avanzado a cambio de tu ayuda. Recibes una recompensa por tu esfuerzo.', recompensa: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 }
      ]
    }
  ]

  // Elegir un personaje aleatorio
  const personajeElegido = pickRandom(personajesColaboracion)
  const situacionElegida = pickRandom(personajeElegido.situaciones)

  // ==================== [ MEJORA #7: BENEFICIO PREMIUM (+30%) ] ====================
  if (isPrems) {
    situacionElegida.recompensa = Math.floor(situacionElegida.recompensa * 1.3)
  }

  // ==================== [ MENSAJE DE FELICIDAD ] ====================
  let mensaje = `🎉✨ *¡Felicidades! Has tocado la colaboración de ${personajeElegido.nombre}* ✨🎉\n\n` +
                `🏯 *Colaboración: ${personajeElegido.nombre}*\n` +
                `📜 ${situacionElegida.descripcion}\n\n` +
                `💰 *${toNum(situacionElegida.recompensa)}* ${moneda}\n` +
                `⚡ Energía: ${user.energia}/10\n` +
                `✨ EXP: ${user.exp || 0}/${expNecesaria} (Nvl ${user.level || 1})`

  // Actualizaciones finales
  cooldowns[m.sender] = Date.now()
  user.energia -= 1
  user.coin += situacionElegida.recompensa

  // ==================== [ COOLDOWN & EXP ] ====================
  user.exp = (user.exp || 0) + Math.floor(Math.random() * 15) + 5

  // Establecer expNecesaria después de la actualización de exp
  let expNecesaria = 100 * (user.level || 1) // Inicializar expNecesaria correctamente
  let nivelUp = user.exp >= expNecesaria

  if (nivelUp) {
    user.level = (user.level || 0) + 1
    user.exp = 0
    conn.sendMessage(m.chat, { 
      text: `🎉 *¡Felicidades! Subiste al nivel ${user.level}*`, 
      contextInfo: { mentionedJid: [m.sender] } 
    })
  }

  // Enviar imagen directamente desde la URL
  await conn.sendFile(m.chat, personajeElegido.imagen, null, mensaje, m)

  // ==================== [ FUNCIONES AUXILIARES ] ====================
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
}

handler.help = ['kurogane']
handler.tags = ['economy']
handler.command = ['kurogane']
handler.group = true
export default handler
