const handler = async (m, { conn, isROwner, text }) => { const delay = (time) => new Promise((res) => setTimeout(res, time)); const getGroups = await conn.groupFetchAllParticipating(); const groupIds = Object.keys(getGroups); // Obtiene todos los IDs de los grupos

if (!text) throw "⚠️ Debes proporcionar un mensaje para enviar.";

const imageUrl = "https://files.catbox.moe/itgvo5.jpeg"; // URL fija de la imagen

let successCount = 0; for (const id of groupIds) { try { await delay(500); await conn.sendMessage(id, { image: { url: imageUrl }, caption: text }); successCount++; } catch (error) { console.error(❌ Error al enviar mensaje al grupo ${id}:, error); } }

m.reply(✅ Mensaje enviado correctamente a ${successCount} de ${groupIds.length} grupo(s).); };

handler.help = ['broadcastgroup', 'bcgc']; handler.tags = ['owner']; handler.command = ['bcgc']; handler.owner = true;

export default handler;

