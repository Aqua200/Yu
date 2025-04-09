import db from '../lib/database.js';
import moment from 'moment-timezone';

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

    if (!(who in global.db.data.users)) {
        return conn.reply(m.chat, `${emoji} El usuario no se encuentra en mi base de Datos.`, m);
    }
    
    let img = 'https://files.catbox.moe/vlzj4r.jpg';
    let user = global.db.data.users[who];
    let name = conn.getName(who);

    let premium = user.premium ? '✅' : '❌';

    // Sección de Monedas y Recursos Básicos
    let text = `╭━〔 📦 Inventario de ${name} 〕━⬣\n` +
               `├─┬─ *💵 Economía* ─\n` +
               `│ ├ 💸 *${moneda} en Cartera:* ${user.coin || 0}\n` +  
               `│ └ 🏦 *${moneda} en Banco:* ${user.bank || 0}\n\n` +
               
               // Sección de Materiales de Minería
               `├─┬─ *⛏️ Materiales de Minería* ─\n` +
               `│ ├ 💎 *Diamantes:* ${user.diamond || 0}\n` +
               `│ ├ ♦️ *Esmeraldas:* ${user.emerald || 0}\n` + 
               `│ ├ 🏅 *Oro:* ${user.gold || 0}\n` +
               `│ ├ 🔩 *Hierro:* ${user.iron || 0}\n` +  
               `│ ├ 🕋 *Carbón:* ${user.coal || 0}\n` +
               `│ └ 🪨 *Piedra:* ${user.stone || 0}\n\n` +
               
               // Sección de Otros Recursos
               `├─┬─ *🎁 Otros Recursos* ─\n` +
               `│ ├ 🍬 *Dulces:* ${user.candies || 0}\n` +
               `│ ├ 🎁 *Regalos:* ${user.gifts || 0}\n` +
               `│ └ 🎟️ *Tokens:* ${user.joincount || 0}\n\n` +
               
               // Sección de Estadísticas
               `├─┬─ *📊 Estadísticas* ─\n` +
               `│ ├ ✨ *Experiencia:* ${user.exp || 0}\n` +
               `│ ├ ❤️ *Salud:* ${user.health || 100}\n` +
               `│ └ ⚜️ *Premium:* ${premium}\n\n` +
               
               // Sección de Actividad
               `├─┬─ *⏳ Actividad* ─\n` +
               `│ ├ Últ. Aventura: ${user.lastAdventure ? moment(user.lastAdventure).fromNow() : 'Nunca'}\n` +
               `│ └ Últ. Minería: ${user.lastmining ? moment(user.lastmining).fromNow() : 'Nunca'}\n` +
               
               `╰━━━━━━━━━━━━━━━━⬣\n` +
               `📅 *Fecha:* ${new Date().toLocaleString('es-ES')}`;

    await conn.sendFile(m.chat, img, 'inventory.jpg', text, m);
}

handler.help = ['inventario', 'inv'];
handler.tags = ['rpg'];
handler.command = ['inventario', 'inv']; 
handler.group = true;
handler.register = true;

export default handler;
