import fs from 'fs/promises';

let mutedUsers = new Set();

// Cargar usuarios muteados desde un archivo JSON de forma asíncrona
const loadMutedUsers = async () => {
    try {
        let data = await fs.readFile('./mutedUsers.json', 'utf-8');
        mutedUsers = new Set(JSON.parse(data));
    } catch (e) {
        mutedUsers = new Set();
    }
};

// Guardar usuarios muteados en un archivo JSON
const saveMutedUsers = async () => {
    try {
        await fs.writeFile('./mutedUsers.json', JSON.stringify([...mutedUsers]), 'utf-8');
    } catch (e) {
        console.error('Error al guardar la lista de muteados:', e);
    }
};

await loadMutedUsers(); // Cargar usuarios al iniciar el bot

var handler = async (m, { conn, participants, command }) => {
    // Verificar si el bot es administrador
    let bot = participants.find(p => p.id === conn.user.jid);
    if (!bot || !bot.admin) {
        return conn.sendMessage(m.chat, { text: '❌ No puedo gestionar muteos porque no soy administrador.' });
    }

    // Verificar si se mencionó o respondió a un usuario
    let user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) {
        return conn.sendMessage(m.chat, { text: '⚠️ Debes mencionar o responder a un usuario para mutearlo.' });
    }

    if (command === "mute") {
        if (mutedUsers.has(user)) {
            return conn.sendMessage(m.chat, { text: '⚠️ Este usuario ya está muteado.' });
        }
        mutedUsers.add(user);
        await saveMutedUsers();
        await conn.sendMessage(m.chat, {
            text: `╭──────────────╮\n  🔇 *USUARIO MUTEADO*\n  📌 *@${user.split('@')[0]}* no podrá enviar mensajes.\n╰──────────────╯`,
            mentions: [user]
        });
    } else if (command === "unmute") {
        if (!mutedUsers.has(user)) {
            return conn.sendMessage(m.chat, { text: '⚠️ Este usuario no está muteado.' });
        }
        mutedUsers.delete(user);
        await saveMutedUsers();
        await conn.sendMessage(m.chat, {
            text: `╭──────────────╮\n  🔊 *USUARIO DESMUTEADO*\n  📌 *@${user.split('@')[0]}* puede volver a hablar.\n╰──────────────╯`,
            mentions: [user]
        });
    }
};

// Interceptar mensajes de usuarios muteados y eliminarlos al instante
handler.before = async (m, { conn }) => {
    if (mutedUsers.has(m.sender)) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
        } catch (e) {
            console.error('Error al eliminar mensaje:', e);
        }
    }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['grupo'];
handler.command = ['mute', 'unmute'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
