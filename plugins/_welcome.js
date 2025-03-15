import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Mejora: Configuración más robusta de directorios
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HOME_DIR = process.env.HOME || '/data/data/com.termux/files/home'
const BOT_DIR = path.join(HOME_DIR, 'whatsapp-bot')
const LOG_DIR = path.join(BOT_DIR, 'logs')
const ASSETS_DIR = path.join(BOT_DIR, 'assets')
const DB_PATH = path.join(BOT_DIR, 'database.json')

// Mejora: Crear estructura de directorios completa
const createDirectories = () => {
  [BOT_DIR, LOG_DIR, ASSETS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

// Mejora: Sistema de logging mejorado
const logger = {
  info: (message) => {
    const logMessage = `[${new Date().toISOString()}] [INFO] ${message}\n`
    console.log(logMessage.trim())
    fs.appendFileSync(path.join(LOG_DIR, 'bot.log'), logMessage)
  },
  error: (message, error) => {
    const logMessage = `[${new Date().toISOString()}] [ERROR] ${message}\n${error?.stack || error}\n\n`
    console.error(logMessage.trim())
    fs.appendFileSync(path.join(LOG_DIR, 'error.log'), logMessage)
  },
  event: (eventType, chatId) => {
    const logMessage = `[${new Date().toISOString()}] [EVENT] Tipo: ${eventType}, Chat: ${chatId}\n`
    fs.appendFileSync(path.join(LOG_DIR, 'events.log'), logMessage)
  }
}

// Mejora: Función para cargar y guardar la base de datos
const loadDatabase = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
      global.db = { data }
    } else {
      global.db = { 
        data: {
          chats: {},
          users: {},
          settings: {
            welcomeMessage: '👋 ¡Bienvenido/a al grupo!',
            goodbyeMessage: '👋 ¡Hasta pronto!'
          }
        }
      }
      saveDatabase()
    }
  } catch (error) {
    logger.error('Error al cargar la base de datos', error)
    global.db = { 
      data: {
        chats: {},
        users: {},
        settings: {
          welcomeMessage: '👋 ¡Bienvenido/a al grupo!',
          goodbyeMessage: '👋 ¡Hasta pronto!'
        }
      }
    }
  }
}

const saveDatabase = () => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(global.db, null, 2))
    return true
  } catch (error) {
    logger.error('Error al guardar la base de datos', error)
    return false
  }
}

// Mejora: Inicialización de la base de datos y mensajes
const initialize = () => {
  createDirectories()
  loadDatabase()
  
  // Definir mensajes predeterminados desde la base de datos
  global.welcom1 = global.db.data.settings.welcomeMessage
  global.welcom2 = global.db.data.settings.goodbyeMessage
  
  // Guardar imagen predeterminada si no existe
  const defaultImagePath = path.join(ASSETS_DIR, 'default_profile.jpg')
  if (!fs.existsSync(defaultImagePath)) {
    // Aquí podrías descargar una imagen predeterminada o usar una incluida en tu proyecto
    // Por ahora usaremos un placeholder
    logger.info('La imagen predeterminada no existe. Se usará una URL como respaldo.')
  }
}

// Función para verificar si el chat existe en la base de datos
const ensureChatExists = (chatId) => {
  if (!global.db.data.chats[chatId]) {
    global.db.data.chats[chatId] = {
      welcome: true,
      antiLink: false,
      antiSpam: false,
      onlyAdmins: false,
      lastCommand: null,
      createdAt: new Date().toISOString()
    }
    saveDatabase()
  }
  return global.db.data.chats[chatId]
}

// Mejora: Obtener imagen de perfil con manejo avanzado de errores y cache
const getProfilePicture = async (conn, jid) => {
  // Implementar un sistema de caché para las fotos de perfil
  const cacheDir = path.join(ASSETS_DIR, 'profile_cache')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }
  
  const userId = jid.split('@')[0]
  const cachePath = path.join(cacheDir, `${userId}.jpg`)
  const cacheTime = 3600000 // 1 hora en milisegundos
  
  // Verificar si existe en caché y no está caducada
  if (fs.existsSync(cachePath)) {
    const stats = fs.statSync(cachePath)
    const now = new Date()
    const fileAge = now - stats.mtime
    
    if (fileAge < cacheTime) {
      logger.info(`Usando foto de perfil en caché para ${userId}`)
      return { 
        url: `file://${cachePath}`,
        buffer: fs.readFileSync(cachePath)
      }
    }
  }
  
  // Si no está en caché o está caducada, obtener de WhatsApp
  try {
    const url = await conn.profilePictureUrl(jid, 'image')
    
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
      
      const buffer = await response.buffer()
      
      // Guardar en caché
      fs.writeFileSync(cachePath, buffer)
      
      return { url, buffer }
    } catch (fetchError) {
      logger.error(`Error al descargar imagen de perfil: ${fetchError.message}`, fetchError)
      throw fetchError
    }
  } catch (error) {
    logger.error(`Error al obtener URL de foto de perfil: ${error.message}`, error)
    
    // Usar imagen predeterminada
    const defaultImagePath = path.join(ASSETS_DIR, 'default_profile.jpg')
    if (fs.existsSync(defaultImagePath)) {
      return {
        url: `file://${defaultImagePath}`,
        buffer: fs.readFileSync(defaultImagePath)
      }
    } else {
      return { 
        url: 'https://files.catbox.moe/xr2m6u.jpg',
        buffer: null
      }
    }
  }
}

// Mejora: Función para formatear mensajes con más opciones
const formatMessage = (template, data) => {
  let message = template
  
  Object.entries(data).forEach(([key, value]) => {
    message = message.replace(new RegExp(`{${key}}`, 'g'), value)
  })
  
  return message
}

// Mejora: Gestión de eventos más organizada
const handleMemberEvent = async (conn, m, groupMetadata) => {
  const chat = ensureChatExists(m.chat)
  if (!chat.welcome) return false
  
  const who = m.messageStubParameters?.[0]
  if (!who) return false
  
  const taguser = `@${who.split('@')[0]}`
  const username = (await conn.getName(who)) || taguser
  
  try {
    const profilePic = await getProfilePicture(conn, who)
    const groupName = groupMetadata?.subject || 'este grupo'
    
    const messageTemplates = {
      [WAMessageStubType.GROUP_PARTICIPANT_ADD]: formatMessage(
        `❀ *Bienvenido* a {groupName}\n ✰ {taguser}\n{welcomeMessage}\n •(=^●ω●^=)• Disfruta tu estadía!\n> ✐ Usa *#help* para ver los comandos.`,
        { 
          groupName, 
          taguser, 
          username,
          welcomeMessage: global.welcom1
        }
      ),
      [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]: formatMessage(
        `❀ *Adiós* de {groupName}\n ✰ {taguser}\n{goodbyeMessage}\n •(=^●ω●^=)• Te esperamos pronto!\n> ✐ Usa *#help* para ver los comandos.`,
        { 
          groupName, 
          taguser, 
          username,
          goodbyeMessage: global.welcom2
        }
      ),
      [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]: formatMessage(
        `❀ *Adiós* de {groupName}\n ✰ {taguser}\n{goodbyeMessage}\n •(=^●ω●^=)• Te esperamos pronto!\n> ✐ Usa *#help* para ver los comandos.`,
        { 
          groupName, 
          taguser, 
          username,
          goodbyeMessage: global.welcom2
        }
      )
    }
    
    const message = messageTemplates[m.messageStubType]
    if (!message) return false
    
    if (profilePic.buffer) {
      await conn.sendMessage(m.chat, { 
        image: profilePic.buffer, 
        caption: message, 
        mentions: [who] 
      })
    } else {
      // Intentar descargar la imagen si solo tenemos la URL
      try {
        const response = await fetch(profilePic.url)
        if (response.ok) {
          const buffer = await response.buffer()
          await conn.sendMessage(m.chat, { 
            image: buffer, 
            caption: message, 
            mentions: [who] 
          })
        } else {
          throw new Error('No se pudo descargar la imagen')
        }
      } catch (error) {
        // Enviar solo el mensaje de texto si no se puede obtener la imagen
        await conn.sendMessage(m.chat, { 
          text: message, 
          mentions: [who] 
        })
      }
    }
    
    logger.info(`Mensaje de ${m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD ? 'bienvenida' : 'despedida'} enviado en ${m.chat}`)
    return true
  } catch (error) {
    logger.error(`Error al enviar mensaje de ${m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD ? 'bienvenida' : 'despedida'}`, error)
    return false
  }
}

// Función principal mejorada
export async function before(m, { conn, participants, groupMetadata }) {
  try {
    // Asegurarse de que la base de datos está cargada
    if (!global.db || !global.db.data) {
      initialize()
    }
    
    // Registrar el evento
    if (m.messageStubType) {
      logger.event(m.messageStubType, m.chat)
    }
    
    if (!m.messageStubType || !m.isGroup) return true
    
    const relevantEvents = [
      WAMessageStubType.GROUP_PARTICIPANT_ADD,
      WAMessageStubType.GROUP_PARTICIPANT_REMOVE,
      WAMessageStubType.GROUP_PARTICIPANT_LEAVE
    ]
    
    if (!relevantEvents.includes(m.messageStubType)) return true
    
    await handleMemberEvent(conn, m, groupMetadata)
  } catch (error) {
    logger.error('Error general en función before', error)
  }
  
  return true
}

// Función para actualizar configuraciones
export async function updateSettings(newSettings) {
  if (!global.db || !global.db.data) {
    initialize()
  }
  
  global.db.data.settings = {
    ...global.db.data.settings,
    ...newSettings
  }
  
  global.welcom1 = global.db.data.settings.welcomeMessage
  global.welcom2 = global.db.data.settings.goodbyeMessage
  
  return saveDatabase()
}

// Inicialización automática
initialize()
