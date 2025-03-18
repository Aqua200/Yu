import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

// Mapa para evitar duplicados con caducidad automática
const eventCache = new Map()

export async function before(m, { conn, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return !0

  // Manejar solo eventos de entrada y salida
  if (![WAMessageStubType.GROUP_PARTICIPANT_ADD, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(m.messageStubType)) return !0

  const who = m.messageStubParameters?.[0]
  if (!who) return !0
  const chat = global.db?.data?.chats?.[m.chat] || { welcome: false }
  const taguser = `@${who.split('@')[0]}`
  const groupName = groupMetadata?.subject || 'el grupo'
  const eventKey = `${m.chat}:${m.messageStubType}:${who}`

  // Prevenir eventos repetidos en 5 segundos
  if (eventCache.has(eventKey)) return !0
  eventCache.set(eventKey, true)
  setTimeout(() => eventCache.delete(eventKey), 5000)

  // Obtener imagen de perfil con fallback
  let profilePic = 'https://files.catbox.moe/xr2m6u.jpg'
  try {
    profilePic = await conn.profilePictureUrl(who, 'image')
  } catch {
    console.log(`[INFO] No se pudo obtener foto de ${who}, usando imagen por defecto.`)
  }
  const imgBuffer = await fetch(profilePic).then(res => res.buffer()).catch(_ => null)

  const welcomeMsg = global.welcom1 || '¡Esperamos que la pases increíble aquí!'
  const byeMsg = global.welcom2 || '¡Te esperamos pronto!'

  if (chat.welcome) {
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const mensajeBienvenida = `
╭─────────────╮
┃ ✧ *¡Bienvenido!* ✧
┃ ➥ ${taguser}
┃ ➥ Grupo: *${groupName}*
┃ ${welcomeMsg}
┃ Usa *#help* para comandos
╰─────────────╯`.trim()
      await conn.sendMessage(m.chat, { image: imgBuffer, caption: mensajeBienvenida, mentions: [who] })
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const mensajeDespedida = `
╭─────────────╮
┃ ✧ *Adiós...* ✧
┃ ➥ ${taguser}
┃ ➥ Grupo: *${groupName}*
┃ ${byeMsg}
┃ ¡Vuelve cuando quieras!
╰─────────────╯`.trim()
      await conn.sendMessage(m.chat, { image: imgBuffer, caption: mensajeDespedida, mentions: [who] })
    }
  }
}
