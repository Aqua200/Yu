/* Plugin para revisión de plugins corruptos (solo Termux), mejorado y decorado por Neykoors */

import { readdir } from 'fs/promises'
import path from 'path'
import { pathToFileURL } from 'url'
import os from 'os'

const handler = async (m, { conn }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.reply(m.chat, 'Este comando solo puede usarse desde el número principal del bot.', m)
  }

  if (os.platform() !== 'linux') {
    return conn.reply(m.chat, 'Este comando solo está disponible para entornos compatibles con Termux (Linux).', m)
  }

  const start = Date.now()
  await conn.reply(m.chat, '⛩️ Iniciando revisión de plugins corruptos en Termux... Por favor, espera.', m)
  m.react('🔎')

  const pluginsFolder = './plugins'
  let pluginFiles = []
  try {
    pluginFiles = await readdir(pluginsFolder)
  } catch (err) {
    return conn.reply(m.chat, 'Error al leer la carpeta de plugins.', m)
  }

  let corruptos = []
  let revisados = 0

  for (const file of pluginFiles) {
    if (file.endsWith('.js') || file.endsWith('.mjs')) {
      revisados++
      try {
        const filePath = path.join(pluginsFolder, file)
        await import(pathToFileURL(filePath))
      } catch (e) {
        corruptos.push(`• ${file}`)
      }
    }
  }

  const correctos = revisados - corruptos.length
  const porcentaje = revisados > 0 ? ((correctos / revisados) * 100).toFixed(2) : '0'
  const tiempo = ((Date.now() - start) / 1000).toFixed(2)

  const encabezado = '╭━━━━━━⊰⛩️⊱━━━━━━╮\n*— 𝗥𝗘𝗩𝗜𝗦𝗜𝗢́𝗡 𝗗𝗘 𝗣𝗟𝗨𝗚𝗜𝗡𝗦 —*\n╰━━━━━━⊰⛩️⊱━━━━━━╯\n'

  if (corruptos.length === 0) {
    m.react('✅')
    return conn.reply(m.chat, `${encabezado}\n✅ *Revisión completada (Termux)*:\n\n• Plugins revisados: ${revisados}\n• Sin errores encontrados.\n• Estado: 100% Correcto\n• Tiempo: ${tiempo} segundos\n\n⛩️ Todo en orden, maestro.`, m)
  } else {
    m.react('⚠️')
    return conn.reply(m.chat, `${encabezado}\n⚠️ *Revisión completada con errores (Termux)*:\n\n• Plugins revisados: ${revisados}\n• Correctos: ${correctos}\n• Corruptos: ${corruptos.length}\n• Porcentaje de éxito: ${porcentaje}%\n• Tiempo: ${tiempo} segundos\n\n*Plugins corruptos detectados:*\n${corruptos.join('\n')}\n\n⛩️ Por favor, revisa estos archivos, maestro.`, m)
  }
}

handler.help = ['detectar']
handler.tags = ['owner']
handler.command = ['detectar']
handler.rowner = true

export default handler
