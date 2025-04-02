/**
 * WhatsApp Bot Mute/Unmute Functionality
 * By @MoonContentCreator 
 * https://github.com/MoonContentCreator/BixbyBot-Md
 */

import fetch from 'node-fetch';

const handler = async (m, {conn, command, text, isAdmin}) => {
    // Comandos disponibles
    const commands = {
        mute: {
            error: {
                notAdmin: '🍬 *Solo un administrador puede ejecutar este comando*',
                botOwner: '🍭 *No puedes mutar el bot*',
                groupOwner: '🍭 *No puedes mutar el creador del grupo*',
                alreadyMuted: '🍭 *Este usuario ya ha sido mutado*',
                mentionRequired: '🍬 *Menciona a la persona que deseas mutar*'
            },
            success: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗺𝘂𝘁𝗮𝗱𝗼',
            image: 'https://telegra.ph/file/f8324d9798fa2ed2317bc.png',
            vcard: `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=19709001746:+1 (970) 900-1746
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`
        },
        unmute: {
            error: {
                notAdmin: '🍬 *Solo un administrador puede ejecutar este comando*',
                notMuted: '🍭 *Este usuario no ha sido mutado*',
                mentionRequired: '🍬 *Menciona a la persona que deseas demutar*',
                selfUnmute: '🍬 *Sólo otro administrador puede desmutarte*'
            },
            success: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗱𝗲𝗺𝘂𝘁𝗮𝗱𝗼',
            image: 'https://telegra.ph/file/aea704d0b242b8c41bf15.png',
            vcard: `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=19709001746:+1 (970) 900-1746
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`
        }
    };

    const currentCommand = commands[command];
    if (!currentCommand) return;

    try {
        // Verificar permisos de administrador
        if (!isAdmin) throw currentCommand.error.notAdmin;

        // Obtener el usuario objetivo
        const targetUser = m.mentionedJid?.[0] || 
                         m.quoted?.sender || 
                         text?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        // Validaciones
        if (!targetUser) throw currentCommand.error.mentionRequired;
        if (targetUser === conn.user.jid) throw '🍭 *No puedes realizar esta acción sobre el bot*';
        if (targetUser === global.owner[0][0] + '@s.whatsapp.net') throw '🍭 *No puedes realizar esta acción sobre el creador del bot*';

        // Obtener metadatos del grupo
        const groupMetadata = await conn.groupMetadata(m.chat);
        const groupOwner = groupMetadata.owner || m.chat.split('-')[0] + '@s.whatsapp.net';
        
        if (targetUser === groupOwner) throw '🍭 *No puedes realizar esta acción sobre el creador del grupo*';
        if (targetUser === m.sender && command === 'unmute') throw currentCommand.error.selfUnmute;

        // Verificar estado actual
        const userData = global.db.data.users[targetUser] || {};
        
        if (command === 'mute' && userData.muted) throw currentCommand.error.alreadyMuted;
        if (command === 'unmute' && !userData.muted) throw currentCommand.error.notMuted;

        // Actualizar estado
        userData.muted = command === 'mute';
        global.db.data.users[targetUser] = userData;

        // Preparar mensaje de respuesta
        const responseMessage = {
            key: {
                participants: '0@s.whatsapp.net',
                fromMe: false,
                id: ''
            },
            message: {
                locationMessage: {
                    name: currentCommand.success,
                    jpegThumbnail: await (await fetch(currentCommand.image)).buffer(),
                    vcard: currentCommand.vcard
                }
            },
            participant: '0@s.whatsapp.net'
        };

        // Enviar respuesta
        await conn.reply(m.chat, 
            command === 'mute' ? '*Tus mensajes serán eliminados*' : '*Tus mensajes no serán eliminados*', 
            responseMessage, 
            { mentions: [targetUser] }
        );

    } catch (error) {
        if (typeof error === 'string') {
            await conn.reply(m.chat, error, m);
        } else {
            console.error(error);
            await conn.reply(m.chat, '❌ Ocurrió un error al procesar el comando', m);
        }
    }
};

handler.command = ['mute', 'unmute'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
