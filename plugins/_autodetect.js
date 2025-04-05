import { WAMessageStubType } from '@whiskeysockets/baileys'

// Cache mejorado con tamaño límite y tiempo de vida
class EnhancedCache {
  constructor(maxSize = 500, ttl = 3600000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    // Verificar expiración
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    return item.value
  }

  set(key, value) {
    // Limpiar si alcanzamos el límite
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    })
  }

  delete(key) {
    this.cache.delete(key)
  }
}

const ppCache = new EnhancedCache()

/**
 * Obtiene la imagen de perfil con cache mejorado
 * @param {string} chatId - ID del chat
 * @param {object} conn - Conexión de WhatsApp
 * @returns {Promise<string>} URL de la imagen
 */
const getProfilePicture = async (chatId, conn) => {
  const cached = ppCache.get(chatId)
  if (cached) return cached
  
  try {
    const pp = await conn.profilePictureUrl(chatId, 'image').catch(() => null) 
      || 'https://files.catbox.moe/xr2m6u.jpg'
    
    ppCache.set(chatId, pp)
    return pp
  } catch (error) {
    console.error('Error al obtener imagen de perfil:', error)
    return 'https://files.catbox.moe/xr2m6u.jpg'
  }
}

// Plantillas mejoradas con soporte para internacionalización
const actionTemplates = {
  // Participante agregado/eliminado
  [WAMessageStubType.GROUP_PARTICIPANT_ADD]: (params, usuario) => ({
    text: `《✦》${usuario} agregó a @${params[1]?.split('@')[0] || 'un usuario'}`,
    mentions: [usuario, params[1]].filter(Boolean)
  }),
  
  [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]: (params, usuario) => ({
    text: `《✦》${usuario} eliminó a @${params[1]?.split('@')[0] || 'un usuario'}`,
    mentions: [usuario, params[1]].filter(Boolean)
  }),

  // Cambio de nombre del grupo
  [WAMessageStubType.GROUP_CHANGE_SUBJECT]: (params, usuario) => ({
    text: `《✦》${usuario} cambió el nombre del grupo a:\n\n> *${params[0] || 'Sin nombre'}*`,
    mentions: [usuario]
  }),
  
  // Cambio de imagen del grupo
  [WAMessageStubType.GROUP_CHANGE_ICON]: async (params, usuario, m, conn) => ({
    image: { url: await getProfilePicture(m.chat, conn) },
    caption: `《✦》${usuario} actualizó la imagen del grupo`,
    mentions: [usuario]
  }),
  
  // Restablecimiento de enlace
  [WAMessageStubType.GROUP_CHANGE_INVITE_LINK]: (params, usuario) => ({
    text: `《✦》${usuario} restableció el enlace del grupo`,
    mentions: [usuario]
  }),
  
  // Restricción de edición
  [WAMessageStubType.GROUP_CHANGE_ANNOUNCE]: (params, usuario) => ({
    text: `《✦》${usuario} ${params[0] === 'on' ? 'restringió' : 'permitió'} editar el grupo a ${params[0] === 'on' ? 'admins' : 'todos'}`,
    mentions: [usuario]
  }),
  
  // Grupo cerrado/abierto
  [WAMessageStubType.GROUP_CHANGE_RESTRICT]: (params, usuario) => ({
    text: `《✦》El grupo fue ${params[0] === 'on' ? 'cerrado' : 'abierto'} por ${usuario}`,
    mentions: [usuario]
  }),
  
  // Promoción a admin
  [WAMessageStubType.GROUP_PARTICIPANT_PROMOTE]: (params, usuario) => ({
    text: `《✦》${usuario} promovió a admin a @${params[0]?.split('@')[0] || 'usuario'}`,
    mentions: [usuario, params[0]].filter(Boolean)
  }),
  
  // Remoción de admin
  [WAMessageStubType.GROUP_PARTICIPANT_DEMOTE]: (params, usuario) => ({
    text: `《✦》${usuario} removió los privilegios de admin a @${params[0]?.split('@')[0] || 'usuario'}`,
    mentions: [usuario, params[0]].filter(Boolean)
  }),
  
  // Cambio de descripción
  [WAMessageStubType.GROUP_CHANGE_DESCRIPTION]: (params, usuario) => ({
    text: `《✦》${usuario} actualizó la descripción del grupo:\n\n${params[0] || 'Sin descripción'}`,
    mentions: [usuario]
  }),
  
  // Configuración de mensajes temporales
  [WAMessageStubType.GROUP_CHANGE_TEMP]: (params, usuario) => ({
    text: `《✦》${usuario} ${params[0] === 'on' ? 'activó' : 'desactivó'} los mensajes temporales`,
    mentions: [usuario]
  })
}

const handler = m => m

handler.before = async function (m, { conn }) {
  // Validación mejorada
  if (!m?.messageStubType || !m?.key?.remoteJid || !m.chat?.endsWith('@g.us')) {
    return
  }

  try {
    // Verificar si la detección está activa para este chat
    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat?.detect) return

    // Obtener información del remitente de forma segura
    const sender = m.sender?.split('@')[0] || 'unknown'
    const usuario = `@${sender}`
    
    // Usar nombres de constantes en lugar de números mágicos
    const template = actionTemplates[m.messageStubType]
    if (!template) {
      console.log('Evento no manejado:', WAMessageStubType[m.messageStubType] || m.messageStubType)
      return
    }

    // Generar configuración del mensaje
    const messageConfig = await (typeof template === 'function' 
      ? template(m.messageStubParameters, usuario, m, conn) 
      : template)
    
    // Enviar mensaje con manejo de errores
    await conn.sendMessage(
      m.chat,
      messageConfig,
      { 
        quoted: m,
        ephemeralExpiration: 86400
      }
    ).catch(e => console.error('Error al enviar mensaje de detección:', e))

  } catch (error) {
    console.error('Error crítico en el handler de detección:', error)
    // Opcional: notificar a los administradores del bot
  }
}

export default handler
