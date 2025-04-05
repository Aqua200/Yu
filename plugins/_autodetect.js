import { WAMessageStubType } from '@whiskeysockets/baileys'

const handler = m => m
handler.before = async function (m, { conn }) {
  if (!m.messageStubType || !m.isGroup || !m.messageStubParameters) return
  
  const fkontak = { 
    key: { 
      participants: "0@s.whatsapp.net", 
      remoteJid: "status@broadcast", 
      fromMe: false, 
      id: "Halo" 
    }, 
    message: { 
      contactMessage: { 
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
      }
    }, 
    participant: "0@s.whatsapp.net"
  }
  
  const chat = global.db.data.chats[m.chat]
  if (!chat.detect) return
  
  const usuario = `@${m.sender.split('@')[0]}`
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg'

  const actionMessages = {
    21: `《✦》${usuario} ha cambiado el nombre del grupo a:\n\n> *${m.messageStubParameters[0]}*`,
    22: { 
      image: { url: pp }, 
      caption: `《✦》${usuario} ha cambiado la imagen del grupo`,
      mentions: [m.sender] 
    },
    23: `《✦》${usuario} ha restablecido el enlace del grupo`,
    25: `《✦》${usuario} ha configurado que ${m.messageStubParameters[0] === 'on' ? 'solo admins' : 'todos'} puedan editar el grupo`,
    26: `《✦》El grupo ha sido ${m.messageStubParameters[0] === 'on' ? 'cerrado' : 'abierto'} por ${usuario}`,
    29: {
      text: `《✦》${usuario} ha promovido a admin a @${m.messageStubParameters[0].split('@')[0]}`,
      mentions: [m.sender, m.messageStubParameters[0]]
    },
    30: {
      text: `《✦》${usuario} ha quitado los privilegios de admin a @${m.messageStubParameters[0].split('@')[0]}`,
      mentions: [m.sender, m.messageStubParameters[0]]
    }
  }

  const messageConfig = actionMessages[m.messageStubType]
  if (messageConfig) {
    try {
      await conn.sendMessage(
        m.chat,
        typeof messageConfig === 'string' 
          ? { text: messageConfig, mentions: [m.sender] }
          : messageConfig,
        { quoted: fkontak }
      )
    } catch (error) {
      console.error('Error al enviar mensaje de detección:', error)
    }
  } else if (m.messageStubType !== 2) {
    console.log('Evento no manejado:', {
      messageStubType: m.messageStubType,
      parameters: m.messageStubParameters,
      type: WAMessageStubType[m.messageStubType]
    })
  }
}

export default handler
