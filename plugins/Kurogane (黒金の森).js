let cooldowns = {}

let handler = async (m, { conn, isPrems }) => {
  let user = global.db.data.users[m.sender]
  let tiempo = 5 * 60

  // Verificar cooldown
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    const tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `${emoji3} Debes esperar *${tiempo2}* para usar *#kurogane* de nuevo.`, m)
    return
  }

  // Definir los lugares y sus posibles situaciones
  const lugares = [
    {
      nombre: 'Bosque',
      imagen: 'https://files.catbox.moe/rh5vun.jpeg',
      situaciones: [
        { descripcion: 'Te adentras en el espeso bosque y encuentras un antiguo amuleto.', recompensa: 150 },
        { descripcion: 'Mientras exploras, descubres una cueva secreta que contiene una espada legendaria.', recompensa: 200 },
        { descripcion: 'Encuentras una fuente cristalina que te otorga una visión del futuro.', recompensa: 100 }
      ]
    },
    {
      nombre: 'Mazmorra',
      imagen: 'https://files.catbox.moe/fu141j.jpeg',
      situaciones: [
        { descripcion: 'Bajas a la sombría mazmorra y encuentras una espada oxidada, pero con un brillo peculiar.', recompensa: 250 },
        { descripcion: 'Te enfrentas a un enigma antiguo y, al resolverlo, descubres un tesoro escondido.', recompensa: 300 },
        { descripcion: 'Una sombra misteriosa te ofrece un pacto a cambio de poder, pero a un precio.', recompensa: 50 }
      ]
    },
    {
      nombre: 'Zona de descanso',
      imagen: 'https://files.catbox.moe/6rxmls.jpeg',
      situaciones: [
        { descripcion: 'Te relajas en la zona de descanso y encuentras una misteriosa carta con un mensaje críptico.', recompensa: 80 },
        { descripcion: 'Un anciano te cuenta historias que te otorgan sabiduría y una pequeña recompensa.', recompensa: 120 },
        { descripcion: 'Mientras descansas, descubres una planta rara con propiedades curativas.', recompensa: 60 }
      ]
    }
  ]

  // Elegir aleatoriamente un lugar y una situación
  const lugarElegido = pickRandom(lugares)
  const situacionElegida = pickRandom(lugarElegido.situaciones)

  // Actualizar el cooldown
  cooldowns[m.sender] = Date.now()

  // Enviar la respuesta al usuario
  await conn.reply(m.chat, `Fuiste al *${lugarElegido.nombre}* y encontraste *${toNum(situacionElegida.recompensa)}* ${moneda} 💸.\n\n${situacionElegida.descripcion}\n\n![Imagen](${lugarElegido.imagen})`, m)
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
