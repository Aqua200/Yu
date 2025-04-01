import fetch from 'node-fetch';

const handler = async (m, { conn, isROwner, text }) => { if (!isROwner) throw "⚠️ Solo el propietario puede usar este comando."; if (!text) throw "⚠️ Debes proporcionar un mensaje para enviar.";

const delay = (time) => new Promise((res) => setTimeout(res, time)); const getGroups = await conn.groupFetchAllParticipating(); const groupIds = Object.keys(getGroups); // Obtiene todos los IDs de los grupos

const imageUrl = "https://files.catbox.moe/itgvo5.jpeg"; // URL fija de la imagen

// Verificar si la imagen está accesible try { const response = await fetch(imageUrl, { method: 'HEAD' }); if (!response.ok) throw new Error('La imagen no está disponible.'); } catch (error) { console.error("❌ Error al acceder a la imagen:", error); return m.reply("⚠️ No se pudo acceder a la imagen, verifica la URL."); }

let successCount = 0; for (const id of groupIds) { try { await conn.sendMessage(id, { image: { url: imageUrl }, caption: text }); successCount++; await delay(1500); // Aumentar el tiempo de espera para evitar bloqueos } catch (error) { console.error(❌ Error al enviar mensaje al grupo ${id}:, error); } }

m.reply(✅ Mensaje enviado correctamente a ${successCount} de ${groupIds.length} grupo(s).); };

handler.help = ['broadcastgroup', 'bcgc']; handler.tags = ['owner']; handler.command = ['bcgc']; handler.owner = true;

export default handler;

                                                        
