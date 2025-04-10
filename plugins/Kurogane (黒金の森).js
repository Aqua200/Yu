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

  // ==================== [ LUGARES & SITUACIONES ] ====================
  const lugares = [
    {
      nombre: 'Bosque encantado 🌲',
      imagen: 'https://files.catbox.moe/rh5vun.jpeg',
      situaciones: [
        { descripcion: 'Hallazgo: Un amuleto místico brilla entre las hojas.', recompensa: 150 },
        { descripcion: '¡Una espada legendaria yace en una cueva oculta!', recompensa: 200 },
        { descripcion: 'La fuente cristalina te muestra un futuro misterioso...', recompensa: 100 }
      ]
    },
    {
      nombre: 'Mazmorra olvidada 🏰',
      imagen: 'https://files.catbox.moe/fu141j.jpeg',
      situaciones: [
        { descripcion: 'Encuentras una espada oxidada con aura oscura.', recompensa: 250 },
        { descripcion: '¡Resuelves un enigma y abres un cofre dorado!', recompensa: 300 },
        { descripcion: 'Una sombra susurra: "¿Intercambiarías algo por poder?"', recompensa: 50 }
      ]
    }
  ]

  // ==================== [ MEJORA #6: COLABORACIÓN CON MUSHOKU TENSEI (89% de probabilidad) ] ====================
  if (Math.random() < 0.89) {
    lugares.push({
      nombre: 'Gremio de Aventureros 🏙️',
      imagen: 'https://files.catbox.moe/j3rtft.jpg',  // Imagen inspirada en el anime o de personajes
      situaciones: [
        { 
          descripcion: '¡Rudeus te invita a unirte al gremio y obtener una misión especial!', 
          recompensa: Math.floor(Math.random() * 11000) + 10000 // Recompensa entre 10,000 y 20,000 yenes
        },
        { 
          descripcion: '¡Una carta de Eris te da un nuevo conjunto de armaduras mágicas!', 
          recompensa: Math.floor(Math.random() * 11000) + 10000 // Recompensa entre 10,000 y 20,000 yenes
        },
        { 
          descripcion: '¡La sabiduría de Rudeus te ayuda a mejorar tu magia!', 
          recompensa: Math.floor(Math.random() * 11000) + 10000 // Recompensa entre 10,000 y 20,000 yenes
        }
      ]
    })
  }

  // ==================== [ MEJORA #3: EVENTO RARO (Eliminado el dragón dorado) ====================
  // El evento del Dragón Dorado ha sido eliminado.

  // Selección aleatoria
  const lugarElegido = pickRandom(lugares)
  const situacionElegida = pickRandom(lugarElegido.situaciones)

  // ==================== [ MEJORA #7: BENEFICIO PREMIUM (+30%) ] ====================
  if (isPrems) {
    situacionElegida.recompensa = Math.floor(situacionElegida.recompensa * 1.3)
  }

  // ==================== [ MEJORA #1: SISTEMA DE NIVELES ] ====================
  user.exp = (user.exp || 0) + Math.floor(Math.random() * 15) + 5
  let expNecesaria = 100 * (user.level || 1)
  let nivelUp = user.exp >= expNecesaria

  if (nivelUp) {
    user.level = (user.level || 0) + 1
    user.exp = 0
    conn.sendMessage(m.chat, { 
      text: `🎉 *¡Felicidades! Subiste al nivel ${user.level}*`, 
      contextInfo: { mentionedJid: [m.sender] } 
    })
  }

  // Actualizaciones finales
  cooldowns[m.sender] = Date.now()
  user.energia -= 1
  user.coin += situacionElegida.recompensa

  // ==================== [ MENSAJE FINAL ] ====================
  let mensaje = `✨ *¡Estás de suerte! Te tocó una colaboración especial con *Mushoku Tensei*!*\n\n` +
                `╭━━━ ∘◦ ✦ ◦∘ ━━━╮\n` +
                `  𓆩 𝑲𝒖𝒓𝒐𝒈𝒂𝒏𝒆 𓆪\n` +
                `╰━━━ ∘◦ ✦ ◦∘ ━━━╯\n\n` +
                `🏯 *${lugarElegido.nombre}*\n` +
                `📜 ${situacionElegida.descripcion}\n\n` +
                `💰 *${toNum(situacionElegida.recompensa)}* ${moneda}\n` +
                `⚡ Energía: ${user.energia}/10\n` +
                `✨ EXP: ${user.exp}/${expNecesaria} (Nvl ${user.level || 1})\n\n` +
                `👀 *Personaje de *Mushoku Tensei*:*`

  await conn.sendFile(m.chat, lugarElegido.imagen, 'rudeus.jpg', mensaje, m)
}

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

handler.help = ['kurogane']
handler.tags = ['economy']
handler.command = ['kurogane']
handler.group = true
export default handler
