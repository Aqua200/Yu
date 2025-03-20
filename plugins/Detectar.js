/* Plugin para revisión de errores de sintaxis hecho por @Fabri115, mejorado por BrunoSobrino y adaptado por ChatGPT */

import { readdir } from 'fs/promises'
import path from 'path'
import { pathToFileURL } from 'url'

var handler = async (m, { conn }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.reply(m.chat, 'Este comando solo puede usarse desde el número principal del bot.', m)
  }

  await conn.reply(m.chat, 'Revisando plugins en busca de errores de sintaxis, por favor espera...', m)
  m.react('⏳')

  const pluginsFolder = './plugins'
  let pluginFiles = []
  try {
    pluginFiles = await readdir(pluginsFolder)
  } catch (err) {
    return conn.reply(m.chat, 'Error al leer la carpeta de plugins.', m)
  }

  let errors = []

  for (const file of pluginFiles) {
    if (file.endsWith('.js') || file.endsWith('.mjs')) {
      try {
        const filePath = path.join(pluginsFolder, file)
        await import(pathToFileURL(filePath))
      } catch (e) {
        errors.push(`• ${file} — ${e.name}: ${e.message}`)
      }
    }
  }

  if (errors.length === 0) {
    m.react('✅')
    return conn.reply(m.chat, 'Revisión completa: no se encontraron errores de sintaxis en los plugins.', m)
  } else {
    m.react('⚠️')
    return conn.reply(m.chat, `Se detectaron errores de sintaxis en los siguientes archivos:\n\n${errors.join('\n\n')}`, m)
  }
}

handler.help = ['detectar']
handler.tags = ['owner', 'fix']
handler.command = ['detectar']
handler.rowner = true

export default handler
