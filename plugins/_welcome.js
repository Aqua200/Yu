import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

// Configura las rutas para Termux
const HOME_DIR = process.env.HOME || '/data/data/com.termux/files/home'
const BOT_DIR = path.join(HOME_DIR, 'whatsapp-bot')

// Asegúrate de que existan las carpetas necesarias
if (!fs.existsSync(BOT_DIR)) {
  fs.mkdirSync(BOT_DIR, { recursive: true })
}

// Configura mensajes predeterminados si no existen
if (!global.welcom1) global.welcom1 = '👋 ¡Bienvenido/a al grupo!'
if (!global.welcom2) global.welcom2 = '👋 ¡Hasta pronto!'

// Asegúrate de que la base de datos exista
if (!global.db) {
  global.db = {
    data: {
      chats: {}
    }
  }
}

// Función para verificar si el chat existe en la base de datos
const ensureChatExists = (chatId) => {
  if (!global.db.data.chats[chatId]) {
    global.db.data.chats[chatId] = {
      welcome: true // Habilitado por defecto
    }
  }
  return global.db.data.chats[chatId]
}

// Función para obtener imagen de perfil con manejo de errores mejorado
const getProfilePicture = async (jid) => {
  try {
    return await conn.profilePictureUrl(jid, 'image')
  } catch (error) {
    console.log(`Error al obtener foto de perfil: ${error.message}`)
    return 'https://files.catbox.moe/xr2m6u.jpg' // Imagen por defecto
  }
}

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0

  try {
    let who = m.messageStubParameters[0]
    let taguser = `@${who.split('@')[0]}`
    let chat = ensureChatExists(m.chat)
    
    // Obtener imagen de perfil con reintentos
    let retries = 0
    let pp = null
    
    while (retries < 3 && !pp) {
      try {
        pp = await getProfilePicture(who)
        break
      } catch (error) {
        retries++
        console.log(`Reintento ${retries} para obtener foto de perfil`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1 segundo antes de reintentar
      }
    }
    
    // Si después de los reintentos no se pudo obtener, usar imagen por defecto
    if (!pp) pp = 'https://files.catbox.moe/xr2m6u.jpg'
    
    // Obtener buffer de imagen con manejo de errores
    let img
    try {
      const response = await fetch(pp)
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
      img = await response.buffer()
    } catch (error) {
      console.log(`Error al descargar imagen: ${error.message}`)
      // Usar una imagen local de respaldo si está disponible
      const backupImagePath = path.join(BOT_DIR, 'default_profile.jpg')
      if (fs.existsSync(backupImagePath)) {
        img = fs.readFileSync(backupImagePath)
      } else {
        // Si no hay imagen local, usar texto sin imagen
        img = null
      }
    }

    // Manejar diferentes tipos de eventos
    if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      let groupName = groupMetadata?.subject || 'este grupo'
      let bienvenida = `❀ *Bienvenido* a ${groupName}\n ✰ ${taguser}\n${global.welcom1}\n •(=^●ω●^=)• Disfruta tu estadía en el grupo!\n> ✐ Puedes usar *#help* para ver la lista de comandos.`
      
      if (img) {
        await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] })
      } else {
        await conn.sendMessage(m.chat, { text: bienvenida, mentions: [who] })
      }
    }
       
    if (chat.welcome && (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || 
                         m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE)) {
      let groupName = groupMetadata?.subject || 'este grupo'
      let bye = `❀ *Adiós* de ${groupName}\n ✰ ${taguser}\n${global.welcom2}\n •(=^●ω●^=)• Te esperamos pronto!\n> ✐ Puedes usar *#help* para ver la lista de comandos.`
      
      if (img) {
        await conn.sendMessage(m.chat, { image: img, caption: bye, mentions: [who] })
      } else {
        await conn.sendMessage(m.chat, { text: bye, mentions: [who] })
      }
    }
    
  } catch (error) {
    console.log(`Error en función before: ${error.message}`)
    // Registra el error para depuración
    fs.appendFileSync(
      path.join(BOT_DIR, 'error.log'),
      `[${new Date().toISOString()}] ${error.message}\n${error.stack}\n\n`
    )
  }
  
  return !0
}
