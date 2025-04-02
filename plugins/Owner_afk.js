export function before(m, { conn }) { const owner = '+5216631079388'; // Número del owner const user = global.db.data.users[m.sender] || {}; const deco1 = '✦'; const deco2 = '✧'; const deco3 = '✨';

if (m.sender === owner) {
    if (m.text === '.wafk') {
        if (user.wafk > -1) {
            user.wafk = -1;
            user.wafkReason = '';
            return conn.reply(m.chat, `${deco1} 𝙃𝙖𝙨 𝙨𝙖𝙡𝙞𝙙𝙤 𝙙𝙚𝙡 𝙢𝙤𝙙𝙤 𝘼𝙁𝙆 ${deco1}`, m);
        } else {
            user.wafk = new Date().getTime();
            user.wafkReason = `${deco2} 𝙈𝙞 𝙤𝙬𝙣𝙚𝙧 𝙚𝙨𝙩á 𝙤𝙘𝙪𝙥𝙖𝙙𝙤 𝙧𝙚𝙥𝙖𝙧𝙖𝙣𝙙𝙤 𝙘𝙤𝙢𝙖𝙣𝙙𝙤𝙨, 𝙗𝙪𝙜𝙨 𝙮 𝙧𝙚𝙫𝙞𝙫𝙞𝙚𝙣𝙙𝙤 𝙜𝙧𝙪𝙥𝙤. 𝙎𝙞 𝙝𝙖𝙮 𝙪𝙣 𝙥𝙧𝙤𝙗𝙡𝙚𝙢𝙖, 𝙚𝙩𝙞𝙦𝙪é𝙩𝙖𝙢𝙚. ${deco2}`;
            return conn.reply(m.chat, `${deco3} 𝘼𝙝𝙤𝙧𝙖 𝙚𝙨𝙩á𝙨 𝙚𝙣 𝙢𝙤𝙙𝙤 𝘼𝙁𝙆 ${deco3}\n${user.wafkReason}`, m);
        }
    }
}

if (user.wafk > -1) {
    conn.reply(m.chat, `${deco1} 𝘿𝙚𝙟𝙖𝙨𝙩𝙚 𝙙𝙚 𝙚𝙨𝙩𝙖𝙧 𝘼𝙁𝙆 ${deco1}\n${user.wafkReason ? `${deco2} 𝙈𝙤𝙩𝙞𝙫𝙤: ` + user.wafkReason : ''}\n\n${deco3} *𝙏𝙞𝙚𝙢𝙥𝙤 𝙞𝙣𝙖𝙘𝙩𝙞𝙫𝙤:* ${Math.floor((new Date() - user.wafk) / 1000)} 𝙨𝙚𝙜𝙪𝙣𝙙𝙤𝙨.`, m);
    user.wafk = -1;
    user.wafkReason = '';
}

const jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];
for (const jid of jids) {
    const mentionedUser = global.db.data.users[jid] || {};
    if (!mentionedUser.wafk || mentionedUser.wafk < 0) continue;
    conn.reply(m.chat, `${deco2} 𝙈𝙞 𝙤𝙬𝙣𝙚𝙧 𝙚𝙨𝙩á 𝙤𝙘𝙪𝙥𝙖𝙙𝙤 𝙧𝙚𝙥𝙖𝙧𝙖𝙣𝙙𝙤 𝙘𝙤𝙢𝙖𝙣𝙙𝙤𝙨, 𝙗𝙪𝙜𝙨 𝙮 𝙧𝙚𝙫𝙞𝙫𝙞𝙚𝙣𝙙𝙤 𝙜𝙧𝙪𝙥𝙤. 𝙎𝙞 𝙝𝙖𝙮 𝙪𝙣 𝙥𝙧𝙤𝙗𝙡𝙚𝙢𝙖, 𝙚𝙩𝙞𝙦𝙪é𝙩𝙖𝙢𝙚. ${deco2}`, m);
}
return true;

}

