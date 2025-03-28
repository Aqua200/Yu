import fs from 'fs';

let mutedUsers = new Set();

// Cargar usuarios muteados desde un archivo JSON
const loadMutedUsers = () => {
    try {
        let data = fs.readFileSync('./mutedUsers.json', 'utf-8');
        mutedUsers = new Set(JSON.parse(data));
    } catch (e) {
        mutedUsers = new Set();
    }
};

// Guardar usuarios muteados en un archivo JSON
const saveMutedUsers = () => {
    fs.writeFileSync('./mutedUsers.json', JSON.stringify([...mutedUsers]), 'utf-8');
};

loadMutedUsers(); // Cargar usuarios al iniciar el bot

var handler = async (m, { conn, participants, command }) => {
    // Verificar si el bot es administrador
    let bot = participants.find(p => p.id === conn.user.jid);
    if (!bot || !bot.admin) {
        return conn.reply(m.chat, '❌ No puedo gestionar muteos porque no soy administrador.', m);
    }

    // Verificar si se mencionó o respondió a un usuario
    if (!m.mentionedJid?.[0] && !m.quoted) {
        return conn.reply(m.chat, '⚠️ Debes mencionar o responder a un usuario para mutearlo.', m);
    }

    let user = m.mentionedJid?.[0] || m.quoted.sender;

    if (command === "mute") {
        if (mutedUsers.has(user)) {
            return conn.reply(m.chat, '⚠️ Este usuario ya está muteado.', m);
        }
        mutedUsers.add(user);
        saveMutedUsers();
        await conn.sendMessage(m.chat, {
            text: `╭──────────────╮\n  🔇 *USUARIO MUTEADO*\n  📌 *@${user.split('@')[0]}* no podrá enviar mensajes.\n╰──────────────╯`,
            mentions: [user]
        });
    } else if (command === "unmute") {
        if (!mutedUsers.has(user)) {
            return conn.reply(m.chat, '⚠️ Este usuario no está muteado.', m);
        }
        mutedUsers.delete(user);
        saveMutedUsers();
        await conn.sendMessage(m.chat, {
            text: `╭──────────────╮\n  🔊 *USUARIO DESMUTEADO*\n  📌 *@${user.split('@')[0]}* puede volver a hablar.\n╰──────────────╯`,
            mentions: [user]
        });
    }
};

// Interceptar mensajes de usuarios muteados
handler.before = async (m, { conn }) => {
    if (mutedUsers.has(m.sender)) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
        } catch (e) {
            console.error(e);
        }
    }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['grupo'];
handler.command = ['mute', 'unmute']; // <-- Cambio importante
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
