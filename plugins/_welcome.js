import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

// Mapa para evitar duplicados por evento durante 5 segundos
const eventCache = new Map()

export async function before(m, { conn, groupMetadata }) {
  // Validaciones básicas
  if (!m.isGroup || !m.messageStubType) return !0

  // Solo manejar eventos de ingreso y salida
  if (![WAMessageStubType.GROUP_PARTICIPANT_ADD, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(m.messageStubType)) return !0

  const who = m.messageStubParameters[0]
  const chat = global.db?.data?.chats?.[m.chat] || { welcome: false }
  const taguser = `@${who.split('@')[0]}`
  const groupName = groupMetadata?.subject || 'este grupo'
  const key = `${m.chat}:${m.messageStubType}:${who}`

  // Prevenir duplicados (5 segundos)
  const lastTime = eventCache.get(key)
  if (lastTime && (Date.now() - lastTime < 5000)) return !0
  eventCache.set(key, Date.now())

  // Obtener foto de perfil o fallback
  let profilePic = 'https://files.catbox.moe/xr2m6u.jpg'
  try {
    profilePic = await conn.profilePictureUrl(who, 'image')
  } catch (err) {
    console.log(`No se pudo obtener foto de perfil para ${who}. Usando imagen por defecto.`)
  }
  const img = await (await fetch(profilePic)).buffer()

  // Mensajes por defecto si no existen en global
  const welcomeText = global.welcom1 || '¡Esperamos que la pases genial!'
  const byeText = global.welcom2 || '¡Vuelve pronto!'

  if (chat.welcome) {
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const bienvenida = `
╭─❖  Bienvenido/a ❖─╮
• Usuario: ${taguser}
• Grupo: ${groupName}
${welcomeText}
•(=^●ω●^=)• Disfruta tu estancia
Usa *#help* para ver comandos.
╰─────────────╯`.trim()
      await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] })
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const despedida = `
╭─❖  Despedida ❖─╮
• Usuario: ${taguser}
• Grupo: ${groupName}
${byeText}
•(=^●ω●^=)• Te esperamos pronto
╰─────────────╯`.trim()
      await conn.sendMessage(m.chat, { image: img, caption: despedida, mentions: [who] })
    }
  }
}
