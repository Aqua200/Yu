let cooldowns = {}

let handler = async (m, { conn, isPrems }) => {
  let user = global.db.data.users[m.sender]
  let tiempo = 5 * 60

  // Verificar cooldown
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    const tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `🌙✨ 𓆩 𝑲𝒖𝒓𝒐𝒈𝒂𝒏𝒆 𓆪 ✨🌙\n\n⚠️ Debes esperar *${tiempo2}* para volver a explorar.`, m)
    return
  }

  // Definir los lugares y sus posibles situaciones
  const lugares = [
    {
      nombre: 'Bosque encantado 🌲',
      imagen: 'https://files.catbox.moe/rh5vun.jpeg',
      situaciones: [
        { descripcion: 'Te adentras en el espeso bosque y hallas un antiguo amuleto con grabados místicos.', recompensa: 150 },
        { descripcion: 'Explorando, descubres una cueva secreta donde descansa una espada legendaria.', recompensa: 200 },
        { descripcion: 'Encuentras una fuente cristalina que refleja un misterioso futuro.', recompensa: 100 }
      ]
    },
    {
      nombre: 'Mazmorra olvidada 🏰',
      imagen: 'https://files.catbox.moe/fu141j.jpeg',
      situaciones: [
        { descripcion: 'Bajas a la sombría mazmorra y hallas una espada oxidada con un aura peculiar.', recompensa: 250 },
        { descripcion: 'Resuelves un enigma antiguo y descubres un tesoro oculto.', recompensa: 300 },
        { descripcion: 'Una sombra te ofrece un pacto de poder... a cambio de algo valioso.', recompensa: 50 }
      ]
    },
    {
      nombre: 'Zona de descanso 🍵',
      imagen: 'https://files.catbox.moe/6rxmls.jpeg',
      situaciones: [
        { descripcion: 'Te relajas y encuentras una carta con un mensaje enigmático.', recompensa: 80 },
        { descripcion: 'Un anciano te narra historias antiguas y te otorga un pequeño obsequio.', recompensa: 120 },
        { descripcion: 'Descubres una planta rara con propiedades curativas.', recompensa: 60 }
      ]
    }
  ]

  // Elegir aleatoriamente un lugar y una situación
  const lugarElegido = pickRandom(lugares)
  const situacionElegida = pickRandom(lugarElegido.situaciones)

  // Actualizar el cooldown
  cooldowns[m.sender] = Date.now()

  // Enviar la imagen con el mensaje decorado
  await conn.sendFile(
    m.chat, 
    lugarElegido.imagen, 
    'aventura.jpg', 
    `╭━━━ ∘◦ ✦ ◦∘ ━━━╮\n` +
    `  𓆩 𝑲𝒖𝒓𝒐𝒈𝒂𝒏𝒆 𓆪\n` +
    `╰━━━ ∘◦ ✦ ◦∘ ━━━╯\n\n` +
    `🏯 Has explorado *${lugarElegido.nombre}* y hallado:\n` +
    `💰 *${toNum(situacionElegida.recompensa)}* ${moneda}\n\n` +
    `📜 ${situacionElegida.descripcion}\n\n` +
    `🔮 ¿Volverás a la aventura?`,
    m
  )
  
  // Actualizar el saldo del usuario
  user.coin += situacionElegida.recompensa
}

handler.help = ['kurogane']
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
