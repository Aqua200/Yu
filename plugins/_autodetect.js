import { default as WAMessageStubType } from '@whiskeysockets/baileys';

let handler = m => m;
handler.before = async function (m, { conn, participants, groupMetadata }) {
    try {
        // Verificación de los datos entrantes para depuración
        console.log('Mensaje recibido:', m);
        console.log('Tipo de mensaje:', m.messageStubType);
        console.log('Parametros del mensaje:', m.messageStubParameters);

        if (!m.messageStubType || !m.isGroup) return;

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

        // Verificar si la configuración de chats está correcta
        let chat = global.db.data.chats[m.chat];
        console.log('Configuración de chat:', chat);
        let usuario = `@${m.sender.split`@`[0]}`;
        let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg';

        let nombre, foto, edit, newlink, status, admingp, noadmingp, aceptar;
        nombre = `《✦》${usuario} Ha cambiado el nombre del grupo.\n\n> ✧ Ahora el grupo se llama:\n> *${m.messageStubParameters[0]}*.`;
        foto = `《✦》Se ha cambiado la imagen del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`;
        edit = `《✦》${usuario} Ha permitido que ${m.messageStubParameters[0] == 'on' ? 'solo admins' : 'todos'} puedan configurar el grupo.`;
        newlink = `《✦》El enlace del grupo ha sido restablecido.\n\n> ✧ Acción hecha por:\n> » ${usuario}`;
        status = `《✦》El grupo ha sido ${m.messageStubParameters[0] == 'on' ? '*cerrado*' : '*abierto*'} Por ${usuario}\n\n> ✧ Ahora ${m.messageStubParameters[0] == 'on' ? '*solo admins*' : '*todos*'} pueden enviar mensaje.`;
        admingp = `《✦》@${m.messageStubParameters[0].split`@`[0]} Ahora es admin del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`;
        noadmingp = `《✦》@${m.messageStubParameters[0].split`@`[0]} Deja de ser admin del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`;
        aceptar = `✦ Ha llegado un nuevo participante al grupo.\n\n> ◦ ✐ Grupo: *${groupMetadata.subject}*\n\n> ◦ ⚘ Bienvenido/a: @${m.messageStubParameters[0].split('@')[0]}\n\n> ◦ ✧ Aceptado por: @${m.sender.split('@')[0]}`;

        // Asegúrate de que chat.detect está correctamente configurado
        if (chat.detect && m.messageStubType == 21) {
            await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak });
        } else if (chat.detect && m.messageStubType == 22) {
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak });
        } else if (chat.detect && m.messageStubType == 23) {
            await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak });
        } else if (chat.detect && m.messageStubType == 25) {
            await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak });
        } else if (chat.detect && m.messageStubType == 26) {
            await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak });
        } else if (chat.detect2 && m.messageStubType == 27) {
            await conn.sendMessage(m.chat, { text: aceptar, mentions: [`${m.sender}`, `${m.messageStubParameters[0]}`] }, { quoted: fkontak });
        } else if (chat.detect && m.messageStubType == 29) {
            await conn.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`, `${m.messageStubParameters[0]}`] }, { quoted: fkontak });
        } else if (chat.detect && m.messageStubType == 30) {
            await conn.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`, `${m.messageStubParameters[0]}`] }, { quoted: fkontak });
        } else {
            if (m.messageStubType == 2) return;
            console.log({
                messageStubType: m.messageStubType,
                messageStubParameters: m.messageStubParameters,
                type: WAMessageStubType[m.messageStubType],
            });
        }
    } catch (error) {
        console.error("Error en el handler:", error);
    }
};

export default handler;
