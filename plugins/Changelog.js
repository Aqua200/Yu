let handler = async (m, { conn }) => {
    let changelog = `
⌜  𝐍𝐲𝐚~ ✦ 𝐂𝐇𝐀𝐍𝐆𝐄𝐋𝐎𝐆 ✦  ⌟

❀~  [ ✅ ] 𝑪𝒐𝒎𝒂𝒏𝒅𝒐 𝒂𝒈𝒓𝒆𝒈𝒂𝒅𝒐 𝒑𝒂𝒓𝒂 𝒎𝒂𝒔 𝒔𝒖𝒃 (*5*)  
❀~  [ 🔄 ] 𝑷𝒓ó𝒙𝒊𝒎𝒂 𝒖𝒑𝒅𝒂𝒕𝒆 𝒆𝒏 𝑹𝑷𝑮 (-80%) (*ppt*)  
❀~  [ 🔄 ] 𝑷𝒐𝒏 .profile 𝒑𝒂𝒓𝒂 𝒗𝒆𝒓 𝒕𝒖 𝒑𝒆𝒓𝒇𝒊𝒍  (*.profile*)  
❀~  [ 🔄 ] 𝑷𝒓ó𝒙𝒊𝒎𝒂 𝒖𝒑𝒅𝒂𝒕𝒆 (*𝑠𝑜𝑜𝑛*)  
❀~  [ 🔄 ] 𝑨𝒉𝒐𝒓𝒂 𝒑𝒖𝒆𝒅𝒆𝒔 𝒓𝒆𝒑𝒂𝒓𝒂𝒓 𝒕𝒖 𝒑𝒊𝒄𝒐 (*.reparar*)  
❀~  [ ✅ ] 𝑪𝒐𝒎𝒂𝒏𝒅𝒐 𝒇𝒖𝒏𝒄𝒊𝒐𝒏𝒂𝒍 𝒏𝒖𝒆𝒗𝒂𝒎𝒆𝒏𝒕𝒆 (*serbot*)  
❀~  [ ✅ ] 𝑨𝒉𝒐𝒓𝒂 𝒑𝒖𝒆𝒅𝒆𝒔 𝒎𝒆𝒋𝒐𝒓𝒂𝒓 𝒕𝒖 𝒂𝒓𝒎𝒂𝒎𝒆𝒏𝒕𝒐 (*𝑠𝑜𝑜𝑛*)  
❀~  [ 🔄 ] 𝑨𝒉𝒐𝒓𝒂 𝒆𝒍 𝒕𝒓𝒂𝒃𝒂𝒋𝒐 𝒅𝒆 𝒎𝒊𝒏𝒆𝒓𝒐 𝒅𝒂 𝒎𝒆𝒏𝒐𝒔 𝒅𝒊𝒏𝒆𝒓𝒐 𝒚 𝒎á𝒔 𝒎𝒂𝒕𝒆𝒓𝒊𝒂𝒍𝒆𝒔 (+20%) (*work*)  

⌜ ~𝐬𝐢𝐞𝐦𝐩𝐫𝐞 𝐦𝐞𝐣𝐨𝐫𝐚𝐧𝐝𝐨~!  ⌟
    `.trim();

    conn.reply(m.chat, changelog, m);
}

handler.help = ['changelog'];
handler.tags = ['info'];
handler.command = ['changelog'];

export default handler;
