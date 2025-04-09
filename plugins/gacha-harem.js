import { promises as fs } from 'fs';
import path from 'path';

const charactersFilePath = path.resolve('./src/database/characters.json');
const haremFilePath = path.resolve('./src/database/harem.json');

async function loadJsonFile(filePath, defaultReturn = []) {
    try {
        await fs.access(filePath);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading ${path.basename(filePath)}:`, error);
        return defaultReturn;
    }
}

function normalizeId(userId) {
    if (!userId || typeof userId !== 'string') return null;
    return userId.split('@')[0].trim();
}

let handler = async (m, { conn, args }) => {
    try {
        const characters = await loadJsonFile(charactersFilePath, []);
        const harem = await loadJsonFile(haremFilePath, []);
        
        // Obtener el usuario objetivo
        let userId;
        if (m.quoted?.sender) {
            userId = normalizeId(m.quoted.sender);
        } else if (args[0]?.startsWith('@')) {
            userId = normalizeId(args[0].slice(1));
        } else {
            userId = normalizeId(m.sender);
        }

        if (!userId) {
            return await conn.reply(m.chat, '❀ No se pudo identificar al usuario.', m);
        }

        // Filtrar personajes del usuario (tanto reclamados como regalados)
        const userCharacters = characters.filter(character => {
            const charUserId = normalizeId(character.user);
            return charUserId === userId;
        });

        const totalCharacters = userCharacters.length;

        if (totalCharacters === 0) {
            return await conn.reply(m.chat, '❀ No tiene personajes reclamados en tu harem.', m);
        }

        // Paginación
        const page = parseInt(args[1]) || 1;
        const charactersPerPage = 50;
        const totalPages = Math.ceil(totalCharacters / charactersPerPage);
        const startIndex = (page - 1) * charactersPerPage;
        const endIndex = Math.min(startIndex + charactersPerPage, totalCharacters);

        if (page < 1 || page > totalPages) {
            return await conn.reply(m.chat, `❀ Página no válida. Hay un total de *${totalPages}* páginas.`, m);
        }

        // Construir el mensaje con el formato solicitado
        let message = `✿ Personajes reclamados ✿\n`;
        message += `⌦ Usuario: @${userId.split('@')[0]}\n`;
        message += `♡ Personajes: *(${totalCharacters}):*\n\n`;

        // Agregar personajes paginados
        for (let i = startIndex; i < endIndex; i++) {
            const character = userCharacters[i];
            message += `» *${character.name}* (*${character.value}*)\n`;
        }

        message += `\n> ⌦ _Página *${page}* de *${totalPages}*_`;

        await conn.reply(m.chat, message, m, { 
            mentions: [userId + '@s.whatsapp.net'] 
        });

    } catch (error) {
        console.error('Error en handler harem:', error);
        await conn.reply(m.chat, `✘ Error al cargar el harem: ${error.message}`, m);
    }
};

handler.help = ['harem [@usuario] [pagina]'];
handler.tags = ['anime'];
handler.command = ['harem', 'claims', 'waifus'];
handler.group = true;
handler.register = true;

export default handler;
