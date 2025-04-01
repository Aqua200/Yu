const handler = async (m, { conn, isROwner, text, args }) => { const delay = (time) => new Promise((res) => setTimeout(res, time)); const getGroups = await conn.groupFetchAllParticipating(); const groups = Object.values(getGroups); const anu = groups.map((v) => v.id);

const pesan = m.quoted && m.quoted.text ? m.quoted.text : text; if (!pesan) throw ${emoji} ✨ 𝐸𝓈𝒸𝓇𝒾𝒷𝑒 𝒶𝓁𝑔𝑜 𝓅𝒶𝓇𝒶 𝑒𝓃𝓋𝒾𝒶𝓇 ✨;

const imageUrl = args[1] || "https://files.catbox.moe/itgvo5.jpeg"; // URL por defecto si no se proporciona una const kawaiiBorder = "━━━━━━━━━━━━━━━━━━━━";

for (const i of anu) { await delay(500); const caption = 🌸 𝒦𝒶𝓌𝒶𝒾𝒾 𝑀𝑒𝓃𝓈𝒶𝒿𝑒 🌸\n${kawaiiBorder}\n${pesan}\n${kawaiiBorder}\n✨ 𝒫𝑜𝓇: ${packname} ✨; conn.sendMessage(i, { image: { url: imageUrl }, caption }); }

m.reply(${emoji} 🎀 *𝑀𝑒𝓃𝓈𝒶𝒿𝑒 𝐸𝓃𝓋𝒾𝒶𝒹𝑜 𝒶:* ${anu.length} *𝒢𝓇𝓊𝓅𝑜(𝓈)* 🎀); };

handler.help = ['broadcastgroup', 'bcgc']; handler.tags = ['owner']; handler.command = ['bcgc']; handler.owner = true;

export default handler;

