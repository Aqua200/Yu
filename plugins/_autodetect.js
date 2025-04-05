import { WAMessageStubType } from '@whiskeysockets/baileys'

const handler = m => m
handler.before = async function (m, { conn }) {
  // Validaciones iniciales reforzadas
  if (!m?.messageStubType || !m?.isGroup || !Array.isArray(m.messageStubParameters)) return
  
  const chat = global.db.data.chats?.[m.chat]
  if (!chat?.detect) return

  // Configuración base
  const sender = m.sender?.split('@')[0] || 'undefined'
  const usuario = `@${sender}`
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => null) 
          || 'https://files.catbox.moe/xr2m6u.jpg'

  // Plantillas de mensajes (podrían externalizarse para i18n)
  const actionTemplates = {
    21: (params) => `《✦》${usuario} cambió el nombre del grupo a:\n\n> *${params[0] || 'Sin nombre'}*`,
    22: (params) => ({ 
      image: { url: pp }, 
      caption: `《✦》${usuario} actualizó la imagen del grupo`,
      mentions: [m.sender] 
    }),
    23: () => `《✦》${usuario} restableció el enlace del grupo`,
    25: (params) => `《✦》${usuario} ${params[0] === 'on' ? 'restringió' : 'permitió'} editar el grupo a ${params[0] === 'on' ? 'admins' : 'todos'}`,
    26: (params) => `《✦》El grupo fue ${params[0] === 'on' ? 'cerrado' : 'abierto'} por ${usuario}`,
    29: (params) => ({
      text: `《✦》${usuario} promovió a admin a @${params[0]?.split('@')[0] || 'usuario'}`,
      mentions: [m.sender, params[0]].filter(Boolean)
    }),
    30: (params) => ({
      text: `《✦》${usuario} removió los privilegios de admin a @${params[0]?.split('@')[0] || 'usuario'}`,
      mentions: [m.sender, params[0]].filter(Boolean)
    })
  }

  // Generar y enviar mensaje
  const generateMessage = actionTemplates[m.messageStubType]
  if (!generateMessage) {
    if (m.messageStubType !== 2) {
      console.log('Evento no manejado:', WAMessageStubType[m.messageStubType])
    }
    return
  }

  try {
    const messageConfig = generateMessage(m.messageStubParameters)
    await conn.sendMessage(
      m.chat,
      typeof messageConfig === 'string' 
        ? { text: messageConfig, mentions: [m.sender] }
        : messageConfig,
      { quoted: m } // Mejor que fkontak para mantener contexto
    )
  } catch (error) {
    console.error('Error en _autodetect:', error)
  }
}

export default handler
