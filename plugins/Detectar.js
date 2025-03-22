/* Plugin para revisar plugins corruptos solo en Termux Android — creado por @Fabri115, mejorado por ChatGPT */

import { readdir, readFile, access } from 'fs/promises'
import path from 'path'
import os from 'os'
import { constants } from 'fs'

const handler = async (m, { conn }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.reply(m.chat, 'Este comando solo puede usarse desde el número principal del bot.', m)
  }

  // Validar que sea Termux en un teléfono Android
  if (os.platform() !== 'linux') {
    return conn.reply(m.chat, 'Este comando solo funciona en Termux de teléfonos Android.', m)
  }

  try {
    await access('/data/data/com.termux/', constants.F_OK)
  } catch {
    return conn.reply(m.chat, 'Este comando solo funciona en Termux de teléfonos Android.', m)
  }

  const start = Date.now()
  await conn.reply(m.chat, '⛩️ Iniciando revisión de plugins corruptos en Termux Android... Por favor, espera.', m)
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
        const contenido = await readFile(filePath, 'utf-8')
        new Function(contenido) // Verifica sintaxis sin ejecutar el plugin
      } catch (e) {
        corruptos.push(`• ${file} — ${e.name}: ${e.message}`)
      }
    }
  }

  const correctos = revisados - corruptos.length
  const porcentaje = revisados > 0 ? ((correctos / revisados) * 100).toFixed(2) : '0'
  const tiempo = ((Date.now() - start) / 1000).toFixed(2)

  const encabezado = '╭━━━━━━⊰⛩️⊱━━━━━━╮\n*— 𝗥𝗘𝗩𝗜𝗦𝗜𝗢́𝗡 𝗗𝗘 𝗣𝗟𝗨𝗚𝗜𝗡𝗦 —*\n╰━━━━━━⊰⛩️⊱━━━━━━╯\n'

  if (corruptos.length === 0) {
    m.react('✅')
    return conn.reply(m.chat, `${encabezado}\n✅ *Revisión completada (Termux Android)*:\n\n• Plugins revisados: ${revisados}\n• Sin errores encontrados.\n• Estado: 100% Correcto\n• Tiempo: ${tiempo} segundos\n\n⛩️ Todo en orden, maestro.`, m)
  } else {
    m.react('⚠️')
    return conn.reply(m.chat, `${encabezado}\n⚠️ *Revisión completada con errores (Termux Android)*:\n\n• Plugins revisados: ${revisados}\n• Correctos: ${correctos}\n• Corruptos: ${corruptos.length}\n• Porcentaje de éxito: ${porcentaje}%\n• Tiempo: ${tiempo} segundos\n\n*Plugins corruptos detectados:*\n${corruptos.join('\n')}\n\n⛩️ Por favor, revisa estos archivos, maestro.`, m)
  }
}

handler.help = ['detectar']
handler.tags = ['owner']
handler.command = ['detectar']
handler.rowner = true

export default handler
