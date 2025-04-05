import { default as WAMessageStubType } from '@whiskeysockets/baileys';

// Cache para imágenes de perfil
const profilePictureCache = new Map();

// Configuración de límite de frecuencia (1 mensaje por tipo cada 5 segundos)
const rateLimit = new Map();
const RATE_LIMIT_TIME = 5000; // 5 segundos

// Plantillas de mensajes organizadas
const MESSAGE_TEMPLATES = {
    NAME_CHANGE: (usuario, newName) => 
        `《✦》${usuario} Ha cambiado el nombre del grupo.\n\n> ✧ Ahora el grupo se llama:\n> *${newName}*.`,
    PHOTO_CHANGE: (usuario) => 
        `《✦》Se ha cambiado la imagen del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`,
    EDIT_PERMISSIONS: (usuario, setting) => 
        `《✦》${usuario} Ha permitido que ${setting === 'on' ? 'solo admins' : 'todos'} puedan configurar el grupo.`,
    NEW_LINK: (usuario) => 
        `《✦》El enlace del grupo ha sido restablecido.\n\n> ✧ Acción hecha por:\n> » ${usuario}`,
    GROUP_STATUS: (usuario, status) => 
        `《✦》El grupo ha sido ${status === 'on' ? '*cerrado*' : '*abierto*'} Por ${usuario}\n\n> ✧ Ahora ${status === 'on' ? '*solo admins*' : '*todos*'} pueden enviar mensaje.`,
    PROMOTE_ADMIN: (usuario, target) => 
        `《✦》@${target.split`@`[0]} Ahora es admin del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`,
    DEMOTE_ADMIN: (usuario, target) => 
        `《✦》@${target.split`@`[0]} Deja de ser admin del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`,
    NEW_MEMBER: (groupName, newMember, inviter) => 
        `✦ Ha llegado un nuevo participante al grupo.\n\n> ◦ ✐ Grupo: *${groupName}*\n\n> ◦ ⚘ Bienvenido/a: @${newMember.split('@')[0]}\n\n> ◦ ✧ Aceptado por: @${inviter.split('@')[0]}`
};

// Función para obtener la imagen de perfil con cache
async function getProfilePicture(conn, chatId) {
    if (profilePictureCache.has(chatId)) {
        return profilePictureCache.get(chatId);
    }
    
    try {
        const pp = await conn.profilePictureUrl(chatId, 'image').catch(() => null);
        const result = pp || 'https://files.catbox.moe/xr2m6u.jpg';
        profilePictureCache.set(chatId, result);
        
        // Limpiar cache después de 1 hora
        setTimeout(() => profilePictureCache.delete(chatId), 3600000);
        return result;
    } catch (error) {
        console.error("Error al obtener imagen de perfil:", error);
        return 'https://files.catbox.moe/xr2m6u.jpg';
    }
}

// Función para enviar notificaciones con control de frecuencia
async function sendNotification(conn, chatId, content, mentions, fkontak) {
    const rateLimitKey = `${chatId}_${content.type || 'default'}`;
    const now = Date.now();
    
    if (rateLimit.has(rateLimitKey)) {
        const lastSent = rateLimit.get(rateLimitKey);
        if (now - lastSent < RATE_LIMIT_TIME) {
            console.log(`Notificación limitada por frecuencia: ${rateLimitKey}`);
            return;
        }
    }
    
    rateLimit.set(rateLimitKey, now);
    
    try {
        const messageOptions = { quoted: fkontak };
        if (content.image) {
            await conn.sendMessage(chatId, { 
                image: content.image, 
                caption: content.text, 
                mentions 
            }, messageOptions);
        } else {
            await conn.sendMessage(chatId, { 
                text: content.text, 
                mentions 
            }, messageOptions);
        }
    } catch (error) {
        console.error("Error al enviar notificación:", error);
    }
}

// Función para validar el mensaje
function validateMessage(m) {
    if (!m || !m.messageStubType || !m.isGroup) return false;
    if (!global.db.data.chats?.[m.chat]) return false;
    return true;
}

// Configuración del handler
let handler = m => m;

handler.before = async function (m, { conn, groupMetadata }) {
    if (!validateMessage(m)) return;
    
    try {
        const chat = global.db.data.chats[m.chat];
        const usuario = `@${m.sender.split`@`[0]}`;
        const pp = await getProfilePicture(conn, m.chat);
        
        const fkontak = {
            "key": {
                "participants": "0@s.whatsapp.net",
                "remoteJid": "status@broadcast",
                "fromMe": false,
                "id": "Halo"
            },
            "message": {
                "contactMessage": {
                    "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            },
            "participant": "0@s.whatsapp.net"
        };

        // Mapeo de handlers para cada tipo de mensaje
        const handlers = {
            21: async () => chat.detect && {
                type: 'name_change',
                text: MESSAGE_TEMPLATES.NAME_CHANGE(usuario, m.messageStubParameters[0]),
                mentions: [m.sender]
            },
            22: async () => chat.detect && {
                type: 'photo_change',
                image: { url: pp },
                text: MESSAGE_TEMPLATES.PHOTO_CHANGE(usuario),
                mentions: [m.sender]
            },
            23: async () => chat.detect && {
                type: 'new_link',
                text: MESSAGE_TEMPLATES.NEW_LINK(usuario),
                mentions: [m.sender]
            },
            25: async () => chat.detect && {
                type: 'edit_permissions',
                text: MESSAGE_TEMPLATES.EDIT_PERMISSIONS(usuario, m.messageStubParameters[0]),
                mentions: [m.sender]
            },
            26: async () => chat.detect && {
                type: 'group_status',
                text: MESSAGE_TEMPLATES.GROUP_STATUS(usuario, m.messageStubParameters[0]),
                mentions: [m.sender]
            },
            27: async () => chat.detect2 && {
                type: 'new_member',
                text: MESSAGE_TEMPLATES.NEW_MEMBER(
                    groupMetadata.subject, 
                    m.messageStubParameters[0], 
                    m.sender
                ),
                mentions: [m.sender, m.messageStubParameters[0]]
            },
            29: async () => chat.detect && {
                type: 'promote_admin',
                text: MESSAGE_TEMPLATES.PROMOTE_ADMIN(usuario, m.messageStubParameters[0]),
                mentions: [m.sender, m.messageStubParameters[0]]
            },
            30: async () => chat.detect && {
                type: 'demote_admin',
                text: MESSAGE_TEMPLATES.DEMOTE_ADMIN(usuario, m.messageStubParameters[0]),
                mentions: [m.sender, m.messageStubParameters[0]]
            }
        };

        const handler = handlers[m.messageStubType];
        if (handler) {
            const content = await handler();
            if (content) {
                await sendNotification(conn, m.chat, content, content.mentions, fkontak);
            }
        } else if (m.messageStubType !== 2) {
            // Log estructurado para mensajes no manejados
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                event: 'unhandled_message_stub',
                details: {
                    messageStubType: m.messageStubType,
                    messageStubParameters: m.messageStubParameters,
                    type: WAMessageStubType[m.messageStubType],
                    chatId: m.chat,
                    sender: m.sender
                }
            }, null, 2));
        }
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            event: 'handler_error',
            error: error.message,
            stack: error.stack,
            chatId: m?.chat,
            messageStubType: m?.messageStubType
        }, null, 2));
    }
};

export default handler;
