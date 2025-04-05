import { WAMessageStubType } from '@whiskeysockets/baileys'

// Cache para imágenes de perfil (optimización de velocidad)
const ppCache = new Map()

/**
 * Obtiene la imagen de perfil con cache
 * @param {string} chatId - ID del chat
 * @param {object} conn - Conexión de WhatsApp
 * @returns {Promise<string>} URL de la imagen
 */
const getProfilePicture = async (chatId, conn) => {
  if (ppCache.has(chatId)) return ppCache.get(chatId)
  
  const pp = await conn.profilePictureUrl(chatId, 'image').catch(() => null) 
    || 'https://files.catbox.moe/xr2m6u.jpg'
  
  // Almacenar en cache por 1 hora
  ppCache.set(chatId, pp)
  setTimeout(() => ppCache.delete(chatId), 3600000)
  
  return pp
}

// Plantillas de mensajes predefinidas (optimización)
const actionTemplates = {
  // Cambio de nombre del grupo
  21: (params, usuario) => ({
    text: `《✦》${usuario} cambió el nombre del grupo a:\n\n> *${params[0] || 'Sin nombre'}*`,
    mentions: [usuario]
  }),
  
  // Cambio de imagen del grupo
  22: async (params, usuario, m, conn) => ({
    image: { url: await getProfilePicture(m.chat, conn) },
    caption: `《✦》${usuario} actualizó la imagen del grupo`,
    mentions: [usuario]
  }),
  
  // Restablecimiento de enlace
  23: (params, usuario) => ({
    text: `《✦》${usuario} restableció el enlace del grupo`,
    mentions: [usuario]
  }),
  
  // Restricción de edición
  25: (params, usuario) => ({
    text: `《✦》${usuario} ${params[0] === 'on' ? 'restringió' : 'permitió'} editar el grupo a ${params[0] === 'on' ? 'admins' : 'todos'}`,
    mentions: [usuario]
  }),
  
  // Grupo cerrado/abierto
  26: (params, usuario) => ({
    text: `《✦》El grupo fue ${params[0] === 'on' ? 'cerrado' : 'abierto'} por ${usuario}`,
    mentions: [usuario]
  }),
  
  // Promoción a admin
  29: (params, usuario) => ({
    text: `《✦》${usuario} promovió a admin a @${params[0]?.split('@')[0] || 'usuario'}`,
    mentions: [usuario, params[0]].filter(Boolean)
  }),
  
  // Remoción de admin
  30: (params, usuario) => ({
    text: `《✦》${usuario} removió los privilegios de admin a @${params[0]?.split('@')[0] || 'usuario'}`,
    mentions: [usuario, params[0]].filter(Boolean)
  })
}

const handler = m => m

handler.before = async function (m, { conn }) {
  // Validaciones rápidas (optimizadas para velocidad)
  if (!m?.messageStubType || !m?.key?.remoteJid?.endsWith('@g.us')) return
  
  // Verificar si la detección está activa para este chat
  const chat = global.db.data.chats?.[m.chat]
  if (!chat?.detect) return

  // Obtener información básica del remitente (optimizado)
  const sender = m.sender.split('@')[0]
  const usuario = `@${sender}`

  // Obtener la plantilla correspondiente al evento
  const template = actionTemplates[m.messageStubType]
  if (!template) {
    // Log solo para eventos no manejados (excepto tipo 2)
    if (m.messageStubType !== 2) {
      console.log('Evento no manejado:', WAMessageStubType[m.messageStubType])
    }
    return
  }

  try {
    // Generar configuración del mensaje
    const messageConfig = await (typeof template === 'function' 
      ? template(m.messageStubParameters, usuario, m, conn) 
      : template)
    
    // Enviar mensaje con optimizaciones
    await conn.sendMessage(
      m.chat,
      messageConfig,
      { 
        quoted: m, 
        background: true, // No esperar confirmación
        ephemeralExpiration: 86400 // Opcional: mensaje efímero
      }
    )
  } catch (error) {
    console.error('Error en _autodetect:', error)
    // Opcional: reintentar o notificar el error
  }
}

export default handler
