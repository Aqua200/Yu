/** By @MoonContentCreator || https://github.com/MoonContentCreator/BixbyBot-Md **/
import fetch from 'node-fetch';

const handler = async (m, { conn, command, text, isAdmin }) => {
    const ownerNumber = '584125014674@s.whatsapp.net'; // Tu número en formato de WhatsApp

    if (command === 'mute') {
        if (!isAdmin) throw '🍬 *Solo un administrador puede ejecutar este comando*';

        let user = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : text);
        if (!user) throw '🍬 *Menciona a la persona que deseas mutar*';

        if (user === ownerNumber) throw '🍬 *El creador del bot no puede ser muteado*';
        if (user === conn.user.jid) throw '🍭 *No puedes mutar el bot*';

        global.db.data.users[user].mute = true;
        conn.reply(m.chat, `🍬 *${user} ha sido muteado*`, m);
    } 
    
    else if (command === 'unmute') {
        if (!isAdmin) throw '🍬 *Solo un administrador puede ejecutar este comando*';

        let user = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : text);
        if (!user) throw '🍬 *Menciona a la persona que deseas desmutar*';

        if (global.db.data.users[user].mute === false) throw '🍭 *Este usuario no ha sido muteado*';

        global.db.data.users[user].mute = false;
        conn.reply(m.chat, `🍬 *${user} ha sido desmuteado*`, m);
    }
};

handler.command = ['mute', 'unmute'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
